"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AudioWaveform, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/#styles", label: "Styles" },
  { href: "/#process", label: "Comment ça marche" },
  { href: "/#pricing", label: "Tarifs" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const isCreate = pathname?.startsWith("/create");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-ink/95 backdrop-blur">
      <nav
        aria-label="Navigation principale"
        className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between"
      >
        <Link
          href="/"
          className="flex items-center gap-2 min-h-11 px-2 -ml-2 rounded-md"
          aria-label="ONDE — retour à l'accueil"
          onClick={() => setMenuOpen(false)}
        >
          <AudioWaveform className="w-6 h-6 text-acid" aria-hidden="true" />
          <span className="font-display font-800 text-xl tracking-tight" style={{ fontWeight: 800 }}>
            ONDE<span className="text-acid">.</span>
          </span>
        </Link>

        {/* Nav desktop */}
        <div className="hidden sm:flex items-center gap-1 sm:gap-2">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center min-h-11 px-4 rounded-md text-sm text-cream-dim hover:text-cream transition-colors"
            >
              {l.label}
            </Link>
          ))}
          {!isCreate && (
            <Link
              href="/create"
              className="flex items-center min-h-11 px-5 rounded-full bg-acid text-ink text-sm font-semibold hover:bg-cream transition-colors"
            >
              Créer ma pub
            </Link>
          )}
        </div>

        {/* Bouton menu mobile */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          className="sm:hidden flex items-center justify-center min-h-11 min-w-11 rounded-md text-cream hover:text-acid transition-colors cursor-pointer"
        >
          {menuOpen ? (
            <X className="w-6 h-6" aria-hidden="true" />
          ) : (
            <Menu className="w-6 h-6" aria-hidden="true" />
          )}
        </button>
      </nav>
      <div className="h-px bg-gradient-to-r from-transparent via-line to-transparent" />

      {/* Panneau mobile */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="sm:hidden border-b border-line bg-ink px-4 pb-6 pt-2 flex flex-col gap-1"
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center min-h-12 px-3 rounded-md text-base text-cream-dim hover:text-cream hover:bg-ink-2 transition-colors"
            >
              {l.label}
            </Link>
          ))}
          {!isCreate && (
            <Link
              href="/create"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center min-h-12 mt-2 rounded-full bg-acid text-ink text-base font-semibold hover:bg-cream transition-colors"
            >
              Créer ma pub
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
