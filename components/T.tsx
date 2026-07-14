"use client";

import { useT, type StringKey, type StringParams } from "@/lib/i18n";

/**
 * Translated text leaf for server components: `<T k="home.intro" />`.
 * Server HTML carries the Spanish default; the client swaps strings when
 * the stored language is English.
 */
export default function T({ k, params }: { k: StringKey; params?: StringParams }) {
  const t = useT();
  return <>{t(k, params)}</>;
}
