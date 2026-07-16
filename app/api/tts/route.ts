import { NextRequest, NextResponse } from "next/server";

/* gpt-4o-mini-tts : accepte une consigne de ton (contrairement à tts-1), utile pour une voix enjouée */
const OPENAI_TTS_MODEL = "gpt-4o-mini-tts";
const OPENAI_TTS_VOICE = "nova";
const OPENAI_TTS_INSTRUCTIONS =
  "Parle comme une jeune femme qui discute naturellement avec un ami : ton spontané et conversationnel, intonations vivantes et variées comme dans une vraie conversation. On doit entendre qu'elle sourit et qu'elle est sincèrement contente d'aider — chaleureuse, pétillante, enjouée. Rythme naturel et fluide, ni lent ni précipité.";
const OPENAI_TTS_SPEED = 1.05;
const MAX_INPUT_CHARS = 2000;

/* La consigne de prononciation seule ne suffit pas à faire lire "WAVORE" à l'anglaise :
   on respelle le mot dans le texte envoyé au modèle pour forcer "way-vore" */
function withEnglishBrandPronunciation(text: string): string {
  return text.replace(/wavore/gi, "Wayvore");
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Voix non configurée" }, { status: 503 });
  }

  const body = (await request.json()) as { text?: string };
  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json({ error: "Texte requis" }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_TTS_MODEL,
        voice: OPENAI_TTS_VOICE,
        input: withEnglishBrandPronunciation(text.slice(0, MAX_INPUT_CHARS)),
        instructions: OPENAI_TTS_INSTRUCTIONS,
        speed: OPENAI_TTS_SPEED,
        response_format: "mp3",
      }),
    });

    if (!res.ok) {
      console.error("[tts] OpenAI a répondu", res.status, await res.text());
      return NextResponse.json({ error: "Échec de la synthèse vocale" }, { status: 502 });
    }

    const audio = await res.arrayBuffer();
    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[tts] échec réseau OpenAI :", err);
    return NextResponse.json({ error: "Échec de la synthèse vocale" }, { status: 502 });
  }
}
