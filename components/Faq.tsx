"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

type FaqItem = {
  question: string;
  answer: React.ReactNode;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Qu'est-ce qui est inclus dans une pub WAVORE ?",
    answer:
      "Un jingle audio sur mesure et une vidéo montée à votre image, toujours livrés ensemble — nous ne vendons jamais l'un sans l'autre.",
  },
  {
    question: "Combien de temps pour recevoir ma pub ?",
    answer:
      "Comptez 5 à 7 jours après validation du concept envoyé dans votre devis, selon la formule choisie.",
  },
  {
    question: "Comment se passe la commande ?",
    answer:
      "Vous décrivez votre projet via le formulaire ou l'assistant, vous recevez un devis personnalisé par email avec le prix et le concept, vous validez, et nous produisons votre pub.",
  },
  {
    question: "Puis-je demander des retouches ?",
    answer:
      "Oui, un temps d'ajustement est prévu après la première version avant la livraison des fichiers finaux.",
  },
  {
    question: "Ai-je besoin de créer un compte ?",
    answer: "Non, aucun compte n'est nécessaire. Tout se passe par email, du devis à la livraison.",
  },
  {
    question: "Qu'est-ce que le programme de parrainage ?",
    answer: (
      <>
        Si vous êtes déjà client WAVORE, vous pouvez recommander notre studio
        et recevoir une pub gratuite pour chaque nouveau client apporté grâce
        à votre lien.{" "}
        <Link href="/affiliation" className="text-acid underline hover:text-cream">
          En savoir plus
        </Link>
        .
      </>
    ),
  },
  {
    question: "Comment vous contacter ?",
    answer: (
      <>
        Par email à{" "}
        <a href="mailto:contact@wavore.com" className="text-acid underline hover:text-cream">
          contact@wavore.com
        </a>{" "}
        ou via notre{" "}
        <Link href="/contact" className="text-acid underline hover:text-cream">
          formulaire de contact
        </Link>
        .
      </>
    ),
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-ink-2">
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = openIndex === i;
        const panelId = `faq-panel-${i}`;
        const buttonId = `faq-button-${i}`;
        return (
          <div key={item.question}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 min-h-14 px-6 sm:px-8 py-4 text-left cursor-pointer"
                style={{ touchAction: "manipulation" }}
              >
                <span className="font-medium text-cream">{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 shrink-0 text-acid transition-transform duration-200 motion-reduce:transition-none ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="px-6 sm:px-8 pb-5 text-sm text-cream-dim leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
