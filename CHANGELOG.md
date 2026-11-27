# Changelog

## 2.13.4 — A clean share card (2026-11-27)

### Changed

- The share image (`/og.png`) is redrawn as a clean 1200×630 card: "FinOps for tokens", "TokenOps Atlas", the home page's own line "Run LLM spend like a professional operating discipline." and the site address, in the site's fonts and Ledger Dark colours. The picture it replaces was machine-generated and its small print was misspelt ("TINOPS FOR TOKENS", "prmmpt", "Governonce"). `scripts/make-share-card.mjs` draws the card, so it can be regenerated; `og:image:width` and `og:image:height` now say 1200 and 630. No title, description or other share text changed.

## 2.13.3 — Canonical links and a self-hosted share image (2026-11-27)

### Changed

- Every page now carries one `<link rel="canonical">` naming itself at https://tokenops.kalilurrahman.com plus its path, without a query string (the home page is https://tokenops.kalilurrahman.com/). The root route adds it for whichever route is showing (`src/lib/canonical.ts`); the Guide, Changelog and Free Chapter pages already named the same address. A test checks that each of the 23 routes in the header's navigation gets its own.
- The share image is now served from this site, at https://tokenops.kalilurrahman.com/og.png, instead of Lovable's upload storage. It is the same picture, unchanged (a 1344×768 PNG); `og:image` and `twitter:image` point at it, and `og:image:type`, `og:image:width` and `og:image:height` describe it. No title, description or other share text changed.

## 2.13.2 — The KR Library's new address; /version.json (2026-11-27)

### Changed

- Every build now answers `/version.json` with the release it carries: the version, the short commit and the commit's date (for example `{"version": "2.13.2", "commit": "abc1234", "date": "2026-11-27"}`). `scripts/write-version.mjs` writes it into `public/` as the first step of `npm run build`; the file is generated and not committed, and the step never fails a build.
- Every page's head now carries `<meta name="version" content="2.13.2">`, the same version as the footer watermark.
- The portfolio specs in `docs/portfolio-specs/` now name the KR Library at https://kr-library.kalilurrahman.com, its primary address since 27 November 2026; the old industrybizcapability address 301s there with the path kept. No page on this site linked the old address, so no visible copy, figure or route changed.

## 2.13.1 — Link to VERITRAIL's AI cost governance practice (2026-11-26)

### Changed

- The Home hero and the footer add a secondary link, "AI cost governance at VERITRAIL", beside the "Book an AI cost governance review" button. It opens VERITRAIL's AI cost governance practice page (https://veritrail.kalilurrahman.com/practice/ai-cost), which is now live. It is styled as an underlined text link in the link colour, 44 px tall so it is a full tap target, and is left out of printouts like the other calls to action. No other copy, figure or route changed.

## 2.13.0 — AI cost governance reviews with VERITRAIL; dated pricing pages (2026-11-26)

### Changed

- Every primary call to action now reads "Book an AI cost governance review" and opens VERITRAIL's contact page (https://veritrail.kalilurrahman.com/contact): the header button (laptop widths), the Home and Roadmap hero buttons and the About page's closing button. The footer gains the same button, so phone and tablet visitors see it on every page. Secondary links (View dashboard, Read the Guide, the navigation and the phone tab bar) still go where they did; Read the Guide is now styled as a secondary button.
- The header search is an icon button at every width (⌘K still opens it), which makes room for the longer call to action.
- Pricing and model pages show "Last reviewed: <date>": Models, Calculator, Hub, Toolkit, the Dashboard sample, every Models briefing, the 2026 pricing landscape, the provider comparison matrix, and the token pricing reference and model selection matrix templates. The date is the last git change to the source of the page's figures (`data/pricing.json`, the briefing's markdown, or the dashboard's sample data), generated into `src/tokenops/review-dates.json` by `npm run review-dates` (`npm run review-dates -- --check` verifies it). No price or model figure changed.
- The 2026 pricing landscape and the Dashboard sample add: "Prices and model line-ups change often; check the provider's current pricing page before relying on these figures."

