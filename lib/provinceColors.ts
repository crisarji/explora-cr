/**
 * Distinct color per province, keyed by official codigo so it survives
 * data regeneration. Single source of truth for MapCanvas (`fill`, SVG
 * paths) and the home-page province chips (`swatch`, a small dot) — same
 * Tailwind color/shade pairing in both, so a chip's dot always matches
 * that province's fill on the map. `districtShades` steps districts within
 * a canton through lightness of the same hue (paired `fill`/`swatch` so a
 * district's "Otros distritos" chip dot matches its map fill too) — which
 * one a given district gets comes from `districtColorIndices` in lib/geo.ts
 * (adjacency via shared TopoJSON arcs), not array order, so bordering
 * districts never land on the same step. Classes are written out literally
 * (not built from a template) because Tailwind's scanner only picks up
 * class names that appear verbatim in source text.
 *
 * Colors are drawn from real provincial identity — mostly each province's
 * flagship football club (the strongest, most widely-recognized
 * "provincial color" association in Costa Rica), except Guanacaste, which
 * has its own actual provincial flag (adopted 1974) and uses that instead.
 * Main/secondary per source: San José/Saprissa purple+white,
 * Alajuela/Alajuelense red+black, Cartago/Cartaginés blue+white,
 * Heredia/Herediano red+yellow (from the province's own flag), Puntarenas
 * FC orange+black, Limón green+white (by explicit request, overriding
 * Limón Black Star's black+multicolor kit). Guanacaste's flag is blue
 * (sky/coastal waters) / white (peace) / green ("verdor de la pampa",
 * the savanna) with a red hoist triangle (historic battles) — blue is
 * already Cartago's, so Guanacaste uses a savanna-toned lime-green here
 * instead, distinct from Limón's true green.
 *
 * Alajuela and Heredia's main colors are both red, and the two provinces
 * border each other — using red for both would make them blur into one
 * shape on the map. Heredia uses its (equally authentic, flag-sourced)
 * secondary yellow here instead.
 */
export interface DistrictShade {
  fill: string;
  swatch: string;
}

export const PROVINCE_COLORS: Record<
  string,
  { fill: string; swatch: string; districtShades: DistrictShade[] }
