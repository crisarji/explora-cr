"use client";

import { useT, type StringKey } from "@/lib/i18n";

export interface Stat {
  labelKey: StringKey;
  value: string | number;
}

export default function StatsCards({ stats }: { stats: Stat[] }) {
  const t = useT();
  return (
    <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {stats.map((s) => (
        <div
          key={s.labelKey}
          className="rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-800"
        >
          <dt className="text-xs text-neutral-500 dark:text-neutral-400">
            {t(s.labelKey)}
          </dt>
          <dd className="mt-1 text-lg font-medium">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
