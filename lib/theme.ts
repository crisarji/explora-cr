"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "explora-theme";

/**
 * Script injected into <head> so the theme lands before first paint —
 * stored choice first, system preference as the fallback.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(t!=="dark"&&t!=="light"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}})()`;

/**
 * Current theme plus a toggle. `theme` is null until hydration (the server
 * doesn't know the visitor's preference), so render a neutral state first.
 */
export function useTheme(): { theme: Theme | null; toggle: () => void } {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // Read what the pre-paint script decided.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next: Theme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private browsing — the choice still applies for this session.
    }
    setTheme(next);
  };

  return { theme, toggle };
}
