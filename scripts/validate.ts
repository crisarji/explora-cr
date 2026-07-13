/**
 * Data integrity checks for the Phase 1 pipeline output.
 * Expected counts come from the source of truth recorded in PLAN.md §3
 * (IGN SNIT, April 2026): 7 provincias / 84 cantones / 494 distritos.
 */
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { provincias } from "../lib/divisiones";

const EXPECTED = { provincias: 7, cantones: 84, distritos: 494 };
const TOPO_PATH = path.join(__dirname, "..", "data", "geo", "costa-rica.topo.json");
const TOPO_MAX_KB = 500;

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`${ok ? "ok  " : "FAIL"} ${label}: ${actual}${ok ? "" : ` (expected ${expected})`}`);
}

// Hierarchy counts
const cantones = provincias.flatMap((p) => p.cantones);
const distritos = cantones.flatMap((c) => c.distritos);
check("provincias", provincias.length, EXPECTED.provincias);
check("cantones", cantones.length, EXPECTED.cantones);
check("distritos", distritos.length, EXPECTED.distritos);

// Codes unique globally, slugs unique within their parent scope (they form URLs)
const codigos = [...provincias, ...cantones, ...distritos].map((r) => r.codigo);
check("codigos únicos", new Set(codigos).size, codigos.length);
const scopes: { slug: string }[][] = [
  provincias,
  ...provincias.map((p) => p.cantones),
  ...cantones.map((c) => c.distritos),
];
const slugCollisions = scopes.filter(
  (items) => new Set(items.map((i) => i.slug)).size !== items.length
);
check("colisiones de slug", slugCollisions.length, 0);

// TopoJSON layers must match the hierarchy
const topo = JSON.parse(readFileSync(TOPO_PATH, "utf8"));
check("topo provincias", topo.objects.provincias.geometries.length, EXPECTED.provincias);
check("topo cantones", topo.objects.cantones.geometries.length, EXPECTED.cantones);
check("topo distritos", topo.objects.distritos.geometries.length, EXPECTED.distritos);

const topoKb = Math.round(statSync(TOPO_PATH).size / 1024);
check(`topo < ${TOPO_MAX_KB} KB`, topoKb < TOPO_MAX_KB, true);
console.log(`     (topo size: ${topoKb} KB)`);

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nOK — all checks passed");
