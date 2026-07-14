"use client";

import { useEffect } from "react";
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

export default function Header() {
  const t = useT();
  const pathname = usePathname();
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  const { theme, toggle } = useTheme();

  // Apply the stored language post-hydration (server HTML is Spanish).
  useEffect(() => {
    const stored = storedLang();
    if (stored && stored !== useLangStore.getState().lang) setLang(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <nav
        aria-label={t("nav.principal")}
        className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3"
      >
        <Link href="/" className="flex items-center gap-2.5 font-semibold">
          <span
            aria-hidden="true"
            className="h-5 w-5 shrink-0 rounded-full border border-borde"
            style={{ background: FLAG_STRIPES }}
          />
          Explora Costa Rica
        </Link>

        <div className="flex rounded-full border border-borde bg-superficie p-0.5">
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
        </div>

        <div className="flex items-center divide-x divide-borde overflow-hidden rounded-lg border border-borde">
          <SearchCommand iconOnly />
          <button
            type="button"
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            aria-label={t("lang.cambiar")}
            className={capsuleButton}
          >
            {lang === "es" ? "EN" : "ES"}
          </button>
          <button
            type="button"
            onClick={toggle}
            aria-label={t("tema.cambiar")}
            className={capsuleButton}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>
      </nav>
    </header>
  );
}
