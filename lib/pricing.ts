/*
 * Grille tarifaire des pubs WAVORE (jingle + vidéo), par durée.
 * Sert à la fois d'affichage sur le site et de cadre pour le devis
 * généré par l'IA (pour qu'il reste cohérent et à ton image).
 */

export type VideoTier = {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  durationSeconds: number;
  duration: string;
  ideal: string;
  features: string[];
  featured?: boolean;
};

export const VIDEO_TIERS: VideoTier[] = [
  {
    id: "courte",
    name: "Courte",
    price: "49 €",
    priceValue: 49,
    durationSeconds: 15,
    duration: "15 s",
    ideal: "Réseaux sociaux, un format vertical",
    features: [
      "Jingle WAVORE sur mesure",
      "Montage vidéo animé (logo + visuels)",
      "Format vertical 9:16",
      "Pas satisfait ? 1 changement disponible",
      "Livraison en 5 jours",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: "99 €",
    priceValue: 99,
    durationSeconds: 30,
    duration: "30 s",
    ideal: "Le format le plus polyvalent",
    features: [
      "Jingle WAVORE sur mesure",
      "Montage vidéo animé (logo + visuels)",
      "Formats vertical, carré et paysage",
      "Pas satisfait ? 2 changements disponibles",
      "Livraison en 5 jours",
    ],
    featured: true,
  },
  {
    id: "longue",
    name: "Longue",
    price: "149 €",
    priceValue: 149,
    durationSeconds: 60,
    duration: "1 min",
    ideal: "Campagne complète, tous supports",
    features: [
      "Jingle WAVORE sur mesure",
      "Montage vidéo animé (logo + visuels)",
      "Tous formats (vertical, carré, paysage)",
      "Pas satisfait ? 3 changements disponibles",
      "Livraison en 7 jours",
    ],
  },
];

export const DEFAULT_TIER = VIDEO_TIERS[1];

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
