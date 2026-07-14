import { NextRequest, NextResponse } from "next/server";
import { computeTotalPrice, PRICING_CONTEXT } from "@/lib/pricing";
import { generateDevisPdf } from "@/lib/devis-pdf";

const DEFAULT_OWNER_EMAIL = "contact@wavore.com";

export type DevisRequest = {
  company: string;
  sector: string;
  message: string;
  style: string;
  duration: number;
  quantity: number;
  budget: string;
  deadline: string;
  name: string;
  email: string;
  phone?: string;
};

export type GeneratedQuote = {
  intro: string;
  concept: string;
  recommendedTier: string;
  priceRange: string;
  timeline: string;
  steps: string[];
};

/* Devis de secours (tant que la clé Claude n'est pas branchée) */
function fallbackQuote(req: DevisRequest): GeneratedQuote {
  const { tier, label } = computeTotalPrice(req.duration, req.quantity);
  const qtyText =
    req.quantity > 1 ? `${req.quantity} vidéos déclinées` : "une vidéo";
  return {
    intro: `Merci ${req.name} pour votre demande concernant ${req.company}. Voici votre proposition pour votre pub.`,
    concept: `Une pub ${req.style.toLowerCase()} mettant en avant « ${req.message} », pensée pour le secteur ${req.sector || "de votre activité"}, avec un jingle WAVORE sur mesure et un montage rythmé à votre image (${qtyText}).`,
    recommendedTier: tier.name,
    priceRange: label,
    timeline: "Livraison estimée sous 7 jours après validation du concept.",
    steps: [
      "Échange de cadrage (15 min) pour affiner le message et le ton",
      "Création du jingle + storyboard de la vidéo",
      "Production et montage de la pub",
      "Retours et ajustements, puis livraison des fichiers finaux",
    ],
  };
}

