import { NextRequest, NextResponse } from "next/server";
import { PRICING_CONTEXT, VIDEO_TIERS } from "@/lib/pricing";

export type DevisRequest = {
  company: string;
  sector: string;
  message: string;
  style: string;
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
  const tier = VIDEO_TIERS[1];
  return {
    intro: `Merci ${req.name} pour votre demande concernant ${req.company}. Voici une première proposition pour votre pub vidéo.`,
    concept: `Une pub ${req.style.toLowerCase()} mettant en avant « ${req.message} », pensée pour le secteur ${req.sector || "de votre activité"}, avec un jingle ONDE sur mesure et un montage rythmé à votre image.`,
    recommendedTier: tier.name,
    priceRange: tier.price,
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

  const prompt = `Tu es un chargé de projet chez ONDE, un studio qui crée des pubs musicales et vidéo pour les entreprises. Rédige un devis personnalisé, chaleureux et professionnel, en français.

Grille tarifaire ONDE (à respecter) :
${PRICING_CONTEXT}

Demande du client :
- Entreprise : ${req.company}
- Secteur : ${req.sector}
- Message à faire passer : ${req.message}
- Style souhaité : ${req.style}
- Budget indiqué : ${req.budget}
- Délai souhaité : ${req.deadline}
- Contact : ${req.name}

Réponds UNIQUEMENT avec un objet JSON valide (sans texte autour) de la forme :
{
  "intro": "phrase d'accueil personnalisée",
  "concept": "2-3 phrases décrivant un concept de pub vidéo adapté à ce client",
  "recommendedTier": "nom d'une formule de la grille",
  "priceRange": "fourchette de prix cohérente avec la grille et le budget",
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

function quoteToHtml(req: DevisRequest, q: GeneratedQuote): string {
  return `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <h1 style="color: #6f5ce8;">Votre devis ONDE</h1>
      <p>${q.intro}</p>
      <h3>Le concept</h3>
      <p>${q.concept}</p>
      <h3>Formule recommandée</h3>
      <p><strong>${q.recommendedTier}</strong> — ${q.priceRange}</p>
      <h3>Délai</h3>
      <p>${q.timeline}</p>
      <h3>Les étapes</h3>
      <ol>${q.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
      <p style="font-size:13px;color:#666;">Ce devis est une première estimation. Nous reviendrons vers vous très vite pour affiner ensemble. — L'équipe ONDE</p>
    </div>`;
}

async function sendEmails(req: DevisRequest, q: GeneratedQuote): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const owner = process.env.OWNER_EMAIL;
  const from = process.env.RESEND_FROM ?? "ONDE <onboarding@resend.dev>";
  if (!apiKey || !owner) return false;

  const send = (to: string, subject: string, html: string) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

  try {
    await Promise.all([
      send(req.email, `Votre devis ONDE pour ${req.company}`, quoteToHtml(req, q)),
      send(
        owner,
        `Nouveau lead devis — ${req.company}`,
        `<div style="font-family:sans-serif">
          <h2>Nouvelle demande de devis</h2>
          <p><strong>${req.name}</strong> · ${req.email}${req.phone ? " · " + req.phone : ""}</p>
          <p><strong>Entreprise :</strong> ${req.company} (${req.sector})</p>
          <p><strong>Message :</strong> ${req.message}</p>
          <p><strong>Style :</strong> ${req.style} · <strong>Budget :</strong> ${req.budget} · <strong>Délai :</strong> ${req.deadline}</p>
          <hr/>${quoteToHtml(req, q)}
        </div>`
      ),
    ]);
    return true;
  } catch {
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
