import { geoArea, geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, Objects } from "topojson-specification";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
import topoJson from "@/data/geo/costa-rica.topo.json";

export interface RegionProps {
  codigo: string;
  nombre: string;
  codigoCanton?: string;
  codigoProvincia?: string;
}

export type RegionFeature = Feature<Polygon | MultiPolygon, RegionProps>;

const topo = topoJson as unknown as Topology<Objects<RegionProps>>;

const toCollection = (layer: "provincias" | "cantones" | "distritos") =>
  feature(topo, topo.objects[layer]) as FeatureCollection<
    Polygon | MultiPolygon,
    RegionProps
  >;

export const provinciaFeatures: RegionFeature[] = toCollection("provincias").features;
export const cantonFeatures: RegionFeature[] = toCollection("cantones").features;
export const distritoFeatures: RegionFeature[] = toCollection("distritos").features;

// The SVG coordinate space. Costa Rica's mainland is wider than tall.
export const MAP_WIDTH = 960;
export const MAP_HEIGHT = 640;

// Isla del Coco (distrito 60110) sits ~500 km offshore; including it in the
// fit would shrink the mainland to a corner. Fit to everything else — the
// island simply falls outside the viewBox until it gets an inset of its own.
const ISLA_DEL_COCO = "60110";
const mainland: FeatureCollection<Polygon | MultiPolygon, RegionProps> = {
  type: "FeatureCollection",
  features: distritoFeatures.filter((d) => d.properties.codigo !== ISLA_DEL_COCO),
};

export const projection = geoMercator().fitExtent(
  [
    [16, 16],
    [MAP_WIDTH - 16, MAP_HEIGHT - 16],
  ],
  mainland
);

export const path = geoPath(projection);

export function pathOf(featureObj: GeoPermissibleObjects): string {
  return path(featureObj) ?? "";
}

export function centroidOf(featureObj: GeoPermissibleObjects): [number, number] {
  return path.centroid(featureObj);
}

/**
 * Anchor point for a region label. For MultiPolygons the plain centroid gets
 * pulled toward offshore islands (Puntarenas would label in the ocean), so
 * take the centroid of the largest polygon instead.
 */
export function labelPointOf(featureObj: RegionFeature): [number, number] {
  const geom = featureObj.geometry;
  if (geom.type === "Polygon") return roundPoint(path.centroid(featureObj));
  let largest = geom.coordinates[0];
  let largestArea = 0;
  for (const coords of geom.coordinates) {
    const area = path.area({ type: "Polygon", coordinates: coords });
    if (area > largestArea) {
      largestArea = area;
      largest = coords;
    }
  }
  return roundPoint(path.centroid({ type: "Polygon", coordinates: largest }));
}

// Server and client float math can differ in the last bits; rounding keeps
// SSR and hydration output identical (path `d` strings are already rounded
// by d3-geo's default digits(3)).
function roundPoint([x, y]: [number, number]): [number, number] {
  return [Math.round(x * 100) / 100, Math.round(y * 100) / 100];
}

const LAYER_FEATURES = {
  provincia: provinciaFeatures,
  canton: cantonFeatures,
  distrito: distritoFeatures,
} as const;

export function getFeature(
  nivel: keyof typeof LAYER_FEATURES,
  codigo: string
): RegionFeature | undefined {
  return LAYER_FEATURES[nivel].find((f) => f.properties.codigo === codigo);
}

const EARTH_RADIUS_KM = 6371;

/**
 * Approximate area in km², computed from the (simplified) geometry via
 * spherical excess — good to a few percent, so callers should present it
 * as approximate.
 */
export function areaKm2Of(featureObj: RegionFeature): number {
  return Math.round(geoArea(featureObj) * EARTH_RADIUS_KM * EARTH_RADIUS_KM);
}

/** Projected bounding box, for zoom-to-bounds transitions. */
export function boundsOf(featureObj: GeoPermissibleObjects): [[number, number], [number, number]] {
  return path.bounds(featureObj);
}

/**
 * Bounds for zooming to a region. Polygons projected entirely outside the
 * viewBox are ignored — Puntarenas (province and canton) contains Isla del
 * Coco ~500 km offshore, and fitting to it would zoom *out* to empty ocean.
 * Falls back to the full bounds when nothing intersects (the island's own
 * district page should zoom to the island).
 */
export function zoomBoundsOf(f: RegionFeature): [[number, number], [number, number]] {
  if (f.geometry.type === "Polygon") return path.bounds(f);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const coords of f.geometry.coordinates) {
    const [[px0, py0], [px1, py1]] = path.bounds({
      type: "Polygon",
      coordinates: coords,
    });
    const intersectsViewBox =
      px1 >= 0 && px0 <= MAP_WIDTH && py1 >= 0 && py0 <= MAP_HEIGHT;
    if (!intersectsViewBox) continue;
    x0 = Math.min(x0, px0);
    y0 = Math.min(y0, py0);
    x1 = Math.max(x1, px1);
    y1 = Math.max(y1, py1);
  }
  return x0 === Infinity ? path.bounds(f) : [[x0, y0], [x1, y1]];
}
