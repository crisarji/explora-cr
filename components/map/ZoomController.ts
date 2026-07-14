import { zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import { MAP_WIDTH, MAP_HEIGHT } from "@/lib/geo";

export const ZOOM_DURATION_MS = 750;
export const MAX_SCALE = 12;
export const MIN_SCALE = 1;

// How far past the map's own edges a manual pan may drift, in viewBox
// units — generous enough to feel unrestricted, bounded so users can't
// pan into unbounded empty space.
const PAN_MARGIN = 200;
// Pointer movement (viewBox units) below which a touch/click is still
// treated as a tap — lets a region's <Link> navigate normally instead of
// being swallowed as the start of a drag.
const CLICK_DISTANCE = 6;

/**
 * Wires up interactive gestures (mouse drag, wheel, touch pinch/pan) on a
 * zoom behavior that will be attached to the map's <svg> via `svg.call()`.
 * `.extent()` and `.translateExtent()` are set in the SAME viewBox-unit
 * coordinate space the rest of lib/geo.ts and fitTransform use — d3's
 * pointer handling resolves mouse/touch positions into the <svg>'s own
 * user-space via getScreenCTM() when the behavior is bound directly to an
 * SVG element with a viewBox, so no separate CSS-pixel conversion is
 * needed here.
 */
export function configureInteractiveZoom(
  zoomBehavior: ZoomBehavior<SVGSVGElement, unknown>
): void {
  zoomBehavior
    .scaleExtent([MIN_SCALE, MAX_SCALE])
    .extent([
      [0, 0],
      [MAP_WIDTH, MAP_HEIGHT],
    ])
    .translateExtent([
      [-PAN_MARGIN, -PAN_MARGIN],
      [MAP_WIDTH + PAN_MARGIN, MAP_HEIGHT + PAN_MARGIN],
    ])
    .clickDistance(CLICK_DISTANCE);
}

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
