# Architecture decisions

- Keep all hosted model pricing, deployment, openness, licence, and verification metadata in `data/pricing.json`; calculators and generated references derive from it to prevent drift.
- Treat unavailable self-hosted token prices as `null`, never zero; calculate open-model economics from user-supplied infrastructure, throughput, utilisation, and overhead assumptions.
- Keep decision-routing and maintained-knowledge economics in browser-safe pure functions with adjacent arithmetic tests; distinguish typed decision models from generative models to avoid invalid cost comparisons.
- Store reading lists only in device-local IndexedDB to preserve the product's no-account and no-tracking privacy model.
- Run AI workload advice through authenticated TanStack server functions and the Lovable AI Gateway; never expose credentials or prompts in browser code.
- Sign-in (`/auth`) is passwordless Supabase email links and exists only for the AI workload adviser; never tie reading lists, calculator inputs, or other browsing to an account. Redirect targets go through `safeRedirect` (same-site paths only).
- Read the release version only from `package.json` `version` (via `src/lib/release.ts`, shown as the footer watermark); bump it with a matching new top `CHANGELOG.md` entry for every change that reaches production, so each deployed build has its own label (`npm test` enforces the match).
