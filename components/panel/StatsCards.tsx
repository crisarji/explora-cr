"use client";

import { useT, type StringKey } from "@/lib/i18n";

export interface Stat {
  labelKey: StringKey;
  value: string | number;
}

export default function StatsCards({ stats }: { stats: Stat[] }) {
  const t = useT();
  return (
    <dl className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
      {stats.map((s) => (
        <div
          key={s.labelKey}
          className="rounded-lg border border-borde bg-superficie px-4 py-3"
        >
          <dt className="text-xs text-suave">
            {t(s.labelKey)}
          </dt>
          <dd className="mt-1 text-lg font-medium">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
