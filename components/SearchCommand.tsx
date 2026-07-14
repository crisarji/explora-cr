"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import slugsIndex from "@/data/slugs.json";
import { getProvincia, getCanton } from "@/lib/divisiones";
import { useT, type StringKey } from "@/lib/i18n";

interface RegionEntry {
  tipo: "provincia" | "canton" | "distrito";
  codigo: string;
  nombre: string;
  path: string;
}

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const ENTRIES: (RegionEntry & { norm: string })[] = (
  slugsIndex as RegionEntry[]
).map((e) => ({ ...e, norm: normalize(e.nombre) }));

const fuse = new Fuse(ENTRIES, {
  keys: ["norm", "nombre"],
  threshold: 0.3,
  ignoreLocation: true,
});

const MAX_RESULTS = 12;

/** Ancestor context shown next to a result ("Grecia · cantón · Alajuela"). */
function contextOf(entry: RegionEntry): string | null {
  const [provSlug, cantonSlug] = entry.path.split("/").filter(Boolean);
  if (entry.tipo === "canton") {
    return getProvincia(provSlug)?.nombre ?? null;
  }
  if (entry.tipo === "distrito") {
    const match = getCanton(provSlug, cantonSlug);
    return match ? `${match.canton.nombre}, ${match.provincia.nombre}` : null;
  }
  return null;
}

/**
 * Cmd+K fuzzy search over all 585 regions. Selecting a result just
 * router.pushes its URL — the URL-driven camera does the flying.
 */
export default function SearchCommand() {
  const router = useRouter();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return [];
    return fuse.search(q, { limit: MAX_RESULTS }).map((r) => r.item);
  }, [query]);

  // Global Cmd+K / Ctrl+K shortcut.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus management + scroll lock while open.
  useEffect(() => {
    if (open) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";
      inputRef.current?.focus();
    } else {
      document.body.style.overflow = "";
      restoreFocusRef.current?.focus?.();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setActive(0);
  };

  const go = (entry: RegionEntry) => {
    close();
    router.push(entry.path);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) =>
        results.length ? (i - 1 + results.length) % results.length : 0
      );
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-1.5 text-sm text-neutral-500 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500"
        aria-label={t("search.titulo")}
      >
        <span>{t("search.abrir")}</span>
        <kbd className="rounded border border-neutral-200 px-1.5 py-0.5 text-[10px] text-neutral-400 dark:border-neutral-700">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-neutral-950/40 p-4 pt-[15vh] backdrop-blur-sm"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("search.titulo")}
            className="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls="search-results"
              aria-activedescendant={
                results[active] ? `search-opt-${results[active].codigo}` : undefined
              }
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder={t("search.placeholder")}
              className="w-full border-b border-neutral-200 bg-transparent px-4 py-3 text-base outline-none placeholder:text-neutral-400 dark:border-neutral-700"
            />
            <ul
              id="search-results"
              role="listbox"
              aria-label={t("search.titulo")}
              className="max-h-80 overflow-y-auto"
            >
              {query.trim() && results.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  {t("search.vacio", { query: query.trim() })}
                </li>
              )}
              {results.map((r, i) => {
                const context = contextOf(r);
                return (
                  <li
                    key={r.codigo}
                    id={`search-opt-${r.codigo}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go(r)}
                    className={`flex cursor-pointer items-baseline justify-between gap-3 px-4 py-2.5 text-sm ${
                      i === active
                        ? "bg-neutral-100 dark:bg-neutral-800"
                        : ""
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="font-medium">{r.nombre}</span>
                      {context && (
                        <span className="ml-2 truncate text-neutral-500 dark:text-neutral-400">
                          {context}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-xs text-neutral-400 dark:text-neutral-500">
                      {t(`search.tipo.${r.tipo}` as StringKey)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
