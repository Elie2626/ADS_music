import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Mentions légales — WAVORE",
  description: "Mentions légales du site WAVORE.",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-10">
      <h2 className="font-display text-xl" style={{ fontWeight: 700 }}>
        {title}
      </h2>
      <div className="mt-3 text-sm text-cream-dim leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  );
}

export default function MentionsLegalesPage() {
  return (
    <>
      <Navbar />
      <main id="contenu" className="flex-1 pt-24 pb-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <p className="font-mono text-xs text-acid tracking-[0.25em] uppercase">
            Informations légales
          </p>
          <h1
            className="font-display text-3xl sm:text-4xl tracking-tight mt-3"
            style={{ fontWeight: 800 }}
          >
            Mentions légales
          </h1>

          <Section title="Éditeur du site">
            <p>
              Le site WAVORE (accessible à l&apos;adresse www.wavore.com) est
              édité par :
            </p>
            <p>
              [Raison sociale à compléter]
              <br />
              [Forme juridique à compléter]
              <br />
              SIRET : [à compléter]
              <br />
              Siège social : [adresse à compléter]
              <br />
              Directeur de la publication : [nom à compléter]
              <br />
              Contact : <a href="mailto:contact@wavore.com" className="text-acid underline hover:text-cream">contact@wavore.com</a>
            </p>
          </Section>

          <Section title="Hébergement">
            <p>
              Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133,
              Walnut, CA 91789, États-Unis.
            </p>
            <p>
              Le nom de domaine est enregistré auprès d&apos;OVH SAS, 2 rue
              Kellermann, 59100 Roubaix, France.
            </p>
          </Section>

          <Section title="Propriété intellectuelle">
            <p>
              L&apos;ensemble des contenus présents sur ce site (textes,
              visuels, logo, éléments graphiques) est la propriété de WAVORE,
              sauf mention contraire, et ne peut être reproduit sans
              autorisation préalable.
            </p>
          </Section>

          <Section title="Données personnelles">
            <p>
              Le traitement des données personnelles collectées via ce site
              est détaillé dans notre{" "}
              <a href="/confidentialite" className="text-acid underline hover:text-cream">
                politique de confidentialité
              </a>
              .
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Pour toute question relative à ce site, vous pouvez nous
              écrire à{" "}
              <a href="mailto:contact@wavore.com" className="text-acid underline hover:text-cream">
                contact@wavore.com
              </a>
              .
            </p>
          </Section>
        </div>
      </main>
      <Footer />
    </>
  );
}
