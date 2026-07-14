import { NextRequest, NextResponse } from "next/server";
import { generateQuote, normalizeDevisRequest, sendDevisEmails } from "@/lib/devisEngine";
import { MOODS, MUSIC_STYLES } from "@/lib/styles";
import { VIDEO_TIERS } from "@/lib/pricing";

/* gpt-4o-mini : le modèle OpenAI le moins cher qui gère bien le function calling */
const OPENAI_MODEL = "gpt-4o-mini";
/* Plafonne la réponse générée — la consigne "2-4 phrases" dans le prompt ne garantit rien à elle seule */
const MAX_REPLY_TOKENS = 220;
/* Ne renvoie que les derniers échanges à OpenAI : au-delà, le contexte ancien compte peu
   et le coût croît avec la longueur de l'historique renvoyé à chaque tour */
const MAX_HISTORY_MESSAGES = 12;

type ChatMessage = { role: "user" | "assistant"; content: string };

type NavigateAction = { type: "navigate"; section: string };
type DevisSentAction = {
  type: "devis_sent";
  recommendedTier: string;
  priceRange: string;
  email: string;
};
type AssistantAction = NavigateAction | DevisSentAction | null;

function systemPrompt(): string {
  const styles = MUSIC_STYLES.map((s) => `${s.name} (${s.tagline})`).join(", ");
  const moods = MOODS.join(", ");
  const tiers = VIDEO_TIERS.map((t) => `${t.name} ${t.duration} ${t.price}/vidéo`).join(", ");

  return `Tu es l'assistant WAVORE, studio qui crée des pubs musicales et vidéo sur mesure (jingle + vidéo réunis, jamais séparés).

Rôle : accueille chaleureusement, intéresse-toi vraiment à l'entreprise du visiteur, aide-le à choisir style et ambiance, puis propose un devis une fois assez d'infos réunies.

Styles : ${styles}
Ambiances : ${moods}
Formules (prix total = prix unitaire × nb de vidéos, 1 à 5) : ${tiers}

Règles strictes :
- Français, chaleureux, 2-4 phrases max, jamais de liste à puces.
- Une seule question à la fois.
- "exemple/démo" → navigate(section="demo"). "prix/tarifs" → navigate(section="pricing"). "styles en détail" → navigate(section="styles"). "comment ça marche" → navigate(section="process").
- Propose un devis dès que tu connais l'entreprise et ce qu'elle veut mettre en avant.
- N'appelle submit_devis qu'après confirmation explicite ET avec au minimum : entreprise, message clé, nom, email.
- Jamais de prix hors grille. Jamais de mot de passe ou données bancaires.`;
}

const TOOLS = [
  {
    type: "function",
    function: {
      name: "navigate",
      description: "Emmène l'utilisateur voir une section du site (exemple, tarifs, styles, processus).",
      parameters: {
        type: "object",
        properties: {
          section: { type: "string", enum: ["pricing", "demo", "styles", "process"] },
        },
        required: ["section"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "submit_devis",
      description:
        "Envoie une vraie demande de devis pour l'utilisateur. Uniquement après confirmation explicite et infos complètes.",
      parameters: {
        type: "object",
        properties: {
          company: { type: "string", description: "Nom de l'entreprise" },
          sector: { type: "string", description: "Secteur d'activité" },
          message: { type: "string", description: "Ce que la pub doit mettre en avant" },
          style: { type: "string", description: "Style musical choisi" },
          mood: { type: "string", description: "Ambiance souhaitée" },
          duration: { type: "number", enum: [15, 30, 60], description: "Durée en secondes" },
          quantity: { type: "number", description: "Nombre de vidéos souhaitées (1 à 5)" },
          name: { type: "string", description: "Nom du contact" },
          email: { type: "string", description: "Email du contact" },
          phone: { type: "string", description: "Téléphone (optionnel)" },
        },
        required: ["company", "message", "name", "email"],
      },
    },
  },
];

const NAV_REPLIES: Record<string, string> = {
  pricing: "Je vous montre nos tarifs juste ici.",
  demo: "Voici un exemple de ce qu'on peut créer pour vous.",
  styles: "Je vous montre tous nos styles musicaux.",
  process: "Voici comment ça se passe, étape par étape.",
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      reply:
        "L'assistant n'est pas encore activé. Vous pouvez utiliser le formulaire de devis ou nous écrire à contact@wavore.com.",
      action: null,
    });
  }

  const body = (await request.json()) as { messages?: ChatMessage[] };
  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages requis" }, { status: 400 });
  }

  const trimmedHistory = messages.slice(-MAX_HISTORY_MESSAGES);
  const openaiMessages = [
    { role: "system" as const, content: systemPrompt() },
    ...trimmedHistory.map((m) => ({ role: m.role, content: m.content })),
  ];

  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: openaiMessages,
        tools: TOOLS,
        tool_choice: "auto",
        temperature: 0.6,
        max_tokens: MAX_REPLY_TOKENS,
      }),
    });
  } catch (err) {
    console.error("[assistant] échec réseau OpenAI :", err);
    return NextResponse.json({
      reply: "Désolé, une erreur est survenue. Réessayez ou écrivez-nous à contact@wavore.com.",
      action: null,
    });
  }

  if (!res.ok) {
    console.error("[assistant] OpenAI a répondu", res.status, await res.text());
    return NextResponse.json({
      reply: "Désolé, une erreur est survenue. Réessayez ou écrivez-nous à contact@wavore.com.",
      action: null,
    });
  }

  const data = await res.json();
  const msg = data.choices?.[0]?.message;
  const call = msg?.tool_calls?.[0];

  // Pas d'appel d'outil : la réponse texte du modèle suffit
  if (!call) {
    return NextResponse.json({ reply: msg?.content || "…", action: null as AssistantAction });
  }

  let args: Record<string, unknown> = {};
  try {
    args = JSON.parse(call.function.arguments || "{}");
  } catch {
    // arguments malformés, on continue avec un objet vide
  }

  if (call.function.name === "navigate") {
    const section = String(args.section ?? "pricing");
    const action: AssistantAction = { type: "navigate", section };
    return NextResponse.json({ reply: NAV_REPLIES[section] ?? NAV_REPLIES.pricing, action });
  }

  if (call.function.name === "submit_devis") {
    const normalized = normalizeDevisRequest({
      company: args.company as string,
      sector: args.sector as string,
      message: args.message as string,
      style: [args.style, args.mood].filter(Boolean).join(" · "),
      duration: args.duration as number,
      quantity: args.quantity as number,
      name: args.name as string,
      email: args.email as string,
      phone: args.phone as string,
    });

    if (!normalized.ok) {
      return NextResponse.json({
        reply: `Il me manque encore : ${normalized.missing.join(", ")}. Vous pouvez me les donner ?`,
        action: null as AssistantAction,
      });
    }

    const quote = await generateQuote(normalized.req);
    await sendDevisEmails(normalized.req, quote);
    const action: AssistantAction = {
      type: "devis_sent",
      recommendedTier: quote.recommendedTier,
      priceRange: quote.priceRange,
      email: normalized.req.email,
    };
    return NextResponse.json({
      reply: `C'est envoyé ! Vous allez recevoir votre devis (${quote.recommendedTier}, ${quote.priceRange}) à ${normalized.req.email}.`,
      action,
    });
  }

  return NextResponse.json({ reply: msg?.content || "…", action: null as AssistantAction });
}
