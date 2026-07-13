import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WAVORE — Pubs musicales et vidéo générées par IA",
    short_name: "WAVORE",
    description:
      "Créez la pub complète de votre entreprise — jingle et vidéo — en quelques minutes.",
    start_url: "/",
    display: "standalone",
    background_color: "#12101a",
    theme_color: "#12101a",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
