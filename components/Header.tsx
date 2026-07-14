"use client";

import { useEffect } from "react";
import Link from "next/link";
import SearchCommand from "@/components/SearchCommand";
import { useLangStore, useT, storedLang } from "@/lib/i18n";

export default function Header() {
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);

  // Apply the stored language post-hydration (server HTML is Spanish).
  useEffect(() => {
    const stored = storedLang();
    if (stored && stored !== useLangStore.getState().lang) setLang(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className="border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
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
            className="rounded-md border border-neutral-200 px-2.5 py-1.5 text-sm text-neutral-500 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500"
          >
            {lang === "es" ? "EN" : "ES"}
          </button>
          <Link
            href="/juego"
            className="text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            {t("nav.jugar")}
          </Link>
          <Link
            href="/acerca"
            className="text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            {t("nav.acerca")}
          </Link>
        </div>
      </nav>
    </header>
  );
}