## 2.12.0 — Saved calculator scenario comparisons (2026-11-20)

### Changed

- Save named snapshots of inputs and results from any calculator in private device-local storage, select snapshots for side-by-side comparison, and delete saved scenarios. Mobile comparisons stack vertically; saved prices remain historical snapshots.

## 2.11.0 — Quality-adjusted optimization calculators (2026-11-20)

### Changed

- Added quality-adjusted task costs with bounded retries, tool-result trimming economics, and batch-processing break-even calculators using the existing hosted-model catalogue.
- Included recurring overhead, explicit assumptions and trade-offs, zero-success handling, and five arithmetic regression tests. The Calculators page now contains thirteen calculators.

## 2.10.1 — Correct payback on the Hub (2026-11-19)

### Fixed

- The Hub calculator's "Payback (months)" was 12 times too long. It divided the assumed $15,000
  implementation cost by a twelfth of the monthly savings, so $5,000 a month of savings showed 36
  months instead of 3, and the default scenario showed 2.0 months instead of 0.2. It now divides
  by the monthly savings, the same formula as the `/calculator` page. Only this figure changes;
  the savings figures were already right. The formula and the $15,000 assumption now live in
  `src/lib/hub-payback.ts` (3 tests, including the old formula as a regression check).

## 2.10.0 — Agent trace token-waste analyser (2026-11-19)

### Changed

- The AI adviser on Models and Techniques briefings can now analyse an uploaded or pasted agent-run trace (up to 60 KB), point out token-waste patterns with evidence from the trace, and give prioritised recommendations. The trace is not stored.

## 2.9.0 — Agent loop cost calculator and briefing (2026-11-19)

### Changed

- New Agent loop cost calculator on the Calculators page: compares no controls, prompt caching, and caching plus compaction for multi-turn agents.
- New briefing "Agent loop economics" explaining why agent costs grow with the square of turns and the four controls that bound them.

## 2.8.0 — Section links in long-form pages (2026-11-19)

### Fixed

- The table of contents on `/guide` works again: its 9 links pointed at `#part-1-foundations`
  and similar, but no heading had an id (newer `marked` versions stopped adding them), so
  clicking an entry did nothing. Long-form headings now get GitHub-style ids, unique within each
  document (`src/lib/markdown.ts`), and a test renders the guide, the sample chapter and every
  Markdown library and template document and fails if any in-page `#` link points at a missing
  heading.

### Added

- Section links: on the guide, the sample chapter and library and template pages, each h2/h3
  links to its own section, so a reader can copy a link that opens at that heading (below the
  sticky header). It reads as a plain heading; a "#" shows on hover and keyboard focus (faintly
  on touch screens) and is generated by CSS, so page text and content parity are unchanged.
  Headings that already contain a link get only the id, and the release notes cards keep plain
  headings so their repeated "Added" and "Fixed" don't produce duplicate ids.

## 2.7.1 — Complete sitemap and llms.txt (2026-11-19)

### Fixed

- `sitemap.xml` listed none of the documents the site exists to publish: the 65 library
  documents and the templates opened in the reader (`/read/library/…`, `/read/template/…`)
  were missing, as were the `/models` comparison matrix and `/reading-lists`. The sitemap now
  lists every navigation page and every document the reader can open, taken from
  `content.json` so new documents appear without editing it (`src/lib/sitemap.ts`).
- `llms.txt` said the library had 44 documents (it has 65) and left out the model matrix,
  reading lists, training and the release notes. It now lists every page in the navigation.
- Tests keep both in step with the site (5 tests): every navigation page must be in the
  sitemap and in `llms.txt`, every sitemap page must be a real route, every listed reader page
  must have a document behind it, and the `llms.txt` library count must match the library.

## 2.7.0 — Search the library (2026-11-17)

### Added

