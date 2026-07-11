"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AudioWaveform, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";

export default function Navbar() {
  const pathname = usePathname();
  const isCreate = pathname?.startsWith("/create");
  const { user, loading } = useAuth();

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <nav
        aria-label="Navigation principale"
        className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between"
      >
        <Link
          href="/"
          className="flex items-center gap-2 min-h-11 px-2 -ml-2 rounded-md"
          aria-label="ONDE — retour à l'accueil"
        >
          <AudioWaveform className="w-6 h-6 text-acid" aria-hidden="true" />
          <span className="font-display font-800 text-xl tracking-tight" style={{ fontWeight: 800 }}>
            ONDE<span className="text-acid">.</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/#styles"
            className="hidden sm:flex items-center min-h-11 px-4 rounded-md text-sm text-cream-dim hover:text-cream transition-colors"
          >
            Styles
          </Link>
          <Link
            href="/#process"
            className="hidden sm:flex items-center min-h-11 px-4 rounded-md text-sm text-cream-dim hover:text-cream transition-colors"
          >
            Comment ça marche
          </Link>
          <Link
            href="/#pricing"
            className="hidden sm:flex items-center min-h-11 px-4 rounded-md text-sm text-cream-dim hover:text-cream transition-colors"
          >
            Tarifs
          </Link>
          {!loading &&
            (user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center min-h-11 px-4 rounded-md text-sm text-cream-dim hover:text-cream transition-colors"
                >
                  Mes pubs
                </Link>
                <button
                  type="button"
                  onClick={() => signOut(auth)}
                  aria-label="Se déconnecter"
                  title="Se déconnecter"
                  className="flex items-center justify-center min-h-11 min-w-11 rounded-md text-cream-dim hover:text-cream transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center min-h-11 px-4 rounded-md text-sm text-cream-dim hover:text-cream transition-colors"
              >
                Connexion
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
      </nav>
      <div className="h-px bg-gradient-to-r from-transparent via-line to-transparent" />
    </header>
  );
}
