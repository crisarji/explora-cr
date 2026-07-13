export interface Stat {
  label: string;
  value: string | number;
}

export default function StatsCards({ stats }: { stats: Stat[] }) {
  return (
    <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-800"
        >
          <dt className="text-xs text-neutral-500 dark:text-neutral-400">
            {s.label}
          </dt>
          <dd className="mt-1 text-lg font-medium">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
