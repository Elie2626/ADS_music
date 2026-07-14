import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit lit ses fichiers de police (.afm) sur disque à l'exécution :
  // il doit rester en dehors du bundle serveur pour que ces chemins restent valides.
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
