import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_OWNER_EMAIL, emailShell, sendEmail } from "@/lib/email";

export type ContactRequest = {
  name: string;
  email: string;
  phone?: string;
  message: string;
};

function contactNotificationHtml(req: ContactRequest): string {
  return emailShell(`
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#6f5ce8;font-weight:700;">Nouveau message</p>
    <h1 style="margin:0 0 20px;font-size:24px;color:#12101a;">${req.name}</h1>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border-top:1px solid #eeecf5;">
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#6b6580;width:100px;">Email</td>
        <td style="padding:6px 0;font-size:14px;color:#12101a;font-weight:600;">
          <a href="mailto:${req.email}" style="color:#6f5ce8;">${req.email}</a>
        </td>
      </tr>
      ${
        req.phone
          ? `<tr>
        <td style="padding:6px 0;font-size:13px;color:#6b6580;">Téléphone</td>
        <td style="padding:6px 0;font-size:14px;color:#12101a;font-weight:600;">${req.phone}</td>
      </tr>`
          : ""
      }
    </table>

    <div style="background:#f7f6fb;border-radius:12px;padding:20px 24px;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#6b6580;font-weight:700;">Message</p>
      <p style="margin:0;font-size:14px;color:#3a3550;line-height:1.6;white-space:pre-wrap;">${req.message}</p>
    </div>
  `);
}

function contactConfirmationHtml(req: ContactRequest): string {
  return emailShell(`
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#6f5ce8;font-weight:700;">Message reçu</p>
    <h1 style="margin:0 0 20px;font-size:24px;color:#12101a;">Merci ${req.name} !</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#3a3550;line-height:1.6;">
      Nous avons bien reçu votre message et nous vous répondrons très vite.
    </p>
    <div style="background:#f7f6fb;border-radius:12px;padding:20px 24px;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#6b6580;font-weight:700;">Votre message</p>
      <p style="margin:0;font-size:14px;color:#3a3550;line-height:1.6;white-space:pre-wrap;">${req.message}</p>
    </div>
  `);
}

export async function POST(request: NextRequest) {
  const req = (await request.json()) as ContactRequest;
  if (!req?.name?.trim() || !req?.email?.trim() || !req?.message?.trim()) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const owner = process.env.OWNER_EMAIL || DEFAULT_OWNER_EMAIL;

  const [ownerSent] = await Promise.all([
    sendEmail({
      to: owner,
      subject: `Nouveau message de contact — ${req.name}`,
      html: contactNotificationHtml(req),
    }),
    sendEmail({
      to: req.email,
      subject: "Votre message a bien été reçu — WAVORE",
      html: contactConfirmationHtml(req),
    }),
  ]);

  return NextResponse.json({ sent: ownerSent });
}
