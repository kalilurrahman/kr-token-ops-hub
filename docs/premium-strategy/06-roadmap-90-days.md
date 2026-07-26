# 06 — The 90-Day Execution Roadmap

**What this document decides.** The single schedule composing the other five documents into a 13-week arc: which week each workstream from [01-product-and-packaging.md](01-product-and-packaging.md) (content), [02-pricing-and-platforms.md](02-pricing-and-platforms.md) (pricing/platforms), [03-licensing-architecture.md](03-licensing-architecture.md) (gating), [04-marketing-and-launch.md](04-marketing-and-launch.md) (audience/launch), and [05-operations-legal-sustainability.md](05-operations-legal-sustainability.md) (ops/legal) runs; three go/no-go gates that decide whether money changes hands; the honest hours math against a 15–20 hrs/week side-project budget, including what happens at 10 hrs/week; and the day-91+ horizon (steady state, video-tier checkpoint, 2027 Edition, the subscription question). The gates are event-driven; the week numbers are planning aids. When hours fall short, dates move — the gates never do.

---

## 1. Four principles that order everything

1. **Audience runway before presale (D8).** Every comp was audience-first — [Comeau turned a $50k goal into $550k of pre-orders off his blog audience](https://www.indiehackers.com/post/launched-my-first-course-earned-over-us-500-000-ama-4382405cd5); [Barry's sample-chapter form converted 5.3% of visitors into leads](https://nathanbarry.com/ongoing-sales/). Kit and the first capture point go live in week 1; the presale does not open before week 9 (8 full weeks of runway) or below ~400 subscribers, per [04-marketing-and-launch.md](04-marketing-and-launch.md) §2.4. The runway is **calendar-bound, not hour-bound** — no crunch buys it back, so it starts first.
2. **Content quality bar before any money changes hands (D6).** The audit documented arithmetic errors in `guide.md`, five-plus contradictory pricing tables, and invented numbers styled as data. The presale cannot open until 01's seven-item bar passes (Gate 1, end of week 6). A refund machine launched on schedule is worse than a trustworthy product launched late.
3. **Gating ships dark before the paywall flips (D7).** The content split, unlock flow, webhooks, and watermark pipeline deploy with premium flags off and get verified against the real platform before the flip — messaging first, paywall second, money third, per 04 §4.
4. **The deploy-pipeline spike is step zero (critique #16).** Everything in [03-licensing-architecture.md](03-licensing-architecture.md) assumes `wrangler.jsonc` bindings (KV, R2, secrets) survive deployment, and nobody has confirmed the Lovable pipeline passes them through. Validate in week 1 — before any gating code — with the else-branch (plain `wrangler deploy` in GitHub Actions) ready the same week.

**Timeline anchor.** T0 (public launch day, a Tuesday) = week 11. That maps 04's launch sequence directly: T-10w = week 1, T-5w = week 6 (sample chapter), T-4w = week 7 (repositioning post + paywall flip), T-3w = week 8 (corrections post), T-2w = week 9 (presale opens), T-1w = week 10, T0 = week 11.

---

## 2. Week-by-week plan

Owner for every row is **you** (solo, per D10) — the column is kept for completeness. Hours are in-window effort; content-workplan IDs (A1–A6, B1–B7) come from 01 §7.

### Phase 1 — Weeks 1–2: Foundations

| Workstream | Concrete tasks | Hours | Owner | Depends on | Exit criteria |
|---|---|---|---|---|---|
| Deploy-pipeline spike (**step zero**) | Add `LICENSE_KV` (KV), `PREMIUM_ASSETS` (R2), and a dummy secret to `wrangler.jsonc`; deploy via the Lovable pipeline; confirm the Worker reads a KV test key in production. If bindings are dropped: stand up `.github/workflows/deploy.yml` running `wrangler deploy`, demote Lovable to edit-only | 4–6 | You | None | A production Worker demonstrably reads KV + a secret, via whichever pipeline won |
| Analytics (D11) | Plausible installed with funnel events (`teaser_view → unlock_cta_click → checkout_start → activation`, `email_capture`); Search Console property verified; **export 12 weeks of query/page data as the only pre-migration baseline that will ever exist** (04 §3.3) | 2–3 | You | None | Events firing in Plausible; GSC baseline exported |
| Email (D8) | Kit account; site-wide footer capture forms (least intrusive on `/caveman` and `/tool-guides` per 04 §2.2); Token Price Watch list created; lead-magnet delivery automation for the first template | 4–6 | You | None | A visitor can subscribe and receive `prompt-optimization-checklist.md` automatically |
| Corpus hygiene (A3, part 1) | Delete `public/library/INTEGRATION.md` (serve 410); fix "29 guides" → 46 in `src/routes/library.tsx` and `public/llms.txt`; label `/dashboard` "sample data demo" | 3–4 | You | None | No internal doc publicly served; counts correct; dashboard honestly labeled |
| Pricing source of truth (A1, spike) | `data/pricing.json` v0 seeded from [LiteLLM's model_prices JSON](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json) with every consumed row manually verified against provider pages; changelog format fixed; repoint `src/tokenops/data.ts` calculator presets | 8–10 | You | None | All 6 calculators read `pricing.json`; changelog entry #1 exists |
| Marketing (04 calendar, T-10w/T-9w) | Token Price Watch #1 (July pricing diff, from the changelog); **caveman compression post** + HN/Reddit/X thread — the most linkable asset in the repo per the audit | 3–4 | You | pricing.json v0 | Issue #1 sent; caveman post live with capture CTA |

**Phase total: ~24–33 h** (12–17/wk — the easy weeks; they don't last).

### Phase 2 — Weeks 3–6: Content critical path

This is 01's Phase A (the presale gate) plus the start of Phase B. It is the critical path in the strict sense: nothing downstream matters if this slips.

| Workstream | Concrete tasks | Hours | Owner | Depends on | Exit criteria |
|---|---|---|---|---|---|
| Pricing unification (A1, finish) | Repoint `hub.tsx` MODELS table and all site tables to `pricing.json`; retire `token-pricing-reference.md` and `provider-comparison-matrix.md`; kill the 5+ contradictory pricing tables | 4–6 | You | pricing.json v0 | Exactly one pricing source of truth; zero contradictions |
| guide.md fact/math pass (A2) | Fix the documented errors: §3.1 per-token arithmetic ($15,000/10B mislabeled), Case Study 1 volume mismatch, the miswritten forecast formula, the invented tokenization IDs; reprice from the dataset; label every illustrative scenario; add `check-math.ts` with the three errors as regression tests; republish free | 10–14 | You | A1 | guide.md corrected, machine-checked, live |
| Corpus hygiene (A3, finish) | Merge three glossaries into one; replace `TokenOps_Guide.pdf` (940 KB) with a teaser edition; consolidate `/hub` duplication | 5–6 | You | — | One glossary; no outdated free PDF competing with the paid edition |
| Voice pass setup (A4) | One-page voice guide + editorial checklist wired into review | 2–3 | You | — | Every doc touched from here on passes it |
| Sample chapter (A5) | "The Prompt Caching Chapter" at final book quality — doubles as the flagship email magnet, launching week 6 (T-5w per 04's calendar) | 10–12 | You | A4 | Chapter live behind email capture; 6-email sequence loaded in Kit |
| Handbook TOC + first chapters (A6) | Final TOC; Chapter 6 (anomaly detection) fact-pass; Chapter 7 merge — so presale buyers receive real material on day one | 14–18 | You | A4 | TOC + ≥3 finished chapters deliverable |
| Handbook manuscript begins (B1) | Merge/rewrite pass on the strongest existing material first (Optimize hub, `advanced/`, trends) | 25–35 | You | A4, A6 | ~30% of manuscript at final quality by end of week 6 |
| Companion repo + case study setup (B6/B7 start) | Repo skeleton from `multi-provider-routing-config.yaml`; external case-study outreach emails sent (long lead time — start now) | 6–8 | You | — | Repo scaffolding runs; 2 outreach attempts in flight |
| Marketing (04 calendar, T-8w→T-5w) | Agentic-loop-tax post; Claude Code and Cursor tool-guide posts; Token Price Watch #2; lead magnets #1–2 wired | 8–10 | You | Phase 1 email | Calendar current; subscribers accruing toward the 400 floor |

**Phase total: ~89–112 h** over 4 weeks (~22–28/wk — the first crunch stretch). **Gate 1 sits at the end of week 6** (§3).

### Phase 3 — Weeks 5–8 (overlapping): Platform and gating

Runs deliberately in parallel with the content tail. Everything ships **dark** — deployed, flagged off, verified.

| Workstream | Concrete tasks | Hours | Owner | Depends on | Exit criteria |
|---|---|---|---|---|---|
| Polar org + products | Polar org (Starter, [5% + $0.50](https://polar.sh/docs/merchant-of-record/fees)); Handbook/Pro/Team products at presale prices ($39/$99/$449); license-key benefits with enforced activation limits (Pro ≈ 5 devices, Team = one key/10 activations); sandbox test keys | 6–8 | You | Week-1 spike | Test checkout issues a key that validates via the customer-portal API |
| Content split (03 §5.1) | `scripts/build-content.mjs` emits `free-documents.json` (client) + `premium-documents.json` (server-only via `src/tokenops/premium.server.ts`); premium files move `public/library/**` → `content/premium/**`; `read.$.tsx` gains a server loader with 15–20% teasers; `documents.json` (663 KiB, 46 documents) stops shipping premium text to the browser | 10–14 | You | Week-1 spike; D5 split map | Client-bundle grep for a premium-only phrase returns nothing; raw `.md` URLs 301 to teasers on staging |
| LicenseService + adapters (D2) | `src/lib/session.server.ts` (signed HttpOnly cookie, 30d hard/7d soft), `src/lib/license.server.ts` behind one `LicenseService` interface with **Polar primary + Gumroad secondary** adapters; `src/fn/license.ts`; `src/routes/unlock.tsx` with Turnstile pre-wired; KV verify cache + denylist + rate limits | 12–16 | You | Polar products | Unlock with a sandbox key sets a session; denylisted key 403s |
| Webhooks | Polar + Gumroad webhook routes; **confirm against the verify API before denylisting** (webhook = hint, not fact, per 03); register subscriptions on both platforms | 4–6 | You | LicenseService | Sandbox refund → KV denylist entry, automatically |
| Watermark + delivery pipeline | CI (GitHub Actions): pandoc/Typst → base PDF/EPUB → `wrangler r2 object put`; `src/routes/api/download/$.ts` stamps per-buyer footer + metadata with `pdf-lib` at download time (fictional fixtures only in tests, e.g. `jane@example.com`, per D9); "Start here" PDF for platform delivery | 10–14 | You | R2 binding; A5+ content | A downloaded PDF carries the test buyer's watermark on every page |
| Gumroad secondary storefront | Product listings, per-sale license keys enabled, Discover opt-in (fees [10% + processing direct / 30% Discover](https://gumroad.com/help/article/66-gumroads-fees) — treated as CAC, not home base); adapter loop test | 3–4 | You | LicenseService | A Gumroad sandbox key unlocks through the same interface |
| **Repositioning + paywall flip (week 7 = T-4w)** | "The reference stays free" post publishes **first**; then flip premium flags, 301 map live, `llms.txt` rewritten, sitemap resubmitted, top-10 teaser routes URL-inspected for JSON-LD `isAccessibleForFree:false` (04 §3) | 4–6 | You | Content split verified; repositioning post live | Paywall live with unlock CTA pointing at the **waitlist** (presale isn't open yet); GSC weekly monitoring starts |
| Handbook + toolkit build continues (B1/B3, parallel) | Manuscript chapters; `.xlsx` cost model started from the calculator logic | 28–38 | You | Phase 2 | ~60% of manuscript done; xlsx tabs 1–3 working |

**Phase total: ~77–106 h** over 4 weeks, weeks 5–6 shared with Phase 2. **Gate 2 sits at the end of week 8** (§3).

### Phase 4 — Weeks 8–10: Presale

| Workstream | Concrete tasks | Hours | Owner | Depends on | Exit criteria |
|---|---|---|---|---|---|
| Pre-presale messaging (week 8 = T-3w) | "What we fixed" corrections post (owning the audit findings in public); Handbook TOC reveal; Token Price Watch #3; waitlist push tagging `presale-interest` | 4–5 | You | Gate 1 passed | List ≥ ~400 or presale slips 2 weeks (04 §2.4) |
| Legal/policy live (D9, per 05) | 30-day money-back guarantee, EU 14-day withdrawal via Polar's consent-on-delivery flow, license terms (single-user; internal use + modification; client deliverables OK; no redistribution; Team = 10 named users), results-not-guaranteed disclaimer on every savings claim, privacy policy (email list + license cookie) | 8–12 | You | — | All published **before** the first sale |
| **Presale opens (week 9 = T-2w)** | List-first, 48–72h exclusive, then public link; $39/$99/$449 (≈33% off, D3); window 10–14 days, closes at T0 permanently | 4–6 | You | Gates 1+2 passed; legal live | Checkout → key → unlock → watermarked download works for real buyers on day one |
| Handbook beta ships | Presale buyers receive the sample + ≥3 finished chapters + dated delivery schedule; a reply-to feedback loop (every presale buyer email gets read and answered) | 4–6 | You | A5/A6 | First batch delivered within 24h of purchase; feedback logged against the manuscript plan |
| Buyer-list export (D11) | Continuous Polar→Kit export of buyer emails verified working (platform-migration hedge — you must own the buyer list) | 1–2 | You | First sales | Every buyer exists in Kit with a `buyer` tag |
| Mid-presale proof (week 10 = T-1w) | "What presale buyers already have" email; KDP condensed edition (narrative handbook only, $9.99 ebook / ~$24.95 paperback, back-of-book discount code into Pro) submitted so it's live for launch week — [KDP drove ~60% of Kahl's week-one volume](https://www.indiehackers.com/post/zero-to-sold-1000-books-sold-in-7-days-here-are-the-numbers-0954b31c39) | 15–20 | You | B1 far enough for the condensed edition | KDP in review by end of week 10 |
| Toolkit + manuscript completion push (B1–B7) | Remaining chapters; `.pptx` exec deck + Team workshop deck + expense template; 8 `.docx` fillable templates; companion repo v1 runnable; case-study chapter (own-telemetry fallback if outreach failed) | 60–85 | You | Phase 2/3 | 01's full-launch gate items all green by end of week 10 |

**Phase total: ~96–136 h** over 3 weeks — this only closes if Phase B tracked to plan through weeks 5–8; see §4. **Gate 3 sits at the end of week 10** (§3).

### Phase 5 — Weeks 11–12: Launch

| Workstream | Concrete tasks | Hours | Owner | Depends on | Exit criteria |
|---|---|---|---|---|---|
| Quality gate go/no-go | Final pass of 01's full-launch gate: complete manuscript, all four Toolkit artifact classes, watermarked delivery end-to-end, first pricing-changelog entry public | 2–3 | You | Phase 4 | Every item green or T0 slips — never launch on the current corpus |
| **T0 (Tuesday, week 11)** | Product Hunt: "TokenOps Pro — the operator's edition," full price, maker comment tells the corrections story; presale closes at T0; prices go full permanently | 6–8 | You | Gate 3 | Live on PH; presale window closed |
| **T0+2 (Thursday)** | Show HN: the free Atlas + calculators as the artifact ([PH-then-HN sequencing](https://smollaunch.com/compare/product-hunt-vs-hacker-news)); stay in the thread all day — the paid tier is discovered, not pitched | 6–8 | You | T0 | Thread engaged all day; funnel events tracking source |
| Launch week, continuous | LinkedIn for manager/CFO personas: exec-deck one-pager, expense-template post — where the Team tier is won (04 §4) | 3–4 | You | — | Team-tier inquiries have a documented reply path |
| Week 12: post-launch drip | Launch-numbers transparency post (the [Vassallo](https://www.linkedin.com/pulse/how-i-made-210822-selling-pdf-video-internet-daniel-vassallo?articleId=6711186613663354880)/Kahl move); affiliate recruiting begins; 3-email non-buyer nurture; buyer onboarding email (unlock flow, toolkit tour, Team upsell) | 6–8 | You | T0 | Drip scheduled; affiliates invited |
| Support + monitoring | Refunds within policy, activation resets, webhook health, GSC weekly checks (301s registering as "Page with redirect," not soft-404) | 4–6 | You | — | Support response <24h; no indexing anomalies unaddressed |

**Phase total: ~27–37 h.**

### Phase 6 — Week 13: Stabilize

| Workstream | Concrete tasks | Hours | Owner | Depends on | Exit criteria |
|---|---|---|---|---|---|
| Retro + metrics review | Actuals vs. 04 §8 targets (presale/launch conversion, capture rates, teaser→unlock ≥8% baseline-setting) and vs. §5's revenue scenarios; write the retro | 3–4 | You | Launch data | One page: what to keep, change, drop |
| Steady-state handover | Adopt 05's operating calendar (§6 below): pricing refresh by the 5th, Token Price Watch, 1–2 briefings/mo, weekly support block; schedule the first Black Friday event only if ≥8 weeks post-T0 | 2–3 | You | Retro | The calendar is running, not aspirational |
| Backlog triage | Benchmark program v1 (30–40 h + ~$100–300 API spend, per 01 Phase C) scheduled as the **first free 2026-edition update within 30 days** if it didn't make launch; KDP paperback proof if still pending | 2–3 | You | Retro | Dated plan for the first edition update |

**Phase total: ~7–10 h.**

---

## 3. Go/no-go gates

**Gate 1 — end of week 6: is the content bar met?**
Pass = all seven items of 01's presale bar: one pricing source of truth with zero contradictory tables; guide.md corrected and machine-checked; hygiene complete (INTEGRATION.md gone, counts fixed, dashboard labeled, one glossary); sample chapter at book quality; TOC + ≥3 chapters deliverable with a dated schedule; no unlabeled invented number anywhere a prospect reads; edition promise + disclaimer drafted for the sales page.
**If failed:** slip the presale in whole weeks (04's 8–10-week runway has slack precisely for this) and keep building the list meanwhile. Never lower the bar or the price. A miss costs 1–2 weeks; a bypass costs the product's one asset, trust.

**Gate 2 — end of week 8: is gating verified dark, with a real commerce loop?**
Pass = all of: (a) built client bundle contains no premium text (grep proof); (b) old raw `.md` URLs 301 to teasers; teasers render 15–20% + JSON-LD paywall markup, confirmed in GSC URL inspection; (c) **a real purchase with a real card on live Polar** → key issued → unlock → session cookie → stamped PDF download → then a real refund → webhook → verify-API confirmation → KV denylist → session lapses and downloads 403 (Polar also auto-revokes the key platform-side); (d) the same loop abbreviated through the Gumroad adapter (manual-disable path).
**If failed:** the presale still opens on time — checkout and file delivery run entirely on Polar (the audit's "sell off-site, zero code" v1 path), and web-hub access unlocks for buyers when gating lands. If the failure is the deploy pipeline itself, the week-1 else-branch (CI `wrangler deploy`) executes now. If the paywall can't flip by T0, launch messaging replaces "license-gated web access at launch" with a dated promise — never a silent one.

**Gate 3 — end of week 10: presale ≥ floor?**
Floor = **≥25 paid units or ≥$2.5k gross in the first 7 presale days, with refunds <5%** — just under the conservative scenario's $3.3k full-window list revenue (§5), i.e., "the conservative case is on track."
**If failed, diagnose before reacting:** (a) list under ~400 at open → the runway was the problem; pause the window, extend 2 weeks, re-open. (b) List ≥400 but conversion <1% → offer/messaging problem; **launch Handbook-only at $59 at T0, defer Pro** until the toolkit is complete, then re-pitch the list with finished artifacts. Presale buyers are never clawed back — they bought Pro at $99 and receive everything on the stated schedule. Not on the fallback menu: cutting prices mid-window (trains buyers to wait, per 02) or shipping unfinished work to hit the date.

---

## 4. Effort reality check

Demand, by workstream (low–high, from the tables above and 01 §7):

| Workstream | Hours |
|---|---|
| Foundations (spike, analytics, email, hygiene) | 24–33 |
| Content Phase A (presale gate) | 56–73 |
| Content Phase B (full Pro delivery) | 157–211 |
| Gating + platform (03) | 49–68 |
| Marketing: runway posts, sequences, presale + launch execution (04) | 55–70 |
| Ops/legal (05) | 8–12 |
| KDP condensed edition | 15–20 |
| Stabilize/retro | 7–10 |
| **Total** | **≈ 370–495** |

Capacity at the stated 15–20 hrs/week over 13 weeks is **195–260 hours**. The gap is real and this document will not pretend otherwise:

- **The 13-week arc as tabled is a ~28–32 hrs/week undertaking through weeks 3–10.** Achievable only as a deliberate, time-boxed crunch (or with time off work), holding scope to the low estimates and using 01's sanctioned deferrals: benchmark program → first edition update; case-study chapter → own-telemetry fallback.
- **At a sustained 20 hrs/week**, the presale still opens on schedule (~190 hours of presale-gate work fits by week 9–10), but full launch lands around **week 17–18 — day ~120–126, not day 90**. The honest name for the 120-day plan is "the 90-day plan at 20 hrs/week." Order, gates, and dependencies are unchanged; only T0 moves.
- **At 15 hrs/week**, T0 drifts toward week 22–24. Don't grind: take the Gate-3 fallback voluntarily — **Handbook-only launch at $59 around week 17**, Pro following when the toolkit completes.
- **At 10 hrs/week, this is not a 120-day plan at all.** 120 days buys ~170 hours: foundations + Phase A + Polar checkout + a light runway — an **early-access program** (presale ~day 80–90, chapters shipping in installments under the edition promise), with the finished Handbook near month 5–6 and Pro after. D10's ≤10 hrs/week is the *steady-state* budget, not a build budget; building at maintenance-level hours roughly doubles every timeline above.

**What gets cut first, in order (D10):** the video tier (already excluded from launch by D3), then new benchmarks (Phase C defers to the first edition update — 01 explicitly permits this), then new playbooks/new-written chapters slow down (existing-material chapters ship first). **Never cut:** the monthly pricing refresh, refunds, and support — the freshness promise is the product's moat and the one failure mode (documented staleness) the audit already caught this site committing once.

---

## 5. Revenue scenarios (reconciled with 02)

Assumptions verbatim from [02-pricing-and-platforms.md](02-pricing-and-platforms.md) §9 — none of this is a forecast; it is the sanity check that the effort clears the bar: tier mix 30% Handbook / 62% Pro / 8% Team (top tiers dominate revenue, per [Barry's launch data](https://nathanbarry.com/double-launch-revenue/)); ASP ≈ $109 presale / $158 full; list conversion 2–3% in the launch window; launch spike 0.5–1× list units at full price; Polar fees ≈ 5.3–6% all-in → ×0.94 net.

| | Conservative | Base | Upside |
|---|---|---|---|
| List at launch (after the runway) | 1,500 | 3,000 | 5,000 |
| Presale: list conversion → units @ $109 | 2.0% → 30 → $3.3k | 2.5% → 75 → $8.2k | 3.0% → 150 → $16.4k |
| Launch spike units @ $158 | 15 → $2.4k | 40 → $6.3k | 90 → $14.2k |
| **Launch-window gross (weeks 9–11)** | **≈ $5.6k** | **≈ $14.5k** | **≈ $30.6k** |
| Steady state (months 2–12) | 12 sales/mo → $1.9k/mo | 25 → $4.0k/mo | 45 → $7.1k/mo |
| KDP + code-redemption trickle | ~$1k/yr | ~$3k/yr | ~$5k/yr |
| Black Friday reactivation | — | — | ~$8k |
| **Year-1 gross** | **≈ $26k** | **≈ $59k** | **≈ $118k** |
| **Year-1 net of platform fees** | **≈ $24k** | **≈ $55k** | **≈ $111k** |

Roadmap-relevant readings: Gate 3's floor ($2.5k/25 units in 7 days) is the conservative case tracking — below it, the fallback produces a smaller launch, not a broken one. The scenarios' first sensitivity is **list size at launch**, which is why the runway is untouchable in every schedule variant in §4; the steady-state rate is carried by the freshness stream — the same items D10 forbids cutting. Nothing here assumes virality, Discover, PPP, or the video tier; each is upside. Anchors, not aspirations: [swyx's $25k launch on ~600 units](https://www.swyx.io/writing/coding-career-launch) had a bigger audience; [Vassallo's $45k in 14 days](https://www.writerontheside.com/40k-in-16-days-from-daniel-vassallo-and-the-good-parts-of-aws/) rode a large following.

---

## 6. Day 91 and beyond

**The steady-state month (per [05-operations-legal-sustainability.md](05-operations-legal-sustainability.md), D10 — ≤10 hrs/week).** ~4 hrs/wk support/ops: refunds inside the 30-day policy, activation resets, Team-tier invoice/procurement questions, webhook and denylist health. ~4 hrs/wk content: the pricing refresh by the 5th (LiteLLM diff → manual verification → changelog entry → Token Price Watch issue), plus 1–2 trend briefings (each newest one free for its first 30 days, per D5). ~2 hrs/wk marketing via 04's flywheel. Monthly metrics review against 04 §8; GSC checks weekly for 8 weeks post-flip, then monthly.

**Video-tier feasibility checkpoint (~day 120, per D3's "only if video proves feasible").** Three criteria, all required: (1) three months of steady state at or above the base case (≥25 sales/mo) — video is an amplifier, not a rescue; (2) organic buyer demand — repeated requests in support and email replies, not your own enthusiasm; (3) a timed pilot: one 15-minute walkthrough produced end-to-end in ≤6 hours. Pass all three → "Complete" tier at $249–299, mirroring [Refactoring UI's ceiling](https://refactoringui.gumroad.com/l/MyQsm). Fail any → revisit at the 2027 Edition; video remains the *first* thing D10 drops under pressure.

**The 2027 Edition cycle (D4).** The promise sold at launch is "every update to the 2026–27 edition (12+ months) + monthly dataset refreshes" — never lifetime. Month 9–10: scope the 2027 Edition (full benchmark rerun, repriced dataset, new chapters for the year's model generation, retirements). Month 11–12: owners get the ~50% upgrade offer, list-first, replaying this document's presale mechanics with the machinery already built. The edition boundary makes the update promise a bounded liability instead of the unbounded one the critique flagged — and each edition is a legitimate revenue event.

**The subscription question — a deliberate later decision, not a launch decision.** The living pricing dataset could become a $10–15/mo add-on (machine-readable JSON + change alerts; the newsletter stays free as the public proof). Decide at **month 6, not before**, against five criteria: (1) six consecutive months of on-time public changelog — prove you can carry an SLA before selling one; (2) ≥200 Pro owners as the upsell base; (3) measurable pull (owners asking for API/JSON access, Token Price Watch engagement); (4) support load still inside the 10-hr budget; (5) platform mechanics verified (Polar subscriptions carry [+0.5%](https://polar.sh/docs/merchant-of-record/fees); keys auto-expire on lapse). Boundary if adopted: the subscription sells the *data stream*; editions sell the *book and toolkit*. If the criteria aren't met, fold the dataset's value into the 2027 Edition and stay one-time-purchase simple — a solo operator makes recurring-delivery promises only once they are demonstrably keepable.
