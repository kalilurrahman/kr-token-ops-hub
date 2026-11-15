# Changelog

## 2.0.0 — Design System v2 (2026-11-15)

Visual uplift to TokenOps Atlas Design System v2. Content, data, routes, calculator maths, SEO
meta, Supabase and AI gateway code are unchanged; the smoke test's content-parity check passes
on all 24 routes. See [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).

### Added

- Three palettes on one token contract: Ledger Dark (default), Paper Light, Bright Pro, with a
  three-way theme menu persisted under `tokenops-theme-v2` and applied before first paint.
- Grouped navigation: laptop dropdowns, ⌘K section search, tablet labelled links with an
  all-sections sheet, and a mobile bottom tab bar whose "All" sheet lists every route.
- Footer columns (Optimize, Tools, Read, Learn).
- Token-bound dashboard charts (`useChartTheme`), horizontal bar charts on mobile, sticky
  calculator results on laptop and a pinned results summary on mobile.
- `npm run typecheck`, `npm test`, `npm run smoke` (route × viewport smoke, content parity,
  viewport-escape check, axe warnings) and `scripts/check-tokens.mjs` in `npm run lint`.

### Changed

- `src/styles.css` holds the v2 tokens; `src/tokenops/style.css` is the v2 component layer,
  replacing a 2,966-line stack of overrides.
- Space Grotesk, IBM Plex Sans and IBM Plex Mono throughout; numbers are mono with tabular
  figures.
- Tailwind palette utilities in routes replaced with semantic tokens.
- Five token values tuned for WCAG AA (Paper Light ink-3 and saving; Bright Pro primary, saving
  and risk); Bright Pro eyebrows use cobalt.

### Fixed

- Content that escaped the viewport on mobile (reader, home hero and executive summary) and was
  hidden by the overflow guard.
- Reduced motion now also stops infinite animations and hover lifts.

### Removed

- Inter, DM Sans and Cormorant Garamond references and all `!important` overrides (except the
  reduced-motion reset).
- The legacy stylesheet and the icon-only tablet navigation.
