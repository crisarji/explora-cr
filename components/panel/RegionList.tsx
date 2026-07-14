"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useT, type StringKey, type StringParams } from "@/lib/i18n";

export interface RegionItem {
  codigo: string;
  nombre: string;
  href: string;
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
      <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
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
              className="inline-block rounded-full border border-neutral-200 px-4 py-1.5 text-sm hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500"
            >
              {item.nombre}
            </Link>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
