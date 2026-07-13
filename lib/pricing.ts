/*
 * Tarif unique des pubs ONDE (jingle + vidéo).
 * Sert à la fois d'affichage sur le site et de cadre pour le devis
 * généré par l'IA (pour qu'il reste cohérent et à ton image).
 */

export type VideoTier = {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  duration: string;
  ideal: string;
  features: string[];
};

export const PUB_OFFER: VideoTier = {
  id: "pub-complete",
  name: "Pub complète",
  price: "99 €",
  priceValue: 99,
  duration: "jusqu'à 30 s",
  ideal: "Jingle et vidéo réunis, prêts à diffuser",
  features: [
    "Jingle ONDE sur mesure",
    "Montage vidéo animé (logo + visuels)",
    "Formats vertical, carré et paysage",
    "1 révision incluse",
    "Livraison en 5 jours",
  ],
};

export const BUDGET_RANGES = [
  "Moins de 500 €",
  "500 € – 1 000 €",
  "1 000 € – 2 000 €",
  "Plus de 2 000 €",
  "Je ne sais pas encore",
] as const;

export const DEADLINES = [
  "Dès que possible",
  "Sous 1 semaine",
  "Sous 2 semaines",
  "Sous 1 mois",
  "Pas de date précise",
] as const;

// Résumé injecté dans le prompt du générateur de devis
export const PRICING_CONTEXT = `- ${PUB_OFFER.name} (${PUB_OFFER.price}, ${PUB_OFFER.duration}) : ${PUB_OFFER.ideal}. Inclut : ${PUB_OFFER.features.join(", ")}.`;
