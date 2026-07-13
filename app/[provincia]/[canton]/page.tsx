import Link from "next/link";
import { notFound } from "next/navigation";
import { getCanton, provincias } from "@/lib/divisiones";

export function generateStaticParams() {
  return provincias.flatMap((p) =>
    p.cantones.map((c) => ({ provincia: p.slug, canton: c.slug }))
  );
}

export default async function CantonPage({
  params,
}: {
  params: Promise<{ provincia: string; canton: string }>;
}) {
  const { provincia: pSlug, canton: cSlug } = await params;
  const match = getCanton(pSlug, cSlug);
  if (!match) notFound();
  const { provincia, canton } = match;

  return (
    <section>
      <nav className="text-sm text-neutral-500">
        <Link href="/" className="hover:text-neutral-900">
          Costa Rica
        </Link>{" "}
        /{" "}
        <Link href={`/${provincia.slug}`} className="hover:text-neutral-900">
          {provincia.nombre}
        </Link>{" "}
        / <span className="text-neutral-900">{canton.nombre}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-medium">{canton.nombre}</h1>
      <p className="mt-2 text-neutral-500">
        Los distritos y el mapa de este cantón llegan en las Fases 1–4.
      </p>
    </section>
  );
}
