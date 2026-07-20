"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const fadeUp = {
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

type Testimonial = {
  company: string;
  sector: string;
  icon: string;
  quote: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    company: "G-Cours",
    sector: "Soutien scolaire",
    icon: "/testimonials/g-cours.fr.png",
    quote:
      "Le jingle est devenu notre signature : les parents nous disent qu'ils l'ont en tête. La vidéo tourne sur nos réseaux depuis des mois.",
  },
  {
    company: "Rivall",
    sector: "Tech",
    icon: "/testimonials/rivallq.com.png",
    quote:
      "Brief envoyé un lundi, pub livrée le vendredi. Le rendu est bien au-dessus de ce qu'on espérait pour ce budget.",
  },
  {
    company: "CloserMatch",
    sector: "Services",
    icon: "/testimonials/closermatch.fr.png",
    quote:
      "On cherchait quelque chose de percutant pour lancer la marque. Résultat : une pub qu'on n'a pas honte de mettre partout.",
  },
  {
    company: "BotExpress",
    sector: "Intelligence artificielle",
    icon: "/testimonials/botexpress.fr.png",
    quote:
      "L'équipe a parfaitement saisi notre univers tech. Le jingle électro colle exactement à notre image.",
  },
  {
    company: "SAD Service",
    sector: "Serrurerie — Lyon",
    icon: "/testimonials/serrurerie.sadservice.fr.png",
    quote:
      "Une pub locale, simple et efficace. Nos clients nous en parlent, c'est exactement ce qu'on voulait.",
  },
  {
    company: "Pharm Consult",
    sector: "Santé",
    icon: "/testimonials/pharm-consult.fr.png",
    quote:
      "Professionnel du premier échange à la livraison. La pub inspire confiance, ce qui est essentiel dans notre secteur.",
  },
  {
    company: "Selesta",
    sector: "Services",
    icon: "/testimonials/selesta.fr.png",
    quote:
      "Rapide, abordable, et le résultat fait très pro. On recommande les yeux fermés.",
  },
];

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="w-[320px] sm:w-[360px] shrink-0 rounded-2xl border border-line bg-ink-2 p-6 flex flex-col">
      <div className="flex gap-1" aria-label="Note : 5 étoiles sur 5" role="img">
        {Array.from({ length: 5 }).map((_, s) => (
          <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" aria-hidden="true" />
        ))}
      </div>
      <blockquote className="mt-4 text-sm text-cream-dim leading-relaxed flex-1 whitespace-normal">
        « {t.quote} »
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <Image
          src={t.icon}
          alt=""
          width={40}
          height={40}
          className="w-10 h-10 rounded-lg object-contain bg-cream/5 p-1"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-cream truncate">{t.company}</p>
          <p className="text-xs text-cream-dim">{t.sector}</p>
        </div>
      </figcaption>
    </figure>
  );
}

export default function Testimonials() {
  return (
    <section id="temoignages" className="pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.h2
          {...fadeUp}
          className="font-display text-3xl sm:text-5xl tracking-tight"
          style={{ fontWeight: 700 }}
        >
          Ils nous ont fait confiance<span className="text-acid">.</span>
        </motion.h2>
        <motion.p {...fadeUp} className="mt-4 text-cream-dim max-w-lg">
          Des entreprises de tous secteurs ont déjà leur pub WAVORE.
        </motion.p>
      </div>

      {/* Bande défilante : liste dupliquée pour une boucle sans couture, pause au survol */}
      <div className="mt-10 marquee-viewport" aria-label="Avis de nos clients">
        <div className="animate-marquee-slow flex w-max items-stretch gap-6 px-4 sm:px-6">
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <div key={`${t.company}-${i}`} aria-hidden={i >= TESTIMONIALS.length}>
              <TestimonialCard t={t} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
