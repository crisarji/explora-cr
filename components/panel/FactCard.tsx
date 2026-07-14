"use client";

import { useLangStore, useT } from "@/lib/i18n";
import type { Fact } from "@/lib/facts";

/** Curated canton tidbit, shown only when one exists in data/facts/. */
export default function FactCard({ fact }: { fact: Fact }) {
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  return (
    <aside className="mt-6 rounded-lg border border-acento/40 bg-acento/10 px-4 py-3">
      <p className="text-xs font-medium text-acento">
        {t("facto.titulo")}
      </p>
      <p className="mt-1 text-sm text-tinta">
        {fact[lang]}
      </p>
    </aside>
  );
}
