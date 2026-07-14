import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import StatsCards from "@/components/panel/StatsCards";
import RegionList from "@/components/panel/RegionList";
import T from "@/components/T";
import ShareButton from "@/components/panel/ShareButton";
import { getDistrito, getCabecera, provincias } from "@/lib/divisiones";
import {
  getFeature,
  areaKm2Of,
  distritosOfCanton,
  districtColorIndices,
} from "@/lib/geo";
import { PROVINCE_COLORS } from "@/lib/provinceColors";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ provincia: string; canton: string; distrito: string }>;
}): Promise<Metadata> {
  const { provincia: pSlug, canton: cSlug, distrito: dSlug } = await params;
  const match = getDistrito(pSlug, cSlug, dSlug);
  if (!match) return {};
  const { provincia, canton, distrito } = match;
  return {
    title: `${distrito.nombre}, ${canton.nombre}, ${provincia.nombre}`,
    description: `Mapa interactivo del distrito de ${distrito.nombre}, cantón de ${canton.nombre}, ${provincia.nombre}, Costa Rica.`,
    alternates: {
      canonical: `/${provincia.slug}/${canton.slug}/${distrito.slug}`,
    },
  };
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
  const shades = PROVINCE_COLORS[provincia.codigo]?.districtShades;
  const colorIndex = districtColorIndices(distritosOfCanton(canton.codigo));

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
      <p className="mt-2 text-suave">
        <T
          k={esCabecera ? "distrito.introCabecera" : "distrito.intro"}
          params={{ canton: canton.nombre, provincia: provincia.nombre }}
        />
      </p>
      <ShareButton />
      <StatsCards
        stats={[
          { labelKey: "stats.codigo", value: distrito.codigo },
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
        titleKey="list.otrosDistritos"
        titleParams={{ canton: canton.nombre }}
        items={canton.distritos
          .filter((d) => d.codigo !== distrito.codigo)
          .map((d) => ({
            codigo: d.codigo,
            nombre: d.nombre,
            href: `/${provincia.slug}/${canton.slug}/${d.slug}`,
            colorSwatch: shades?.[(colorIndex.get(d.codigo) ?? 0) % shades.length].swatch,
          }))}
      />
    </section>
  );
}
