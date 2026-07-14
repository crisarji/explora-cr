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
  "1": "#d8b4fe", // San José — guaria purple
  "2": "#fca5a5", // Alajuela — macaw red
  "3": "#fcd34d", // Cartago — mango amber
  "4": "#6ee7b7", // Heredia — jungle emerald
  "5": "#fdba74", // Guanacaste — sunset orange
  "6": "#7dd3fc", // Puntarenas — ocean sky
  "7": "#bef264", // Limón — lime
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
