"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Music4, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import WaveformPlayer from "@/components/WaveformPlayer";
import { useAuth } from "@/components/AuthProvider";
import { listAds, type SavedAd } from "@/lib/ads";
import { MUSIC_STYLES } from "@/lib/styles";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ads, setAds] = useState<SavedAd[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/dashboard");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    listAds(user.uid)
      .then(setAds)
      .catch(() =>
        setError("Impossible de charger vos pubs. Rechargez la page pour réessayer.")
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
                Mon studio
              </p>
              <h1
                className="font-display text-3xl sm:text-5xl tracking-tight mt-3"
                style={{ fontWeight: 800 }}
              >
                Mes pubs
              </h1>
            </div>
            <Link
              href="/create"
              className="flex items-center gap-2 min-h-12 px-6 rounded-full bg-acid text-ink font-semibold hover:bg-cream transition-colors"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Nouvelle pub
            </Link>
          </div>

          {error && (
            <p className="mt-10 text-sm text-ember" role="alert">
              {error}
            </p>
          )}

          {!error && ads === null && (
            <div className="mt-16 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-cream-dim" aria-label="Chargement des pubs" />
            </div>
          )}

          {ads !== null && ads.length === 0 && (
            <div className="mt-16 rounded-2xl border border-line bg-ink-2 p-12 text-center">
              <Music4 className="w-10 h-10 mx-auto text-cream-dim" aria-hidden="true" />
              <h2 className="font-display text-xl mt-4" style={{ fontWeight: 600 }}>
                Aucune pub pour l&apos;instant
              </h2>
              <p className="mt-2 text-sm text-cream-dim max-w-sm mx-auto">
                Créez votre première pub musicale : deux minutes de brief, et
                l&apos;IA compose pour vous.
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 mt-6 min-h-12 px-6 rounded-full bg-acid text-ink font-semibold hover:bg-cream transition-colors"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Créer ma première pub
              </Link>
            </div>
          )}

          <div className="mt-10 space-y-4">
            {ads?.map((ad, i) => {
              const style = MUSIC_STYLES.find((s) => s.id === ad.styleId);
              return (
                <motion.article
                  key={ad.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl border border-line bg-ink-2 p-6"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="font-display text-xl" style={{ fontWeight: 600 }}>
                        {ad.company}
                      </h2>
                      <p className="mt-1 text-sm text-cream-dim">
                        {style?.name ?? ad.styleId} · {ad.mood} · {ad.duration} s
                      </p>
                    </div>
                    <time
                      className="font-mono text-xs text-cream-dim tabular-nums"
                      dateTime={new Date(ad.createdAt).toISOString()}
                    >
                      {new Date(ad.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                  <div className="mt-5">
                    <WaveformPlayer
                      duration={ad.duration}
                      audioUrl={ad.audioUrl}
                      accent={style?.hue}
                    />
                  </div>
                  <details className="mt-4 group">
                    <summary className="cursor-pointer text-sm text-cream-dim hover:text-cream transition-colors min-h-11 flex items-center">
                      Voir les paroles
                    </summary>
                    <pre className="mt-3 whitespace-pre-wrap font-body text-sm leading-relaxed text-cream-dim">
                      {ad.lyrics}
                    </pre>
                  </details>
                </motion.article>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