- Full-text search on `/library`. A search box above the category tabs finds documents by title,
  description, category and their full text; every word must match, and title matches rank first
  (so "prompt caching" leads with _Prompt Caching in 2026_). Matching words are highlighted, and
  documents that match only in their text show the passage around the match. The search works
  with the category tabs, says how many documents match (also to screen readers), and lives in the
  address bar (`/library?q=prompt+caching`) so it can be shared, bookmarked or reloaded.
- The document text (about 230 KB gzipped) loads only when someone focuses or uses the search
  box, so the library page itself grows by under 4 KB. The reader shares the same file, so a
  reader page opened later doesn't download it again. Ranking, snippets and highlighting live in
  `src/lib/library-search.ts` (8 tests, including the real 65-document library).

### Removed

- `pricingVersion` in `src/tokenops/data.ts`, which nothing used.

## 2.6.0 — Print-ready pages (2026-11-17)

### Added

- Print and "Save as PDF" give ink on paper in every palette. Ledger Dark printed pale text on
  white, because browsers drop page backgrounds but keep text colours, and pages printed the
  header, tab bar, buttons and the fixed background grid. Now every palette prints with Paper
  Light colours (print tokens in `src/styles.css`), site chrome and controls are hidden, wide
  tables and code print whole, headings stay with their text, and tables, code blocks and
  release cards don't split across pages. External links in long-form pages print their
  address after the link text. The guide prints as a 36-page A4 document.
- Printouts keep the footer's bottom row, so every printed or saved page set ends with the
  copyright and the release watermark (`v2.6.0`).
- `npm run smoke` checks print in all three palettes on `/guide`, `/calculator` and a library
  briefing: no chrome or buttons, dark text on a white page, and the watermark printed. On the
  build before this change it reported 21 failures.

## 2.5.0 — Shareable calculator scenarios (2026-11-17)

### Added

- Shareable calculator scenarios. "Copy scenario link" beside "Download CSV" on `/calculator`
  copies a link such as `/calculator?p=anthropic&r=5000000&cache=50` and puts it in the address
  bar; opening it fills the blended-savings calculator with the same inputs, server render
  included. Only values that differ from the defaults are written, so the default scenario is
  plain `/calculator`. Where the clipboard is blocked, the link is shown in a field to copy.
- Links are validated before use (`src/lib/calculator-scenario.ts`, 6 tests): only known
  presets and in-range numbers are read, anything else falls back to the default, and unknown
  parameters such as `utm_source` are ignored. The calculator maths is unchanged.

### Changed

- `npm run smoke -- --accept=/route[,/route]` rewrites the content-parity baseline for routes a
  feature changes on purpose; every other route is still compared.
- Secondary buttons show a pointer cursor.

## 2.4.2 — Working links between library documents (2026-11-17)

### Added

- `npm run smoke` checks the release watermark on every page at every width: the footer must
  show `v<package.json version>`, so a stale build or cached shell fails instead of passing.
- `/changelog`, exempt from text parity since 2.4.1, is now checked against `CHANGELOG.md`: it
  must list every version, newest first, with the `package.json` version marked current.

### Fixed

