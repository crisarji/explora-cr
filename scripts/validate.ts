import { provincias } from "../lib/divisiones";

const totalCantones = provincias.reduce((n, p) => n + p.cantones.length, 0);

console.log(`Provincias: ${provincias.length}`);
console.log(`Cantones:   ${totalCantones}`);

if (provincias.length !== 7) {
  console.error("FAIL: expected 7 provincias");
  process.exit(1);
}

if (totalCantones !== 84) {
  console.warn(
    "NOTE: seed data has fewer than 84 cantones — expected until Phase 1 replaces it."
  );
}

console.log("OK (Phase 0 seed)");
