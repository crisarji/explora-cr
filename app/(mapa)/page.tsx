import Link from "next/link";
import { provincias } from "@/lib/divisiones";

export default function HomePage() {
  return (
    <section>
      <h1 className="text-3xl font-medium">Costa Rica</h1>
      <p className="mt-2 text-neutral-500 dark:text-neutral-400">
        7 provincias · 84 cantones · 494 distritos. Haz clic en una provincia
        para explorarla.
      </p>
      <ul className="mt-8 flex flex-wrap gap-2" aria-label="Provincias">
        {provincias.map((p) => (
          <li key={p.codigo}>
            <Link
              href={`/${p.slug}`}
              className="inline-block rounded-full border border-neutral-200 px-4 py-1.5 text-sm hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500"
            >
              {p.nombre}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
