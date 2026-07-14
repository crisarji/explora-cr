# Changelog

All notable changes to this project are documented here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Changed
- New **"Pura Vida"** palette across the site: warm-sand light mode and a deep ocean-navy dark mode (no more pure black) with fully saturated tropical province fills. All chrome colors now go through semantic tokens (`lienzo`, `superficie`, `borde`, `tinta`, `suave`, `acento`) defined once in `globals.css`; the README map artwork matches.

### Added
- Vercel Web Analytics (`@vercel/analytics`) — privacy-friendly, cookie-less page-view counts.
- Phase 7: "¿Cuál es este cantón?" quiz at `/juego` (10 rounds, 4 same-province choices, bilingual); hand-curated canton fact cards (`data/facts/`, 10 seeded); share button with native share sheet + clipboard fallback; README overhaul with generated province-map SVG artwork.
- Phase 6: Cmd+K fuzzy search over all 585 regions (Fuse.js, accent-insensitive, combobox a11y pattern) that flies the camera to the selected region; ES/EN language toggle (client-side dictionary, persisted, ES default); per-page metadata with hierarchical titles and canonical URLs; accessibility pass (labeled navs/regions, focus restore, `aria-current`).
- Phase 5 animation polish: first-load intro where province borders draw themselves in (`pathLength`/`stroke-dashoffset`), staggered canton/district reveals after the zoom lands, Motion fade/slide for side-panel page changes, and staggered region-chip lists. All animations respect `prefers-reduced-motion`.
- Phase 4 full drill-down: district pages at `/[provincia]/[canton]/[distrito]` (494 routes; 590 static pages total), with the district layer rendered on the map for the active canton only and zoom-to-district on navigation — including Isla del Coco, whose page flies the camera out to the island.
- Panel components (`StatsCards`, `RegionList`) used by all four page levels: counts, cabecera (derived from the official district-01 convention), approximate area computed from the geometry (`areaKm2Of`), and child/sibling region chips.
- Phase 3 interaction core: the map now lives in a route-group layout (`app/(mapa)/`) and persists across navigations; the URL drives the camera, so map clicks, canton chips, breadcrumbs, browser back, and direct links all animate through the same zoom-to-bounds transition (`d3-zoom`, programmatic only).
- Hover states (lift region, dim siblings) with a cursor-following name tooltip; hover is suppressed while a zoom is animating.
- `lib/store.ts` (Zustand) for ephemeral UI state only: hovered region, tooltip position, animation-in-flight.
- Shared `Breadcrumb` component on province/canton pages; clicking the map background climbs one level.
- Keyboard accessibility: map regions are focusable links activated with Enter.
- `zoomBoundsOf` in `lib/geo.ts`: zoom fits ignore polygons outside the viewBox, so Puntarenas zooms to its mainland instead of fitting Isla del Coco 500 km offshore.
- `prefers-reduced-motion` collapses zoom transitions to instant.

### Removed
- `/prototipo` zoom prototype (superseded by the real interaction core).

### Fixed
- Hydration mismatch from float nondeterminism in label centroids (rounded to 2 decimals).
- Phase 2 static map: home page renders the 7 provinces as a responsive, colored SVG map (`components/map/MapCanvas.tsx` + reusable `GeoLayer`), with labels anchored to each province's largest polygon and click-through to province pages.
- `lib/geo.ts`: TopoJSON→GeoJSON features, Mercator projection fitted to mainland bounds (Isla del Coco excluded from the fit), path/centroid/bounds helpers.
- Dark-mode palette across the app shell and map.
- `/prototipo`: throwaway zoom-to-bounds prototype (d3-zoom) that de-risks the Phase 3 interaction core — click a province to zoom in and reveal its cantons.
- ESLint flat config (`eslint.config.mjs`); `npm run lint` now runs the ESLint CLI (`next lint` is deprecated in Next 16).
- Phase 1 data pipeline (`npm run build:topo`): downloads official IGN SNIT WFS district boundaries (versión 20260410001), simplifies with mapshaper, dissolves districts → cantons → provinces into a single 445 KB `data/geo/costa-rica.topo.json` with three arc-sharing layers.
- Full hierarchy data: `data/divisiones.json` (7 provincias / 84 cantones / 494 distritos with accent-safe slugs) and `data/slugs.json` (flat region index with URL paths, future search index).
- Canton pages now list their districts; district data exposed via `getDistrito` in `lib/divisiones.ts`.
- `scripts/validate.ts` hardened: asserts counts, globally unique codes, scope-unique slugs, topo/hierarchy consistency, and the < 500 KB topo size budget.

### Changed
- Source of truth recorded in PLAN.md §3: IGN SNIT (both candidate GitHub datasets were outdated at 81 cantons).
- `data/divisiones.seed.json` removed — replaced by the generated `data/divisiones.json`.
- Phase 0 skeleton: Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 project setup.
- Routes: `/` (country), `/[provincia]` (province), `/[provincia]/[canton]` (canton), `/acerca` (about) — all statically generated via `generateStaticParams`.
- `lib/divisiones.ts` data layer with `getProvincia` / `getCanton` lookups, backed by a Phase 0 seed dataset (`data/divisiones.seed.json`).
- `scripts/validate.ts` — asserts expected province/canton counts.
- `scripts/fetch-geo.md` — data pipeline notes and candidate sources for Phase 1.
- Project docs: README.md, PLAN.md (full roadmap and architecture rules), CLAUDE.md, CONTRIBUTING.md, LICENSE (MIT).
