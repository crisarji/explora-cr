import Link from "next/link";

export interface RegionItem {
  codigo: string;
  nombre: string;
  href: string;
}

/** Chip list linking to child (or sibling) regions. */
export default function RegionList({
  title,
  items,
}: {
  title: string;
  items: RegionItem[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="mt-6">
      <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
        {title}
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2" aria-label={title}>
        {items.map((item) => (
          <li key={item.codigo}>
            <Link
              href={item.href}
              className="inline-block rounded-full border border-neutral-200 px-4 py-1.5 text-sm hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500"
            >
              {item.nombre}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
