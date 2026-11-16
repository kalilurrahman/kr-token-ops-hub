# Changelog

## 2.3.2 — Keyboard-scrollable tables and code on phones (2026-11-16)

### Fixed

- Keyboard users can scroll wide content that scrolls sideways: Markdown tables (guide, sample
  chapter, library reader) and adviser answer tables get `tabindex="0"` from
  `src/lib/markdown.ts` (`focusableTables`, also used by `renderAdviceMarkdown`); the home page
  executive-summary tables and the `/prompt-templates` code blocks are focusable; the
  `/tool-guides` caching table is a focusable region labelled by its heading. axe flagged 26 of
  these on 7 routes at 390px. No visible text changes.

### Changed

- `npm run smoke` also runs the full axe WCAG 2 A/AA audit in Ledger Dark at 390px, so
  phone-only layouts are checked (reported as `dark@390`).

## 2.3.1 — Adviser answers render as formatted text (2026-11-16)

### Fixed

- AI workload adviser answers were shown as raw Markdown, so the strategy comparison's table
  (2.3.0) appeared as rows of `|` and `---`, and headings and lists as plain lines. Answers now
  render as headings, numbered and bulleted lists, emphasis, links and a table. The table uses
  the full card width and scrolls inside it on narrow screens, with cells wrapping between
  words.
- Model output is untrusted, so `src/lib/advice-markdown.ts` (`renderAdviceMarkdown`, 5 tests)
  shows any raw HTML in an answer as text, keeps only https, http, mailto and same-site links
  (external links open in a new tab), and never loads images (their alt text is shown), so an
  answer cannot run script, fetch anything or track readers. `AGENTS.md` records the rule.

## 2.3.0 — Compare optimization strategies for a workload (2026-11-16)

### Added

- The workload adviser can compare the cost and trade-offs of relevant token-optimization strategies for a described workload.

## 2.2.1 — Email sign-in links finish on any page (2026-11-16)

### Fixed

- An emailed sign-in link now completes wherever it opens. Supabase sends the reader to its
  Site URL (the homepage) when the briefing isn't on its redirect allow-list, and only the
  adviser started the Supabase client, so on any other page the session was never stored, the
  adviser stayed locked and the access token stayed in the address bar and history.
  `src/components/EmailLinkCompletion.tsx` (in the root layout) starts the client only when the
  URL carries a link result, which stores the session and strips the token, then returns the
  reader to the briefing they asked from: signed in, or with the expired-link message.
- The return briefing is remembered when the link is requested: a page path in `localStorage`,
  used once and ignored after an hour or if it isn't a same-site path
  (`src/lib/adviser-auth.ts`, 3 new tests).

### Changed

- `npm run smoke` also covers a Techniques briefing, so the adviser's sign-in form is checked for
  overflow, 16px fields and contrast at every width (25 routes).

## 2.2.0 — Email sign-in for the AI workload adviser (2026-11-16)

### Added

- Passwordless sign-in for the AI workload adviser. On Models and Techniques reader pages,
  signed-out readers enter their email and Supabase sends a one-time magic link back to the
  same page; once signed in they see the adviser form, their email and a "Sign out" button.
  Browsing, reading lists (still device-local) and calculators never need an account.
- Clear messages for an invalid address, a rate-limited send, and an expired or already used
  link. Helpers live in `src/lib/adviser-auth.ts` with tests in `src/lib/adviser-auth.test.ts`.

### Fixed

- Text inputs are 16px on phones again, so iOS no longer zooms in on focus (57 fields on
  `/calculator`, `/toolkit`, `/glossary` and `/reading-lists` were 15px). The phone rule in
  `src/tokenops/style.css` now uses the same selectors as the base input rule, which had
  outranked it.
- Bright Pro: filled primary buttons darken on hover instead of fading, keeping the white label
  above AA contrast (it dropped to 4.33:1).

### Changed

- `AGENTS.md`: the privacy note now records that the adviser's email sign-in is the only
  account and stays scoped to the adviser.
- `npm run smoke` fails if any visible text field is under 16px on mobile.

## 2.1.4 — AI workload adviser requires sign-in (2026-11-16)

### Security

- The AI workload adviser's server function (`recommendWorkload` in
  `src/lib/workload-adviser.functions.ts`) now runs `requireSupabaseAuth`, so only requests with a
  valid Supabase session reach the Lovable AI Gateway, as `AGENTS.md` requires. Previously any
  visitor could call it and spend gateway credits. The middleware runs before input validation,
  so rejected requests never reach the gateway. Signed-in browsers already send their session
  token through the global `attachSupabaseAuth` middleware in `src/start.ts`.
- The site has no sign-in flow yet, so the adviser is unavailable until one is added: `/read`
  pages show a "Sign-in required" notice in place of the form for visitors without a session
  (server render included), and a rejected session shows a plain message instead of the raw
  `Unauthorized: …` error.

## 2.1.3 — Table of contents tap targets (2026-11-16)

### Fixed

- `/guide` table of contents: each link is a 44px row on phones and tablets instead of a
  22px strip. The markdown renderer (`src/lib/markdown.ts`) marks list items that are only a
  link with `class="link-item"`; text and laptop layout are unchanged.

### Changed

- `npm run smoke` no longer counts disabled controls (markdown task-list checkboxes) or links
  inside a sentence (the WCAG 2.5.8 inline exception) as small tap targets, so its warning
  lists only real targets.
- `src/lib/markdown.test.ts` covers the renderer's task-list and link-item markup and checks
  that its visible text matches plain `marked`.

## 2.1.2 — zod 4 and npm install fix (2026-11-15)

### Changed

- zod 3 → 4 (4.6.7), superseding Dependabot's #26. It's used only by the AI adviser's input
  schema, whose APIs (`object`, `string().trim().min().max()`, `enum`, `nullable`) are unchanged
  in v4. Valid input still parses and invalid input is still rejected; only the issue codes in
  validation errors are renamed. Both `package-lock.json` and `bun.lock` carry the update.
- README demo GIF shows the Design System v2 UI in all three palettes.

### Fixed

- Plain `npm ci` works again: a new `.npmrc` sets `legacy-peer-deps=true`, matching how
  `package-lock.json` is generated. Without it npm stopped with `ERESOLVE`, because
  `@lovable.dev/vite-tanstack-config` declares `nitro >=3.0.260603-beta` and semver prerelease
  rules don't treat the pinned `3.0.260903-beta` as satisfying it. Lovable installs from
  `bun.lock` and is unaffected.

## 2.1.1 — Server function validator API (2026-11-15)

### Fixed

- AI workload adviser (`src/lib/workload-adviser.functions.ts`): `createServerFn().inputValidator()`
  → `.validator()`. Clears the deprecation warning that the newer `@tanstack/start-plugin-core`
  prints in `npm run dev`. Same schema, same typed input, no behaviour change.

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
