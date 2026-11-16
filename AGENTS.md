# Architecture decisions

- Keep all hosted model pricing, deployment, openness, licence, and verification metadata in `data/pricing.json`; calculators and generated references derive from it to prevent drift.
- Treat unavailable self-hosted token prices as `null`, never zero; calculate open-model economics from user-supplied infrastructure, throughput, utilisation, and overhead assumptions.
- Keep decision-routing and maintained-knowledge economics in browser-safe pure functions with adjacent arithmetic tests; distinguish typed decision models from generative models to avoid invalid cost comparisons.
- Store reading lists only in device-local IndexedDB to preserve the product's no-tracking privacy model; browsing, reading lists and calculators never need an account.
- The only account is the optional passwordless email sign-in (Supabase magic link) that unlocks the AI workload adviser; keep it scoped to the adviser and store nothing about the user beyond Supabase Auth.
- Run AI workload advice through authenticated TanStack server functions and the Lovable AI Gateway; never expose credentials or prompts in browser code.
- Read the release version only from `package.json` `version` (via `src/lib/release.ts`, shown as the footer watermark); bump it with a matching new top `CHANGELOG.md` entry for every change that reaches production, so each deployed build has its own label (`npm test` enforces the match).
