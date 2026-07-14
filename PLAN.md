# Explora Costa Rica 🇨🇷

An interactive, animated map of Costa Rica's territorial divisions — 7 provinces, 84 cantons, and ~490 districts — built as a free social service and a personal learning project.

**Live site:** https://explora-cr.vercel.app

---

## 1. Vision

A modern, beautiful web experience where anyone can explore Costa Rica's political geography:

- Click a province → the map smoothly zooms in and its cantons animate into view.
- Click a canton → zoom again, districts draw themselves in stroke by stroke.
- Search any canton or district by name and fly straight to it.
- Every region has a shareable URL (e.g. `/alajuela/grecia`).
- Free to use, free to host, open data.

**Why it's worth building:** existing resources are static PDFs (UCR/IFAM maps), basic reference sites (Statoids), or paid tools (Mapline, editable PowerPoint maps). Nothing modern, animated, and interactive exists — this fills a real gap.

---

## 2. Tech stack

| Layer      | Choice                                   | Reason                                                                 |
| ---------- | ---------------------------------------- | ---------------------------------------------------------------------- |
| Framework  | Next.js 15 (App Router) + TypeScript     | Static export, file-based routing, per-region SEO, industry relevance |
| Map        | D3.js (`d3-geo`, `d3-zoom`) + TopoJSON   | Full control over SVG paths → creative animations tiles can't do      |
| Animation  | Motion (Framer Motion) + D3 transitions  | Motion for UI/pages, D3 for geographic zoom and path morphs           |
| Styling    | Tailwind CSS                             | Fast iteration, dark mode for free                                    |
| State      | URL params (source of truth) + Zustand   | Shareable links; Zustand only for ephemeral UI (hover, animating)     |
| Search     | Fuse.js                                  | Fuzzy search over ~580 region names, fully client-side                |
| Data       | Static TopoJSON + JSON                   | The divisions never change → no backend, no database, no cost         |
| Hosting    | Vercel (free tier)                       | Deploy on push, preview deployments per branch                        |

---

## 3. Data sources

- **IGN (Instituto Geográfico Nacional)** — official boundaries via WFS geoservice (authoritative, most current).
- **github.com/schweini/CR_distritos_geojson** — provinces, cantons, districts already converted to GeoJSON.
- **github.com/investigacion/divisiones-territoriales-data** — names, codes, and hierarchy in CSV/JSON.
- **arce's Costa Rica TopoJSON gist** — reference for a single-file TopoJSON structure.

> ⚠️ Sources disagree slightly on district counts (489–492) because new districts get created. Pick ONE source of truth in Phase 1 and record it here: `source: IGN SNIT WFS (IGN_5_CO:limitedistrital_5k, versión 20260410001), date: 2026-07-13, districts: 494`.
>
> Phase 1 findings: both GitHub repos above are outdated (81 cantons — pre-2017, missing Río Cuarto, Monteverde, and Puerto Jiménez). The IGN WFS is authoritative **and** current, so it is the single source: geometry and hierarchy are both derived from the district layer by `scripts/build-topo.mts`.

---

## 4. Routes

URL = application state. Every view is a link; every page is pre-rendered at build time.

```
/                                   Country view (7 provinces)
/[provincia]                        Province view        → /alajuela
/[provincia]/[canton]               Canton view          → /alajuela/grecia
/[provincia]/[canton]/[distrito]    District view (opt.) → /alajuela/grecia/tacares
/acerca                             About, data sources, credits
```

≈ 7 + 84 + 490 pages via `generateStaticParams`. Search is a Cmd+K overlay, not a route.

---

## 5. Project structure

