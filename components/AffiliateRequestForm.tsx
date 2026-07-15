"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

type FormState = {
  name: string;
  email: string;
  phone: string;
  pubReference: string;
};

const inputClass =
  "w-full min-h-12 rounded-xl bg-ink-2 border border-line px-4 text-base placeholder:text-cream-dim/50 focus:border-acid transition-colors";

export default function AffiliateRequestForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    pubReference: "",
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
    if (!form.phone.trim()) e.phone = "Indiquez votre téléphone.";
    if (!form.pubReference.trim())
      e.pubReference = "Indiquez le nom de votre entreprise ou de votre pub.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/affiliate", {
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
          Demande envoyée
        </h2>
        <p className="mt-2 text-sm text-cream-dim">
          Merci {form.name}, nous vérifions votre dossier et vous envoyons
          votre lien personnalisé à {form.email} très vite.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 rounded-2xl border border-line bg-ink-2 p-6 sm:p-8 space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="aff-name" className="block text-sm font-medium mb-2">
            Votre nom <span className="text-ember" aria-hidden="true">*</span>
          </label>
          <input
            id="aff-name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputClass}
            placeholder="Camille Martin"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "err-aff-name" : undefined}
          />
          {errors.name && (
            <p id="err-aff-name" className="mt-2 text-sm text-ember" role="alert">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="aff-email" className="block text-sm font-medium mb-2">
            Email <span className="text-ember" aria-hidden="true">*</span>
          </label>
          <input
            id="aff-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className={inputClass}
            placeholder="vous@entreprise.fr"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "err-aff-email" : undefined}
          />
          {errors.email && (
            <p id="err-aff-email" className="mt-2 text-sm text-ember" role="alert">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="aff-phone" className="block text-sm font-medium mb-2">
          Téléphone <span className="text-ember" aria-hidden="true">*</span>
        </label>
        <input
          id="aff-phone"
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          className={`${inputClass} sm:max-w-xs`}
          placeholder="06 12 34 56 78"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "err-aff-phone" : undefined}
        />
        {errors.phone && (
          <p id="err-aff-phone" className="mt-2 text-sm text-ember" role="alert">
            {errors.phone}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="aff-pub" className="block text-sm font-medium mb-2">
          Quelle pub avez-vous déjà commandée chez nous ?{" "}
          <span className="text-ember" aria-hidden="true">*</span>
        </label>
        <input
          id="aff-pub"
          type="text"
          value={form.pubReference}
          onChange={(e) => set("pubReference", e.target.value)}
          className={inputClass}
          placeholder="Nom de votre entreprise ou de la pub réalisée"
          aria-invalid={!!errors.pubReference}
          aria-describedby={errors.pubReference ? "err-aff-pub" : undefined}
        />
        <p className="mt-2 text-xs text-cream-dim">
          Cela nous permet de vérifier votre éligibilité au programme.
        </p>
        {errors.pubReference && (
          <p id="err-aff-pub" className="mt-2 text-sm text-ember" role="alert">
            {errors.pubReference}
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
        {busy ? "Envoi en cours…" : "Demander mon lien de parrainage"}
        {!busy && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
      </button>
    </form>
  );
}
