"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Download,
  Loader2,
  MicVocal,
  Music4,
  RefreshCw,
  Timer,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import WaveformPlayer from "@/components/WaveformPlayer";
import { useAuth } from "@/components/AuthProvider";
import { saveAd } from "@/lib/ads";
import { musicProvider, type AdBrief, type GeneratedAd } from "@/lib/generation";
import { DURATIONS, MOODS, MUSIC_STYLES, VOICE_OPTIONS } from "@/lib/styles";

type Phase = "brief" | "generating" | "result";

const STEPS = [
  { id: 0, label: "Entreprise", icon: Building2 },
  { id: 1, label: "Style", icon: Music4 },
  { id: 2, label: "Ambiance", icon: MicVocal },
  { id: 3, label: "Format", icon: Timer },
] as const;

const slide = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
};

export default function AudioPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("brief");
  const [saved, setSaved] = useState(false);
  const [genError, setGenError] = useState("");
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ad, setAd] = useState<GeneratedAd | null>(null);

  const [brief, setBrief] = useState<AdBrief>({
    company: "",
    sector: "",
    message: "",
    styleId: "",
    mood: "",
    duration: 30,
    voice: "femme",
  });

  const set = <K extends keyof AdBrief>(key: K, value: AdBrief[K]) => {
    setBrief((b) => ({ ...b, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validateStep = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!brief.company.trim())
        e.company = "Indiquez le nom de votre entreprise pour personnaliser le jingle.";
      if (!brief.message.trim())
        e.message = "Décrivez le message clé : c'est ce que la pub va chanter.";
    }
    if (step === 1 && !brief.styleId)
      e.styleId = "Choisissez un style musical pour continuer.";
    if (step === 2 && !brief.mood)
      e.mood = "Choisissez une ambiance pour continuer.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) setStep(step + 1);
    else launch();
  };

  const launch = async () => {
    setPhase("generating");
    setSaved(false);
    setGenError("");
    let result: GeneratedAd;
    try {
      result = await musicProvider.generate(brief);
    } catch (err) {
      setGenError(
        err instanceof Error ? err.message : "La génération a échoué. Réessayez."
      );
      setPhase("brief");
      return;
    }
    setAd(result);
    setPhase("result");
    if (user) {
      try {
        await saveAd(user.uid, result);
        setSaved(true);
      } catch {
        // la pub reste affichée même si la sauvegarde échoue
      }
    }
  };

  const selectedStyle = MUSIC_STYLES.find((s) => s.id === brief.styleId);

  // Génération réservée aux comptes connectés
  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/audio");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <>
        <Navbar />
        <main
          id="contenu"
          className="flex-1 pt-24 flex items-center justify-center min-h-[60vh]"
        >
          <Loader2
            className="w-6 h-6 animate-spin text-cream-dim"
            aria-label="Chargement"
          />
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main id="contenu" className="flex-1 pt-24 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* ————— PHASE BRIEF ————— */}
          {phase === "brief" && (
            <>
              <p className="font-mono text-xs text-acid tracking-[0.25em] uppercase">
                Jingle seul
              </p>
              <h1
                className="font-display text-3xl sm:text-5xl tracking-tight mt-3"
                style={{ fontWeight: 800 }}
              >
                Composons votre jingle
              </h1>
              <p className="mt-3 text-cream-dim max-w-lg">
                Juste l&apos;audio, généré immédiatement — sans vidéo.{" "}
                <Link href="/create" className="text-acid underline hover:text-cream">
                  Vous voulez une pub complète ?
                </Link>
              </p>
              {genError && (
                <p
                  className="mt-4 text-sm text-ember rounded-xl border border-ember/30 bg-ember/5 px-4 py-3"
                  role="alert"
                >
                  {genError}
                </p>
              )}

              {/* Stepper */}
              <ol className="mt-10 flex gap-2" aria-label="Étapes de création">
                {STEPS.map((s, i) => (
                  <li key={s.id} className="flex-1">
                    <button
                      type="button"
                      onClick={() => i < step && setStep(i)}
                      disabled={i > step}
                      aria-current={i === step ? "step" : undefined}
                      className={`w-full min-h-11 rounded-lg border px-2 flex items-center justify-center gap-2 text-xs sm:text-sm transition-colors ${
                        i === step
                          ? "border-acid text-acid bg-acid/5"
                          : i < step
                            ? "border-line text-cream cursor-pointer hover:border-cream-dim"
                            : "border-line/50 text-cream-dim/50"
                      }`}
                    >
                      <s.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span className="hidden sm:inline">{s.label}</span>
                    </button>
                  </li>
                ))}
              </ol>

              <AnimatePresence mode="wait">
                {/* Étape 0 — Entreprise */}
                {step === 0 && (
                  <motion.div key="s0" {...slide} className="mt-10 space-y-6">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium mb-2">
                        Nom de l&apos;entreprise <span className="text-ember" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="company"
                        type="text"
                        autoComplete="organization"
                        value={brief.company}
                        onChange={(e) => set("company", e.target.value)}
                        placeholder="Ex : Boulangerie Martin"
                        className="w-full min-h-12 rounded-xl bg-ink-2 border border-line px-4 text-base placeholder:text-cream-dim/50 focus:border-acid transition-colors"
                        aria-invalid={!!errors.company}
                        aria-describedby={errors.company ? "company-error" : undefined}
                      />
                      {errors.company && (
                        <p id="company-error" className="mt-2 text-sm text-ember" role="alert">
                          {errors.company}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="sector" className="block text-sm font-medium mb-2">
                        Secteur d&apos;activité
                      </label>
                      <input
                        id="sector"
                        type="text"
                        value={brief.sector}
                        onChange={(e) => set("sector", e.target.value)}
                        placeholder="Ex : boulangerie artisanale"
                        className="w-full min-h-12 rounded-xl bg-ink-2 border border-line px-4 text-base placeholder:text-cream-dim/50 focus:border-acid transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">
                        Message clé <span className="text-ember" aria-hidden="true">*</span>
                      </label>
                      <textarea
                        id="message"
                        rows={3}
                        value={brief.message}
                        onChange={(e) => set("message", e.target.value)}
                        placeholder="Ex : le meilleur pain frais du quartier, ouvert 7j/7"
                        className="w-full rounded-xl bg-ink-2 border border-line px-4 py-3 text-base placeholder:text-cream-dim/50 focus:border-acid transition-colors resize-none"
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? "message-error" : undefined}
                      />
                      {errors.message && (
                        <p id="message-error" className="mt-2 text-sm text-ember" role="alert">
                          {errors.message}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Étape 1 — Style */}
                {step === 1 && (
                  <motion.fieldset key="s1" {...slide} className="mt-10">
                    <legend className="text-sm font-medium mb-4">
                      Style musical <span className="text-ember" aria-hidden="true">*</span>
                    </legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {MUSIC_STYLES.map((style) => {
                        const active = brief.styleId === style.id;
                        return (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() => set("styleId", style.id)}
                            aria-pressed={active}
                            className={`text-left rounded-xl border p-4 min-h-12 transition-all cursor-pointer ${
                              active
                                ? "border-acid bg-acid/5 -translate-y-0.5"
                                : "border-line bg-ink-2 hover:border-cream-dim"
                            }`}
                            style={{ touchAction: "manipulation" }}
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ background: style.hue }}
                                aria-hidden="true"
                              />
                              <span className="font-display" style={{ fontWeight: 600 }}>
                                {style.name}
                              </span>
                            </span>
                            <span className="block mt-1 text-sm text-cream-dim">
                              {style.tagline}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {errors.styleId && (
                      <p className="mt-3 text-sm text-ember" role="alert">
                        {errors.styleId}
                      </p>
                    )}
                  </motion.fieldset>
                )}

                {/* Étape 2 — Ambiance + voix */}
                {step === 2 && (
                  <motion.div key="s2" {...slide} className="mt-10 space-y-8">
                    <fieldset>
                      <legend className="text-sm font-medium mb-4">
                        Ambiance <span className="text-ember" aria-hidden="true">*</span>
                      </legend>
                      <div className="flex flex-wrap gap-2">
                        {MOODS.map((mood) => {
                          const active = brief.mood === mood;
                          return (
                            <button
                              key={mood}
                              type="button"
                              onClick={() => set("mood", mood)}
                              aria-pressed={active}
                              className={`min-h-11 px-5 rounded-full border text-sm transition-colors cursor-pointer ${
                                active
                                  ? "border-acid bg-acid text-ink font-semibold"
                                  : "border-line text-cream-dim hover:border-cream-dim hover:text-cream"
                              }`}
                              style={{ touchAction: "manipulation" }}
                            >
                              {mood}
                            </button>
                          );
                        })}
                      </div>
                      {errors.mood && (
                        <p className="mt-3 text-sm text-ember" role="alert">
                          {errors.mood}
                        </p>
                      )}
                    </fieldset>

                    <fieldset>
                      <legend className="text-sm font-medium mb-4">Voix</legend>
                      <div className="grid grid-cols-2 gap-3">
                        {VOICE_OPTIONS.map((v) => {
                          const active = brief.voice === v.id;
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => set("voice", v.id)}
                              aria-pressed={active}
                              className={`min-h-12 rounded-xl border text-sm transition-colors cursor-pointer ${
                                active
                                  ? "border-acid bg-acid/5 text-cream"
                                  : "border-line bg-ink-2 text-cream-dim hover:border-cream-dim"
                              }`}
                              style={{ touchAction: "manipulation" }}
                            >
                              {v.label}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                  </motion.div>
                )}

                {/* Étape 3 — Durée + récap */}
                {step === 3 && (
                  <motion.div key="s3" {...slide} className="mt-10 space-y-8">
                    <fieldset>
                      <legend className="text-sm font-medium mb-4">Durée</legend>
                      <div className="grid grid-cols-3 gap-3">
                        {DURATIONS.map((d) => {
                          const active = brief.duration === d.value;
                          return (
                            <button
                              key={d.value}
                              type="button"
                              onClick={() => set("duration", d.value)}
                              aria-pressed={active}
                              className={`rounded-xl border p-4 transition-colors cursor-pointer ${
                                active
                                  ? "border-acid bg-acid/5"
                                  : "border-line bg-ink-2 hover:border-cream-dim"
                              }`}
                              style={{ touchAction: "manipulation" }}
                            >
                              <span
                                className="block font-display text-2xl tabular-nums"
                                style={{ fontWeight: 700 }}
                              >
                                {d.label}
                              </span>
                              <span className="block mt-1 text-xs text-cream-dim">{d.hint}</span>
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    {/* Récapitulatif */}
                    <div className="rounded-2xl border border-line bg-ink-2 p-6">
                      <h2 className="font-mono text-xs tracking-widest uppercase text-cream-dim mb-4">
                        Récapitulatif
                      </h2>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between gap-4">
                          <dt className="text-cream-dim">Entreprise</dt>
                          <dd className="text-right">{brief.company}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-cream-dim">Style</dt>
                          <dd className="text-right">{selectedStyle?.name}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-cream-dim">Ambiance</dt>
                          <dd className="text-right">{brief.mood}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-cream-dim">Voix</dt>
                          <dd className="text-right">
                            {VOICE_OPTIONS.find((v) => v.id === brief.voice)?.label}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-cream-dim">Durée</dt>
                          <dd className="text-right tabular-nums">{brief.duration} s</dd>
                        </div>
                      </dl>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="mt-10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => (step > 0 ? setStep(step - 1) : null)}
                  disabled={step === 0}
                  className="flex items-center gap-2 min-h-12 px-6 rounded-full border border-line text-cream-dim hover:text-cream hover:border-cream-dim transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  Retour
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="flex items-center gap-2 min-h-12 px-7 rounded-full bg-acid text-ink font-semibold hover:bg-cream transition-colors cursor-pointer"
                  style={{ touchAction: "manipulation" }}
                >
                  {step === STEPS.length - 1 ? "Générer mon jingle" : "Continuer"}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </>
          )}

          {/* ————— PHASE GÉNÉRATION ————— */}
          {phase === "generating" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-[60vh] flex flex-col items-center justify-center text-center"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-end gap-1.5 h-16 mb-8" aria-hidden="true">
                {Array.from({ length: 9 }).map((_, i) => (
                  <span
                    key={i}
                    className="eq-bar w-2 rounded-full bg-acid"
                    style={{ height: "100%", animationDelay: `${i * 0.09}s` }}
                  />
                ))}
              </div>
              <h1 className="font-display text-2xl sm:text-4xl" style={{ fontWeight: 700 }}>
                Composition en cours…
              </h1>
              <p className="mt-4 text-cream-dim max-w-sm">
                L&apos;IA écrit les paroles et compose la musique de{" "}
                <span className="text-cream">{brief.company}</span> en style{" "}
                <span className="text-cream">{selectedStyle?.name.toLowerCase()}</span>.
              </p>
              <p className="mt-6 font-mono text-xs text-cream-dim">
                Généralement 1 à 2 minutes — ne fermez pas la page
              </p>
              <Loader2 className="w-5 h-5 mt-4 animate-spin text-cream-dim" aria-hidden="true" />
            </motion.div>
          )}

          {/* ————— PHASE RÉSULTAT ————— */}
          {phase === "result" && ad && (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
              <p className="font-mono text-xs text-acid tracking-[0.25em] uppercase">
                Votre jingle est prêt
              </p>
              <h1
                className="font-display text-3xl sm:text-5xl tracking-tight mt-3"
                style={{ fontWeight: 800 }}
              >
                {ad.brief.company}
              </h1>
              <p className="mt-2 text-cream-dim">
                {selectedStyle?.name} · {ad.brief.mood} · {ad.brief.duration} s
              </p>
              {user && saved && (
                <p className="mt-2 text-sm text-acid">
                  Sauvegardé dans{" "}
                  <Link href="/dashboard" className="underline hover:text-cream">
                    Mes créations
                  </Link>
                </p>
              )}

              <div className="mt-8 rounded-2xl border border-line bg-ink-2 p-6">
                <WaveformPlayer
                  duration={ad.brief.duration}
                  audioUrl={ad.audioUrl}
                  accent={selectedStyle?.hue}
                />
              </div>

              <div className="mt-6 rounded-2xl border border-line bg-ink-2 p-6">
                <h2 className="font-mono text-xs tracking-widest uppercase text-cream-dim mb-4">
                  Paroles générées
                </h2>
                <pre className="whitespace-pre-wrap font-body text-base leading-relaxed">
                  {ad.lyrics}
                </pre>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={launch}
                  className="flex items-center gap-2 min-h-12 px-6 rounded-full border border-line text-cream hover:border-cream-dim transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  Régénérer
                </button>
                {ad.audioUrl ? (
                  <a
                    href={ad.audioUrl}
                    download={`jingle-${ad.brief.company.toLowerCase().replace(/\s+/g, "-")}.mp3`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 min-h-12 px-6 rounded-full bg-acid text-ink font-semibold hover:bg-cream transition-colors"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    Télécharger
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="flex items-center gap-2 min-h-12 px-6 rounded-full bg-acid/30 text-ink/60 font-semibold cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    Télécharger
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setPhase("brief");
                    setStep(0);
                    setAd(null);
                  }}
                  className="flex items-center min-h-12 px-6 rounded-full text-cream-dim hover:text-cream transition-colors cursor-pointer"
                >
                  Nouveau jingle
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}
