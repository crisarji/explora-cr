/**
 * Distinct color per province, keyed by official codigo so it survives
 * data regeneration. Single source of truth for MapCanvas (`fill`, SVG
 * paths) and the home-page province chips (`swatch`, a small dot) — same
 * Tailwind color/shade pairing in both, so a chip's dot always matches
 * that province's fill on the map.
 *
 * Colors are drawn from each province's flagship football club — the
 * real, widely-recognized "provincial color" identity in Costa Rica
 * (stronger than any official government flag). Main/secondary per club:
 * San José/Saprissa purple+white, Alajuela/Alajuelense red+black,
 * Cartago/Cartaginés blue+white, Heredia/Herediano red+yellow (from the
 * province's own flag), Guanacaste/Mun. Liberia yellow+black, Puntarenas
 * FC orange+black, Limón green+white (by explicit request, overriding
 * Limón Black Star's black+multicolor kit).
 *
 * Alajuela and Heredia's main colors are both red, and the two provinces
 * border each other — using red for both would make them blur into one
 * shape on the map. Heredia uses its (equally authentic, flag-sourced)
 * secondary yellow here instead.
 *
 * That put Heredia and Guanacaste both on Tailwind's pastel yellow family
 * (`amber-300`/`yellow-300`), which measured at a 1.09:1 WCAG contrast
 * ratio — imperceptible, even though the two provinces don't border each
 * other. Guanacaste is deliberately bumped to the more saturated
 * `yellow-500`/`600` (a genuine gold, matching Mun. Liberia's own "aurum"
 * description) as the one exception to the palette's otherwise-uniform
 * light-300/dark-400 shade convention — everything else follows it.
 */
export const PROVINCE_COLORS: Record<string, { fill: string; swatch: string }> = {
  "1": { fill: "fill-purple-300 dark:fill-purple-400", swatch: "bg-purple-300 dark:bg-purple-400" }, // San José — Saprissa purple
  "2": { fill: "fill-red-300 dark:fill-red-400", swatch: "bg-red-300 dark:bg-red-400" }, // Alajuela — Alajuelense red
  "3": { fill: "fill-blue-300 dark:fill-blue-400", swatch: "bg-blue-300 dark:bg-blue-400" }, // Cartago — Cartaginés blue
  "4": { fill: "fill-amber-300 dark:fill-amber-400", swatch: "bg-amber-300 dark:bg-amber-400" }, // Heredia — Herediano yellow (secondary; red clashes with Alajuela)
  "5": { fill: "fill-yellow-500 dark:fill-yellow-600", swatch: "bg-yellow-500 dark:bg-yellow-600" }, // Guanacaste — Mun. Liberia "aurum" gold, deepened off Heredia's yellow
  "6": { fill: "fill-orange-300 dark:fill-orange-400", swatch: "bg-orange-300 dark:bg-orange-400" }, // Puntarenas — Puntarenas FC orange
  "7": { fill: "fill-green-300 dark:fill-green-400", swatch: "bg-green-300 dark:bg-green-400" }, // Limón — green (requested; secondary white)
};
