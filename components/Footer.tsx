import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Image
            src="/brand/logo.png"
            alt=""
            width={24}
            height={24}
            className="w-6 h-6 rounded-md"
            aria-hidden="true"
          />
          <span className="font-display text-lg" style={{ fontWeight: 800 }}>
            WAVORE<span className="text-acid">.</span>
          </span>
        </div>
        <p className="text-sm text-cream-dim max-w-md">
          Des pubs musicales générées par IA pour les entreprises qui veulent
          qu&apos;on se souvienne d&apos;elles.
        </p>
        <nav aria-label="Liens de pied de page" className="flex gap-6 text-sm text-cream-dim">
          <Link href="/create" className="hover:text-cream transition-colors min-h-11 flex items-center">
            Créer
          </Link>
          <Link href="/#pricing" className="hover:text-cream transition-colors min-h-11 flex items-center">
            Tarifs
          </Link>
          <Link href="/affiliation" className="hover:text-cream transition-colors min-h-11 flex items-center">
            Parrainage
          </Link>
          <Link href="/contact" className="hover:text-cream transition-colors min-h-11 flex items-center">
            Contact
          </Link>
        </nav>
      </div>
      <div className="flex flex-col items-center gap-2 pb-6">
        <div className="flex items-center gap-4 text-xs text-cream-dim/80">
          <Link href="/mentions-legales" className="hover:text-cream transition-colors min-h-11 flex items-center">
            Mentions légales
          </Link>
          <Link href="/confidentialite" className="hover:text-cream transition-colors min-h-11 flex items-center">
            Confidentialité
          </Link>
        </div>
        <div className="text-center text-xs text-cream-dim/60 font-mono">
          © {new Date().getFullYear()} WAVORE — tous droits réservés
        </div>
      </div>
    </footer>
  );
}
