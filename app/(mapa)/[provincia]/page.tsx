import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
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
      <Breadcrumb
        items={[
          { nombre: "Costa Rica", href: "/" },
          { nombre: provincia.nombre },
        ]}
      />
      <h1 className="mt-4 text-3xl font-medium">{provincia.nombre}</h1>
      <p className="mt-2 text-neutral-500 dark:text-neutral-400">
        {provincia.cantones.length} cantones. Haz clic en uno para acercarte.
      </p>
      <ul className="mt-6 flex flex-wrap gap-2" aria-label="Cantones">
        {provincia.cantones.map((c) => (
          <li key={c.codigo}>
            <Link
              href={`/${provincia.slug}/${c.slug}`}
              className="inline-block rounded-full border border-neutral-200 px-4 py-1.5 text-sm hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500"
            >
              {c.nombre}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
