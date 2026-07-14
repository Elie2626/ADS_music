"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

type FormState = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

const inputClass =
  "w-full min-h-12 rounded-xl bg-ink-2 border border-line px-4 text-base placeholder:text-cream-dim/50 focus:border-acid transition-colors";

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Indiquez votre nom.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      e.email = "Entrez un email valide.";
    if (!form.message.trim()) e.message = "Écrivez votre message.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Échec de l'envoi");
      setSent(true);
    } catch {
      setSubmitError(
        "Une erreur est survenue. Réessayez ou écrivez-nous directement à contact@wavore.com."
      );
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="mt-6 rounded-2xl border border-acid/40 bg-ink-2 p-8 text-center">
        <span className="inline-flex w-12 h-12 rounded-full bg-acid/15 text-acid items-center justify-center">
          <Check className="w-5 h-5" aria-hidden="true" />
        </span>
        <h2 className="font-display text-xl mt-4" style={{ fontWeight: 600 }}>
          Message envoyé
        </h2>
        <p className="mt-2 text-sm text-cream-dim">
          Merci {form.name}, nous vous répondrons très vite à {form.email}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 rounded-2xl border border-line bg-ink-2 p-6 sm:p-8 space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
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
          className={`${inputClass} sm:max-w-xs`}
          placeholder="06 12 34 56 78"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          Message <span className="text-ember" aria-hidden="true">*</span>
        </label>
        <textarea
          id="message"
          rows={5}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          className={`${inputClass} py-3 resize-none`}
          placeholder="Comment pouvons-nous vous aider ?"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "err-message" : undefined}
        />
        {errors.message && (
          <p id="err-message" className="mt-2 text-sm text-ember" role="alert">
            {errors.message}
          </p>
        )}
      </div>

      {submitError && (
        <p className="text-sm text-ember" role="alert">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="flex items-center gap-2 min-h-12 px-7 rounded-full bg-acid text-ink font-semibold hover:bg-cream transition-colors cursor-pointer disabled:opacity-60"
        style={{ touchAction: "manipulation" }}
      >
        {busy && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
        {busy ? "Envoi en cours…" : "Envoyer le message"}
        {!busy && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
      </button>
    </form>
  );
}
