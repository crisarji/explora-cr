/**
 * Renders the province map as a standalone SVG for the README
 * (docs/mapa.svg). Fixed colors — no Tailwind — so it looks the same on
 * GitHub in light and dark. Run with: npx tsx scripts/render-map-svg.mts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  provinciaFeatures,
  pathOf,
  labelPointOf,
} from "../lib/geo";

// Kept in sync by hand with lib/provinceColors.ts (Tailwind 300-shade hex
// values) — see that file for why Heredia uses yellow, not its clubs's red.
const FILL: Record<string, string> = {
  "1": "#d8b4fe", // San José — Saprissa purple
  "2": "#fca5a5", // Alajuela — Alajuelense red
  "3": "#93c5fd", // Cartago — Cartaginés blue
  "4": "#fcd34d", // Heredia — Herediano yellow
  "5": "#fde047", // Guanacaste — Mun. Liberia yellow
  "6": "#fdba74", // Puntarenas — Puntarenas FC orange
  "7": "#86efac", // Limón — green
};

const shapes = provinciaFeatures
  .map((f) => {
    const fill = FILL[f.properties.codigo] ?? "#d4d4d4";
    return `  <path d="${pathOf(f)}" fill="${fill}" stroke="#ffffff" stroke-width="1.5"/>`;
  })
  .join("\n");

const labels = provinciaFeatures
  .map((f) => {
    const [x, y] = labelPointOf(f);
    return `  <text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15" font-weight="500" fill="#27303a" stroke="#ffffff" stroke-width="3" paint-order="stroke" stroke-linejoin="round">${f.properties.nombre}</text>`;
  })
  .join("\n");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}">
  <rect width="${MAP_WIDTH}" height="${MAP_HEIGHT}" rx="12" fill="#faf7f0"/>
${shapes}
${labels}
</svg>
`;

mkdirSync("docs", { recursive: true });
writeFileSync("docs/mapa.svg", svg);
console.log(`docs/mapa.svg written (${(svg.length / 1024).toFixed(0)} KB)`);
