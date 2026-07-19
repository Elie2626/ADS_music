import { VIDEO_TIERS } from "@/lib/pricing";

const BASE_URL = "https://www.wavore.com";

/* Fiche entreprise : aide Google à associer le nom, le logo et le site */
export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "WAVORE",
  url: BASE_URL,
  logo: `${BASE_URL}/icons/icon-512.png`,
  email: "contact@wavore.com",
  description:
    "Studio de création de pubs musicales et vidéo générées par IA pour les entreprises : jingle et vidéo sur mesure.",
};

export const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "WAVORE",
  url: BASE_URL,
};

/* Offres : les 3 formules avec prix, adossées aux avis clients affichés sur le site */
export const PRODUCT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Pub musicale et vidéo WAVORE",
  description:
    "Pub complète pour votre entreprise : jingle sur mesure + vidéo montée à votre image, prête pour la radio, les réseaux sociaux et vos points de vente.",
  brand: { "@type": "Brand", name: "WAVORE" },
  image: `${BASE_URL}/opengraph-image.png`,
  offers: VIDEO_TIERS.map((t) => ({
    "@type": "Offer",
    name: `Formule ${t.name} (${t.duration})`,
    price: t.priceValue,
    priceCurrency: "EUR",
    url: `${BASE_URL}/#pricing`,
    availability: "https://schema.org/InStock",
  })),
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: 5,
    bestRating: 5,
    reviewCount: 7,
  },
};

/* Versions texte des questions/réponses de la FAQ (à garder en phase avec components/Faq.tsx) */
export const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      question: "Qu'est-ce qui est inclus dans une pub WAVORE ?",
      answer:
        "Un jingle audio sur mesure et une vidéo montée à votre image, toujours livrés ensemble — nous ne vendons jamais l'un sans l'autre.",
    },
    {
      question: "Combien de temps pour recevoir ma pub ?",
      answer:
        "Selon la formule : 24 h pour une pub de 15 s, 48 h pour 30 s, et 3 à 5 jours pour 1 min, après validation du concept envoyé dans votre devis.",
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
      answer:
        "Non, aucun compte n'est nécessaire. Tout se passe par email, du devis à la livraison.",
    },
    {
      question: "Qu'est-ce que le programme de parrainage ?",
      answer:
        "Si vous êtes déjà client WAVORE, vous pouvez recommander notre studio et recevoir une pub gratuite pour chaque nouveau client apporté grâce à votre lien.",
    },
    {
      question: "Comment vous contacter ?",
      answer:
        "Par email à contact@wavore.com ou via notre formulaire de contact.",
    },
  ].map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};
