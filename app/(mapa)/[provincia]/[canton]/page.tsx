import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import StatsCards from "@/components/panel/StatsCards";
import RegionList from "@/components/panel/RegionList";
import T from "@/components/T";
import FactCard from "@/components/panel/FactCard";
import ShareButton from "@/components/panel/ShareButton";
import { getCanton, getCabecera, provincias } from "@/lib/divisiones";
import { getFact } from "@/lib/facts";
import { getFeature, areaKm2Of } from "@/lib/geo";

export function generateStaticParams() {
  return provincias.flatMap((p) =>
    p.cantones.map((c) => ({ provincia: p.slug, canton: c.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ provincia: string; canton: string }>;
}): Promise<Metadata> {
  const { provincia: pSlug, canton: cSlug } = await params;
  const match = getCanton(pSlug, cSlug);
  if (!match) return {};
  const { provincia, canton } = match;
  const cabecera = getCabecera(canton);
  return {
    title: `${canton.nombre}, ${provincia.nombre}`,
    description: `Mapa interactivo del cantón de ${canton.nombre} (${provincia.nombre}, Costa Rica): ${canton.distritos.length} distritos${cabecera ? `, cabecera ${cabecera.nombre}` : ""}.`,
    alternates: { canonical: `/${provincia.slug}/${canton.slug}` },
  };
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
  const fact = getFact(canton.codigo);

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
        <T k="canton.intro" params={{ provincia: provincia.nombre }} />
      </p>
      <ShareButton />
      {fact && <FactCard fact={fact} />}
      <StatsCards
        stats={[
          { labelKey: "stats.distritos", value: canton.distritos.length },
          ...(cabecera
            ? [{ labelKey: "stats.cabecera" as const, value: cabecera.nombre }]
            : []),
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
        titleKey="list.distritos"
        items={canton.distritos.map((d) => ({
          codigo: d.codigo,
          nombre: d.nombre,
          href: `/${provincia.slug}/${canton.slug}/${d.slug}`,
        }))}
      />
    </section>
  );
}
