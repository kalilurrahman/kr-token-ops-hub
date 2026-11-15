# TokenOps Atlas — Design System v2

One token contract (`--to-*`) filled by three palettes, a component layer keyed to the
existing class names, and guardrails that keep both honest. Content, data and features are
independent of this layer: a smoke test checks every route's text against a baseline.

| File                       | Role                                                                                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/styles.css`           | Tokens: palettes, spacing, type scale, motion, Tailwind `@theme` mapping. The only CSS file allowed to contain hex.                             |
| `src/tokenops/style.css`   | Component layer: styles the class names routes already use (`.tile`, `.dash-card`, `.badge` …), navigation, data views, long-form. Tokens only. |
| `src/lib/theme.ts`         | Palette choice, storage key, `theme-color` values and the inline `<head>` script.                                                               |
| `src/lib/chart-theme.ts`   | `useChartTheme()` — Recharts colours read from tokens at render time and refreshed on palette change.                                           |
| `scripts/check-tokens.mjs` | Runs with `npm run lint`; fails on hex, `!important`, Tailwind palette utilities or removed fonts outside the token files.                      |
| `scripts/smoke.mjs`        | Route × viewport smoke, content parity, viewport-escape check, axe warnings.                                                                    |

## Palettes

|                     | Selector                                          | Default | `theme-color` |
| ------------------- | ------------------------------------------------- | ------- | ------------- |
| **A · Ledger Dark** | `html[data-theme="dark"]` (+ `.dark`)             | yes     | `#070A10`     |
| **B · Paper Light** | `html[data-theme="light"]`                        |         | `#F7F5F0`     |
| **C · Bright Pro**  | `html[data-theme="light"][data-palette="bright"]` |         | `#F5F7FC`     |

The choice is stored in `localStorage["tokenops-theme-v2"]` as `dark | light | bright` and
applied by an inline script before first paint (no flash). The header theme menu (Moon / Sun /
Sparkles) writes the same key. Bright Pro is a light palette, so `.dark` is only present for
Ledger Dark and Tailwind's `dark:` variant keeps working.

### Colour meaning (fixed across palettes)

| Role          | Tokens                                                  | Tailwind                                         | Use for                                |
| ------------- | ------------------------------------------------------- | ------------------------------------------------ | -------------------------------------- |
| Gold · money  | `--to-money`, `--to-money-fill`, `--to-money-text`      | `bg-money`, `bg-money-fill`, `text-money-text`   | spend, prices, primary action (Ledger) |
| Teal · saving | `--to-saving`, `--to-saving-fill`, `--to-saving-text`   | `text-saving`, `bg-saving-fill`, `border-saving` | savings, optimized series, success     |
| Coral · risk  | `--to-risk`, `--to-risk-fill`, `--to-risk-text`         | `text-risk`, `bg-risk-fill`, `border-risk`       | anomalies, over-budget, destructive    |
| Sky · info    | `--to-info`, `--to-info-fill`, `--to-info-text`         | `text-info`, `bg-info-fill`                      | links in prose, MD badge, notes        |
| Primary       | `--to-primary`, `--to-primary-ink`, `--to-primary-grad` | `bg-primary`, `text-primary-foreground`          | one primary action per view            |

Use `*-text` tokens for small text on `*-fill` backgrounds; the base colour is for marks,
icons, borders and large figures.

### Core values

| Token                        | Ledger Dark                           | Paper Light                           | Bright Pro                                     |
| ---------------------------- | ------------------------------------- | ------------------------------------- | ---------------------------------------------- |
| `--to-bg`                    | `#070A10`                             | `#F7F5F0`                             | `#F5F7FC`                                      |
| `--to-surface` / `-2` / `-3` | `#0E131D` / `#151C2A` / `#1D2638`     | `#FFFFFF` / `#F1EEE6` / `#E9E4D8`     | `#FFFFFF` / `#EEF2FA` / `#E3E8F2`              |
| `--to-ink` / `-2` / `-3`     | `#F3EFE6` / `#B9B2A3` / `#8A8476`     | `#14161C` / `#4A4D57` / **`#676A74`** | `#0B1220` / `#3D4A63` / `#5A6680`              |
| `--to-primary`               | `#E8B964`                             | `#14161C`                             | **`#2B62EB`**                                  |
| `--to-money` / text          | `#E8B964` / `#F4D08A`                 | `#8A6418`                             | `#B87700` / `#8A5A00`                          |
| `--to-saving`                | `#4DD8C4`                             | **`#0E786C`**                         | **`#007C63`**                                  |
| `--to-risk` / text           | `#F1734F` / `#F59A7E`                 | `#B8452A`                             | **`#CA3A22`**                                  |
| `--to-info` / text           | `#7FB4FF` / `#A9CBFF`                 | `#2B5DB8`                             | `#1F55D6`                                      |
| `--to-focus`                 | `#4DD8C4`                             | `#0F7F72`                             | `#7C5CFF`                                      |
| Charts 1–6                   | gold, teal, sky, violet, coral, stone | same hues, deeper                     | cobalt, emerald, saffron, violet, coral, slate |

