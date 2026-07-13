import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import StatsCards from "@/components/panel/StatsCards";
import RegionList from "@/components/panel/RegionList";
import { getDistrito, getCabecera, provincias } from "@/lib/divisiones";
import { getFeature, areaKm2Of } from "@/lib/geo";

export function generateStaticParams() {
  return provincias.flatMap((p) =>
    p.cantones.flatMap((c) =>
      c.distritos.map((d) => ({
        provincia: p.slug,
        canton: c.slug,
        distrito: d.slug,
      }))
    )
  );
}

export default async function DistritoPage({
  params,
}: {
  params: Promise<{ provincia: string; canton: string; distrito: string }>;
}) {
  const { provincia: pSlug, canton: cSlug, distrito: dSlug } = await params;
  const match = getDistrito(pSlug, cSlug, dSlug);
  if (!match) notFound();
  const { provincia, canton, distrito } = match;

  const feature = getFeature("distrito", distrito.codigo);
  const esCabecera = getCabecera(canton)?.codigo === distrito.codigo;

  return (
    <section>
      <Breadcrumb
        items={[
          { nombre: "Costa Rica", href: "/" },
          { nombre: provincia.nombre, href: `/${provincia.slug}` },
          {
            nombre: canton.nombre,
            href: `/${provincia.slug}/${canton.slug}`,
          },
          { nombre: distrito.nombre },
        ]}
      />
      <h1 className="mt-4 text-3xl font-medium">{distrito.nombre}</h1>
      <p className="mt-2 text-neutral-500 dark:text-neutral-400">
        Distrito {esCabecera ? "y cabecera " : ""}del cantón de{" "}
        {canton.nombre}, {provincia.nombre}.
      </p>
      <StatsCards
        stats={[
          { label: "Código", value: distrito.codigo },
          ...(feature
            ? [{ label: "Área aprox.", value: `${areaKm2Of(feature)} km²` }]
            : []),
        ]}
      />
      <RegionList
        title={`Otros distritos de ${canton.nombre}`}
        items={canton.distritos
          .filter((d) => d.codigo !== distrito.codigo)
          .map((d) => ({
            codigo: d.codigo,
            nombre: d.nombre,
            href: `/${provincia.slug}/${canton.slug}/${d.slug}`,
          }))}
      />
    </section>
  );
}
