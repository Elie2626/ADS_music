"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ClipboardList,
  FileText,
  Music4,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Faq from "@/components/Faq";
import Testimonials from "@/components/Testimonials";
import { MUSIC_STYLES } from "@/lib/styles";
import { VIDEO_TIERS } from "@/lib/pricing";

const Scene3D = dynamic(() => import("@/components/Scene3D"), { ssr: false });
const StatNumber3D = dynamic(() => import("@/components/StatNumber3D"), { ssr: false });

/*
 * Les sections restent toujours visibles : pas d'opacité 0 dépendante
 * d'une animation au scroll (fragile sur mobile / onglets en veille).
 */
const fadeUp = {
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

const MARQUEE_ITEMS = [
  "RADIO", "TIKTOK", "INSTAGRAM", "SPOTIFY ADS", "ATTENTE TÉLÉPHONIQUE",
  "YOUTUBE", "PODCAST", "POINT DE VENTE",
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="contenu" className="flex-1">
        {/* ————— HERO ————— */}
        <section className="relative min-h-dvh flex items-center overflow-hidden">
          <Scene3D />
          {/* voile pour la lisibilité du texte */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 30% 50%, rgba(18,16,26,0.88) 0%, rgba(18,16,26,0.42) 55%, transparent 100%)",
            }}
            aria-hidden="true"
          />
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 w-full pt-24">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-mono text-xs sm:text-sm text-acid tracking-[0.25em] uppercase mb-6"
            >
              Pubs vidéo & musicales · sur mesure
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-display max-w-3xl text-5xl sm:text-7xl lg:text-8xl leading-[0.95] tracking-tight"
              style={{ fontWeight: 800 }}
            >
              Votre marque
              <br />
              mérite son <span className="text-acid italic">Clip</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-8 max-w-xl text-lg text-cream-dim leading-relaxed"
            >
              Décrivez votre entreprise, choisissez un style musical et une
              ambiance. Nous créons votre pub complète — jingle et vidéo —
              prête pour la radio, les réseaux et vos points de vente.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link
                href="/create"
                className="group flex items-center gap-2 min-h-12 px-7 rounded-full bg-acid text-ink font-semibold hover:bg-cream transition-colors"
                style={{ touchAction: "manipulation" }}
              >
                Créer ma pub
                <ArrowRight
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="#process"
                className="flex items-center min-h-12 px-7 rounded-full border border-line text-cream hover:border-cream-dim transition-colors"
              >
                Voir comment ça marche
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ————— MARQUEE ————— */}
        <div className="border-y border-line py-4 overflow-hidden" aria-hidden="true">
          <div className="animate-marquee flex w-max gap-8 whitespace-nowrap">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-8 font-mono text-sm text-cream-dim tracking-widest"
              >
                {item} <span className="text-acid">✦</span>
              </span>
            ))}
          </div>
        </div>

        {/* ————— IMPACT / CHIFFRES ————— */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-28">
          <motion.h2
            {...fadeUp}
            className="font-display text-3xl sm:text-5xl tracking-tight max-w-xl"
            style={{ fontWeight: 700 }}
          >
            Une pub oubliée
            <br />
            <span className="text-acid">ne rapporte rien.</span>
          </motion.h2>

          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                num: "30%",
                tag: "Audio",
                text: "Une seule écoute d'un jingle suffit à améliorer la mémorisation de la marque de plus de 30 %.",
              },
              {
                num: "80%",
                tag: "Audio",
                text: "Un jingle bien conçu peut faire grimper le taux de mémorisation d'une pub jusqu'à 80 %.",
              },
              {
                num: "95%",
                tag: "Vidéo",
                text: "Les spectateurs retiennent 95 % d'un message vu en vidéo, contre 10 % seulement à l'écrit.",
              },
              {
                num: "84%",
                tag: "Vidéo",
                text: "84 % des gens disent avoir été convaincus d'acheter après avoir regardé une vidéo de marque.",
              },
            ].map((stat, i) => (
              <motion.figure
                key={stat.num + stat.tag}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                className="stat-card rounded-2xl border border-line bg-ink-2 p-5 sm:p-8 hover:border-acid/40 transition-colors"
              >
                <span className="font-mono text-[10px] tracking-widest uppercase text-acid">
                  {stat.tag}
                </span>
                <StatNumber3D label={stat.num} />
                <figcaption className="mt-2 sm:mt-4 text-xs sm:text-sm text-cream-dim leading-relaxed">
                  {stat.text}
                </figcaption>
              </motion.figure>
            ))}
          </div>

          {/* Comparatif agence vs WAVORE */}
          <motion.div
            {...fadeUp}
            className="mt-6 rounded-2xl border border-acid/40 bg-ink-3 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          >
            <div>
              <p className="text-lg text-cream-dim">
                Une pub vidéo sur mesure via une agence coûte en moyenne{" "}
                <span className="text-cream font-semibold">
                  entre 3 000 € et 15 000 €
                </span>
                .
              </p>
              <p
                className="mt-3 font-display text-2xl sm:text-3xl"
                style={{ fontWeight: 700 }}
              >
                Chez WAVORE, c&apos;est{" "}
                <span className="text-acid">jusqu&apos;à 60× moins cher</span> —
                à partir de {VIDEO_TIERS[0].price}.
              </p>
            </div>
            <Link
              href="/create"
              className="shrink-0 flex items-center gap-2 min-h-12 px-7 rounded-full bg-acid text-ink font-semibold hover:bg-cream transition-colors"
            >
              Créer ma pub
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </motion.div>

          {/* Démo vidéo */}
          <motion.div
            id="demo"
            {...fadeUp}
            className="mt-6 rounded-2xl border border-acid/40 bg-ink-2 p-4 sm:p-6 scroll-mt-24"
          >
            <p className="font-mono text-xs text-acid tracking-[0.25em] uppercase mb-4">
              Regardez un exemple
            </p>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-line bg-ink">
              <video
                controls
                playsInline
                preload="metadata"
                poster="/video/app-demo-poster.jpg"
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src="/video/app-demo.mp4" type="video/mp4" />
              </video>
            </div>
            <p className="mt-4 text-sm text-cream-dim">
              Pub générée par WAVORE — jingle et vidéo réunis.
            </p>
          </motion.div>
        </section>

        {/* ————— PROCESS ————— */}
        <section id="process" className="mx-auto max-w-7xl px-4 sm:px-6 py-28">
          <motion.h2
            {...fadeUp}
            className="font-display text-3xl sm:text-5xl tracking-tight max-w-lg"
            style={{ fontWeight: 700 }}
          >
            Trois étapes.
            <br />
            <span className="text-cream-dim">Une pub complète.</span>
          </motion.h2>

          <div className="mt-16 grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: ClipboardList,
                num: "01",
                title: "Décrivez votre pub",
                text: "Entreprise, message clé, style musical, ambiance, budget et délai. Deux minutes chrono.",
              },
              {
                icon: Music4,
                num: "02",
                title: "Recevez votre devis",
                text: "Un concept de pub — jingle et vidéo — avec prix et délai, généré et envoyé par email.",
              },
              {
                icon: FileText,
                num: "03",
                title: "On crée votre pub",
                text: "Notre équipe compose le jingle et produit la vidéo, prêts pour la radio, les réseaux et vos points de vente.",
              },
            ].map((step, i) => (
              <motion.article
                key={step.num}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.12 }}
                className="relative rounded-2xl border border-line bg-ink-2 p-8 hover:border-acid/40 transition-colors"
              >
                <span className="font-mono text-xs text-acid tracking-widest">
                  {step.num}
                </span>
                <step.icon className="w-8 h-8 mt-6 text-cream" aria-hidden="true" />
                <h3 className="font-display text-xl mt-4" style={{ fontWeight: 600 }}>
                  {step.title}
                </h3>
                <p className="mt-3 text-sm text-cream-dim leading-relaxed">{step.text}</p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* ————— STYLES ————— */}
        <section id="styles" className="mx-auto max-w-7xl px-4 sm:px-6 py-12 pb-28">
          <motion.h2
            {...fadeUp}
            className="font-display text-3xl sm:text-5xl tracking-tight"
            style={{ fontWeight: 700 }}
          >
            Un style pour
            <br />
            <span className="text-cream-dim">chaque business.</span>
          </motion.h2>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MUSIC_STYLES.map((style, i) => (
              <motion.div
                key={style.id}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: (i % 4) * 0.08 }}
                className="group relative rounded-2xl border border-line bg-ink-2 p-6 overflow-hidden hover:-translate-y-1 transition-transform duration-300"
              >
                <div
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
                  style={{ background: style.hue }}
                  aria-hidden="true"
                />
                <div className="flex items-end gap-[3px] h-8 mb-5" aria-hidden="true">
                  {[0.5, 0.9, 0.4, 1, 0.6, 0.8, 0.3].map((h, j) => (
                    <span
                      key={j}
                      className="eq-bar w-1 rounded-full"
                      style={{
                        height: `${h * 100}%`,
                        background: style.hue,
                        animationDelay: `${j * 0.11}s`,
                      }}
                    />
                  ))}
                </div>
                <h3 className="font-display text-lg" style={{ fontWeight: 600 }}>
                  {style.name}
                </h3>
                <p className="mt-1 text-sm text-cream-dim">{style.tagline}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {style.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[10px] tracking-wider uppercase px-2 py-1 rounded-full border border-line text-cream-dim"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ————— TÉMOIGNAGES ————— */}
        <Testimonials />

        {/* ————— PRICING ————— */}
        <section id="pricing" className="mx-auto max-w-7xl px-4 sm:px-6 pb-28">
          <motion.h2
            {...fadeUp}
            className="font-display text-3xl sm:text-5xl tracking-tight"
            style={{ fontWeight: 700 }}
          >
            Des tarifs simples<span className="text-acid">.</span>
          </motion.h2>
          <motion.p
            {...fadeUp}
            className="mt-4 text-cream-dim max-w-lg"
          >
            Jingle et vidéo toujours réunis. Décrivez votre projet et recevez un
            devis personnalisé.
          </motion.p>

          <div className="mt-10 grid sm:grid-cols-3 gap-6 items-stretch">
            {VIDEO_TIERS.map((plan, i) => (
              <motion.div
                key={plan.id}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                className={`relative rounded-2xl border p-8 flex flex-col ${
                  plan.featured ? "border-acid bg-ink-3" : "border-line bg-ink-2"
                }`}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-8 flex items-center gap-1 bg-acid text-ink font-mono text-[10px] tracking-widest uppercase px-3 py-1 rounded-full">
                    <Sparkles className="w-3 h-3" aria-hidden="true" /> Populaire
                  </span>
                )}
                <h3 className="font-mono text-xs tracking-widest uppercase text-cream-dim">
                  {plan.name}
                </h3>
                <p className="mt-4 flex items-baseline gap-2">
                  <span
                    className="font-display text-5xl tabular-nums"
                    style={{ fontWeight: 800 }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-sm text-cream-dim">{plan.duration}</span>
                </p>
                <p className="mt-2 text-sm text-cream-dim">{plan.ideal}</p>
                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-cream-dim">
                      <Check className="w-4 h-4 mt-0.5 text-acid shrink-0" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/create"
                  className={`mt-8 flex items-center justify-center min-h-12 rounded-full font-semibold transition-colors ${
                    plan.featured
                      ? "bg-acid text-ink hover:bg-cream"
                      : "border border-line text-cream hover:border-cream-dim"
                  }`}
                >
                  Demander un devis
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ————— FAQ ————— */}
        <section id="faq" className="mx-auto max-w-7xl px-4 sm:px-6 pb-28">
          <motion.h2
            {...fadeUp}
            className="font-display text-3xl sm:text-5xl tracking-tight"
            style={{ fontWeight: 700 }}
          >
            Questions fréquentes<span className="text-acid">.</span>
          </motion.h2>
          <motion.p {...fadeUp} className="mt-4 text-cream-dim max-w-lg">
            Tout ce qu&apos;il faut savoir avant de commander votre pub.
          </motion.p>

          <motion.div {...fadeUp}>
            <Faq />
          </motion.div>
        </section>

        {/* ————— CTA FINAL ————— */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-12">
          <motion.div
            {...fadeUp}
            className="relative rounded-3xl border border-line bg-ink-2 px-8 py-16 sm:px-16 text-center overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(ellipse 60% 80% at 50% 120%, rgba(157,140,255,0.22), transparent)",
              }}
              aria-hidden="true"
            />
            <h2
              className="relative font-display text-3xl sm:text-5xl tracking-tight"
              style={{ fontWeight: 800 }}
            >
              On crée votre pub ?
            </h2>
            <p className="relative mt-4 text-cream-dim max-w-md mx-auto">
              Deux minutes pour décrire votre entreprise. Une pub — jingle et
              vidéo — dont vos clients se souviendront pendant des années.
            </p>
            <Link
              href="/create"
              className="relative inline-flex items-center gap-2 mt-8 min-h-12 px-8 rounded-full bg-acid text-ink font-semibold hover:bg-cream transition-colors"
            >
              Commencer maintenant
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  );
}