```
explora-cr/
├── app/
│   ├── layout.tsx                  App shell: fonts, theme, Header, footer
│   ├── page.tsx                    Country view
│   ├── acerca/page.tsx
│   └── [provincia]/
│       ├── page.tsx                Province view
│       └── [canton]/
│           ├── page.tsx            Canton view
│           └── [distrito]/page.tsx District view (optional)
├── components/
│   ├── Header.tsx                  Logo, language toggle
│   ├── SearchCommand.tsx           Cmd+K overlay (Fuse.js)
│   ├── Breadcrumb.tsx
│   ├── map/
│   │   ├── MapCanvas.tsx           Owns the SVG; React↔D3 boundary lives here
│   │   ├── GeoLayer.tsx            Renders one TopoJSON layer (reused 3×)
│   │   ├── ZoomController.ts       zoom-to-bounds transitions
│   │   └── HoverTooltip.tsx
│   └── panel/
│       ├── SidePanel.tsx           Motion enter/exit transitions
│       ├── StatsCards.tsx          Canton/district counts, cabecera
│       └── RegionList.tsx          Staggered chips/rows, links to children
├── data/
│   ├── geo/costa-rica.topo.json    ONE TopoJSON, 3 layers (provincias/cantones/distritos)
│   ├── divisiones.json             Hierarchy + metadata (codes, names, cabeceras)
│   ├── slugs.json                  Name → URL slug (accent-safe, duplicate-safe)
│   └── facts/                      (Phase 7) curated per-canton tidbits
├── lib/
│   ├── geo.ts                      Projection setup, path generators, bounds helpers
│   ├── slugs.ts                    Slug lookup utilities
│   └── store.ts                    Zustand: hoveredRegion, isAnimating
├── scripts/
│   ├── fetch-geo.md                Where raw data comes from + license notes
│   ├── build-topo.ts               Merge GeoJSON → simplify (mapshaper) → TopoJSON
│   └── validate.ts                 Assert 7 provinces / 84 cantons / N districts
└── PLAN.md                         This file
```

**Architecture rules**

