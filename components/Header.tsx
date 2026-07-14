"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchCommand from "@/components/SearchCommand";
import { useLangStore, useT, storedLang, type StringKey } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

// Costa Rican flag stripes (blue/white/red/white/blue), used for the top
// ribbon and the brand dot.
const FLAG_STRIPES =
  "linear-gradient(180deg,#002b7f 0%,#002b7f 18%,#ffffff 18%,#ffffff 38%,#ce1126 38%,#ce1126 62%,#ffffff 62%,#ffffff 82%,#002b7f 82%,#002b7f 100%)";
const FLAG_RIBBON =
  "linear-gradient(90deg,#002b7f 0%,#002b7f 30%,#f6f6f4 30%,#f6f6f4 42%,#ce1126 42%,#ce1126 72%,#f6f6f4 72%,#f6f6f4 82%,#002b7f 82%,#002b7f 100%)";

const SECTIONS: { id: string; href: string; labelKey: StringKey }[] = [
  { id: "mapa", href: "/", labelKey: "nav.mapa" },
  { id: "juego", href: "/juego", labelKey: "nav.jugar" },
  { id: "acerca", href: "/acerca", labelKey: "nav.acerca" },
];

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export default function Header() {
  const t = useT();
  const pathname = usePathname();
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  // Apply the stored language post-hydration (server HTML is Spanish).
  useEffect(() => {
    const stored = storedLang();
    if (stored && stored !== useLangStore.getState().lang) setLang(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close the mobile menu on navigation.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
  }, [pathname]);

  const section = pathname.startsWith("/juego")
    ? "juego"
    : pathname.startsWith("/acerca")
      ? "acerca"
      : "mapa";

  const capsuleButton =
    "flex h-9 w-10 items-center justify-center text-sm text-suave hover:bg-superficie hover:text-tinta";

  return (
    <header className="border-b border-borde">
      <div aria-hidden="true" className="h-1" style={{ background: FLAG_RIBBON }} />
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:gap-4 md:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2 font-semibold md:gap-2.5">
          <span
            aria-hidden="true"
            className="h-5 w-5 shrink-0 rounded-full border border-borde"
            style={{ background: FLAG_STRIPES }}
          />
          <span className="truncate">Explora Costa Rica</span>
        </Link>

        {/* Desktop: segmented section nav (centered) */}
        <nav
          aria-label={t("nav.principal")}
          className="hidden rounded-full border border-borde bg-superficie p-0.5 md:flex"
        >
          {SECTIONS.map((s) => (
            <Link
              key={s.id}
              href={s.href}
              aria-current={section === s.id ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                section === s.id
                  ? "bg-acento font-medium text-acento-tinta"
                  : "text-suave hover:text-tinta"
              }`}
            >
              {t(s.labelKey)}
            </Link>
          ))}
        </nav>

        {/* Desktop: tools capsule */}
        <div className="hidden items-center divide-x divide-borde overflow-hidden rounded-lg border border-borde md:flex">
          <SearchCommand iconOnly />
          <button
            type="button"
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            aria-label={t("lang.cambiar")}
            className={capsuleButton}
          >
            {lang === "es" ? "EN" : "ES"}
          </button>
          <button type="button" onClick={toggle} aria-label={t("tema.cambiar")} className={capsuleButton}>
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>

        {/* Mobile: search stays one tap away; everything else moves into the menu */}
        <div className="flex items-center gap-1.5 md:hidden">
          <div className="overflow-hidden rounded-lg border border-borde">
            <SearchCommand iconOnly />
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={t("nav.menu")}
            className="flex h-9 w-10 items-center justify-center rounded-lg border border-borde text-suave hover:bg-superficie hover:text-tinta"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-borde px-4 py-3 md:hidden">
          <nav aria-label={t("nav.principal")} className="flex flex-col gap-1">
            {SECTIONS.map((s) => (
              <Link
                key={s.id}
                href={s.href}
                aria-current={section === s.id ? "page" : undefined}
                className={`rounded-lg px-3 py-2.5 text-sm ${
                  section === s.id
                    ? "bg-acento font-medium text-acento-tinta"
                    : "text-suave hover:bg-superficie hover:text-tinta"
                }`}
              >
                {t(s.labelKey)}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex gap-2 border-t border-borde pt-3">
            <button
              type="button"
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              className="flex-1 rounded-lg border border-borde px-2 py-2 text-center text-sm text-suave hover:text-tinta"
            >
              {t("lang.cambiar")}
            </button>
            <button
              type="button"
              onClick={toggle}
              className="flex-1 rounded-lg border border-borde px-2 py-2 text-center text-sm text-suave hover:text-tinta"
            >
              {t("tema.cambiar")}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
