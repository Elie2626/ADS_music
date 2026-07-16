import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Politique de confidentialité — WAVORE",
  description:
    "Comment WAVORE collecte, utilise et protège vos données personnelles.",
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

export default function ConfidentialitePage() {
  return (
    <>
      <Navbar />
      <main id="contenu" className="flex-1 pt-24 pb-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <p className="font-mono text-xs text-acid tracking-[0.25em] uppercase">
            RGPD
          </p>
          <h1
            className="font-display text-3xl sm:text-4xl tracking-tight mt-3"
            style={{ fontWeight: 800 }}
          >
            Politique de confidentialité
          </h1>
          <p className="mt-5 text-cream-dim leading-relaxed">
            WAVORE attache une grande importance à la protection de vos
            données personnelles. Cette page explique quelles données nous
            collectons, pourquoi, et comment vous pouvez exercer vos droits.
          </p>

          <Section title="Quelles données collectons-nous ?">
            <p>
              Selon le formulaire que vous utilisez sur le site (devis,
              contact, assistant, parrainage), nous collectons tout ou partie
              des données suivantes : nom, email, téléphone, nom de
              l&apos;entreprise, secteur d&apos;activité, et détails du
              projet de pub (message, style, durée, budget, délai).
            </p>
            <p>
              Nous ne collectons jamais de mot de passe, de donnée bancaire
              ou de donnée sensible via ces formulaires.
            </p>
          </Section>

          <Section title="Pourquoi collectons-nous ces données ?">
            <p>
              Ces données sont utilisées uniquement pour répondre à votre
              demande : établir et vous envoyer un devis, répondre à votre
              message, traiter votre demande de lien de parrainage, ou
              qualifier un filleul.
            </p>
          </Section>

          <Section title="Qui a accès à vos données ?">
            <p>
              Vos données sont accessibles uniquement par l&apos;équipe
              WAVORE, ainsi que par les prestataires techniques suivants,
              nécessaires au fonctionnement du site :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Google Firebase — hébergement de la base de données,</li>
              <li>Resend — envoi des emails transactionnels,</li>
              <li>OpenAI — traitement des messages échangés avec l&apos;assistant WAVORE,</li>
              <li>Vercel — hébergement du site.</li>
            </ul>
            <p>
              Nous ne vendons ni ne partageons vos données avec des tiers à
              des fins commerciales.
            </p>
          </Section>

          <Section title="Combien de temps conservons-nous vos données ?">
            <p>
              Vos données sont conservées le temps nécessaire au traitement
              de votre demande, puis supprimées ou archivées dans un délai
              raisonnable si aucune suite commerciale n&apos;y est donnée.
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              Ce site n&apos;utilise aucun cookie de mesure d&apos;audience
              ni de publicité. Seuls des cookies strictement nécessaires au
              fonctionnement technique du site peuvent être déposés.
            </p>
          </Section>

          <Section title="Vos droits">
            <p>
              Conformément au Règlement Général sur la Protection des
              Données (RGPD), vous disposez d&apos;un droit d&apos;accès, de
              rectification, d&apos;effacement, de limitation et
              d&apos;opposition concernant vos données personnelles.
            </p>
            <p>
              Pour exercer ces droits, écrivez-nous à{" "}
              <a href="mailto:contact@wavore.com" className="text-acid underline hover:text-cream">
                contact@wavore.com
              </a>
              . Vous pouvez également introduire une réclamation auprès de
              la CNIL (www.cnil.fr) si vous estimez que vos droits ne sont
              pas respectés.
            </p>
          </Section>

          <Section title="Modifications">
            <p>
              Cette politique de confidentialité peut être mise à jour à
              tout moment. La version en ligne fait foi.
            </p>
          </Section>
        </div>
      </main>
      <Footer />
    </>
  );
}
