# Contributing

Explora Costa Rica is a free, open-source, social-service project — an interactive map of Costa Rica's provinces, cantons, and districts. Contributions are welcome, whether that's code, data corrections, translations, or design feedback.

## Before you start

Read [PLAN.md](PLAN.md) first. It's the source of truth for the vision, tech stack, project structure, and the phased build plan (Phase 0–7). It also documents the architecture rules the codebase commits to (URL as source of truth, React/D3 boundaries, etc.) — please follow them rather than introducing new patterns.

The project is currently in **Phase 0 (skeleton)**. Check the `- [ ]` checklist in PLAN.md §7 to see what phase is active and what's already done.

## Setup

```bash
pnpm install
pnpm run dev        # http://localhost:3000
```

## Before submitting a change

```bash
pnpm run lint
pnpm run validate    # asserts province/canton/district counts against the data layer
pnpm run build        # confirms the static export still builds
```

## Data contributions

Costa Rica's territorial division counts vary slightly by source (see PLAN.md §3 — district counts range 489–492). If you're correcting or adding geographic/hierarchy data:

- Cite the source (IGN, a named GitHub dataset, etc.) and its license in your PR description.
- Only use open-data sources compatible with this project's MIT license.
- Update `scripts/validate.ts` expectations if the correction changes official counts.

## Pull requests

- Keep PRs scoped to one phase/feature where possible — this makes review easier against the PLAN.md checklist.
- Update PLAN.md's checklist and this repo's docs if your change completes or alters a planned item.
- Describe what you tested (dev server, `pnpm run validate`, build) in the PR description.

## Code of conduct

Be respectful and constructive. This is a learning project as much as a public tool — questions and beginner-friendly PRs are welcome.
