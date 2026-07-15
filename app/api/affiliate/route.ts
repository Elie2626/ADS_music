import { NextRequest, NextResponse } from "next/server";
import { saveAffiliateRequest, sendAffiliateRequestEmails } from "@/lib/affiliate";
import type { AffiliateRequest } from "@/lib/affiliate";

export async function POST(request: NextRequest) {
  const req = (await request.json()) as AffiliateRequest;
  if (
    !req?.name?.trim() ||
    !req?.email?.trim() ||
    !req?.phone?.trim() ||
    !req?.pubReference?.trim()
  ) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  try {
    await saveAffiliateRequest(req);
  } catch (err) {
    console.error("[affiliate] échec de l'enregistrement Firestore :", err);
  }

  const sent = await sendAffiliateRequestEmails(req);
  return NextResponse.json({ sent });
}
