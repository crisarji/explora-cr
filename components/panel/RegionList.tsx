"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useT, type StringKey, type StringParams } from "@/lib/i18n";

export interface RegionItem {
  codigo: string;
  nombre: string;
  href: string;
  /** Optional bg-* Tailwind class for a leading color dot (see lib/provinceColors.ts). */
  colorSwatch?: string;
}

/** Chip list linking to child (or sibling) regions, revealed one by one. */
export default function RegionList({
  titleKey,
  titleParams,
  items,
}: {
  titleKey: StringKey;
  titleParams?: StringParams;
  items: RegionItem[];
}) {
  const reduced = useReducedMotion();
  const t = useT();
  const title = t(titleKey, titleParams);

  if (items.length === 0) return null;

  const chip = {
    hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="mt-6">
      <h2 className="text-sm font-medium text-suave">
        {title}
      </h2>
      <motion.ul
        className="mt-3 flex flex-wrap gap-2"
        aria-label={title}
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: reduced
              ? undefined
              : { staggerChildren: 0.02, delayChildren: 0.15 },
          },
        }}
      >
        {items.map((item) => (
          <motion.li key={item.codigo} variants={chip}>
            <Link
              href={item.href}
              className={`inline-flex items-center gap-2 rounded-full border border-borde py-1.5 pr-4 text-sm hover:border-suave ${
                item.colorSwatch ? "pl-2.5" : "pl-4"
              }`}
            >
              {item.colorSwatch && (
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.colorSwatch}`}
                />
              )}
              {item.nombre}
            </Link>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
