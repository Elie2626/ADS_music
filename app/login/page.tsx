"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";

const FIREBASE_ERRORS: Record<string, string> = {
  "auth/invalid-credential": "Email ou mot de passe incorrect.",
  "auth/user-not-found": "Aucun compte avec cet email.",
  "auth/wrong-password": "Email ou mot de passe incorrect.",
  "auth/email-already-in-use":
    "Un compte existe déjà avec cet email. Connectez-vous plutôt.",
  "auth/weak-password": "Le mot de passe doit contenir au moins 6 caractères.",
  "auth/invalid-email": "Cet email n'est pas valide.",
  "auth/popup-closed-by-user": "Connexion annulée.",
};

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading } = useAuth();
  const redirect = params.get("next") || "/dashboard";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace(redirect);
  }, [user, loading, router, redirect]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.replace(redirect);
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setError(FIREBASE_ERRORS[code] ?? "Une erreur est survenue. Réessayez.");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError("");
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.replace(redirect);
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setError(FIREBASE_ERRORS[code] ?? "Connexion Google impossible. Réessayez.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <p className="font-mono text-xs text-acid tracking-[0.25em] uppercase">
        {mode === "login" ? "Bon retour" : "Bienvenue"}
      </p>
      <h1
        className="font-display text-3xl sm:text-4xl tracking-tight mt-3"
        style={{ fontWeight: 800 }}
      >
        {mode === "login" ? "Connexion" : "Créer un compte"}
      </h1>

      <button
        type="button"
        onClick={google}
        disabled={busy}
        className="mt-8 w-full flex items-center justify-center gap-3 min-h-12 rounded-full border border-line bg-ink-2 hover:border-cream-dim transition-colors cursor-pointer disabled:opacity-50"
      >
        {/* Logo Google officiel */}
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.2 3.7-8.6z"/>
          <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.9-5L1.2 17.3C3.2 21.3 7.3 24 12 24z"/>
          <path fill="#FBBC05" d="M5.1 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.2 6.7C.4 8.3 0 10.1 0 12s.4 3.7 1.2 5.3l3.9-3z"/>
          <path fill="#EA4335" d="M12 4.7c2.3 0 3.8 1 4.7 1.8l3.4-3.3C18 1.2 15.2 0 12 0 7.3 0 3.2 2.7 1.2 6.7l3.9 3c1-2.9 3.7-5 6.9-5z"/>
        </svg>
        Continuer avec Google
      </button>

      <div className="flex items-center gap-4 my-6" aria-hidden="true">
        <span className="flex-1 h-px bg-line" />
        <span className="font-mono text-xs text-cream-dim">ou par email</span>
        <span className="flex-1 h-px bg-line" />
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full min-h-12 rounded-xl bg-ink-2 border border-line px-4 text-base placeholder:text-cream-dim/50 focus:border-acid transition-colors"
            placeholder="vous@entreprise.fr"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Mot de passe
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-12 rounded-xl bg-ink-2 border border-line px-4 pr-12 text-base placeholder:text-cream-dim/50 focus:border-acid transition-colors"
              placeholder="6 caractères minimum"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-cream-dim hover:text-cream transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-ember" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 min-h-12 rounded-full bg-acid text-ink font-semibold hover:bg-cream transition-colors cursor-pointer disabled:opacity-60"
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
          {mode === "login" ? "Se connecter" : "Créer mon compte"}
        </button>
      </form>

      <p className="mt-6 text-sm text-cream-dim text-center">
        {mode === "login" ? (
          <>
            Pas encore de compte ?{" "}
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(""); }}
              className="text-acid hover:underline cursor-pointer min-h-11"
            >
              Créer un compte
            </button>
          </>
        ) : (
          <>
            Déjà un compte ?{" "}
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className="text-acid hover:underline cursor-pointer min-h-11"
            >
              Se connecter
            </button>
          </>
        )}
      </p>

      <p className="mt-2 text-xs text-cream-dim/60 text-center">
        <Link href="/" className="hover:text-cream-dim">
          ← Retour à l&apos;accueil
        </Link>
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main id="contenu" className="flex-1 pt-24 pb-20 flex items-center justify-center px-4">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </main>
    </>
  );
}
