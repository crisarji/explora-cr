# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Explora Costa Rica — an interactive, animated map of Costa Rica's territorial divisions (7 provinces, 84 cantons, ~490 districts), built as a free static site. It's a personal learning project as well as a public social-service tool, so code should stay simple and readable over clever.

The project has completed **Phase 1 (data pipeline)** — see [PLAN.md](PLAN.md) for the full phased build plan (Phase 0 through Phase 7) and the architecture rules it commits to. Read PLAN.md before starting work on map rendering, animation, or the data pipeline — it defines the intended design up front, including phases not yet built.

## Commands

```bash
npm run dev        # start dev server (http://localhost:3000)
npm run build       # static export build (output: "export" in next.config.ts)
npm run start        # serve the production build
npm run lint          # next lint
npm run build:topo     # regenerate all data files from the IGN WFS source (scripts/build-topo.mts)
npm run validate        # data-integrity checks: counts, unique codes/slugs, topo consistency, size budget
```

There is no test runner configured yet. `npm run validate` is the closest thing to a test suite — run it after touching anything under `data/` or `lib/divisiones.ts`.

## Architecture

**Routing is state.** Every view is a URL, statically generated via `generateStaticParams`: `/` (country) → `/[provincia]` → `/[provincia]/[canton]` → (planned) `/[provincia]/[canton]/[distrito]`. There is no client-side selection state that isn't reflected in the route — page components derive everything from `params`.

**Data layer:** `data/divisiones.json` (full hierarchy: 7 provincias / 84 cantones / 494 distritos, with accent-safe slugs), `data/slugs.json` (flat region index with URL paths), and `data/geo/costa-rica.topo.json` (three TopoJSON layers — provincias/cantones/distritos — that share arcs because cantons and provinces are dissolved from the district geometry) are all **generated files**. Never hand-edit them; regenerate with `npm run build:topo`, which downloads the official IGN SNIT WFS district layer (cached in the gitignored `data/geo/raw/`), simplifies with mapshaper, and derives everything from that single source (see [scripts/fetch-geo.md](scripts/fetch-geo.md)). `lib/divisiones.ts` exposes the hierarchy plus lookup helpers `getProvincia` / `getCanton` / `getDistrito`.

**Static export target:** `next.config.ts` sets `output: "export"`, so this must stay a fully static site — no server components that require a runtime, no API routes, no dynamic (non-generateStaticParams) rendering.

**Planned React↔D3 boundary** (Phase 2+, not yet implemented): D3 owns SVG internals (paths, zoom transforms) inside `useEffect`; React owns component lifecycle only and never re-renders individual paths during a D3 transition. `components/map/MapCanvas.tsx` is meant to be the sole boundary between the two. `GeoLayer` is meant to be written once and reused for all three geographic layers.

**Planned state split** (Phase 3+): URL params are the only source of truth for the current selection. Zustand (`lib/store.ts`, not yet created) is reserved strictly for ephemeral, non-persistent UI state (hover, in-flight animation) — never for selection state that a URL could represent.

## Conventions in this codebase

- Copy is in Spanish (`<html lang="es">`); Spanish is the default locale, English toggle is a later phase.
- Slugs are the accent-safe, URL-safe identifiers used in routes; `codigo` is the official numeric/string code from the data source; `nombre` is the display name. Keep these three distinct — don't conflate slug and nombre.
- Tailwind CSS 4 via `@tailwindcss/postcss` (see `postcss.config.mjs`); global styles are just `@import "tailwindcss"` in `app/globals.css` — no custom CSS files elsewhere.
- Path alias `@/*` maps to the repo root (`tsconfig.json`), e.g. `@/lib/divisiones`, `@/data/divisiones.seed.json`.
