import { NextRequest, NextResponse } from "next/server";
import type { AdBrief } from "@/lib/generation";

const BASE = "https://api.sunoapi.org/api/v1";

function buildLyrics(brief: AdBrief): string {
  const { company, message } = brief;
  return [
    "(Couplet)",
    `Quand la journée commence, une adresse en tête,`,
    `${company}, là où tout s'arrête.`,
    "",
    "(Refrain)",
    `${company} — ${message}`,
    `${company} — on n'attend plus que vous !`,
    "",
    "(Outro)",
    `${company}. ${message}.`,
  ].join("\n");
}

const STYLE_PROMPTS: Record<string, string> = {
  "pop-energique": "upbeat catchy pop, radio jingle, bright synths, energetic",
  "electro-futuriste": "futuristic electro, punchy synths, modern tech advert",
  "acoustique-chaleureux": "warm acoustic guitar, folk, friendly and intimate",
  "hip-hop-urbain": "urban hip-hop groove, confident rap flow, street energy",
  "orchestral-premium": "cinematic orchestral, strings, prestigious and elegant",
  "jazz-lounge": "smooth jazz lounge, brushed drums, upright bass, classy",
  "rock-percutant": "punchy rock, distorted guitars, driving drums, bold",
  "chill-ambient": "chill ambient, soft pads, airy, relaxing wellness",
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.SUNO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "SUNO_API_KEY manquante" }, { status: 500 });
  }

  const brief = (await req.json()) as AdBrief;
  if (!brief?.company?.trim() || !brief?.message?.trim()) {
    return NextResponse.json({ error: "Brief incomplet" }, { status: 400 });
  }

  const lyrics = buildLyrics(brief);
  const instrumental = brief.voice === "instrumental";
  const style = [
    STYLE_PROMPTS[brief.styleId] ?? "catchy advertising jingle",
    `${brief.mood} mood`,
    `french advertising jingle, ${brief.duration} seconds radio spot`,
  ].join(", ");

  const res = await fetch(`${BASE}/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customMode: true,
      instrumental,
      prompt: instrumental ? undefined : lyrics,
      style,
      title: `Pub ${brief.company}`.slice(0, 80),
      model: "V5",
      // Requis par l'API ; on récupère le résultat par polling, le callback est ignoré
      callBackUrl: "https://onde-app.example.com/api/suno-callback",
      ...(brief.voice === "femme" && { vocalGender: "f" }),
      ...(brief.voice === "homme" && { vocalGender: "m" }),
    }),
  });

  const json = await res.json();
  if (!res.ok || json.code !== 200 || !json.data?.taskId) {
    return NextResponse.json(
      { error: json.msg ?? "Échec de la création de la génération" },
      { status: 502 }
    );
  }

  return NextResponse.json({ taskId: json.data.taskId, lyrics });
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.SUNO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "SUNO_API_KEY manquante" }, { status: 500 });
  }

  const taskId = req.nextUrl.searchParams.get("taskId");
  if (!taskId) {
    return NextResponse.json({ error: "taskId requis" }, { status: 400 });
  }

  const res = await fetch(
    `${BASE}/generate/record-info?taskId=${encodeURIComponent(taskId)}`,
    { headers: { Authorization: `Bearer ${apiKey}` }, cache: "no-store" }
  );
  const json = await res.json();
  if (!res.ok || json.code !== 200) {
    return NextResponse.json(
      { error: json.msg ?? "Échec de la vérification du statut" },
      { status: 502 }
    );
  }

  const data = json.data;
  const first = data?.response?.sunoData?.[0];
  return NextResponse.json({
    status: data?.status ?? "PENDING",
    audioUrl: first?.audioUrl || first?.streamAudioUrl || null,
    imageUrl: first?.imageUrl ?? null,
    duration: first?.duration ?? null,
    error: data?.errorMessage ?? null,
  });
}
