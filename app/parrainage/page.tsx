import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReferralForm from "@/components/ReferralForm";

export const metadata: Metadata = {
  title: "Vous avez été recommandé — WAVORE",
  description: "Vous avez reçu un lien de parrainage WAVORE. Dites-nous en plus sur votre projet.",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ParrainagePage({ searchParams }: Props) {
  const params = await searchParams;
  const refParam = params.ref;
  const refCode = (Array.isArray(refParam) ? refParam[0] : refParam)?.trim() || "";

  return (
    <>
      <Navbar />
      <main id="contenu" className="flex-1 pt-24 pb-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          {refCode ? (
            <>
              <p className="font-mono text-xs text-acid tracking-[0.25em] uppercase">
                Vous avez été recommandé
              </p>
              <h1
                className="font-display text-3xl sm:text-5xl tracking-tight mt-3"
                style={{ fontWeight: 800 }}
              >
                Un client WAVORE
                <br />
                <span className="text-acid">pense à vous.</span>
              </h1>
              <p className="mt-5 text-cream-dim max-w-lg leading-relaxed">
                Laissez-nous vos coordonnées, notre équipe vous recontacte
                rapidement pour parler de votre projet de pub musicale et
                vidéo.
              </p>

              <ReferralForm refCode={refCode} />
            </>
          ) : (
            <>
              <p className="font-mono text-xs text-acid tracking-[0.25em] uppercase">
                Parrainage
              </p>
              <h1
                className="font-display text-3xl sm:text-5xl tracking-tight mt-3"
                style={{ fontWeight: 800 }}
              >
                Cette page nécessite
                <br />
                <span className="text-acid">un lien personnalisé.</span>
              </h1>
              <p className="mt-5 text-cream-dim max-w-lg leading-relaxed">
                Vous êtes arrivé ici sans lien de parrainage. Cette page n&apos;est
                accessible que via un lien personnalisé transmis par un client
                WAVORE. Si l&apos;un de vos contacts est déjà client, demandez-lui
                son lien — ou parlez-nous directement de votre projet.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/create"
                  className="flex items-center justify-center gap-2 min-h-12 px-7 rounded-full bg-acid text-ink font-semibold hover:bg-cream transition-colors"
                >
                  Demander un devis
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 min-h-12 px-7 rounded-full border border-line text-cream hover:border-cream-dim transition-colors"
                >
                  Nous contacter
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
