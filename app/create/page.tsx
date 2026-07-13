"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Clapperboard,
  Loader2,
  Mail,
  MicVocal,
  Music4,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { saveDevis } from "@/lib/devis";
import { BUDGET_RANGES, DEADLINES } from "@/lib/pricing";
import { DURATIONS, MOODS, MUSIC_STYLES } from "@/lib/styles";
import type { DevisRequest, GeneratedQuote } from "@/app/api/devis/route";

type Phase = "brief" | "generating" | "result";

const STEPS = [
  { id: 0, label: "Entreprise", icon: Building2 },
  { id: 1, label: "Style", icon: Music4 },
  { id: 2, label: "Ambiance", icon: MicVocal },
  { id: 3, label: "Projet", icon: Clapperboard },
] as const;

const slide = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
};

type FormState = DevisRequest & {
  styleId: string;
  mood: string;
  duration: number;
};

export default function CreatePage() {
  const [phase, setPhase] = useState<Phase>("brief");
  const [genError, setGenError] = useState("");
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [quote, setQuote] = useState<GeneratedQuote | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const [form, setForm] = useState<FormState>({
    company: "",
    sector: "",
    message: "",
    styleId: "",
    mood: "",
    duration: 30,
    style: "",
    budget: BUDGET_RANGES[1],
    deadline: DEADLINES[1],
    name: "",
    email: "",
    phone: "",
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const selectedStyle = MUSIC_STYLES.find((s) => s.id === form.styleId);

  const validateStep = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!form.company.trim())
        e.company = "Indiquez le nom de votre entreprise pour personnaliser votre pub.";
      if (!form.message.trim())
        e.message = "Décrivez le message clé de votre pub.";
    }
    if (step === 1 && !form.styleId)
      e.styleId = "Choisissez un style musical pour continuer.";
    if (step === 2 && !form.mood)
      e.mood = "Choisissez une ambiance pour continuer.";
    if (step === 3) {
      if (!form.name.trim()) e.name = "Indiquez votre nom.";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
        e.email = "Entrez un email valide pour recevoir votre devis.";
    }
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
    setGenError("");

    const payload: DevisRequest = {
      company: form.company,
      sector: form.sector,
      message: form.message,
      style: `${selectedStyle?.name ?? ""} · ambiance ${form.mood} · format ${form.duration}s`,
      budget: form.budget,
      deadline: form.deadline,
      name: form.name,
      email: form.email,
      phone: form.phone,
    };

    try {
      const res = await fetch("/api/devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Échec de la génération du devis");
      setQuote(data.quote);
      setEmailSent(data.emailSent);
      setPhase("result");
      try {
        await saveDevis(payload, data.quote, null);
      } catch {
        // le devis reste affiché même si l'enregistrement échoue
      }
    } catch (err) {
      setGenError(
        err instanceof Error ? err.message : "La génération du devis a échoué. Réessayez."
      );
      setPhase("brief");
    }
  };

  const inputClass =
    "w-full min-h-12 rounded-xl bg-ink-2 border border-line px-4 text-base placeholder:text-cream-dim/50 focus:border-acid transition-colors";

  return (
    <>
      <Navbar />
      <main id="contenu" className="flex-1 pt-24 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* ————— PHASE BRIEF ————— */}
          {phase === "brief" && (
            <>
              <p className="font-mono text-xs text-acid tracking-[0.25em] uppercase">
                Nouveau projet
              </p>
              <h1
                className="font-display text-3xl sm:text-5xl tracking-tight mt-3"
                style={{ fontWeight: 800 }}
              >
                Composons votre pub
              </h1>
              <p className="mt-3 text-cream-dim max-w-lg">
                Jingle et vidéo réunis en une seule pub. Décrivez votre projet,
                recevez un devis personnalisé par email.
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
                        value={form.company}
                        onChange={(e) => set("company", e.target.value)}
                        placeholder="Ex : Boulangerie Martin"
                        className={inputClass}
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
                        value={form.sector}
                        onChange={(e) => set("sector", e.target.value)}
                        placeholder="Ex : boulangerie artisanale"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">
                        Message clé <span className="text-ember" aria-hidden="true">*</span>
                      </label>
                      <textarea
                        id="message"
                        rows={3}
                        value={form.message}
                        onChange={(e) => set("message", e.target.value)}
                        placeholder="Ex : le meilleur pain frais du quartier, ouvert 7j/7"
                        className={`${inputClass} py-3 resize-none`}
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
                        const active = form.styleId === style.id;
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

                {/* Étape 2 — Ambiance + durée */}
                {step === 2 && (
                  <motion.div key="s2" {...slide} className="mt-10 space-y-8">
                    <fieldset>
                      <legend className="text-sm font-medium mb-4">
                        Ambiance <span className="text-ember" aria-hidden="true">*</span>
                      </legend>
                      <div className="flex flex-wrap gap-2">
                        {MOODS.map((mood) => {
                          const active = form.mood === mood;
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
                      <legend className="text-sm font-medium mb-4">Durée souhaitée</legend>
                      <div className="grid grid-cols-3 gap-3">
                        {DURATIONS.map((d) => {
                          const active = form.duration === d.value;
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
                  </motion.div>
                )}

                {/* Étape 3 — Projet vidéo + contact */}
                {step === 3 && (
                  <motion.div key="s3" {...slide} className="mt-10 space-y-8">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="budget" className="block text-sm font-medium mb-2">
                          Budget
                        </label>
                        <select
                          id="budget"
                          value={form.budget}
                          onChange={(e) => set("budget", e.target.value)}
                          className={`${inputClass} cursor-pointer`}
                        >
                          {BUDGET_RANGES.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="deadline" className="block text-sm font-medium mb-2">
                          Délai souhaité
                        </label>
                        <select
                          id="deadline"
                          value={form.deadline}
                          onChange={(e) => set("deadline", e.target.value)}
                          className={`${inputClass} cursor-pointer`}
                        >
                          {DEADLINES.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="border-t border-line pt-6 grid sm:grid-cols-3 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2">
                          Votre nom <span className="text-ember" aria-hidden="true">*</span>
                        </label>
                        <input
                          id="name"
                          type="text"
                          autoComplete="name"
                          value={form.name}
                          onChange={(e) => set("name", e.target.value)}
                          className={inputClass}
                          placeholder="Camille Martin"
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? "err-name" : undefined}
                        />
                        {errors.name && (
                          <p id="err-name" className="mt-2 text-sm text-ember" role="alert">
                            {errors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                          Email <span className="text-ember" aria-hidden="true">*</span>
                        </label>
                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                          className={inputClass}
                          placeholder="vous@entreprise.fr"
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? "err-email" : undefined}
                        />
                        {errors.email && (
                          <p id="err-email" className="mt-2 text-sm text-ember" role="alert">
                            {errors.email}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-2">
                          Téléphone
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          autoComplete="tel"
                          value={form.phone}
                          onChange={(e) => set("phone", e.target.value)}
                          className={inputClass}
                          placeholder="06 12 34 56 78"
                        />
                      </div>
                    </div>

                    {/* Récapitulatif */}
                    <div className="rounded-2xl border border-line bg-ink-2 p-6">
                      <h2 className="font-mono text-xs tracking-widest uppercase text-cream-dim mb-4">
                        Récapitulatif
                      </h2>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between gap-4">
                          <dt className="text-cream-dim">Entreprise</dt>
                          <dd className="text-right">{form.company}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-cream-dim">Style</dt>
                          <dd className="text-right">{selectedStyle?.name}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-cream-dim">Ambiance</dt>
                          <dd className="text-right">{form.mood}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-cream-dim">Durée</dt>
                          <dd className="text-right tabular-nums">{form.duration} s</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-cream-dim">Budget</dt>
                          <dd className="text-right">{form.budget}</dd>
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
                  {step === STEPS.length - 1 ? "Recevoir mon devis" : "Continuer"}
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
                Préparation de votre devis…
              </h1>
              <p className="mt-4 text-cream-dim max-w-sm">
                On assemble le concept de la pub de{" "}
                <span className="text-cream">{form.company}</span>.
              </p>
              <Loader2 className="w-5 h-5 mt-6 animate-spin text-cream-dim" aria-hidden="true" />
            </motion.div>
          )}

          {/* ————— PHASE RÉSULTAT ————— */}
          {phase === "result" && quote && (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
              <p className="font-mono text-xs text-acid tracking-[0.25em] uppercase">
                Votre devis
              </p>
              <h1
                className="font-display text-3xl sm:text-5xl tracking-tight mt-3"
                style={{ fontWeight: 800 }}
              >
                {form.company}
              </h1>

              {emailSent ? (
                <p className="mt-4 flex items-center gap-2 text-sm text-acid">
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  Une copie vient de vous être envoyée à {form.email}
                </p>
              ) : (
                <p className="mt-4 text-sm text-cream-dim">
                  Voici votre devis. Nous revenons vers vous très vite par email.
                </p>
              )}

              <div className="mt-8 space-y-6 rounded-2xl border border-line bg-ink-2 p-6 sm:p-8">
                <p className="text-lg">{quote.intro}</p>

                <div>
                  <h2 className="font-mono text-xs tracking-widest uppercase text-cream-dim mb-2">
                    Le concept
                  </h2>
                  <p className="text-cream-dim leading-relaxed">{quote.concept}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h2 className="font-mono text-xs tracking-widest uppercase text-cream-dim mb-2">
                      Formule recommandée
                    </h2>
                    <p className="font-display text-2xl" style={{ fontWeight: 700 }}>
                      {quote.recommendedTier}
                    </p>
                    <p className="text-acid font-semibold">{quote.priceRange}</p>
                  </div>
                  <div>
                    <h2 className="font-mono text-xs tracking-widest uppercase text-cream-dim mb-2">
                      Délai
                    </h2>
                    <p className="text-cream-dim">{quote.timeline}</p>
                  </div>
                </div>

                <div>
                  <h2 className="font-mono text-xs tracking-widest uppercase text-cream-dim mb-3">
                    Les étapes
                  </h2>
                  <ol className="space-y-2">
                    {quote.steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 text-cream-dim">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-acid/15 text-acid text-sm flex items-center justify-center font-mono">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <p className="mt-6 flex items-center gap-2 text-sm text-cream-dim">
                <Check className="w-4 h-4 text-acid" aria-hidden="true" />
                Ce devis est une première estimation, sans engagement.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/"
                  className="flex items-center min-h-12 px-6 rounded-full bg-acid text-ink font-semibold hover:bg-cream transition-colors"
                >
                  Retour à l&apos;accueil
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setPhase("brief");
                    setStep(0);
                    setQuote(null);
                  }}
                  className="flex items-center min-h-12 px-6 rounded-full text-cream-dim hover:text-cream transition-colors cursor-pointer"
                >
                  Nouveau projet
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}
