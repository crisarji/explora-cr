"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";

export interface Crumb {
  nombre: string;
  /** Present on ancestors; absent on the current page. */
  href?: string;
}

function HomeIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 11 12 3l9 8" />
      <path d="M5 10v10h5v-6h4v6h5V10" />
    </svg>
  );
}

/**
 * Ancestors are chips that read as buttons (border, surface, hover lift) —
 * clicking one zooms the map back out to that level. The current level is
 * a solid accent chip.
 */
export default function Breadcrumb({ items }: { items: Crumb[] }) {
  const t = useT();
  return (
    <nav
      aria-label={t("breadcrumb.label")}
      className="flex flex-wrap items-center gap-2 text-sm"
    >
      {items.map((item, i) => (
        <span key={`${item.nombre}-${i}`} className="flex items-center gap-2">
          {i > 0 && (
            <span aria-hidden="true" className="text-suave">
              ›
            </span>
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="flex items-center gap-1.5 rounded-full border border-borde bg-superficie px-3.5 py-1 text-tinta transition-[color,border-color,translate] hover:-translate-y-px hover:border-acento hover:text-acento"
            >
              {i === 0 && <HomeIcon />}
              {item.nombre}
            </Link>
          ) : (
            <span
              aria-current="page"
              className="rounded-full bg-acento px-3.5 py-1 font-medium text-acento-tinta"
            >
              {item.nombre}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
