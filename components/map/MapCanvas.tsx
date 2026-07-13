import GeoLayer from "@/components/map/GeoLayer";
import { MAP_WIDTH, MAP_HEIGHT, provinciaFeatures, type RegionFeature } from "@/lib/geo";
import { getProvinciaByCodigo } from "@/lib/divisiones";

/**
 * Distinct fill per province, readable in light and dark. Keyed by the
 * official province code so colors stay stable across data regenerations.
 */
const PROVINCE_FILL: Record<string, string> = {
  "1": "fill-indigo-300 dark:fill-indigo-600/70", // San José
  "2": "fill-rose-300 dark:fill-rose-600/70", // Alajuela
  "3": "fill-amber-300 dark:fill-amber-600/70", // Cartago
  "4": "fill-emerald-300 dark:fill-emerald-600/70", // Heredia
  "5": "fill-orange-300 dark:fill-orange-600/70", // Guanacaste
  "6": "fill-sky-300 dark:fill-sky-600/70", // Puntarenas
  "7": "fill-violet-300 dark:fill-violet-600/70", // Limón
};

const provinceClass = (f: RegionFeature) =>
  `${PROVINCE_FILL[f.properties.codigo] ?? "fill-neutral-300"} stroke-white dark:stroke-neutral-950 transition-opacity hover:opacity-80 cursor-pointer`;

const provinceHref = (f: RegionFeature) =>
  `/${getProvinciaByCodigo(f.properties.codigo)?.slug ?? ""}`;

/**
 * Owns the map SVG. Static in Phase 2; becomes the React↔D3 boundary
 * (zoom, transitions) in Phase 3 — see PLAN.md architecture rule 3.
 */
export default function MapCanvas() {
  return (
    <svg
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      role="img"
      aria-label="Mapa de las 7 provincias de Costa Rica"
      className="h-auto w-full"
    >
      <GeoLayer
        features={provinciaFeatures}
        featureClass={provinceClass}
        hrefOf={provinceHref}
        labels
      />
    </svg>
  );
}
