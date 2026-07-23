import Link from "next/link";
import { useRouter } from "next/navigation";
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
  /**
   * Animation hook for the layer <g> ("map-intro", "geo-reveal" — see
   * globals.css). Paths carry a --geo-i index for staggered delays.
   */
  className?: string;
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
  className,
}: GeoLayerProps) {
  const router = useRouter();

  return (
    <g className={className}>
      {features.map((f, i) => {
        const shape = (
          <path
            key={f.properties.codigo}
            d={pathOf(f)}
            pathLength={1}
            vectorEffect="non-scaling-stroke"
            style={{ "--geo-i": i } as React.CSSProperties}
            className={featureClass(f)}
            onMouseEnter={onHoverStart ? (e) => onHoverStart(f, e) : undefined}
            onMouseMove={onHoverMove}
            onMouseLeave={onHoverEnd}
          >
            {/* Native tooltip only when no custom hover handling exists */}
            {!onHoverStart && <title>{f.properties.nombre}</title>}
          </path>
        );
        const href = hrefOf?.(f);
        return href ? (
          <Link
            key={f.properties.codigo}
            href={href}
            aria-label={f.properties.nombre}
            className="group outline-none"
            // Browser support for keyboard-activating an SVG <a> is
            // inconsistent (confirmed: focus works, native Enter/Space
            // navigation does not) — trigger the route change explicitly
            // rather than rely on default anchor behavior inside <svg>.
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                router.push(href);
              }
            }}
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
              className="pointer-events-none select-none fill-tinta stroke-lienzo/80 stroke-[3px] text-sm font-medium"
            >
              {f.properties.nombre}
            </text>
          );
        })}
    </g>
  );
}
