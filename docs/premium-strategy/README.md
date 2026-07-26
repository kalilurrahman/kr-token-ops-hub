# TokenOps Premium Strategy — Executive Summary

**The plan in one paragraph.** TokenOps Atlas stays the free, open reference — corrected and consolidated so it becomes the best free resource in its niche and the top of the funnel. The paid product is **TokenOps Pro — the operator's edition**: a book-quality *TokenOps Handbook (2026 Edition)*, an Operator Toolkit of artifacts professionals actually use in meetings (.xlsx cost model, .pptx exec deck, .docx templates, a runnable companion code repo), license-gated web access with advanced calculators, and — the real moat — a **living, monthly-verified pricing dataset with a public changelog**. It sells at **$59 / $149 / $599** (Handbook / Pro / Team) through **Polar.sh** as merchant of record and license authority, with Gumroad kept only as a secondary marketplace storefront, license keys enforced end-to-end on the existing Cloudflare Workers deployment, and an audience-first launch: an 8–10 week email runway, a list-first presale at ~33% off, then a Product Hunt + Show HN launch week. Year-one revenue scenarios, built on comp-anchored assumptions and honest math: **~$24k conservative / ~$55k base / ~$111k upside**, net of fees.

## Why this shape (the three findings that forced it)

1. **The existing library is effectively public property.** All 46 library documents are world-readable under `/public`, shipped in full inside the 663 KiB `documents.json` compiled into the client JavaScript bundle, indexed, archived, and advertised to AI crawlers by `llms.txt` as "the open reference." Retroactively paywalling it would protect nothing and read as a bait-and-switch. **The paid product must be corrected, unified, and new material plus a freshness stream — not walls around leaked content.**
2. **The corpus is not yet sellable — and the gap is precisely identified.** Roughly 25–30% is genuinely differentiated (the Optimize hub and per-tool credit guides, the trends pack, cost-anomaly detection, the vendor negotiation kit, six verified-correct calculators, the brandable "Caveman compression" method). But the flagship guide contains documented arithmetic errors and mid-2024 pricing under a "May 2026" label, the product carries 5+ mutually contradictory pricing tables, and zero primary data exists anywhere. The fact/math pass and a single pricing source of truth (`data/pricing.json`) are **launch-blocking**, and the presale cannot open until the quality gate passes.
3. **The market gap is real and time-boxed.** No premium, engineer-first, provider-neutral LLM cost product exists between the [$67 thin Gumroad playbooks](https://agentgenius.gumroad.com/l/ocxnk) and the [$500 FinOps Foundation "FinOps for AI" certification](https://thenewstack.io/finops-foundation-launches-new-finops-for-ai-certification/). The proven analogs — [The Good Parts of AWS ($65, $140k+)](https://www.writerontheside.com/40k-in-16-days-from-daniel-vassallo-and-the-good-parts-of-aws/), [Refactoring UI ($149→$249)](https://refactoringui.gumroad.com/l/MyQsm) — show exactly how the $79–349 middle is won. The window is measured in quarters.

## The locked decisions

| # | Decision |
|---|---|
| D1 | **Brand:** TokenOps Atlas = free open reference. Paid line: TokenOps Pro. Flagship: *The TokenOps Handbook, 2026 Edition* |
| D2 | **Platform:** Polar.sh primary (MoR, enforced activation limits, auto-revocation on refund, ~5% + $0.50). Gumroad secondary storefront only (Discover's 30% treated as CAC). Lemon Squeezy excluded (sunsetting). Fallbacks: Stripe Managed Payments + Keygen, or Paddle + Keygen. Everything behind one `LicenseService` interface |
| D3 | **Prices:** Handbook $59 (presale $39) · Pro $149 (presale $99, the default tier) · Team $599 (presale $449, 10 seats on one key) · KDP condensed edition $9.99 / ~$24.95 as funnel · video tier later only if proven feasible |
| D4 | **Updates:** edition-based, never "lifetime" — every 2026–27 edition update (12+ months) + monthly pricing refreshes; ~50% off the next edition |
| D5 | **Free↔premium split:** guide, Optimize hub, glossary, blended calculator, newest-2 trend briefings stay free; advanced/playbooks/operating packs, trends archive, 5 advanced calculators, Handbook, all new artifacts are premium |
| D6 | **Quality gate (launch-blocking):** fact/math pass, one pricing source of truth, no invented numbers presented as data, one glossary, hygiene fixes |
| D7 | **Gating:** premium content server-only (out of `/public` and the client bundle), R2 + per-buyer watermarked downloads, KV license state, signed cookie sessions, honest SSR teasers + paywall JSON-LD, 301s for old URLs |
| D8 | **Audience:** Kit (ConvertKit), four capture points, "Token Price Watch" newsletter, 8–10 week runway before any presale |
| D9 | **Legal:** 30-day guarantee, explicit content license (internal use + modification OK, no redistribution), results disclaimer on every savings claim, GDPR-clean privacy |
| D10 | **Sustainability:** ≤10 hrs/week steady state with an explicit drop order; the pricing refresh and support are never dropped — pause sales before breaking the freshness promise |
| D11 | **Analytics:** Plausible + full-funnel events + UTM discipline; buyer emails continuously exported to Kit (platform-migration hedge) |
| D12 | Facts harmonized: 46 library documents; 663 KiB client-bundled corpus; fees as verified July 2026 |

## The documents

| Doc | Contents |
|---|---|
| [01 — Product & Packaging](01-product-and-packaging.md) | Honest audit verdict, product line, the definitive free↔premium asset map, the full Handbook table of contents (6 parts, 21 chapters), editorial quality gate, new-asset specs (xlsx/pptx/docx/code repo/benchmarks/pricing dataset), and the costed content workplan (~215–285 h) |
| [02 — Pricing, Tiers & Sales Platforms](02-pricing-and-platforms.md) | Evidence for every price point, edition-based update promise, presale design, PPP plan, the platform decision memo with fee tables, Team-tier operational design, KDP/Leanpub complement, refund policy, revenue scenarios |
| [03 — License & Entitlement Architecture](03-licensing-architecture.md) | Why the current site leaks everything, the server-only content design, `LicenseService` with Polar + Gumroad adapters (TypeScript), sessions, webhooks, watermarked delivery, SEO-safe teasers, a file-by-file implementation plan (~5–6.5 days) with the deploy-pipeline spike as step zero |
| [04 — Marketing, Audience & Launch](04-marketing-and-launch.md) | Positioning + claims-hygiene policy, the email runway and capture points, the SEO transition without backlash ("the reference stays free"), the dated launch sequence, content flywheel, affiliates, the B2B expense-template motion, metrics with pre-committed targets |
| [05 — Operations, Legal & Sustainability](05-operations-legal-sustainability.md) | The ≤10 hrs/week operating calendar, the pricing-dataset pipeline and SLA, support playbook, full draft legal package (license text, disclaimers, privacy), piracy stance + DMCA routine, platform hedges, risk register |
| [06 — The 90-Day Execution Roadmap](06-roadmap-90-days.md) | Week-by-week plan with hours, three go/no-go gates with fallback paths, the honest effort reality check (~370–495 h total; what 20 or 10 hrs/week really means), reconciled revenue scenarios, day-91+ horizon |

## The first five actions (this week)

1. **Deploy-pipeline spike:** confirm the Lovable pipeline passes `wrangler.jsonc` KV/R2 bindings and secrets to production; if not, move deploys to `wrangler deploy` in CI. Everything in doc 03 depends on this answer.
2. **Delete `public/library/INTEGRATION.md`** (internal build instructions currently shipped publicly) and fix the stale "29 guides" count (actual: 46).
3. **Install Plausible and export the Search Console baseline** — the only pre-migration traffic baseline that will ever exist.
4. **Stand up Kit with the first capture form** and seed `data/pricing.json` v0 from LiteLLM's model-prices JSON with manual verification — changelog entry #1.
5. **Publish Token Price Watch #1 and the Caveman compression post** — the runway starts now; it is calendar-bound and no later crunch can buy it back.
