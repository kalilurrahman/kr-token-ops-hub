# CLAUDE.md — TokenOps Atlas (Design System v2 uplift)

Claude Code reads this on every session. Also follow `AGENTS.md`; the design system is documented in `docs/DESIGN_SYSTEM.md`.

## Project

- TokenOps Atlas — open reference for FinOps on LLM tokens. https://tokenops.kalilurrahman.com
- Stack: TanStack Start 1.168, React 19, Tailwind 4 (`@theme inline`), shadcn/Radix, lucide-react, recharts, Supabase, Cloudflare via `@lovable.dev/vite-tanstack-config`.
- Lovable also edits this repo. Keep changes compatible with Lovable (no custom Vite plugins, no moving `src/routes`).

## Commands

- `npm run dev` · `npm run lint` · `npm run typecheck` · `npm test` · `npm run build` · `npm run smoke` (`-- --baseline` to reset, only on an untouched UI; `-- --no-build` to reuse a build)
- Smoke serves the Cloudflare build with `wrangler dev`. In sandboxes set `CHROMIUM_PATH` to an existing Chromium and, if third-party APIs are blocked, `SMOKE_IGNORE_CONSOLE` to a regex of the resulting console errors (report them as NOT VERIFIED).

## Rules for this uplift

1. Visual only. Never edit copy, data, routes, calculator math, SEO meta, Supabase or AI gateway code.
2. Styling lives in two files: `src/styles.css` (tokens + Tailwind theme) and `src/tokenops/style.css` (component layer keyed to existing class names).
3. Use `--to-*` tokens or Tailwind semantic utilities (`bg-card`, `text-muted-foreground`, `text-saving`, `bg-money-fill`, `border-risk`). Never raw hex or Tailwind palette colours (`emerald-500`, `blue-600`) in components.
4. No `!important`.
5. Fonts: Space Grotesk (display), IBM Plex Sans (body), IBM Plex Mono (numbers, eyebrows). Every number a user reads uses `.to-metric` or `font-mono tabular-nums`.
6. Colour meaning is fixed: gold = money & primary action, teal = savings/success, coral = anomaly/risk, sky = info/links in prose.
7. Palettes: Ledger Dark (`data-theme=dark`, default), Paper Light (`data-theme=light`), Bright Pro (`data-theme=light data-palette=bright`). Every change must look right in all three.
8. Responsive: design mobile 390 → tablet 834 → laptop 1440. No horizontal scroll. Nav tap targets ≥ 44px. Inputs 16px on mobile (no iOS zoom).
9. Accessibility: WCAG AA contrast, visible focus ring (`--to-focus`), `aria-current` on nav, Esc closes overlays, respect reduced motion.
10. Before saying a task is done, run the five commands and paste their summary. Use "NOT VERIFIED" for anything you did not run.

## Where things are

- Header/nav: `src/components/SiteHeader.tsx` (FULL_NAV = 23 routes, all must stay)
- Footer: `src/components/SiteFooter.tsx`
- Logo: `src/components/TokenOpsLogo.tsx` (do not redraw)
- Theme: `src/components/ThemeToggle.tsx`, head script in `src/routes/__root.tsx`
- Charts: `src/routes/dashboard.tsx` + `src/lib/chart-theme.ts`
- Mobile tab bar: `src/components/MobileTabBar.tsx`; palette logic: `src/lib/theme.ts`
- Guardrail: `scripts/check-tokens.mjs` (runs in `npm run lint`)
- Reference visuals: the design handoff's `reference/*.html` (not committed); palette screenshots in `docs/design-system/screens/`