> = {
  "1": {
    fill: "fill-purple-300 dark:fill-purple-400",
    swatch: "bg-purple-300 dark:bg-purple-400",
    districtShades: [
      { fill: "fill-purple-100 dark:fill-purple-200", swatch: "bg-purple-100 dark:bg-purple-200" },
      { fill: "fill-purple-200 dark:fill-purple-300", swatch: "bg-purple-200 dark:bg-purple-300" },
      { fill: "fill-purple-300 dark:fill-purple-400", swatch: "bg-purple-300 dark:bg-purple-400" },
      { fill: "fill-purple-400 dark:fill-purple-500", swatch: "bg-purple-400 dark:bg-purple-500" },
      { fill: "fill-purple-500 dark:fill-purple-600", swatch: "bg-purple-500 dark:bg-purple-600" },
      { fill: "fill-purple-600 dark:fill-purple-700", swatch: "bg-purple-600 dark:bg-purple-700" },
    ],
  }, // San José — Saprissa purple
  "2": {
    fill: "fill-red-300 dark:fill-red-400",
    swatch: "bg-red-300 dark:bg-red-400",
    districtShades: [
      { fill: "fill-red-100 dark:fill-red-200", swatch: "bg-red-100 dark:bg-red-200" },
      { fill: "fill-red-200 dark:fill-red-300", swatch: "bg-red-200 dark:bg-red-300" },
      { fill: "fill-red-300 dark:fill-red-400", swatch: "bg-red-300 dark:bg-red-400" },
      { fill: "fill-red-400 dark:fill-red-500", swatch: "bg-red-400 dark:bg-red-500" },
      { fill: "fill-red-500 dark:fill-red-600", swatch: "bg-red-500 dark:bg-red-600" },
      { fill: "fill-red-600 dark:fill-red-700", swatch: "bg-red-600 dark:bg-red-700" },
    ],
  }, // Alajuela — Alajuelense red
  "3": {
    fill: "fill-blue-300 dark:fill-blue-400",
    swatch: "bg-blue-300 dark:bg-blue-400",
    districtShades: [
      { fill: "fill-blue-100 dark:fill-blue-200", swatch: "bg-blue-100 dark:bg-blue-200" },
      { fill: "fill-blue-200 dark:fill-blue-300", swatch: "bg-blue-200 dark:bg-blue-300" },
      { fill: "fill-blue-300 dark:fill-blue-400", swatch: "bg-blue-300 dark:bg-blue-400" },
      { fill: "fill-blue-400 dark:fill-blue-500", swatch: "bg-blue-400 dark:bg-blue-500" },
      { fill: "fill-blue-500 dark:fill-blue-600", swatch: "bg-blue-500 dark:bg-blue-600" },
      { fill: "fill-blue-600 dark:fill-blue-700", swatch: "bg-blue-600 dark:bg-blue-700" },
    ],
  }, // Cartago — Cartaginés blue
  "4": {
    fill: "fill-amber-300 dark:fill-amber-400",
    swatch: "bg-amber-300 dark:bg-amber-400",
    districtShades: [
      { fill: "fill-amber-100 dark:fill-amber-200", swatch: "bg-amber-100 dark:bg-amber-200" },
      { fill: "fill-amber-200 dark:fill-amber-300", swatch: "bg-amber-200 dark:bg-amber-300" },
      { fill: "fill-amber-300 dark:fill-amber-400", swatch: "bg-amber-300 dark:bg-amber-400" },
      { fill: "fill-amber-400 dark:fill-amber-500", swatch: "bg-amber-400 dark:bg-amber-500" },
      { fill: "fill-amber-500 dark:fill-amber-600", swatch: "bg-amber-500 dark:bg-amber-600" },
      { fill: "fill-amber-600 dark:fill-amber-700", swatch: "bg-amber-600 dark:bg-amber-700" },
    ],
  }, // Heredia — Herediano yellow (secondary; red clashes with Alajuela)
  "5": {
    fill: "fill-lime-300 dark:fill-lime-400",
    swatch: "bg-lime-300 dark:bg-lime-400",
    districtShades: [
      { fill: "fill-lime-100 dark:fill-lime-200", swatch: "bg-lime-100 dark:bg-lime-200" },
      { fill: "fill-lime-200 dark:fill-lime-300", swatch: "bg-lime-200 dark:bg-lime-300" },
      { fill: "fill-lime-300 dark:fill-lime-400", swatch: "bg-lime-300 dark:bg-lime-400" },
      { fill: "fill-lime-400 dark:fill-lime-500", swatch: "bg-lime-400 dark:bg-lime-500" },
      { fill: "fill-lime-500 dark:fill-lime-600", swatch: "bg-lime-500 dark:bg-lime-600" },
      { fill: "fill-lime-600 dark:fill-lime-700", swatch: "bg-lime-600 dark:bg-lime-700" },
    ],
  }, // Guanacaste — "verdor de la pampa" from its own flag, distinct from Limón's green
  "6": {
    fill: "fill-orange-300 dark:fill-orange-400",
    swatch: "bg-orange-300 dark:bg-orange-400",
    districtShades: [
      { fill: "fill-orange-100 dark:fill-orange-200", swatch: "bg-orange-100 dark:bg-orange-200" },
      { fill: "fill-orange-200 dark:fill-orange-300", swatch: "bg-orange-200 dark:bg-orange-300" },
      { fill: "fill-orange-300 dark:fill-orange-400", swatch: "bg-orange-300 dark:bg-orange-400" },
      { fill: "fill-orange-400 dark:fill-orange-500", swatch: "bg-orange-400 dark:bg-orange-500" },
      { fill: "fill-orange-500 dark:fill-orange-600", swatch: "bg-orange-500 dark:bg-orange-600" },
      { fill: "fill-orange-600 dark:fill-orange-700", swatch: "bg-orange-600 dark:bg-orange-700" },
    ],
  }, // Puntarenas — Puntarenas FC orange
  "7": {
    fill: "fill-green-300 dark:fill-green-400",
    swatch: "bg-green-300 dark:bg-green-400",
    districtShades: [
      { fill: "fill-green-100 dark:fill-green-200", swatch: "bg-green-100 dark:bg-green-200" },
      { fill: "fill-green-200 dark:fill-green-300", swatch: "bg-green-200 dark:bg-green-300" },
      { fill: "fill-green-300 dark:fill-green-400", swatch: "bg-green-300 dark:bg-green-400" },
      { fill: "fill-green-400 dark:fill-green-500", swatch: "bg-green-400 dark:bg-green-500" },
      { fill: "fill-green-500 dark:fill-green-600", swatch: "bg-green-500 dark:bg-green-600" },
      { fill: "fill-green-600 dark:fill-green-700", swatch: "bg-green-600 dark:bg-green-700" },
    ],
  }, // Limón — green (requested; secondary white)
};