- 29 links between library documents led to "not found" pages. The FAQ, maturity model, RACI
  matrix and case studies point at templates with content-pack paths such as
  `../../public/templates/implementation-playbook.md`, which the browser resolved to
  `/read/public/templates/…`. The library reader now resolves relative links against the
  document's place in the pack (`src/lib/reader-links.ts`) and opens the target in the reader:
  27 template links and the templates folder link now work, and the 18 links that already worked
  point straight at their reader page. A link to a file that exists nowhere (the library
  README's `INTEGRATION.md`) shows as plain text instead of a dead link. Absolute, `#anchor` and
  root-relative links are unchanged, as are the guide and sample chapter.
- A test renders all 72 library and template documents and fails if any link points at a
  missing reader page, so new content can't add dead links (6 tests).

### Removed

- `THEME_CHOICES` in `src/lib/theme.ts`, which nothing used.

## 2.4.1 — Watermark opens its own release notes (2026-11-17)

### Changed

- The footer version watermark links straight to its own entry on `/changelog`
  (`/changelog#v2.4.1`) instead of the top of the page.
- `npm run smoke -- --baseline` skips routes that the baseline build does not have (HTTP 404)
  with a warning, so a baseline rebuilt from the pre-uplift commit reports "no baseline" for
  `/changelog` instead of recording a 404 page that later fails content parity.
- `/changelog` is exempt from smoke's content-parity check (`PARITY_EXEMPT`): its text is the
  release log, which every release extends, so parity failed every release PR against a `main`
  baseline. It keeps the HTTP, console, overflow, tap-target, field-size and axe checks.

### Removed

- `screenshot.js` and `screenshot.cjs`: identical one-off scripts from May that nothing ran or
  referenced, pointing at the old `lovable.app` URL (the `.js` copy could not run in this ES
  module package). `npm run smoke` takes the section screenshots (`.smoke/shots`).

## 2.4.0 — Release notes page and release tooling (2026-11-17)

### Added

- Release notes page at `/changelog`, rendered from `CHANGELOG.md` with one card per version and
  the current release marked. The footer watermark (`v2.4.0`) now links to it; the page is in
  `sitemap.xml` and the smoke routes, and stays out of the main navigation.
- `npm run release -- <patch|minor|major|x.y.z> "Title"` cuts a release: it bumps
  `package.json` and both `package-lock.json` version fields, and adds a dated
  `## x.y.z — Title (YYYY-MM-DD)` entry with a placeholder at the top of `CHANGELOG.md`
  (`--dry-run` prints the plan). This release was cut with it.

### Changed

- `npm test` guards the watermark more strictly: `package-lock.json` must carry the same version
  as `package.json`, `CHANGELOG.md` versions must be unique and newest first with well-formed
  dated headings, and the newest entry must have real notes rather than the release script's
  placeholder. Shared parsing lives in `src/lib/release-notes.ts` (5 tests).

## 2.3.4 — Remove unused UI components and packages (2026-11-17)

### Removed

- 41 shadcn/ui components that nothing imports (`accordion`, `alert-dialog`, `calendar`,
  `card`, `carousel`, `chart`, `form`, `select`, `sidebar`, `sonner`, `tabs`, `tooltip` and
  others) from `src/components/ui`. The five in use stay: `button`, `command`, `dialog`,
  `dropdown-menu` and `sheet`. They can be re-added with the shadcn CLI (`components.json`) if a
  future page needs one.
- 32 packages used only by those components or by nothing: 22 `@radix-ui/react-*` primitives,
  `react-day-picker`, `date-fns`, `embla-carousel-react`, `vaul`, `input-otp`,
  `react-resizable-panels`, `sonner`, `react-hook-form`, `@hookform/resolvers` and
  `@ai-sdk/react`. 44 entries leave `package-lock.json` and `bun.lock`; no remaining package
  changes version.
- Kept on purpose: the Lovable-managed `drizzle/` scaffold and its packages, and the generated
  Supabase integration files.

## 2.3.3 — Bullets and numbers in long-form lists (2026-11-16)

### Fixed

- Lists in the guide, the sample chapter and every Markdown library and template page had no
  bullets or numbers. Tailwind 4's reset removes list markers and the long-form styles never set
  them back, so numbered steps lost their numbers and nested bullets read as plain lines (on
  `/guide` alone, 41 numbered and 275 bulleted items). `.guide` and `.reader-article` lists now
  show discs and numbers indented 1.5em, as adviser answers have since 2.3.1, with circles for
  nested bullets.
- Tables of contents (link-only items that jump to a heading on the same page, on `/guide` and
  the FAQ) and checklists look as before: no markers, flush with the text. The Sources lists of
  external links in model and technique briefings now have bullets.

Found and fixed in #38 (originally numbered 2.3.2); brought onto `main` after 2.3.2 shipped.

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
