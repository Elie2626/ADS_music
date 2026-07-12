"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, FileText, Loader2, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { listDevis, type SavedDevis } from "@/lib/devis";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [devis, setDevis] = useState<SavedDevis[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/dashboard");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    listDevis(user.uid)
      .then(setDevis)
      .catch(() =>
        setError("Impossible de charger vos devis. Rechargez la page pour réessayer.")
      );
  }, [user]);

  if (loading || !user) {
    return (
      <>
        <Navbar />
        <main id="contenu" className="flex-1 pt-24 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-6 h-6 animate-spin text-cream-dim" aria-label="Chargement" />
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main id="contenu" className="flex-1 pt-24 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <p className="font-mono text-xs text-acid tracking-[0.25em] uppercase">
                Mon espace
              </p>
              <h1
                className="font-display text-3xl sm:text-5xl tracking-tight mt-3"
                style={{ fontWeight: 800 }}
              >
                Mes devis
              </h1>
            </div>
            <Link
              href="/create"
              className="flex items-center gap-2 min-h-12 px-6 rounded-full bg-acid text-ink font-semibold hover:bg-cream transition-colors"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Nouveau projet
            </Link>
          </div>

          {error && (
            <p className="mt-10 text-sm text-ember" role="alert">
              {error}
            </p>
          )}

          {!error && devis === null && (
            <div className="mt-16 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-cream-dim" aria-label="Chargement des devis" />
            </div>
          )}

          {devis !== null && devis.length === 0 && (
            <div className="mt-16 rounded-2xl border border-line bg-ink-2 p-12 text-center">
              <FileText className="w-10 h-10 mx-auto text-cream-dim" aria-hidden="true" />
              <h2 className="font-display text-xl mt-4" style={{ fontWeight: 600 }}>
                Aucun devis pour l&apos;instant
              </h2>
              <p className="mt-2 text-sm text-cream-dim max-w-sm mx-auto">
                Décrivez votre projet de pub — jingle et vidéo — et recevez un
                devis personnalisé en quelques instants.
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 mt-6 min-h-12 px-6 rounded-full bg-acid text-ink font-semibold hover:bg-cream transition-colors"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Demander mon premier devis
              </Link>
            </div>
          )}

          <div className="mt-10 space-y-4">
            {devis?.map((d, i) => (
              <motion.article
                key={d.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-line bg-ink-2 p-6"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="font-display text-xl" style={{ fontWeight: 600 }}>
                      {d.company}
                    </h2>
                    <p className="mt-1 text-sm text-cream-dim">{d.style}</p>
                  </div>
                  <time
                    className="font-mono text-xs text-cream-dim tabular-nums"
                    dateTime={new Date(d.createdAt).toISOString()}
                  >
                    {new Date(d.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="font-display text-lg" style={{ fontWeight: 700 }}>
                    {d.quote?.recommendedTier}
                  </span>
                  <span className="text-acid font-semibold">{d.quote?.priceRange}</span>
                </div>
                <p className="mt-2 text-sm text-cream-dim leading-relaxed">
                  {d.quote?.concept}
                </p>

                <details className="mt-4 group">
                  <summary className="cursor-pointer text-sm text-cream-dim hover:text-cream transition-colors min-h-11 flex items-center">
                    Voir le détail du devis
                  </summary>
                  <div className="mt-3 space-y-3">
                    <p className="text-sm text-cream-dim">{d.quote?.timeline}</p>
                    <ol className="space-y-2">
                      {d.quote?.steps?.map((s, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-cream-dim">
                          <Check className="w-4 h-4 mt-0.5 text-acid shrink-0" aria-hidden="true" />
                          {s}
                        </li>
                      ))}
                    </ol>
                  </div>
                </details>
              </motion.article>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
