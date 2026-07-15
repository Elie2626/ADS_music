import type { Metadata } from "next";
import { Gift, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AffiliateRequestForm from "@/components/AffiliateRequestForm";

export const metadata: Metadata = {
  title: "Programme de parrainage — WAVORE",
  description:
    "Recommandez WAVORE et recevez une pub gratuite pour chaque client que vous nous amenez.",
};

export default function AffiliationPage() {
  return (
    <>
      <Navbar />
      <main id="contenu" className="flex-1 pt-24 pb-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <p className="font-mono text-xs text-acid tracking-[0.25em] uppercase">
            Parrainage
          </p>
          <h1
            className="font-display text-3xl sm:text-5xl tracking-tight mt-3"
            style={{ fontWeight: 800 }}
          >
            Recommandez WAVORE,
            <br />
            <span className="text-acid">recevez une pub gratuite.</span>
          </h1>
          <p className="mt-5 text-cream-dim max-w-lg leading-relaxed">
            Envoyez votre lien personnalisé à une entreprise que vous
            connaissez. Si elle commande sa pub grâce à vous, vous recevez une{" "}
            <strong className="text-cream">pub gratuite</strong>.
          </p>

          <div className="mt-8 rounded-2xl border border-line bg-ink-2 p-6 sm:p-8 flex gap-4">
            <ShieldCheck className="w-5 h-5 text-acid shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-cream-dim leading-relaxed">
              <strong className="text-cream">Ce programme est réservé aux clients WAVORE</strong> — il
              faut avoir déjà fait réaliser votre pub chez nous pour pouvoir
              obtenir un lien de parrainage.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-ink-2 p-6 sm:p-8 flex gap-4">
            <Gift className="w-5 h-5 text-acid shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-cream-dim leading-relaxed">
              Comment ça marche : vous faites votre demande ci-dessous, nous
              vérifions votre dossier et créons votre lien personnalisé. Vous
              l&apos;envoyez ensuite à qui vous voulez — chaque commande
              validée grâce à ce lien vous fait gagner une pub gratuite.
            </p>
          </div>

          <AffiliateRequestForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
