import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import StatsCards from "@/components/panel/StatsCards";
import RegionList from "@/components/panel/RegionList";
import { getProvincia, provincias, totalDistritos } from "@/lib/divisiones";
import { getFeature, areaKm2Of } from "@/lib/geo";

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

  const feature = getFeature("provincia", provincia.codigo);

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
        Haz clic en un cantón para acercarte.
      </p>
      <StatsCards
        stats={[
          { label: "Cantones", value: provincia.cantones.length },
          { label: "Distritos", value: totalDistritos(provincia) },
          ...(feature
            ? [{ label: "Área aprox.", value: `${areaKm2Of(feature)} km²` }]
            : []),
        ]}
      />
      <RegionList
        title="Cantones"
        items={provincia.cantones.map((c) => ({
          codigo: c.codigo,
          nombre: c.nombre,
          href: `/${provincia.slug}/${c.slug}`,
        }))}
      />
    </section>
  );
}