1. **URL is the only source of truth for selection.** MapCanvas and SidePanel both derive from route params — they can never drift apart.
2. **Zustand holds only ephemeral UI state** (hovered region, animation-in-flight). Nothing persistent.
3. **React owns lifecycle, D3 owns the SVG internals.** D3 manipulates paths/transforms inside `useEffect` in MapCanvas; React never re-renders individual paths during a D3 transition. The zoom behavior is both driven programmatically (route changes → `fitTransform` animations) and bound live to the `<svg>` for interactive mouse-drag/wheel/touch pinch-pan (`zoom.clickDistance` keeps a stationary tap passing through to each region's `<Link>` instead of being swallowed as a drag). Manual pan/zoom is ephemeral — never written to the URL — and any navigation re-triggers the deterministic fit animation from wherever the camera currently sits.
4. **GeoLayer is written once, rendered three times** with different data/styles — drill-down logic stays uniform.
5. **Only mount district paths for the active canton** — never all ~490 at once.

---

## 6. Signature animations

| Moment                | Effect                                                        | Technique                                  |
| --------------------- | ------------------------------------------------------------- | ------------------------------------------ |
| First load            | Province borders draw themselves                              | SVG `stroke-dasharray` / `stroke-dashoffset` |
| Click province/canton | Camera zooms to bounds; rest of map fades + desaturates       | `d3-zoom` transform to fitted bounds       |
| After zoom lands      | Child regions fade/scale in one by one                        | Motion `staggerChildren`                   |
| Hover                 | Region lifts slightly; neighbors dim                          | CSS transform + opacity via Zustand hover  |
| Search select         | Camera flies from anywhere to the target canton               | Chained zoom transitions                   |
| Back / breadcrumb     | Reverse zoom out                                              | Same zoom-to-bounds, inverted              |

Respect `prefers-reduced-motion`: swap all of the above for simple fades.

---

## 7. Build plan

### Phase 0 — Skeleton and deploy _(a weekend)_
- [x] `create-next-app` with TypeScript + Tailwind
- [x] Create all routes with placeholder content
- [x] Push to GitHub (github.com/crisarji/explora-cr), deployed to Vercel (explora-cr.vercel.app)
- [x] Add this PLAN.md to the repo

**Learning:** App Router, project setup, CI/CD loop. _Deploy on day one — every push after this is live._

### Phase 1 — Data pipeline _(2–4 evenings)_
- [x] Download boundaries (IGN WFS — GitHub repos turned out to be outdated, see §3)
- [x] `build-topo.mts`: districts → simplify 2.5% (mapshaper) → dissolve up to cantones/provincias → single TopoJSON
- [x] Build `divisiones.json` (hierarchy) and `slugs.json` (accent-safe slugs + search index)
- [x] `validate.ts` asserts expected counts; record source of truth in §3
- [x] Target: full-country TopoJSON with districts under ~500 KB → **445 KB**

**Learning:** GeoJSON/TopoJSON, coordinate systems, simplification tradeoffs.

### Phase 2 — Static map _(1 week)_
- [x] `geoMercator` fitted to mainland bounds (Isla del Coco excluded from the fit — needs an inset later)
- [x] Render 7 provinces with `geoPath`, distinct colors, labels (largest-polygon anchor, not raw centroid)
- [x] Responsive SVG (viewBox scaling), dark mode palette
- [x] De-risk Phase 3: throwaway prototype of zoom-to-bounds at `/prototipo`

**Learning:** projections, `geoPath`, SVG fundamentals.

### Phase 3 — Interaction core _(1–2 weeks — the riskiest phase)_
- [x] Hover: lift region, dim neighbors, tooltip with name
- [x] Click province → `router.push` → zoom-to-bounds transition on arrival (URL drives the camera; clicks, breadcrumbs, back button, and direct links all animate through one code path)
- [x] Breadcrumb + back navigation with reverse zoom (plus background click to go up one level)
- [x] Keyboard focus/activation on regions (a11y)

**Learning:** D3 transitions, React↔D3 integration, dynamic routes.

### Phase 4 — Full drill-down _(1 week)_
- [x] Cantons render after province zoom; districts after canton zoom
- [x] SidePanel: stats (counts, approx. area from geometry), cabecera (district 01 convention), child-region list from `divisiones.json`
- [x] `generateStaticParams` for all pages (590 total: 1 + 7 + 84 + 494 + acerca); verified static export builds
- [x] Performance pass: active-canton-only district mounting (7 + ≤16 + ≤16 paths mounted, never all 494)

**Learning:** static generation at scale, data-driven rendering, performance.

### Phase 5 — Animation polish _(1–2 weeks — the fun one)_
- [x] Intro border-drawing animation (once per session, country view only; deep links skip it)
- [x] Staggered child reveals after zoom (CSS `--geo-i` delays, `backwards` fill so hover/dim classes take over afterwards)
- [x] Motion transitions for side panel page changes + staggered RegionList chips (enter-only — App Router swaps children immediately, so exit animations aren't reliable)
- [x] Color/level transitions, easing tuning (CSS transitions on fill/opacity/filter; d3 default cubic easing kept)
- [x] `prefers-reduced-motion` fallbacks (zoom duration 0, CSS animations off, Motion via `useReducedMotion`)

**Learning:** Motion, animation choreography, motion accessibility.

### Phase 6 — Search, i18n, SEO _(1 week)_
- [x] Cmd+K SearchCommand over all region names (Fuse.js, accent-insensitive) → flies camera to result (it's just `router.push` — the URL-driven camera does the rest)
- [x] ES/EN toggle (ES default; client-side UI-string dictionary in `lib/i18n.ts`, persisted in localStorage and applied post-hydration; region names and metadata stay Spanish)
- [x] Per-page metadata: titles with hierarchy, stat descriptions, canonical URLs (~585 pages). _OpenGraph mini-map images deferred — needs a build-time image pipeline._
- [x] a11y audit: labeled map regions/navs/buttons, combobox pattern in search with focus restore, `aria-current` breadcrumbs, contrast pass

**Learning:** fuzzy search, accessibility, Next.js metadata API.

### Phase 7 — Extras _(open-ended)_
- [x] Canton fact cards (`data/facts/` — hand-curated, 10 of 84 cantons seeded; see data/facts/README.md)
- [x] "Guess the canton" quiz mode at `/juego` — 10 rounds, 4 same-province choices, bilingual
- [x] Share button (native share sheet / clipboard fallback, no third-party scripts). _Analytics pending: needs an account decision (Plausible/Umami/none)._
- [x] README with generated map artwork (`scripts/render-map-svg.mts` → docs/mapa.svg) + MIT license

---

## 8. Timeline & definition of done

Rough total at evenings-and-weekends pace: **6–10 weeks**, with a live URL from week one.

**v1.0 is done when:** a visitor can land on the site, understand the 7 provinces at a glance, drill down to any district in ≤3 clicks with smooth animated transitions, search any canton by name, share a link to it, and use it all on a phone — in Spanish or English, at zero cost to host.

---

## 9. Skills learned along the way

TypeScript in a real project · geographic data handling (`d3-geo`, TopoJSON, mapshaper) · SVG animation fundamentals · React↔D3 integration patterns · URL-driven state & dynamic routing · static site generation at scale · fuzzy search · i18n · accessibility · CI/CD with Vercel.
