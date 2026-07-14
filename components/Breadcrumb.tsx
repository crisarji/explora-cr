"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";

export interface Crumb {
  nombre: string;
  /** Present on ancestors; absent on the current page. */
  href?: string;
}

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  const t = useT();
  return (
    <nav
      aria-label={t("breadcrumb.label")}
      className="text-sm text-suave"
    >
      {items.map((item, i) => (
        <span key={`${item.nombre}-${i}`}>
          {i > 0 && <span aria-hidden="true"> / </span>}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-tinta"
            >
              {item.nombre}
            </Link>
          ) : (
            <span
              aria-current="page"
              className="text-tinta"
            >
              {item.nombre}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
