"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUp,
  Check,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

type Action =
  | { type: "navigate"; section: string }
  | { type: "devis_sent"; recommendedTier: string; priceRange: string; email: string }
  | null;

/* Contrat minimal de la Web Speech API (reconnaissance vocale) — pas de coût, tout se passe dans le navigateur */
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};
type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

/* Texte figé : gardé en phase avec public/assistant-welcome.mp3 (audio pré-généré une fois, pour ne pas repayer l'API à chaque ouverture) */
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
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [loadingSpeechIndex, setLoadingSpeechIndex] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceInputSupported, setVoiceInputSupported] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const frenchVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  // Sélectionne la meilleure voix française disponible sur l'appareil du visiteur
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const PREFERRED_NAMES = [
      "google français",
      "google francais",
      "amélie",
      "amelie",
      "thomas",
      "audrey",
      "chantal",
    ];
    const pickVoice = () => {
      const frVoices = window.speechSynthesis
        .getVoices()
        .filter((v) => v.lang.toLowerCase().startsWith("fr"));
      if (frVoices.length === 0) return;
      frenchVoiceRef.current =
        frVoices.find((v) =>
          PREFERRED_NAMES.some((name) => v.name.toLowerCase().includes(name))
        ) ?? frVoices[0];
    };
    pickVoice();
    window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", pickVoice);
  }, []);

  const stopSpeaking = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIndex(null);
    setLoadingSpeechIndex(null);
  };

  // Coupe la voix si le panneau se ferme ou si le composant se démonte
  useEffect(() => {
    if (!open) stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reconnaissance vocale : API native du navigateur, gratuite, aucun envoi vers un service tiers payant
  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as SpeechRecognitionWindow;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setInput(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    setVoiceInputSupported(true);
  }, []);

  // Coupe le micro si le panneau se ferme
  useEffect(() => {
    if (!open && listening) {
      recognitionRef.current?.stop();
      setListening(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (listening) {
      recognition.stop();
      setListening(false);
      return;
    }
    stopSpeaking();
    setInput("");
    recognition.start();
    setListening(true);
  };

  /* Repli gratuit (voix du navigateur) si l'API de synthèse vocale échoue ou est indisponible */
  const speakWithBrowserVoice = (index: number, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    if (frenchVoiceRef.current) utterance.voice = frenchVoiceRef.current;
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);
    window.speechSynthesis.speak(utterance);
    setSpeakingIndex(index);
  };

  const playApiSpeech = async (index: number, text: string) => {
    stopSpeaking();
    setLoadingSpeechIndex(index);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("tts failed");
      const url = URL.createObjectURL(await res.blob());
      const audio = new Audio(url);
      audio.onended = () => {
        setSpeakingIndex((cur) => (cur === index ? null : cur));
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setSpeakingIndex((cur) => (cur === index ? null : cur));
        URL.revokeObjectURL(url);
      };
      audioRef.current = audio;
      setLoadingSpeechIndex(null);
      setSpeakingIndex(index);
      await audio.play();
    } catch {
      setLoadingSpeechIndex(null);
      speakWithBrowserVoice(index, text);
    }
  };

  // Message d'accueil : toujours le fichier pré-généré (index 0), jamais l'API payante
  const playWelcomeAudio = () => {
    stopSpeaking();
    const audio = new Audio("/assistant-welcome.mp3");
    audio.onended = () => setSpeakingIndex((cur) => (cur === 0 ? null : cur));
    audio.onerror = () => setSpeakingIndex((cur) => (cur === 0 ? null : cur));
    audioRef.current = audio;
    setSpeakingIndex(0);
    audio.play().catch(() => setSpeakingIndex((cur) => (cur === 0 ? null : cur)));
  };

  const toggleSpeak = (index: number, text: string) => {
    if (speakingIndex === index || loadingSpeechIndex === index) {
      stopSpeaking();
      return;
    }
    if (index === 0) {
      playWelcomeAudio();
    } else {
      playApiSpeech(index, text);
    }
  };

  // Joue le message d'accueil une seule fois à la première ouverture
  const welcomePlayedRef = useRef(false);
  useEffect(() => {
    if (!open || welcomePlayedRef.current) return;
    welcomePlayedRef.current = true;
    playWelcomeAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
      playApiSpeech(next.length, data.reply);
      handleAction(data.action ?? null);
    } catch {
      const fallback =
        "Désolé, une erreur est survenue. Réessayez ou écrivez-nous à contact@wavore.com.";
      setMessages((m) => [...m, { role: "assistant", content: fallback }]);
      playApiSpeech(next.length, fallback);
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
                className={`flex items-end gap-1 ${m.role === "user" ? "justify-end" : "justify-start"}`}
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
                {m.role === "assistant" && (
                  <button
                    type="button"
                    onClick={() => toggleSpeak(i, m.content)}
                    aria-label={speakingIndex === i ? "Arrêter la lecture à voix haute" : "Écouter cette réponse à voix haute"}
                    aria-pressed={speakingIndex === i}
                    className="flex items-center justify-center min-h-9 min-w-9 rounded-full text-cream-dim hover:text-acid transition-colors cursor-pointer shrink-0"
                    style={{ touchAction: "manipulation" }}
                  >
                    {loadingSpeechIndex === i ? (
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    ) : speakingIndex === i ? (
                      <VolumeX className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Volume2 className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                )}
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

          {/* Avatar de l'assistant */}
          <div className="flex items-center justify-center py-2.5 border-t border-line bg-ink shrink-0">
            <div
              className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-colors ${
                speakingIndex !== null || loadingSpeechIndex !== null || busy
                  ? "border-acid animate-pulse motion-reduce:animate-none"
                  : "border-line"
              }`}
            >
              <Image
                src="/assistant-avatar.png"
                alt=""
                fill
                sizes="56px"
                className="object-cover"
                aria-hidden="true"
              />
            </div>
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
              placeholder={listening ? "Je vous écoute…" : "Écrivez votre message…"}
              disabled={busy}
              className="flex-1 min-h-11 rounded-xl bg-ink-2 border border-line px-4 text-sm placeholder:text-cream-dim/50 focus:border-acid transition-colors disabled:opacity-60"
            />
            {voiceInputSupported && (
              <button
                type="button"
                onClick={toggleListening}
                disabled={busy}
                aria-pressed={listening}
                aria-label={listening ? "Arrêter la dictée vocale" : "Parler à l'assistant"}
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
                  listening
                    ? "bg-ember text-ink animate-pulse motion-reduce:animate-none"
                    : "border border-line text-cream-dim hover:text-acid hover:border-cream-dim"
                }`}
                style={{ touchAction: "manipulation" }}
              >
                {listening ? (
                  <MicOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Mic className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            )}
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