async function generateQuote(req: DevisRequest): Promise<GeneratedQuote> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return fallbackQuote(req);

  const { tier, label } = computeTotalPrice(req.duration, req.quantity);

  const prompt = `Tu es un chargé de projet chez WAVORE, un studio qui crée des pubs musicales et vidéo pour les entreprises. Rédige un devis personnalisé, chaleureux et professionnel, en français.

Grille tarifaire WAVORE (à respecter strictement, ne jamais inventer un autre prix) :
${PRICING_CONTEXT}

Demande du client :
- Entreprise : ${req.company}
- Secteur : ${req.sector}
- Message à faire passer : ${req.message}
- Style souhaité : ${req.style}
- Durée souhaitée : ${req.duration} secondes
- Nombre de vidéos souhaitées : ${req.quantity}
- Délai souhaité : ${req.deadline}
- Contact : ${req.name}

La durée souhaitée correspond à la formule "${tier.name}" (${tier.price} par vidéo). Pour ${req.quantity} vidéo(s), le prix total est ${label}. Réponds UNIQUEMENT avec un objet JSON valide (sans texte autour) de la forme :
{
  "intro": "phrase d'accueil personnalisée",
  "concept": "2-3 phrases décrivant un concept de pub vidéo adapté à ce client",
  "recommendedTier": "${tier.name}",
  "priceRange": "${label}",
  "timeline": "délai réaliste tenant compte du besoin",
  "steps": ["étape 1", "étape 2", "étape 3", "étape 4"]
}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-opus-4-8",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const json = await res.json();
    const text = json?.content?.[0]?.text ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return fallbackQuote(req);
    return JSON.parse(match[0]) as GeneratedQuote;
  } catch {
    return fallbackQuote(req);
  }
}

/* Emballage commun : en-tête de marque + pied de page, en table pour la compatibilité email */
function emailShell(bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f3f1fa;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f1fa;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(20,10,50,0.08);">
          <tr>
            <td style="background:#12101a;padding:32px 40px;text-align:center;">
              <span style="font-size:22px;font-weight:800;color:#f0edfb;letter-spacing:-0.5px;">WAVORE<span style="color:#9d8cff;">.</span></span>
              <div style="margin-top:6px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#9d8cff;">Pubs musicales &amp; vidéo</div>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background:#f7f6fb;border-top:1px solid #eeecf5;text-align:center;">
              <p style="margin:0;font-size:13px;color:#6b6580;">
                Une question ? Écrivez-nous à
                <a href="mailto:${DEFAULT_OWNER_EMAIL}" style="color:#6f5ce8;text-decoration:none;font-weight:600;">${DEFAULT_OWNER_EMAIL}</a>
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#a8a2bd;">© ${new Date().getFullYear()} WAVORE — tous droits réservés</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function quoteToHtml(req: DevisRequest, q: GeneratedQuote): string {
  const stepsHtml = q.steps
    .map(
      (s, i) => `
      <tr>
        <td width="28" valign="top" style="padding:0 12px 14px 0;">
          <div style="width:24px;height:24px;border-radius:50%;background:#efeafd;color:#6f5ce8;font-size:12px;font-weight:700;text-align:center;line-height:24px;font-family:monospace;">${i + 1}</div>
        </td>
        <td style="padding:0 0 14px 0;font-size:14px;color:#3a3550;line-height:1.6;">${s}</td>
      </tr>`
    )
    .join("");

  return emailShell(`
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#6f5ce8;font-weight:700;">Votre devis</p>
    <h1 style="margin:0 0 20px;font-size:24px;color:#12101a;">${req.company}</h1>

    <p style="margin:0 0 24px;font-size:15px;color:#3a3550;line-height:1.6;">${q.intro}</p>

    <div style="background:#f7f6fb;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#6b6580;font-weight:700;">Le concept</p>
      <p style="margin:0;font-size:14px;color:#3a3550;line-height:1.6;">${q.concept}</p>
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td width="50%" style="padding-right:8px;">
          <div style="background:#f7f6fb;border-radius:12px;padding:18px 20px;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#6b6580;font-weight:700;">Formule</p>
            <p style="margin:0;font-size:16px;color:#12101a;font-weight:700;">${q.recommendedTier}</p>
            <p style="margin:2px 0 0;font-size:14px;color:#6f5ce8;font-weight:700;">${q.priceRange}</p>
          </div>
        </td>
        <td width="50%" style="padding-left:8px;">
          <div style="background:#f7f6fb;border-radius:12px;padding:18px 20px;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#6b6580;font-weight:700;">Délai</p>
            <p style="margin:0;font-size:14px;color:#3a3550;line-height:1.5;">${q.timeline}</p>
          </div>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 12px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#6b6580;font-weight:700;">Les étapes</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      ${stepsHtml}
    </table>

    <div style="margin-top:8px;padding:16px 20px;background:#fff9e6;border-radius:12px;">
      <p style="margin:0;font-size:13px;color:#7a6a1e;line-height:1.5;">✦ Ce devis est une première estimation, sans engagement. Nous revenons vers vous très vite pour affiner ensemble votre projet.</p>
    </div>
  `);
}

function leadNotificationHtml(req: DevisRequest, q: GeneratedQuote): string {
  const row = (label: string, value: string) => `
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#6b6580;width:140px;">${label}</td>
        <td style="padding:6px 0;font-size:14px;color:#12101a;font-weight:600;">${value}</td>
      </tr>`;

  return emailShell(`
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#6f5ce8;font-weight:700;">Nouveau lead</p>
    <h1 style="margin:0 0 20px;font-size:24px;color:#12101a;">${req.company}</h1>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border-top:1px solid #eeecf5;">
      ${row("Contact", `${req.name} — <a href="mailto:${req.email}" style="color:#6f5ce8;">${req.email}</a>${req.phone ? " · " + req.phone : ""}`)}
      ${row("Secteur", req.sector || "—")}
      ${row("Message", req.message)}
      ${row("Style", req.style)}
      ${row("Vidéos", String(req.quantity))}
      ${row("Budget estimé", req.budget)}
      ${row("Délai souhaité", req.deadline)}
    </table>

    <div style="background:#f7f6fb;border-radius:12px;padding:20px 24px;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#6b6580;font-weight:700;">Devis envoyé au client</p>
      <p style="margin:0;font-size:14px;color:#3a3550;line-height:1.6;"><strong>${q.recommendedTier}</strong> — ${q.priceRange}</p>
    </div>
  `);
}

async function sendEmails(req: DevisRequest, q: GeneratedQuote): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const owner = process.env.OWNER_EMAIL || DEFAULT_OWNER_EMAIL;
  const from = process.env.RESEND_FROM ?? "WAVORE <onboarding@resend.dev>";
  if (!apiKey) return false;

  const send = (
    to: string,
    subject: string,
    html: string,
    attachments?: { filename: string; content: string }[]
  ) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html, attachments }),
    });

  try {
    const pdfBuffer = await generateDevisPdf(req, q);
    const pdfBase64 = pdfBuffer.toString("base64");
    const filename = `devis-wavore-${req.company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;

    await Promise.all([
      send(
        req.email,
        `Votre devis WAVORE pour ${req.company}`,
        quoteToHtml(req, q),
        [{ filename, content: pdfBase64 }]
      ),
      send(
        owner,
        `Nouveau lead devis — ${req.company}`,
        leadNotificationHtml(req, q),
        [{ filename, content: pdfBase64 }]
      ),
    ]);
    return true;
  } catch (err) {
    console.error("[devis] échec de l'envoi des emails :", err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const req = (await request.json()) as DevisRequest;
  if (!req?.company?.trim() || !req?.email?.trim() || !req?.message?.trim()) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const quote = await generateQuote(req);
  const emailSent = await sendEmails(req, quote);

  return NextResponse.json({ quote, emailSent });
}
