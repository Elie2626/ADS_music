import { NextRequest, NextResponse } from "next/server";
import { generateQuote, sendDevisEmails } from "@/lib/devisEngine";
import type { DevisRequest } from "@/lib/devisEngine";

export type { DevisRequest, GeneratedQuote } from "@/lib/devisEngine";

export async function POST(request: NextRequest) {
  const req = (await request.json()) as DevisRequest;
  if (!req?.company?.trim() || !req?.email?.trim() || !req?.message?.trim()) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const quote = await generateQuote(req);
  const emailSent = await sendDevisEmails(req, quote);

  return NextResponse.json({ quote, emailSent });
}
