import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact — WAVORE",
  description: "Contactez l'équipe WAVORE pour toute question sur votre pub.",
};

const CONTACT_EMAIL = "contact@wavore.com";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main id="contenu" className="flex-1 pt-24 pb-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <p className="font-mono text-xs text-acid tracking-[0.25em] uppercase">
            Contact
          </p>
          <h1
            className="font-display text-3xl sm:text-5xl tracking-tight mt-3"
            style={{ fontWeight: 800 }}
          >
            Une question ?
            <br />
            <span className="text-acid">Écrivez-nous.</span>
          </h1>
          <p className="mt-5 text-cream-dim max-w-lg leading-relaxed">
            Pour toute question sur votre projet, un devis en cours ou une
            demande spécifique, notre équipe vous répond rapidement.
          </p>

          <div className="mt-10 rounded-2xl border border-acid/40 bg-ink-2 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
            <div className="flex items-center gap-4">
              <span className="shrink-0 w-12 h-12 rounded-full bg-acid/15 text-acid flex items-center justify-center">
                <Mail className="w-5 h-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-mono text-xs tracking-widest uppercase text-cream-dim">
                  Email
                </p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-display text-xl sm:text-2xl text-cream hover:text-acid transition-colors"
                  style={{ fontWeight: 700 }}
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="shrink-0 flex items-center gap-2 min-h-12 px-6 rounded-full bg-acid text-ink font-semibold hover:bg-cream transition-colors"
            >
              Envoyer un email
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-ink-2 p-6 sm:p-8">
            <h2 className="font-display text-xl" style={{ fontWeight: 600 }}>
              Vous avez un projet de pub ?
            </h2>
            <p className="mt-2 text-sm text-cream-dim leading-relaxed">
              Pour une demande de devis personnalisé, passez plutôt par notre
              formulaire — vous recevrez une proposition détaillée directement
              par email.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 mt-5 min-h-12 px-6 rounded-full border border-line text-cream hover:border-cream-dim transition-colors"
            >
              Demander un devis
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
