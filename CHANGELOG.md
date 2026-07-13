# Changelog

All notable changes to this project are documented here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
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
