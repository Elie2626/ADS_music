export type MusicStyle = {
  id: string;
  name: string;
  tagline: string;
  tags: string[];
  hue: string; // couleur d'accent de la carte
};

export const MUSIC_STYLES: MusicStyle[] = [
  {
    id: "pop-energique",
    name: "Pop énergique",
    tagline: "Accrocheur, moderne, impossible à oublier",
    tags: ["Retail", "Food", "Jeunesse"],
    hue: "#9d8cff",
  },
  {
    id: "electro-futuriste",
    name: "Électro futuriste",
    tagline: "Synthés, punch, image high-tech",
    tags: ["Tech", "Auto", "Startup"],
    hue: "#5ec8fa",
  },
  {
    id: "acoustique-chaleureux",
    name: "Acoustique chaleureux",
    tagline: "Guitare, proximité, confiance",
    tags: ["Artisan", "Local", "Bio"],
    hue: "#ffb35e",
  },
  {
    id: "hip-hop-urbain",
    name: "Hip-hop urbain",
    tagline: "Groove, attitude, ancrage street",
    tags: ["Mode", "Sport", "Event"],
    hue: "#ff8a5c",
  },
  {
    id: "orchestral-premium",
    name: "Orchestral premium",
    tagline: "Cordes, prestige, haut de gamme",
    tags: ["Luxe", "Immobilier", "Finance"],
    hue: "#c9b8ff",
  },
  {
    id: "jazz-lounge",
    name: "Jazz lounge",
    tagline: "Élégant, feutré, intemporel",
    tags: ["Restaurant", "Hôtel", "Bar"],
    hue: "#ffd166",
  },
  {
    id: "rock-percutant",
    name: "Rock percutant",
    tagline: "Guitares saturées, énergie brute",
    tags: ["Auto", "Sport", "Outillage"],
    hue: "#f76b8a",
  },
  {
    id: "chill-ambient",
    name: "Chill ambient",
    tagline: "Doux, aérien, bien-être",
    tags: ["Spa", "Santé", "Yoga"],
    hue: "#6ee7c0",
  },
];

export const MOODS = [
  "Joyeux",
  "Dynamique",
  "Élégant",
  "Rassurant",
  "Épique",
  "Fun / décalé",
  "Émotionnel",
  "Sérieux",
] as const;

export const DURATIONS = [
  { value: 15, label: "15 s", hint: "Spot radio court / réseaux sociaux" },
  { value: 30, label: "30 s", hint: "Format pub standard" },
  { value: 60, label: "60 s", hint: "Jingle complet / attente téléphonique" },
] as const;

export const VOICE_OPTIONS = [
  { id: "femme", label: "Voix féminine" },
  { id: "homme", label: "Voix masculine" },
  { id: "duo", label: "Duo chanté" },
  { id: "instrumental", label: "Instrumental seul" },
] as const;
