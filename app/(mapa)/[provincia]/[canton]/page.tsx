import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
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
      <Breadcrumb
        items={[
          { nombre: "Costa Rica", href: "/" },
          { nombre: provincia.nombre, href: `/${provincia.slug}` },
          { nombre: canton.nombre },
        ]}
      />
      <h1 className="mt-4 text-3xl font-medium">{canton.nombre}</h1>
      <p className="mt-2 text-neutral-500 dark:text-neutral-400">
        {canton.distritos.length} distritos. El detalle por distrito llega en
        la Fase 4.
      </p>
      <ul className="mt-6 flex flex-wrap gap-2" aria-label="Distritos">
        {canton.distritos.map((d) => (
          <li
            key={d.codigo}
            className="inline-block rounded-full border border-neutral-200 px-4 py-1.5 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-300"
          >
            {d.nombre}
          </li>
        ))}
      </ul>
    </section>
  );
}
