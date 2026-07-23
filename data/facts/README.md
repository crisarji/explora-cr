# Canton facts

`cantones.json` holds curated per-canton tidbits, keyed by the official
canton `codigo`, each with `es` and `en` text.

Rules for adding facts:

- **Curated by hand, never generated.** Only add facts you can verify
  against a reliable source (the canton's municipality, national press,
  UNESCO, etc.).
- Keep each fact to one sentence; both languages required.
- This file is NOT produced by `pnpm run build:topo` — it survives data
  regeneration.

Coverage so far: 30 of 84 cantons. Contributions welcome.
