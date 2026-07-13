import Link from "next/link";
import { notFound } from "next/navigation";
import { getProvincia, provincias } from "@/lib/divisiones";

export function generateStaticParams() {
  return provincias.map((p) => ({ provincia: p.slug }));
}

export default async function ProvinciaPage({
  params,
}: {
  params: Promise<{ provincia: string }>;
}) {
  const { provincia: slug } = await params;
  const provincia = getProvincia(slug);
  if (!provincia) notFound();

  return (
    <section>
      <nav className="text-sm text-neutral-500">
        <Link href="/" className="hover:text-neutral-900">
          Costa Rica
        </Link>{" "}
        / <span className="text-neutral-900">{provincia.nombre}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-medium">{provincia.nombre}</h1>
      <p className="mt-2 text-neutral-500">
        {provincia.cantones.length > 0
          ? "Cantones:"
          : "Los cantones de esta provincia se cargan en la Fase 1 (pipeline de datos)."}
      </p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {provincia.cantones.map((c) => (
          <li key={c.codigo}>
            <Link
              href={`/${provincia.slug}/${c.slug}`}
              className="inline-block rounded-full border border-neutral-200 px-4 py-1.5 text-sm hover:border-neutral-400"
            >
              {c.nombre}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
