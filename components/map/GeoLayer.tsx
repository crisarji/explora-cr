import Link from "next/link";
import { pathOf, labelPointOf, type RegionFeature } from "@/lib/geo";

interface GeoLayerProps {
  features: RegionFeature[];
  /** Tailwind classes per feature (fill, stroke, hover/dim states). */
  featureClass: (f: RegionFeature) => string;
  /** When set, each region becomes a link (SVG <a> via next/link). */
  hrefOf?: (f: RegionFeature) => string;
  /** When true, draws the region name at its label anchor. */
  labels?: boolean;
  onHoverStart?: (f: RegionFeature, e: React.MouseEvent) => void;
  onHoverMove?: (e: React.MouseEvent) => void;
  onHoverEnd?: () => void;
}

/**
 * Renders one geographic layer as SVG paths. Written once, used for
 * provincias, cantones, and distritos alike (PLAN.md architecture rule 4).
 */
export default function GeoLayer({
  features,
  featureClass,
  hrefOf,
  labels,
  onHoverStart,
  onHoverMove,
  onHoverEnd,
}: GeoLayerProps) {
  return (
    <g>
      {features.map((f) => {
        const shape = (
          <path
            key={f.properties.codigo}
            d={pathOf(f)}
            vectorEffect="non-scaling-stroke"
            className={featureClass(f)}
            onMouseEnter={onHoverStart ? (e) => onHoverStart(f, e) : undefined}
            onMouseMove={onHoverMove}
            onMouseLeave={onHoverEnd}
          >
            {/* Native tooltip only when no custom hover handling exists */}
            {!onHoverStart && <title>{f.properties.nombre}</title>}
          </path>
        );
        return hrefOf ? (
          <Link
            key={f.properties.codigo}
            href={hrefOf(f)}
            aria-label={f.properties.nombre}
            className="group outline-none"
          >
            {shape}
          </Link>
        ) : (
          shape
        );
      })}
      {labels &&
        features.map((f) => {
          const [x, y] = labelPointOf(f);
          return (
            <text
              key={f.properties.codigo}
              x={x}
              y={y}
              textAnchor="middle"
              paintOrder="stroke"
              strokeLinejoin="round"
              className="pointer-events-none select-none fill-neutral-900 stroke-white/80 stroke-[3px] text-sm font-medium dark:fill-white dark:stroke-neutral-950/80"
            >
              {f.properties.nombre}
            </text>
          );
        })}
    </g>
  );
}
