"use client";

import { useLangStore, useT } from "@/lib/i18n";
import type { Fact } from "@/lib/facts";

/** Curated canton tidbit, shown only when one exists in data/facts/. */
export default function FactCard({ fact }: { fact: Fact }) {
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  return (
    <aside className="mt-6 rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10">
      <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
        {t("facto.titulo")}
      </p>
      <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-200">
        {fact[lang]}
      </p>
    </aside>
  );
}
