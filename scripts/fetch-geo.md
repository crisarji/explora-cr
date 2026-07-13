# Data pipeline notes (Phase 1)

## Sources (pick ONE as source of truth and record it in PLAN.md §3)

1. IGN (Instituto Geográfico Nacional) — official WFS geoservice.
2. https://github.com/schweini/CR_distritos_geojson — provincias/cantones/distritos in GeoJSON.
3. https://github.com/investigacion/divisiones-territoriales-data — names/codes hierarchy (CSV/JSON).

## Pipeline (build-topo.ts, to be written in Phase 1)

1. Download raw GeoJSON for the three levels.
2. Merge into one file with three named layers: provincias, cantones, distritos.
3. Simplify with mapshaper (`-simplify 8% keep-shapes`) — target < 500 KB total.
4. Emit data/geo/costa-rica.topo.json.
5. Regenerate data/divisiones.json + data/slugs.json from the same source.
6. Run scripts/validate.ts (asserts 7 provincias / 84 cantones / N distritos).
