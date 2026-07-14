"use client";

import GeoLayer from "@/components/map/GeoLayer";
import { fitTransform } from "@/components/map/ZoomController";
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  cantonFeatures,
  provinciaFeatures,
  getFeature,
  zoomBoundsOf,
  type RegionFeature,
} from "@/lib/geo";
import { useT } from "@/lib/i18n";

/**
 * Static quiz map: camera fitted to the target's province, every canton
 * neutral except the highlighted target. No d3 runtime — the transform is
 * computed once and set as an attribute.
 */
export default function QuizMap({
  provinciaCodigo,
  targetCodigo,
}: {
  provinciaCodigo: string;
  targetCodigo: string;
}) {
  const t = useT();
  const provFeature = getFeature("provincia", provinciaCodigo);
  const transform = provFeature
    ? fitTransform(zoomBoundsOf(provFeature)).toString()
    : undefined;
  const cantones = cantonFeatures.filter(
    (f) => f.properties.codigoProvincia === provinciaCodigo
  );

  const neutral =
    "fill-superficie stroke-lienzo";
  const cantonClass = (f: RegionFeature) =>
    f.properties.codigo === targetCodigo
      ? "fill-red-500 stroke-lienzo"
      : "fill-borde stroke-lienzo";

  return (
    <svg
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      role="img"
      aria-label={t("juego.mapaLabel")}
      className="h-auto w-full rounded-lg border border-borde"
    >
      <g transform={transform}>
        <GeoLayer features={provinciaFeatures} featureClass={() => neutral} />
        <GeoLayer features={cantones} featureClass={cantonClass} />
      </g>
    </svg>
  );
}
