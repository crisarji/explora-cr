import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import StatsCards from "@/components/panel/StatsCards";
import RegionList from "@/components/panel/RegionList";
import T from "@/components/T";
import ShareButton from "@/components/panel/ShareButton";
import { getProvincia, provincias, totalDistritos } from "@/lib/divisiones";
import { getFeature, areaKm2Of } from "@/lib/geo";

export function generateStaticParams() {
  return provincias.map((p) => ({ provincia: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ provincia: string }>;
}): Promise<Metadata> {
  const { provincia: slug } = await params;
  const provincia = getProvincia(slug);
  if (!provincia) return {};
  return {
    title: provincia.nombre,
    description: `Mapa interactivo de la provincia de ${provincia.nombre}, Costa Rica: ${provincia.cantones.length} cantones y ${totalDistritos(provincia)} distritos.`,
    alternates: { canonical: `/${provincia.slug}` },
  };
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
      <p className="mt-2 text-suave">
        <T k="prov.intro" />
      </p>
      <ShareButton />
      <StatsCards
        stats={[
          { labelKey: "stats.cantones", value: provincia.cantones.length },
          { labelKey: "stats.distritos", value: totalDistritos(provincia) },
          ...(feature
            ? [
                {
                  labelKey: "stats.area" as const,
                  value: `${areaKm2Of(feature)} km²`,
                },
              ]
            : []),
        ]}
      />
      <RegionList
        titleKey="list.cantones"
        items={provincia.cantones.map((c) => ({
          codigo: c.codigo,
          nombre: c.nombre,
          href: `/${provincia.slug}/${c.slug}`,
        }))}
      />
    </section>
  );
}