**Bold** values differ from the handoff's `tokens.json` v2.0.0. Each was darkened by the
smallest step that clears WCAG AA (4.5:1) for small text on the surfaces and fills it appears
on, keeping the hue: Paper Light `ink-3` (was `#6B6E78`, 4.39:1 on `surface-2`) and `saving`
(`#0F7F72`, 4.21:1); Bright Pro `primary` (`#2F6BFF`, 4.0–4.5:1 for white text and
`text-primary`), `saving` (`#00866B`) and `risk` (`#D43D24`). Bright Pro eyebrows use
`--to-info-text` (cobalt, as in the reference screens) because saffron `--to-money` is 3.7:1 on
white.

## Type

- **Space Grotesk** 500/600/700 — headings (`--font-display`)
- **IBM Plex Sans** 400/500/600 — body (`--font-sans`)
- **IBM Plex Mono** 400/500/600 — numbers, prices, eyebrows (`--font-mono`)

Scale: display `clamp(2.5rem, 5.2vw, 4.25rem)`, h1 `clamp(2rem, 3.6vw, 3rem)`, h2
`clamp(1.5rem, 2.4vw, 2.125rem)`, h3 `1.25rem`, body `1rem / 1.65`, eyebrow `0.75rem` mono
uppercase `0.14em`. Every number a user reads is mono with tabular figures: `.to-metric`, or
the selectors that share it (`.metric-row strong`, `.dash-card strong`, `.calc-results .row
strong`, `.hub-metric-val`, comparator and hub lever figures). Inter, DM Sans and Cormorant
Garamond are gone and the token check rejects them.

## Space, radius, motion, breakpoints

- Spacing on a 4px grid: `--to-space-1 … --to-space-24` (4 → 96px).
- Radius: input 8 · button 10 · card 14 · panel 20 · hero 24.
- Motion: 120 / 200 / 360ms, `cubic-bezier(0.2, 0.7, 0.2, 1)`. Hover lift is at most 2px.
  `prefers-reduced-motion` removes transitions, hover lifts, infinite animations and smooth
  scrolling.
- Breakpoints: mobile < 768 · tablet 768–1279 · laptop ≥ 1280. Container 1240px with
  `clamp(16px, 4vw, 32px)` edges.

## Components (class names routes already use)

- Buttons: `.primary-action` (one per view), `.secondary-action`, `.download-btn`,
  `.to-btn-gold` (header CTA).
- Surfaces: `.tile`, `.resource-card`, `.dash-card`, `.dash-panel`, `.calc-card`,
  `.control-surface`, `.result-surface`, `.exec-summary`, `.hero-band`.
- Badges: `.badge` + `.badge-md | -yaml | -csv | -guide`; `.category-tag`; `.calc-status.ok |
.warn | .bad`.
- Data: `.dashboard-kpis`, `.dashboard-grid`, `.anomaly-board`, `.calculator-layout` (results
  sticky beside inputs on laptop, pinned summary above the tab bar on mobile).
- Long-form: `.guide`, `.reader-article` (72ch measure, info-coloured links, tables that scroll
  on mobile), `.reader-toolbar-title` (sticky from 768px).

### Navigation

`FULL_NAV` in `src/components/SiteHeader.tsx` is the single list of all 23 routes, each with a
group: **Start** (Home, Hub, Guide, Free Chapter, About) · **Optimize** (Optimize, Techniques,
Tool Guides, Caveman, Prompts, Patterns) · **Models & tools** (Models, Calculator, Dashboard,
Toolkit, Roadmap) · **Library** (Library, Reading Lists, Templates, Resources, Glossary,
Sources) · **Learn** (Training).

- Laptop: Home, four dropdowns (`.to-mega`, Radix NavigationMenu), Training, ⌘K search (cmdk),
  theme menu, gold Calculator CTA.
- Tablet: labelled Home / Optimize / Calculator / Library, search, theme, menu → all-sections
  sheet.
- Mobile: search and theme in the header; `MobileTabBar` (`.to-tabbar`) with Home, Optimize,
  Calculator, Library and All (bottom sheet listing every route by group with a filter).
- Exact-path `aria-current="page"`, 44px minimum targets, Esc closes menus and sheets and focus
  returns to the trigger, teal focus ring (`--to-focus`).

### Legacy variable aliases

