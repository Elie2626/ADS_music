/*
 * Grille tarifaire des pubs vidéo ONDE.
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
  featured?: boolean;
};

export const VIDEO_TIERS: VideoTier[] = [
  {
    id: "essentielle",
    name: "Essentielle",
    price: "490 €",
    priceValue: 490,
    duration: "15 s",
    ideal: "Réseaux sociaux, un format vertical",
    features: [
      "Jingle ONDE sur mesure inclus",
      "Montage animé (logo + vos visuels)",
      "Format vertical 9:16",
      "1 révision incluse",
      "Livraison en 5 jours",
    ],
  },
  {
    id: "signature",
    name: "Signature",
    price: "990 €",
    priceValue: 990,
    duration: "30 s",
    ideal: "Le format pub le plus polyvalent",
    features: [
      "Jingle ONDE sur mesure inclus",
      "Concept créatif + storyboard",
      "Plans vidéo générés par IA",
      "3 formats (vertical, carré, paysage)",
      "3 révisions incluses",
      "Livraison en 7 jours",
    ],
    featured: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "1 990 €",
    priceValue: 1990,
    duration: "jusqu'à 60 s",
    ideal: "Campagne complète, haut de gamme",
    features: [
      "Jingle ONDE sur mesure inclus",
      "Direction artistique dédiée",
      "Production vidéo sur mesure",
      "Déclinaisons multi-formats illimitées",
      "Révisions illimitées",
      "Accompagnement diffusion",
    ],
  },
];

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
export const PRICING_CONTEXT = VIDEO_TIERS.map(
  (t) =>
    `- ${t.name} (${t.price}, ${t.duration}) : ${t.ideal}. Inclut : ${t.features.join(", ")}.`
).join("\n");
