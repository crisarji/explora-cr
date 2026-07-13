# Changelog

All notable changes to this project are documented here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- Phase 0 skeleton: Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 project setup.
- Routes: `/` (country), `/[provincia]` (province), `/[provincia]/[canton]` (canton), `/acerca` (about) — all statically generated via `generateStaticParams`.
- `lib/divisiones.ts` data layer with `getProvincia` / `getCanton` lookups, backed by a Phase 0 seed dataset (`data/divisiones.seed.json`).
- `scripts/validate.ts` — asserts expected province/canton counts.
- `scripts/fetch-geo.md` — data pipeline notes and candidate sources for Phase 1.
- Project docs: README.md, PLAN.md (full roadmap and architecture rules), CLAUDE.md, CONTRIBUTING.md, LICENSE (MIT).