Some route JSX still uses pre-v2 variable names in inline styles and Tailwind arbitrary values
(`text-[var(--muted)]`, `var(--gold)` …). `src/tokenops/style.css` aliases them to tokens
(`--ink`, `--muted`, `--subtle`, `--line`, `--line-bright`, `--bg`, `--bg-1`, `--surface`,
`--surface-2`, `--shadow`, `--gold`, `--gold-dim`, `--gold-glow`, `--green`, `--blue`, `--red`)
so they follow the active palette. Don't use them in new code.

## Rules

1. Colours come from `--to-*` tokens or semantic utilities (`bg-card`, `text-muted-foreground`,
   `text-saving`, `bg-money-fill`, `border-risk`). No hex outside `src/styles.css`,
   `TokenOpsLogo.tsx` (brand mark) and `chart-theme.ts` (SSR fallbacks). No Tailwind palette
   utilities (`emerald-500`, `blue-600`).
2. No `!important` (the reduced-motion reset in `src/styles.css` excepted).
3. Check every change in all three palettes at 390, 834 and 1440px.
4. Watch for tailwind-merge: `cn()` treats any class starting with `to-` as a gradient stop and
   keeps only the last one, so pass at most one `to-*` class through `cn()`.

## Checks

```bash
npm run lint        # eslint + check-tokens
npm run typecheck   # tsc --noEmit
npm test            # tsx --test src/**/*.test.ts
npm run build       # vite build (Nitro cloudflare-module preset → .output/)
npm run smoke       # build, wrangler dev on 127.0.0.1:4173, scripts/smoke.mjs
```

`npm run smoke` serves `.output/` with `wrangler dev` (the Cloudflare build can't be served by
`vite preview`), then for 24 routes × 390/834/1440 checks HTTP 200, console errors, horizontal
overflow (including elements escaping the viewport, which the `html, body { overflow-x: clip }`
guard would otherwise hide), mobile tap targets (warning), and content parity against
`.smoke/baseline` at 1440px. Parity reads authored text: CSS `text-transform` is neutralised and
Recharts axis ticks (whose visibility depends on font metrics) are ignored. An axe-core pass
(WCAG 2 A/AA in Ledger Dark, colour contrast in the light palettes) adds warnings and writes
`.smoke/axe.json`.

Options: `-- --baseline` rewrites the baseline (only on an untouched UI), `-- --no-build` reuses
the current build. Environment: `CHROMIUM_PATH` points Playwright at an existing Chromium,
`SMOKE_IGNORE_CONSOLE` (regex) downgrades matching console errors to warnings for sandboxes that
block third-party APIs, `SMOKE_AXE=0` skips the axe pass, `SMOKE_PORT` changes the port.

### Releases and the version watermark

The footer shows the release version (`.to-release`, e.g. `v2.1.0`). It comes from the
`version` field in `package.json` via `src/lib/release.ts`; Vite inlines only that field. To cut
a release, bump `package.json` `version` and add a matching `## x.y.z — Title (date)` entry at
the top of `CHANGELOG.md` in the same change. `npm test` (`src/lib/release.test.ts`) fails if
they disagree. The live site's version can be checked from the footer or with
`curl -s https://tokenops.kalilurrahman.com/ | grep -o 'v[0-9]*\.[0-9]*\.[0-9]*'`.

### Regenerating the baseline

`.smoke/` is not committed. To rebuild the baseline in a fresh clone, take it from the last
commit before the uplift (`51c8ffb`, scripts only), then return to your branch:

```bash
git worktree add ../tokenops-baseline 51c8ffb
cd ../tokenops-baseline && npm install && npm run build
npx wrangler dev --cwd .output --config server/wrangler.json --ip 127.0.0.1 --port 4174
```

In a second shell from the repo root (using this branch's `scripts/smoke.mjs`):

```bash
BASE_URL=http://127.0.0.1:4174 node scripts/smoke.mjs --baseline
```

## Accessibility status (v2.0.0)

- axe-core WCAG 2 A/AA (smoke step): no violations on 24 routes; colour contrast checked in all
  three palettes at 1440 and 390px.
- Lighthouse mobile (local `wrangler dev`, simulated throttling): Performance 99,
  Accessibility 100, CLS 0 on `/`, `/calculator` and `/library`. Production (#21, measured via
  the sandbox proxy): Performance 95–98, Accessibility 98–100, CLS 0.
- Hero art is a `<picture>`: phones (< 640px, where it is hidden) download nothing, larger screens
  get a 40 KB WebP with the original PNG as fallback. Home page weight on mobile: 809 KB → 407 KB.
- In-page buttons and range sliders are at least 44px tall on phones. Remaining smoke tap-target
  warnings are links inside paragraphs (exempt from WCAG target size) and disabled checklist
  checkboxes rendered from markdown.
- Markdown task-list items are rendered by `src/lib/markdown.ts`, which wraps each item in a
  `<label>` so its text names the checkbox. Use `renderMarkdown()` for any new long-form page.
