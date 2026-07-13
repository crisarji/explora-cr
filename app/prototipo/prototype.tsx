"use client";

/**
 * Throwaway Phase 2 prototype for the Phase 3 interaction core.
 * Proves out the React↔D3 split from PLAN.md architecture rule 3:
 * React mounts the paths; D3 owns only the <g> transform via d3-zoom.
 */
import { useEffect, useRef, useState } from "react";
import { select } from "d3-selection";
import { zoom, zoomIdentity, type ZoomBehavior } from "d3-zoom";
import "d3-transition";
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  provinciaFeatures,
  cantonFeatures,
  pathOf,
  boundsOf,
  type RegionFeature,
} from "@/lib/geo";

const FILL: Record<string, string> = {
  "1": "fill-indigo-300 dark:fill-indigo-600/70",
  "2": "fill-rose-300 dark:fill-rose-600/70",
  "3": "fill-amber-300 dark:fill-amber-600/70",
  "4": "fill-emerald-300 dark:fill-emerald-600/70",
  "5": "fill-orange-300 dark:fill-orange-600/70",
  "6": "fill-sky-300 dark:fill-sky-600/70",
  "7": "fill-violet-300 dark:fill-violet-600/70",
};

const MAX_SCALE = 12;

export default function ZoomPrototype() {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown>>(null);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const svg = select(svgRef.current!);
    const g = select(gRef.current!);
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, MAX_SCALE])
      .on("zoom", (event) => g.attr("transform", event.transform.toString()));
    svg.call(behavior);
    zoomRef.current = behavior;
    return () => {
      svg.on(".zoom", null);
    };
  }, []);

  const zoomTo = (f: RegionFeature) => {
    const [[x0, y0], [x1, y1]] = boundsOf(f);
    const scale = Math.min(
      MAX_SCALE,
      0.9 / Math.max((x1 - x0) / MAP_WIDTH, (y1 - y0) / MAP_HEIGHT)
    );
    const tx = MAP_WIDTH / 2 - (scale * (x0 + x1)) / 2;
    const ty = MAP_HEIGHT / 2 - (scale * (y0 + y1)) / 2;
    select(svgRef.current!)
      .transition()
      .duration(750)
      .call(zoomRef.current!.transform, zoomIdentity.translate(tx, ty).scale(scale));
  };

  const reset = () => {
    setActive(null);
    select(svgRef.current!)
      .transition()
      .duration(750)
      .call(zoomRef.current!.transform, zoomIdentity);
  };

  const cantonesActivos = active
    ? cantonFeatures.filter((c) => c.properties.codigoProvincia === active)
    : [];

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      className="h-auto w-full cursor-grab rounded-lg border border-neutral-200 dark:border-neutral-800"
    >
      {/* Background catches the "zoom out" click */}
      <rect
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        className="fill-transparent"
        onClick={reset}
      />
      <g ref={gRef}>
        {provinciaFeatures.map((f) => {
          const codigo = f.properties.codigo;
          const isActive = active === codigo;
          return (
            <path
              key={codigo}
              d={pathOf(f)}
              vectorEffect="non-scaling-stroke"
              onClick={() => {
                if (isActive) {
                  reset();
                } else {
                  setActive(codigo);
                  zoomTo(f);
                }
              }}
              className={`${FILL[codigo]} cursor-pointer stroke-white transition-opacity duration-500 dark:stroke-neutral-950 ${
                active && !isActive ? "opacity-30 saturate-50" : ""
              }`}
            >
              <title>{f.properties.nombre}</title>
            </path>
          );
        })}
        {/* Only the active province's cantons are mounted (rule 5) */}
        {cantonesActivos.map((c) => (
          <path
            key={c.properties.codigo}
            d={pathOf(c)}
            vectorEffect="non-scaling-stroke"
            className="pointer-events-none fill-transparent stroke-white/90 dark:stroke-neutral-950/90"
          >
            <title>{c.properties.nombre}</title>
          </path>
        ))}
      </g>
    </svg>
  );
}
