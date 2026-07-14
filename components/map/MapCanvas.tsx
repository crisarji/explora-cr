"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  distritoFeatures,
  zoomBoundsOf,
  type RegionFeature,
} from "@/lib/geo";
import {
  getProvincia,
  getProvinciaByCodigo,
  getCanton,
  getDistrito,
} from "@/lib/divisiones";
import { useUIStore, type HoveredRegion } from "@/lib/store";

/**
 * Distinct fill per province, readable in light and dark. Keyed by the
 * official province code so colors stay stable across data regenerations.
 * Cantons and districts inherit their province's hue.
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

// The border-drawing intro plays once per session, and only when the
// session starts at the country view (deep links skip straight to their
// zoom). Module-level so route changes don't replay it.
let introPlayed = false;
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

  const [showIntro, setShowIntro] = useState(false);

  const hoveredCodigo = useUIStore((s) => s.hovered?.codigo ?? null);
  const setHovered = useUIStore((s) => s.setHovered);
  const setTooltip = useUIStore((s) => s.setTooltip);
  const setAnimating = useUIStore((s) => s.setAnimating);

  // URL → active regions. The URL is the only source of truth for selection.
  const [provSlug, cantonSlug, distritoSlug] = pathname.split("/").filter(Boolean);
  const provincia = provSlug ? getProvincia(provSlug) : undefined;

  // Intro decision happens after hydration (server HTML must not carry the
  // class — the export worker renders pages in arbitrary order).
  useEffect(() => {
    if (!introPlayed && !provincia) {
      introPlayed = true;
      // Post-hydration setState is the point: the class must differ from
      // the server HTML only after React has taken over.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowIntro(true);
    }
    // Run once at mount: the intro belongs to the session's first view only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const canton =
    provincia && cantonSlug ? getCanton(provSlug, cantonSlug)?.canton : undefined;
  const distrito =
    canton && distritoSlug
      ? getDistrito(provSlug, cantonSlug, distritoSlug)?.distrito
      : undefined;

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
  const distritoFeature = useMemo(
    () =>
      distritoFeatures.find((f) => f.properties.codigo === distrito?.codigo) ??
      null,
    [distrito?.codigo]
  );

  // Only the active province's cantons and the active canton's districts
  // are mounted (PLAN.md rule 5) — never all 494 districts at once.
  const cantonesDeProvincia = useMemo(
    () =>
      provincia
        ? cantonFeatures.filter(
            (f) => f.properties.codigoProvincia === provincia.codigo
          )
        : [],
    [provincia]
  );
  const distritosDeCanton = useMemo(
    () =>
      canton
        ? distritoFeatures.filter(
            (f) => f.properties.codigoCanton === canton.codigo
          )
        : [],
    [canton]
  );
  const cantonSlugByCodigo = useMemo(
    () => new Map(provincia?.cantones.map((c) => [c.codigo, c.slug]) ?? []),
    [provincia]
  );
  const distritoSlugByCodigo = useMemo(
    () => new Map(canton?.distritos.map((d) => [d.codigo, d.slug]) ?? []),
    [canton]
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
    const target = distritoFeature ?? cantonFeature ?? provinciaFeature;
    const transform = target
      ? fitTransform(zoomBoundsOf(target))
      : zoomIdentity;
    setAnimating(true);
    setHovered(null);
    setTooltip(null);
    select(svgRef.current)
      .transition()
      .duration(zoomDuration())
      .call(zoomRef.current.transform, transform)
      .on("end interrupt cancel", () => setAnimating(false));
  }, [
    distritoFeature,
    cantonFeature,
    provinciaFeature,
    setAnimating,
    setHovered,
    setTooltip,
  ]);

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
  const hoverDistrito = (f: RegionFeature, e: React.MouseEvent) =>
    startHover("distrito", f, e);
  const endHover = () => {
    setHovered(null);
    setTooltip(null);
  };

  const provinceClass = (f: RegionFeature) => {
    const codigo = f.properties.codigo;
    const fill = PROVINCE_FILL[codigo] ?? "fill-neutral-300";
    const base = `${fill} ${STROKE} ${EASE} ${FOCUS} cursor-pointer`;
    if (provincia) {
      // Zoomed in: the active province sits under its cantons; the rest
      // recede.
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
      // The active canton sits under its districts; siblings recede.
      return canton.codigo === codigo
        ? base
        : `${base} opacity-40 saturate-50`;
    }
    if (hoveredCodigo === codigo) return `${base} brightness-110`;
    if (hoveredCodigo) return `${base} opacity-75`;
    return base;
  };

  const distritoClass = (f: RegionFeature) => {
    const codigo = f.properties.codigo;
    const fill = provincia
      ? PROVINCE_FILL[provincia.codigo]
      : "fill-neutral-300";
    const base = `${fill} ${STROKE} ${EASE} ${FOCUS} cursor-pointer`;
    if (distrito) {
      return distrito.codigo === codigo
        ? `${base} brightness-110`
        : `${base} opacity-40 saturate-50`;
    }
    if (hoveredCodigo === codigo) return `${base} brightness-110`;
    if (hoveredCodigo) return `${base} opacity-75`;
    return base;
  };

  // Background click climbs one level (reverse zoom via navigation).
  const goUp = () => {
    if (distrito && canton && provincia) {
      router.push(`/${provincia.slug}/${canton.slug}`);
    } else if (canton && provincia) {
      router.push(`/${provincia.slug}`);
    } else if (provincia) {
      router.push("/");
    }
  };

  const ariaLabel = distrito
    ? `Mapa del distrito ${distrito.nombre}`
    : canton
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
            className={showIntro ? "map-intro" : undefined}
          />
          {provincia && (
            <GeoLayer
              key={provincia.codigo}
              features={cantonesDeProvincia}
              featureClass={cantonClass}
              hrefOf={(f) =>
                `/${provincia.slug}/${cantonSlugByCodigo.get(f.properties.codigo) ?? ""}`
              }
              onHoverStart={hoverCanton}
              onHoverMove={moveTooltip}
              onHoverEnd={endHover}
              className="geo-reveal"
            />
          )}
          {provincia && canton && (
            <GeoLayer
              key={canton.codigo}
              features={distritosDeCanton}
              featureClass={distritoClass}
              hrefOf={(f) =>
                `/${provincia.slug}/${canton.slug}/${distritoSlugByCodigo.get(f.properties.codigo) ?? ""}`
              }
              onHoverStart={hoverDistrito}
              onHoverMove={moveTooltip}
              onHoverEnd={endHover}
              className="geo-reveal"
            />
          )}
        </g>
      </svg>
      <HoverTooltip />
    </div>
  );
}
