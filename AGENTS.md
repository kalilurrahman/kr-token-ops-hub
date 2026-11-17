# Architecture decisions

- Keep all hosted model pricing, deployment, openness, licence, and verification metadata in `data/pricing.json`; calculators and generated references derive from it to prevent drift.
- Treat unavailable self-hosted token prices as `null`, never zero; calculate open-model economics from user-supplied infrastructure, throughput, utilisation, and overhead assumptions.
- Keep decision-routing and maintained-knowledge economics in browser-safe pure functions with adjacent arithmetic tests; distinguish typed decision models from generative models to avoid invalid cost comparisons.
- Store reading lists only in device-local IndexedDB to preserve the product's no-tracking privacy model; browsing, reading lists and calculators never need an account.
- The only account is the optional passwordless email sign-in (Supabase magic link) that unlocks the AI workload adviser; keep it scoped to the adviser and store nothing about the user beyond Supabase Auth.
- Run AI workload advice through authenticated TanStack server functions and the Lovable AI Gateway; never expose credentials or prompts in browser code.
- Render AI workload adviser answers only with `renderAdviceMarkdown` (`src/lib/advice-markdown.ts`): model output is untrusted, so raw HTML stays text, links are limited to https/http/mailto/same-site, and images are never loaded. Never pass it to `renderMarkdown` (trusted library documents only) or other raw HTML.
- Read the release version only from `package.json` `version` (via `src/lib/release.ts`, shown as the footer watermark that links to its `/changelog` entry); bump it, both `package-lock.json` copies and a matching new top `CHANGELOG.md` entry for every change that reaches production, taking the next version that is free on current `main`, so each deployed build has its own label (`npm test` enforces the match, the heading format and unique, descending versions).
