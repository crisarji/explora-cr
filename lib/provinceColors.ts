/**
 * Distinct color per province, keyed by official codigo so it survives
 * data regeneration. Single source of truth for MapCanvas (`fill`, SVG
 * paths) and the home-page province chips (`swatch`, a small dot) — same
 * Tailwind color/shade pairing in both, so a chip's dot always matches
 * that province's fill on the map.
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
export const PROVINCE_COLORS: Record<string, { fill: string; swatch: string }> = {
  "1": { fill: "fill-purple-300 dark:fill-purple-400", swatch: "bg-purple-300 dark:bg-purple-400" }, // San José — Saprissa purple
  "2": { fill: "fill-red-300 dark:fill-red-400", swatch: "bg-red-300 dark:bg-red-400" }, // Alajuela — Alajuelense red
  "3": { fill: "fill-blue-300 dark:fill-blue-400", swatch: "bg-blue-300 dark:bg-blue-400" }, // Cartago — Cartaginés blue
  "4": { fill: "fill-amber-300 dark:fill-amber-400", swatch: "bg-amber-300 dark:bg-amber-400" }, // Heredia — Herediano yellow (secondary; red clashes with Alajuela)
  "5": { fill: "fill-lime-300 dark:fill-lime-400", swatch: "bg-lime-300 dark:bg-lime-400" }, // Guanacaste — "verdor de la pampa" from its own flag, distinct from Limón's green
  "6": { fill: "fill-orange-300 dark:fill-orange-400", swatch: "bg-orange-300 dark:bg-orange-400" }, // Puntarenas — Puntarenas FC orange
  "7": { fill: "fill-green-300 dark:fill-green-400", swatch: "bg-green-300 dark:bg-green-400" }, // Limón — green (requested; secondary white)
};
