import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import StatsCards from "@/components/panel/StatsCards";
import RegionList from "@/components/panel/RegionList";
import { getCanton, getCabecera, provincias } from "@/lib/divisiones";
import { getFeature, areaKm2Of } from "@/lib/geo";

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

  const feature = getFeature("canton", canton.codigo);
  const cabecera = getCabecera(canton);

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
        Cantón de {provincia.nombre}. Haz clic en un distrito para acercarte.
      </p>
      <StatsCards
        stats={[
          { label: "Distritos", value: canton.distritos.length },
          ...(cabecera ? [{ label: "Cabecera", value: cabecera.nombre }] : []),
          ...(feature
            ? [{ label: "Área aprox.", value: `${areaKm2Of(feature)} km²` }]
            : []),
        ]}
      />
      <RegionList
        title="Distritos"
        items={canton.distritos.map((d) => ({
          codigo: d.codigo,
          nombre: d.nombre,
          href: `/${provincia.slug}/${canton.slug}/${d.slug}`,
        }))}
      />
    </section>
  );
}
