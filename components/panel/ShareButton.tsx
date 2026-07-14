"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";

/**
 * Native share sheet where available (mobile), clipboard fallback
 * elsewhere. No third-party scripts.
 */
export default function ShareButton() {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
      } catch {
        // User dismissed the share sheet — nothing to do.
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={share}
      aria-live="polite"
      className="mt-3 rounded-md border border-neutral-200 px-3 py-1.5 text-sm text-neutral-500 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500"
    >
      {copied ? t("compartir.copiado") : t("compartir.boton")}
    </button>
  );
}
