# Changelog

All notable changes to this project are documented here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Fixed
- Guanacaste and Heredia's map fills were both Tailwind pastel yellow (measured 1.09:1 WCAG contrast — imperceptible), flagged during a mobile-viewport check. Guanacaste now uses the deeper `yellow-500`/`600` gold instead — the one exception to the palette's otherwise-uniform light-300/dark-400 shade convention, documented in `lib/provinceColors.ts`. Verified: contrast improved to 1.32:1 (light) / 1.71:1 (dark), Euclidean RGB distance from 21→60 and 14→69.

### Changed
- Province map colors now match each province's real football-club identity (San José/Saprissa purple, Alajuela/Alajuelense red, Cartago/Cartaginés blue, Heredia/Herediano yellow — Alajuela and Heredia's clubs are both red, and the provinces border each other, so Heredia uses its flag-sourced yellow instead — Guanacaste/Mun. Liberia yellow, Puntarenas FC orange, Limón green by request). `lib/provinceColors.ts` documents the reasoning; `docs/mapa.svg` regenerated to match.

### Added
- Interactive map gestures: mouse-drag-pan, wheel/trackpad-zoom on desktop, touch pinch/pan on mobile. `zoom.clickDistance` keeps stationary taps passing through to each region's `<Link>` unchanged; `scaleExtent`/`translateExtent`/`extent` (all in the same viewBox-unit space as `lib/geo.ts`) bound how far a manual gesture can drift. Manual pan/zoom is ephemeral — never written to the URL — so any navigation still re-triggers the deterministic `fitTransform` animation. Addresses the mobile-pass follow-up: small cantons/districts are now easy to zoom into by hand instead of relying on precise taps.

### Changed
- Mobile pass on the header: the segmented nav and tools capsule (search/language/theme) were unreachable off-screen below ~480px width. Replaced with a compact bar (brand + search icon + hamburger) that expands into a full-width menu with stacked nav links and lang/theme buttons; closes automatically on navigation. Desktop layout (Header B) is untouched — the collapse only triggers below the `md` breakpoint.
- Stats cards are always 3 columns (was 2 on mobile, leaving an orphaned third card on its own row).
- Footer is now fixed to the bottom of the viewport on desktop (`md:` breakpoint and up); stays in normal flow on mobile. `main` reserves matching bottom padding so content never sits underneath it.
- Home-page province chips gained a small color dot matching that province's exact map fill — `lib/provinceColors.ts` is now the single source of truth both MapCanvas and the chips read from, so the two can't drift apart.
- Header redesigned: Costa Rican flag ribbon + brand dot, segmented Mapa/Jugar/Acerca navigation showing the active section, and a tools capsule (search, language, theme). Search shortcut label is platform-aware (Ctrl K / ⌘K).
- Breadcrumb redesigned as clickable chips: ancestors read as buttons (border, hover lift, home icon on the root), current level is a solid accent chip — clicking a chip zooms the map back out to that level.
- Dark/light mode is now an explicit header toggle persisted per visitor (system preference only seeds the first visit).
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
