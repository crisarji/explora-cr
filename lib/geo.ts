import { geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo";
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
  if (geom.type === "Polygon") return path.centroid(featureObj);
  let largest = geom.coordinates[0];
  let largestArea = 0;
  for (const coords of geom.coordinates) {
    const area = path.area({ type: "Polygon", coordinates: coords });
    if (area > largestArea) {
      largestArea = area;
      largest = coords;
    }
  }
  return path.centroid({ type: "Polygon", coordinates: largest });
}

/** Projected bounding box, for zoom-to-bounds transitions. */
export function boundsOf(featureObj: GeoPermissibleObjects): [[number, number], [number, number]] {
  return path.bounds(featureObj);
}
