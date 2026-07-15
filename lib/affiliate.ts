import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_OWNER_EMAIL, emailShell, sendEmail } from "@/lib/email";

export type AffiliateRequest = {
  name: string;
  email: string;
  phone: string;
  pubReference: string;
};

export type ReferralLead = {
  name: string;
  email: string;
  phone: string;
  refCode: string;
};

/* Enregistre une demande de lien de parrainage (collection "affiliate_requests") */
export async function saveAffiliateRequest(req: AffiliateRequest): Promise<void> {
  await addDoc(collection(db, "affiliate_requests"), {
    ...req,
    status: "nouveau",
    createdAt: serverTimestamp(),
  });
}

/* Enregistre un filleul arrivé via un lien de parrainage (collection "referrals") */
export async function saveReferral(lead: ReferralLead): Promise<void> {
  await addDoc(collection(db, "referrals"), {
    ...lead,
    status: "nouveau",
    createdAt: serverTimestamp(),
  });
}

function row(label: string, value: string): string {
  return `
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#6b6580;width:140px;">${label}</td>
        <td style="padding:6px 0;font-size:14px;color:#12101a;font-weight:600;">${value}</td>
      </tr>`;
}

function affiliateRequestOwnerHtml(req: AffiliateRequest): string {
  return emailShell(`
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#6f5ce8;font-weight:700;">Nouvelle demande de parrainage</p>
    <h1 style="margin:0 0 20px;font-size:24px;color:#12101a;">${req.name}</h1>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border-top:1px solid #eeecf5;">
      ${row("Email", `<a href="mailto:${req.email}" style="color:#6f5ce8;">${req.email}</a>`)}
      ${row("Téléphone", req.phone)}
      ${row("Pub déjà commandée", req.pubReference)}
    </table>

    <div style="background:#f7f6fb;border-radius:12px;padding:20px 24px;">
      <p style="margin:0;font-size:13px;color:#3a3550;line-height:1.6;">Vérifiez que cette personne est bien cliente WAVORE, puis créez-lui son lien de parrainage personnalisé (<code>/parrainage?ref=CODE</code>) et envoyez-le lui.</p>
    </div>
  `);
}

function affiliateRequestConfirmationHtml(req: AffiliateRequest): string {
  return emailShell(`
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#6f5ce8;font-weight:700;">Demande reçue</p>
    <h1 style="margin:0 0 20px;font-size:24px;color:#12101a;">Merci ${req.name} !</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#3a3550;line-height:1.6;">
      Nous avons bien reçu votre demande de lien de parrainage. Nous vérifions votre dossier et vous envoyons votre lien personnalisé très vite à cette adresse.
    </p>
    <div style="background:#f7f6fb;border-radius:12px;padding:20px 24px;">
      <p style="margin:0;font-size:14px;color:#3a3550;line-height:1.6;">Pour rappel : chaque personne qui commande sa pub grâce à votre lien vous fait gagner <strong>une pub gratuite</strong>.</p>
    </div>
  `);
}

function referralOwnerHtml(lead: ReferralLead): string {
  return emailShell(`
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#6f5ce8;font-weight:700;">Nouveau filleul</p>
    <h1 style="margin:0 0 20px;font-size:24px;color:#12101a;">${lead.name}</h1>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border-top:1px solid #eeecf5;">
      ${row("Email", `<a href="mailto:${lead.email}" style="color:#6f5ce8;">${lead.email}</a>`)}
      ${row("Téléphone", lead.phone)}
      ${row("Code de parrainage", lead.refCode)}
    </table>

    <div style="background:#f7f6fb;border-radius:12px;padding:20px 24px;">
      <p style="margin:0;font-size:13px;color:#3a3550;line-height:1.6;">Si cette personne conclut une commande, pensez à créditer la pub gratuite au parrain associé au code <strong>${lead.refCode}</strong>.</p>
    </div>
  `);
}

function referralConfirmationHtml(lead: ReferralLead): string {
  return emailShell(`
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#6f5ce8;font-weight:700;">Message reçu</p>
    <h1 style="margin:0 0 20px;font-size:24px;color:#12101a;">Merci ${lead.name} !</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#3a3550;line-height:1.6;">
      Nous avons bien reçu votre demande, transmise par l'un de nos clients. Notre équipe vous recontacte très vite pour parler de votre projet de pub.
    </p>
  `);
}

export async function sendAffiliateRequestEmails(req: AffiliateRequest): Promise<boolean> {
  const owner = process.env.OWNER_EMAIL || DEFAULT_OWNER_EMAIL;
  const [ownerSent] = await Promise.all([
    sendEmail({
      to: owner,
      subject: `Nouvelle demande de parrainage — ${req.name}`,
      html: affiliateRequestOwnerHtml(req),
    }),
    sendEmail({
      to: req.email,
      subject: "Votre demande de lien de parrainage — WAVORE",
      html: affiliateRequestConfirmationHtml(req),
    }),
  ]);
  if (!ownerSent) {
    console.error(`[affiliate] échec de l'envoi au propriétaire (${owner})`);
  }
  return ownerSent;
}

export async function sendReferralEmails(lead: ReferralLead): Promise<boolean> {
  const owner = process.env.OWNER_EMAIL || DEFAULT_OWNER_EMAIL;
  const [ownerSent] = await Promise.all([
    sendEmail({
      to: owner,
      subject: `Nouveau filleul via parrainage — ${lead.name}`,
      html: referralOwnerHtml(lead),
    }),
    sendEmail({
      to: lead.email,
      subject: "Votre message a bien été reçu — WAVORE",
      html: referralConfirmationHtml(lead),
    }),
  ]);
  if (!ownerSent) {
    console.error(`[referral] échec de l'envoi au propriétaire (${owner})`);
  }
  return ownerSent;
}
