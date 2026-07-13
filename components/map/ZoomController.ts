import { zoomIdentity, type ZoomTransform } from "d3-zoom";
import { MAP_WIDTH, MAP_HEIGHT } from "@/lib/geo";

export const ZOOM_DURATION_MS = 750;
export const MAX_SCALE = 12;

/**
 * Transform that centers a projected bounding box in the viewBox,
 * filling 90% of it (the classic d3 zoom-to-bounds fit).
 */
export function fitTransform(
  [[x0, y0], [x1, y1]]: [[number, number], [number, number]]
): ZoomTransform {
  const scale = Math.min(
    MAX_SCALE,
    0.9 / Math.max((x1 - x0) / MAP_WIDTH, (y1 - y0) / MAP_HEIGHT)
  );
  const tx = MAP_WIDTH / 2 - (scale * (x0 + x1)) / 2;
  const ty = MAP_HEIGHT / 2 - (scale * (y0 + y1)) / 2;
  return zoomIdentity.translate(tx, ty).scale(scale);
}

export function zoomDuration(): number {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return 0;
  }
  return ZOOM_DURATION_MS;
}
