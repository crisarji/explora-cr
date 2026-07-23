# Data pipeline notes (Phase 1)

## Source of truth (decided 2026-07-13)

**IGN SNIT WFS geoservice** — `https://geos.snitcr.go.cr/be/IGN_5_CO/wfs`, layer
`IGN_5_CO:limitedistrital_5k` (1:5000 district boundaries, versión 20260410001).
7 provincias / 84 cantones / 494 distritos.

Sources evaluated and rejected:

- https://github.com/schweini/CR_distritos_geojson — outdated: 81 cantons
  (pre-2017, missing Río Cuarto, Monteverde, Puerto Jiménez).
- https://github.com/investigacion/divisiones-territoriales-data — same problem
  (README says "Los 81 cantones"), and has no geometry.

The IGN district layer carries the full hierarchy in its properties
(`CÓDIGO_DTA`, `DISTRITO`, `CÓDIGO_CANTÓN`, `CANTÓN`, `CÓDIGO_PROVINCIA`,
`PROVINCIA`), so both geometry and `divisiones.json` derive from this one layer.

## Pipeline (`pnpm run build:topo` → scripts/build-topo.mts)

1. Download the district layer as GeoJSON (EPSG:4326) → `data/geo/raw/`
   (~60 MB, gitignored, cached — delete to force re-download).
2. Simplify with mapshaper (`-simplify 2.5% keep-shapes`).
3. Dissolve districts → cantones → provincias so all three layers share arcs.
4. Emit `data/geo/costa-rica.topo.json` (3 layers, 445 KB).
5. Emit `data/divisiones.json` (hierarchy + slugs) and `data/slugs.json`
   (flat region index with URL paths, feeds Phase 6 search).
6. `pnpm run validate` asserts counts, unique codes, scope-unique slugs,
   topo/hierarchy consistency, and the < 500 KB size budget.
