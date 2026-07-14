"use client";

import { useEffect } from "react";
import Link from "next/link";
import SearchCommand from "@/components/SearchCommand";
import { useLangStore, useT, storedLang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

export default function Header() {
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  const { theme, toggle } = useTheme();

  // Apply the stored language post-hydration (server HTML is Spanish).
  useEffect(() => {
    const stored = storedLang();
    if (stored && stored !== useLangStore.getState().lang) setLang(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className="border-b border-borde px-6 py-4">
      <nav
        aria-label={t("nav.principal")}
        className="mx-auto flex max-w-5xl items-center justify-between gap-4"
      >
        <Link href="/" className="text-lg font-medium">
          Explora Costa Rica
        </Link>
        <div className="flex items-center gap-3">
          <SearchCommand />
          <button
            type="button"
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            aria-label={t("lang.cambiar")}
            className="rounded-md border border-borde px-2.5 py-1.5 text-sm text-suave hover:border-suave"
          >
            {lang === "es" ? "EN" : "ES"}
          </button>
          <button
            type="button"
            onClick={toggle}
            aria-label={t("tema.cambiar")}
            className="rounded-md border border-borde px-2.5 py-1.5 text-sm text-suave hover:border-suave"
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
          <Link
            href="/juego"
            className="text-sm text-suave hover:text-tinta"
          >
            {t("nav.jugar")}
          </Link>
          <Link
            href="/acerca"
            className="text-sm text-suave hover:text-tinta"
          >
            {t("nav.acerca")}
          </Link>
        </div>
      </nav>
    </header>
  );
}
