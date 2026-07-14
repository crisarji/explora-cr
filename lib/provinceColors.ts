/**
 * Distinct color per province, keyed by official codigo so it survives
 * data regeneration. Single source of truth for MapCanvas (`fill`, SVG
 * paths) and the home-page province chips (`swatch`, a small dot) — same
 * Tailwind color/shade pairing in both, so a chip's dot always matches
 * that province's fill on the map.
 */
export const PROVINCE_COLORS: Record<string, { fill: string; swatch: string }> = {
  "1": { fill: "fill-purple-300 dark:fill-purple-400", swatch: "bg-purple-300 dark:bg-purple-400" }, // San José
  "2": { fill: "fill-red-300 dark:fill-red-400", swatch: "bg-red-300 dark:bg-red-400" }, // Alajuela
  "3": { fill: "fill-amber-300 dark:fill-amber-400", swatch: "bg-amber-300 dark:bg-amber-400" }, // Cartago
  "4": { fill: "fill-emerald-300 dark:fill-emerald-400", swatch: "bg-emerald-300 dark:bg-emerald-400" }, // Heredia
  "5": { fill: "fill-orange-300 dark:fill-orange-400", swatch: "bg-orange-300 dark:bg-orange-400" }, // Guanacaste
  "6": { fill: "fill-sky-300 dark:fill-sky-400", swatch: "bg-sky-300 dark:bg-sky-400" }, // Puntarenas
  "7": { fill: "fill-lime-300 dark:fill-lime-400", swatch: "bg-lime-300 dark:bg-lime-400" }, // Limón
};
