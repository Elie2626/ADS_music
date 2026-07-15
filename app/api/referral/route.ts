import { NextRequest, NextResponse } from "next/server";
import { saveReferral, sendReferralEmails } from "@/lib/affiliate";
import type { ReferralLead } from "@/lib/affiliate";

export async function POST(request: NextRequest) {
  const req = (await request.json()) as ReferralLead;
  if (
    !req?.name?.trim() ||
    !req?.email?.trim() ||
    !req?.phone?.trim() ||
    !req?.refCode?.trim()
  ) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  try {
    await saveReferral(req);
  } catch (err) {
    console.error("[referral] échec de l'enregistrement Firestore :", err);
  }

  const sent = await sendReferralEmails(req);
  return NextResponse.json({ sent });
}
