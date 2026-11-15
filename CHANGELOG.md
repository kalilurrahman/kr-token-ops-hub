# Changelog

## 2.1.1 — Server function validator API (2026-11-15)

### Fixed

- AI workload adviser (`src/lib/workload-adviser.functions.ts`): `createServerFn().inputValidator()`
  → `.validator()`. Clears the deprecation warning that the newer `@tanstack/start-plugin-core`
  prints in `npm run dev`. Same schema, same typed input, no behaviour change.
- Plain `npm ci` works again: a new `.npmrc` sets `legacy-peer-deps=true`, matching how
  `package-lock.json` is generated. Without it npm stopped with `ERESOLVE`, because
  `@lovable.dev/vite-tanstack-config` declares `nitro >=3.0.260603-beta` and semver prerelease
  rules don't treat the pinned `3.0.260903-beta` as satisfying it. Lovable installs from
  `bun.lock` and is unaffected.

### Changed

- zod 3 → 4 (4.6.7), superseding Dependabot's #26. It's used only by the AI adviser's input
  schema, whose APIs (`object`, `string().trim().min().max()`, `enum`, `nullable`) are unchanged
  in v4. Valid input still parses and invalid input is still rejected; only the issue codes in
  validation errors are renamed. Both `package-lock.json` and `bun.lock` carry the update.

## 2.1.0 — Release watermark (2026-11-15)

### Added

- Release version watermark in the footer (`v2.1.0`), read from `package.json` through
  `src/lib/release.ts` so it always matches the deployed build.
- `package.json` now carries the release `version`; `src/lib/release.test.ts` fails if it differs
  from the newest entry in this changelog.

## 2.0.1 — Dependency updates (2026-11-15)

Applies the pending Dependabot updates in one tested change.

- Vite 7 → 8 (8.3.8), Nitro `3.0.260903-beta`, `@cloudflare/vite-plugin` ^1.54.7 (1.69.1).
- Transitive security and compatibility bumps now reach `bun.lock` (what Lovable installs) as
  well as `package-lock.json`: brace-expansion 1.1.22, postcss 8.5.33, nanoid 3.3.20, js-yaml
  4.3.2, browserslist 4.29.5, baseline-browser-mapping 2.11.37, undici 7.30.1, ws 8.22.0, sharp
  0.35.5.
- `package-lock.json` is regenerated and back in sync with `package.json` (`npm ci` works again).
- `wrangler.jsonc`: trailing comma removed; the newer Nitro parses it as strict JSON.

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
- Hero illustration served as WebP (40 KB, PNG fallback) and not downloaded on phones, where it
  is hidden; home page weight on mobile drops from 809 KB to 407 KB.

### Fixed

- Content that escaped the viewport on mobile (reader, home hero and executive summary) and was
  hidden by the overflow guard.
- Reduced motion now also stops infinite animations and hover lifts.
- In-page buttons and range sliders reach 44px on phones.
- Accessibility markup (no visible text changes): `/hub` slider and preset labels are tied to their
  controls, markdown task-list checkboxes are labelled by their item text, the `/caveman` snippet
  is keyboard-scrollable, and `/library` card titles no longer skip a heading level.
- Resource card icon tiles are 44px again on `/library`, `/resources` and `/templates`.

### Removed

- Inter, DM Sans and Cormorant Garamond references and all `!important` overrides (except the
  reduced-motion reset).
- The legacy stylesheet and the icon-only tablet navigation.
