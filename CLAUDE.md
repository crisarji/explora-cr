# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Explora Costa Rica — an interactive, animated map of Costa Rica's territorial divisions (7 provinces, 84 cantons, ~490 districts), built as a free static site. It's a personal learning project as well as a public social-service tool, so code should stay simple and readable over clever.

The project has completed **Phases 0–5** (data pipeline, static map, interaction core, full drill-down, animation polish) — see [PLAN.md](PLAN.md) for the phased build plan (Phase 0 through Phase 7) and the architecture rules it commits to. Read PLAN.md before starting work on map rendering, animation, or the data pipeline — it defines the intended design, and its checklists record what is actually done.

## Commands

```bash
npm run dev        # start dev server (http://localhost:3000)
npm run build       # static export build (output: "export" in next.config.ts)
npm run start        # serve the production build
npm run lint          # eslint . (flat config in eslint.config.mjs)
npm run build:topo     # regenerate all data files from the IGN WFS source (scripts/build-topo.mts)
npm run validate        # data-integrity checks: counts, unique codes/slugs, topo consistency, size budget
```

There is no test runner configured yet. `npm run validate` is the closest thing to a test suite — run it after touching anything under `data/` or `lib/divisiones.ts`.

## Architecture

**Routing is state.** Every view is a URL, statically generated via `generateStaticParams`: `/` (country) → `/[provincia]` → `/[provincia]/[canton]` → `/[provincia]/[canton]/[distrito]` (~585 pages). There is no client-side selection state that isn't reflected in the route — page components derive everything from `params`, and the map camera is driven exclusively by route changes: click → `router.push` → zoom-to-bounds effect, so clicks, breadcrumbs, back button, and direct links all animate through one code path. The map pages live in the `app/(mapa)/` route group whose layout mounts `MapCanvas` once so it persists (and animates) across navigations.

**Data layer:** `data/divisiones.json` (full hierarchy: 7 provincias / 84 cantones / 494 distritos, with accent-safe slugs), `data/slugs.json` (flat region index with URL paths), and `data/geo/costa-rica.topo.json` (three TopoJSON layers — provincias/cantones/distritos — that share arcs because cantons and provinces are dissolved from the district geometry) are all **generated files**. Never hand-edit them; regenerate with `npm run build:topo`, which downloads the official IGN SNIT WFS district layer (cached in the gitignored `data/geo/raw/`), simplifies with mapshaper, and derives everything from that single source (see [scripts/fetch-geo.md](scripts/fetch-geo.md)). `lib/divisiones.ts` exposes the hierarchy plus lookup helpers `getProvincia` / `getCanton` / `getDistrito`.

**Static export target:** `next.config.ts` sets `output: "export"`, so this must stay a fully static site — no server components that require a runtime, no API routes, no dynamic (non-generateStaticParams) rendering.

**React↔D3 boundary:** `components/map/MapCanvas.tsx` is the sole boundary. React mounts the paths; D3 owns only the `<g>` zoom transform (programmatic `zoom.transform` transitions — no user gestures bound). Only the active province's cantons and the active canton's districts are mounted, never all 494 districts. `GeoLayer` is written once and reused for all three layers. Map animations (intro border draw, staggered child reveals) are CSS keyframes in `app/globals.css`, applied as layer classes; they use `backwards` fill so class-driven hover/dim states take over when they end.

**State split:** URL params are the only source of truth for the current selection. Zustand (`lib/store.ts`) holds strictly ephemeral UI state (hovered region, tooltip position, animation-in-flight) — never selection state that a URL could represent. Client components that must differ from server HTML (e.g. the once-per-session intro) decide post-hydration in an effect, never during render — the static export renders pages in arbitrary order, so render-time module state causes hydration mismatches.

## Conventions in this codebase

- Copy is in Spanish by default (`<html lang="es">`), with a client-side EN toggle: every UI string lives in the `lib/i18n.ts` dictionary (both languages — add new strings there, never hardcode them in components). Server HTML is always Spanish; the stored language applies post-hydration. Region names are proper nouns and never translate; page metadata stays Spanish.
- Slugs are the accent-safe, URL-safe identifiers used in routes; `codigo` is the official numeric/string code from the data source; `nombre` is the display name. Keep these three distinct — don't conflate slug and nombre.
- Tailwind CSS 4 via `@tailwindcss/postcss` (see `postcss.config.mjs`); `app/globals.css` holds the `@import "tailwindcss"` plus the map animation keyframes — no custom CSS files elsewhere.
- Path alias `@/*` maps to the repo root (`tsconfig.json`), e.g. `@/lib/divisiones`, `@/data/divisiones.seed.json`.
