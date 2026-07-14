"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUp, Check, Loader2, MessageCircle, Sparkles, X } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

type Action =
  | { type: "navigate"; section: string }
  | { type: "devis_sent"; recommendedTier: string; priceRange: string; email: string }
  | null;

const WELCOME =
  "Bonjour, je suis l'assistant WAVORE. Parlez-moi de votre entreprise et je vous aiderai à choisir votre pub — je peux aussi vous envoyer un devis quand vous êtes prêt.";

export default function WavoreAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: WELCOME }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmedDevis, setConfirmedDevis] = useState<
    { recommendedTier: string; priceRange: string; email: string } | null
  >(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const handleAction = (action: Action) => {
    if (!action) return;
    if (action.type === "navigate") {
      if (pathname === "/") {
        document
          .getElementById(action.section)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        router.push(`/#${action.section}`);
      }
    } else if (action.type === "devis_sent") {
      setConfirmedDevis(action);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      handleAction(data.action ?? null);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Désolé, une erreur est survenue. Réessayez ou écrivez-nous à contact@wavore.com.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="wavore-assistant-panel"
        aria-label={open ? "Fermer l'assistant WAVORE" : "Ouvrir l'assistant WAVORE"}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-acid text-ink flex items-center justify-center shadow-lg hover:bg-cream transition-colors cursor-pointer"
        style={{ touchAction: "manipulation" }}
      >
        {open ? (
          <X className="w-6 h-6" aria-hidden="true" />
        ) : (
          <MessageCircle className="w-6 h-6" aria-hidden="true" />
        )}
      </button>

      {/* Panneau */}
      {open && (
        <div
          id="wavore-assistant-panel"
          role="dialog"
          aria-label="Assistant WAVORE"
          className="fixed z-50 bottom-24 right-5 left-5 sm:left-auto sm:w-[380px] h-[70dvh] max-h-[600px] rounded-2xl border border-line bg-ink-2 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* En-tête */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-line bg-ink shrink-0">
            <span className="w-9 h-9 rounded-full bg-acid/15 text-acid flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-sm truncate" style={{ fontWeight: 700 }}>
                Assistant WAVORE
              </p>
              <p className="text-xs text-cream-dim">Vous aide à choisir votre pub</p>
            </div>
          </div>

          {/* Transcript */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-acid text-ink"
                      : "bg-ink border border-line text-cream"
                  }`}
                >
                  {m.content}
                </p>
              </div>
            ))}

            {busy && (
              <div className="flex justify-start">
                <div className="bg-ink border border-line rounded-2xl px-4 py-2.5">
                  <Loader2 className="w-4 h-4 animate-spin text-cream-dim" aria-hidden="true" />
                </div>
              </div>
            )}

            {confirmedDevis && (
              <div className="rounded-xl border border-acid/40 bg-ink p-3 space-y-1">
                <p className="flex items-center gap-2 text-sm text-acid font-semibold">
                  <Check className="w-4 h-4" aria-hidden="true" />
                  Devis envoyé à {confirmedDevis.email}
                </p>
                <p className="text-sm text-cream">
                  {confirmedDevis.recommendedTier} — {confirmedDevis.priceRange}
                </p>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Saisie */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 p-3 border-t border-line bg-ink shrink-0"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez votre message…"
              disabled={busy}
              className="flex-1 min-h-11 rounded-xl bg-ink-2 border border-line px-4 text-sm placeholder:text-cream-dim/50 focus:border-acid transition-colors disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Envoyer le message"
              className="w-11 h-11 rounded-xl bg-acid text-ink flex items-center justify-center shrink-0 hover:bg-cream transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              style={{ touchAction: "manipulation" }}
            >
              <ArrowUp className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
