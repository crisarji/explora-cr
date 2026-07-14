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

const FILL: Record<string, string> = {
  "1": "#a5b4fc", // San José — indigo
  "2": "#fda4af", // Alajuela — rose
  "3": "#fcd34d", // Cartago — amber
  "4": "#6ee7b7", // Heredia — emerald
  "5": "#fdba74", // Guanacaste — orange
  "6": "#7dd3fc", // Puntarenas — sky
  "7": "#c4b5fd", // Limón — violet
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
    return `  <text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15" font-weight="500" fill="#171717" stroke="#ffffff" stroke-width="3" paint-order="stroke" stroke-linejoin="round">${f.properties.nombre}</text>`;
  })
  .join("\n");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}">
  <rect width="${MAP_WIDTH}" height="${MAP_HEIGHT}" rx="12" fill="#f8fafc"/>
${shapes}
${labels}
</svg>
`;

mkdirSync("docs", { recursive: true });
writeFileSync("docs/mapa.svg", svg);
console.log(`docs/mapa.svg written (${(svg.length / 1024).toFixed(0)} KB)`);
