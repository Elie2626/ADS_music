import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import WavoreAssistant from "@/components/WavoreAssistant";
import { ORGANIZATION_SCHEMA, WEBSITE_SCHEMA } from "@/lib/structured-data";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.wavore.com"),
  title: "WAVORE — Pubs musicales et vidéo générées par IA",
  description:
    "Créez la pub complète de votre entreprise — jingle et vidéo — en quelques minutes. Choisissez le style, l'ambiance, la durée — nous créons, vous diffusez.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.webmanifest",
  verification: {
    google: "Zct7Amwnuv3ai0rHhtr9hJPj67qMzi-n_aZxNeIPK64",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${bricolage.variable} ${instrument.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([ORGANIZATION_SCHEMA, WEBSITE_SCHEMA]),
          }}
        />
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-acid focus:text-ink focus:px-4 focus:py-2 focus:rounded-md focus:font-medium"
        >
          Passer au contenu principal
        </a>
        {children}
        <WavoreAssistant />
      </body>
    </html>
  );
}
