"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { select } from "d3-selection";
import { zoom, zoomIdentity, type ZoomBehavior } from "d3-zoom";
import "d3-transition";
import GeoLayer from "@/components/map/GeoLayer";
import HoverTooltip from "@/components/map/HoverTooltip";
import { fitTransform, zoomDuration } from "@/components/map/ZoomController";
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  provinciaFeatures,
  cantonFeatures,
  zoomBoundsOf,
  type RegionFeature,
} from "@/lib/geo";
import { getProvincia, getProvinciaByCodigo, getCanton } from "@/lib/divisiones";
import { useUIStore, type HoveredRegion } from "@/lib/store";

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

const STROKE = "stroke-white dark:stroke-neutral-950";
const EASE = "transition-[opacity,filter,transform] duration-300";
const FOCUS =
  "group-focus-visible:stroke-neutral-900 dark:group-focus-visible:stroke-white group-focus-visible:stroke-2";

/**
 * Owns the map SVG — the sole React↔D3 boundary (PLAN.md rule 3).
 * React mounts paths; D3 owns only the <g> zoom transform. The camera is
 * driven exclusively by the URL: clicks router.push, and the route-change
 * effect zooms — so click, breadcrumb, back button, and direct links all
 * animate through the same code path.
 */
export default function MapCanvas() {
  const pathname = usePathname();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const hoveredCodigo = useUIStore((s) => s.hovered?.codigo ?? null);
  const setHovered = useUIStore((s) => s.setHovered);
  const setTooltip = useUIStore((s) => s.setTooltip);
  const setAnimating = useUIStore((s) => s.setAnimating);

  // URL → active regions. The URL is the only source of truth for selection.
  const [provSlug, cantonSlug] = pathname.split("/").filter(Boolean);
  const provincia = provSlug ? getProvincia(provSlug) : undefined;
  const canton =
    provincia && cantonSlug ? getCanton(provSlug, cantonSlug)?.canton : undefined;

  const provinciaFeature = useMemo(
    () =>
      provinciaFeatures.find((f) => f.properties.codigo === provincia?.codigo) ??
      null,
    [provincia?.codigo]
  );
  const cantonFeature = useMemo(
    () =>
      cantonFeatures.find((f) => f.properties.codigo === canton?.codigo) ?? null,
    [canton?.codigo]
  );
  // Only the active province's cantons are mounted (PLAN.md rule 5).
  const cantonesDeProvincia = useMemo(
    () =>
      provincia
        ? cantonFeatures.filter(
            (f) => f.properties.codigoProvincia === provincia.codigo
          )
        : [],
    [provincia]
  );
  const cantonSlugByCodigo = useMemo(
    () => new Map(provincia?.cantones.map((c) => [c.codigo, c.slug]) ?? []),
    [provincia]
  );

  // D3 zoom behavior — created once, used programmatically only.
  useEffect(() => {
    const g = select(gRef.current!);
    zoomRef.current = zoom<SVGSVGElement, unknown>().on("zoom", (event) =>
      g.attr("transform", event.transform.toString())
    );
  }, []);

  // Route change → zoom-to-bounds transition.
  useEffect(() => {
    if (!zoomRef.current || !svgRef.current) return;
    const target = cantonFeature ?? provinciaFeature;
    const transform = target ? fitTransform(zoomBoundsOf(target)) : zoomIdentity;
    setAnimating(true);
    setHovered(null);
    setTooltip(null);
    select(svgRef.current)
      .transition()
      .duration(zoomDuration())
      .call(zoomRef.current.transform, transform)
      .on("end interrupt cancel", () => setAnimating(false));
  }, [cantonFeature, provinciaFeature, setAnimating, setHovered, setTooltip]);

  const moveTooltip = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  const startHover = (
    nivel: HoveredRegion["nivel"],
    f: RegionFeature,
    e: React.MouseEvent
  ) => {
    if (useUIStore.getState().isAnimating) return;
    setHovered({
      nivel,
      codigo: f.properties.codigo,
      nombre: f.properties.nombre,
    });
    moveTooltip(e);
  };
  const hoverProvincia = (f: RegionFeature, e: React.MouseEvent) =>
    startHover("provincia", f, e);
  const hoverCanton = (f: RegionFeature, e: React.MouseEvent) =>
    startHover("canton", f, e);
  const endHover = () => {
    setHovered(null);
    setTooltip(null);
  };

  const provinceClass = (f: RegionFeature) => {
    const codigo = f.properties.codigo;
    const fill = PROVINCE_FILL[codigo] ?? "fill-neutral-300";
    const base = `${fill} ${STROKE} ${EASE} ${FOCUS} cursor-pointer`;
    if (provincia) {
      // Zoomed to a province: the active one sits under its cantons;
      // the rest recede.
      return provincia.codigo === codigo
        ? base
        : `${base} opacity-30 saturate-50`;
    }
    if (hoveredCodigo === codigo) return `${base} brightness-110 -translate-y-0.5`;
    if (hoveredCodigo) return `${base} opacity-60`;
    return base;
  };

  const cantonClass = (f: RegionFeature) => {
    const codigo = f.properties.codigo;
    const fill = provincia
      ? PROVINCE_FILL[provincia.codigo]
      : "fill-neutral-300";
    const base = `${fill} ${STROKE} ${EASE} ${FOCUS} cursor-pointer`;
    if (canton) {
      return canton.codigo === codigo
        ? `${base} brightness-110`
        : `${base} opacity-40 saturate-50`;
    }
    if (hoveredCodigo === codigo) return `${base} brightness-110`;
    if (hoveredCodigo) return `${base} opacity-75`;
    return base;
  };

  // Background click climbs one level (reverse zoom via navigation).
  const goUp = () => {
    if (canton && provincia) router.push(`/${provincia.slug}`);
    else if (provincia) router.push("/");
  };

  const ariaLabel = canton
    ? `Mapa del cantón ${canton.nombre}`
    : provincia
      ? `Mapa de la provincia de ${provincia.nombre}`
      : "Mapa de las 7 provincias de Costa Rica";

  return (
    <div ref={containerRef} className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        role="img"
        aria-label={ariaLabel}
        className="h-auto w-full"
      >
        <rect
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          className="fill-transparent"
          onClick={goUp}
        />
        <g ref={gRef}>
          <GeoLayer
            features={provinciaFeatures}
            featureClass={provinceClass}
            hrefOf={(f) =>
              `/${getProvinciaByCodigo(f.properties.codigo)?.slug ?? ""}`
            }
            labels={!provincia}
            onHoverStart={hoverProvincia}
            onHoverMove={moveTooltip}
            onHoverEnd={endHover}
          />
          {provincia && (
            <GeoLayer
              features={cantonesDeProvincia}
              featureClass={cantonClass}
              hrefOf={(f) =>
                `/${provincia.slug}/${cantonSlugByCodigo.get(f.properties.codigo) ?? ""}`
              }
              onHoverStart={hoverCanton}
              onHoverMove={moveTooltip}
              onHoverEnd={endHover}
            />
          )}
        </g>
      </svg>
      <HoverTooltip />
    </div>
  );
}
