import Link from "next/link";
import { provincias } from "@/lib/divisiones";

export default function HomePage() {
  return (
    <section>
      <h1 className="text-3xl font-medium">Costa Rica</h1>
      <p className="mt-2 text-neutral-500">
        7 provincias · 84 cantones · ~490 distritos. El mapa interactivo llega
        en la Fase 2 — por ahora, explora la jerarquía.
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {provincias.map((p) => (
          <li key={p.codigo}>
            <Link
              href={`/${p.slug}`}
              className="block rounded-lg border border-neutral-200 px-4 py-3 hover:border-neutral-400"
            >
              {p.nombre}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
