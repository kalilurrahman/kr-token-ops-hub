# 05 — Operations, Legal & Sustainability

**What this document decides.** This is the "can one person actually run this" document. It converts every promise the product makes — monthly pricing refreshes, edition updates, 30-day refunds, license support — into a bounded hours budget (≤10 hrs/week, D10), defines the pipeline that keeps the living pricing dataset honest (the structural fix for the staleness the audit documented), drafts the full legal package (terms of sale, content license, disclaimers, privacy — all marked as drafts pending lawyer review), sets the piracy posture (accept, watermark, out-fresh the pirates), locks in the platform-dependency hedges, specifies the analytics that gate future decisions, and closes with a ten-risk register. Product scope and tiers are in [01-product-and-packaging.md](01-product-and-packaging.md); pricing and platform economics in [02-pricing-and-platforms.md](02-pricing-and-platforms.md); the gating/licensing build in [03-licensing-architecture.md](03-licensing-architecture.md); launch sequencing in [04-marketing-and-launch.md](04-marketing-and-launch.md); the dated plan in [06-roadmap-90-days.md](06-roadmap-90-days.md).

---

## 1. The maintenance commitment, made concrete

The audit's core finding was not "the content is bad" — it was that unmaintained freshness claims rot into liabilities: guide.md said "May 2026" over mid-2024 pricing, and "Last reviewed: June 2026" was true for one file and false for four others. The critique (#8, #14) is blunt: an unbounded update promise from a solo creator fails within two quarters, reproducing exactly the failure you're selling the fix for. So every promise below has an hours price tag, and the total fits the budget.

### 1.1 The weekly budget (≤10 hrs/week steady state, D10)

| Bucket | Hrs/wk | What it covers |
|---|---|---|
| Support & ops | ~4 | Tickets (§3), refunds, webhook/platform health check, Polar/Gumroad dashboard review, buyer-email export verification (§6) |
| Content | ~4 | Monthly pricing refresh (amortized ~1 hr/wk), 1–2 trend briefings/month (~2 hrs/wk), errata and correction PRs (~1 hr/wk) |
| Marketing | ~2 | Token Price Watch newsletter send, funnel review (§7), one distribution action (a post, a reply, an outreach email) |

This is a ceiling, not a target. Launch weeks and edition-ship weeks will spike above it; the steady state must return to it within two weeks of any spike or something gets cut per the drop order below.

### 1.2 The monthly operating calendar

| When | Task | Hours | Output |
|---|---|---|---|
| Day 1–2 | **Pricing refresh**: pull upstream, verify against provider pages, update `data/pricing.json`, publish changelog entry | 3–4 | Dataset release + changelog + site/calculators auto-updated (§2) |
| Day 2 | **Token Price Watch** newsletter (the changelog, narrated) | 1 | Kit broadcast — doubles as public freshness proof (D8) |
| Day 5–10 | Trend briefing #1 (450–600 words, sourced) | 2–3 | New premium briefing; previous month's brief rotates behind the paywall per D5 |
| Day 15–20 | Trend briefing #2 (optional — this is the first flex item) | 2–3 | Same |
| Day 20 | **Platform export**: full customer/order CSV from Polar (and Gumroad if active) archived off-platform; reconcile against Kit list | 0.5 | Migration insurance (§6) |
| Day 25 | Ops review: refund rate, activation-cap flags, funnel dashboard, risk-register early-warning signals (§8) | 1 | Go/no-go on next month's flex items |
| Continuous | Support inbox at defined response times (§3) | ~2/wk | — |

### 1.3 Every promise, priced in hours

No promise ships without a line in this table. If a proposed feature can't state its recurring cost, it doesn't ship (this table is also why the video tier is deferred in [01-product-and-packaging.md](01-product-and-packaging.md)).

| Product promise | Recurring cost | Bounded by |
|---|---|---|
| "Pricing reviewed monthly; provider changes reflected within 7 days" | ≈3–4 hrs/month incl. verification + changelog | The SLA wording itself (§2) — "reviewed monthly," not "real-time" |
| "Every update to the 2026–27 edition" (D4) | ≈4–6 hrs/month of errata, additions, artifact rebuilds | **Edition-based, 12+ months** — never "lifetime." Next edition is a new purchase at ~50% off for owners |
| Monthly trend briefings | ≈2–3 hrs each, 1–2/month | Explicitly "1–2 per month," never "weekly" |
| 30-day money-back guarantee | ≈15 min/refund; MoR handles the money movement | Refund policy text (§4.1); Polar auto-revokes the key |
| License/activation support | Near-zero: Polar's [customer self-service portal](https://polar.sh/docs/api-reference/customer-portal/license-keys/activate) handles seat management | Activation caps enforced platform-side, not by you |
| Team-tier procurement support | ≈30–60 min/deal | Pre-built vendor-info pack (§3, ticket type 5) |
| Companion code repo | Issues triaged monthly, fixes best-effort | README states: "maintained on the edition cycle, not a support contract" |

### 1.4 Drop order under pressure (D10)

When life happens, cut in this order, publicly and without apology:

1. **Video tier work** (it isn't promised at launch — see [01-product-and-packaging.md](01-product-and-packaging.md))
2. **New benchmark runs** (existing benchmark reports stay; new runs pause)
3. **New playbooks** (edition scope shrinks; edition promise still met)
4. Second monthly trend briefing → one
5. Marketing hours

**Never drop:** the monthly pricing refresh + changelog (it is the paid product's core claim), and refunds/support (it is the reputation). If you cannot sustain those two, the correct move is to pause new sales — not to let the dataset go stale while still selling "living data." That is the exact failure mode the audit caught, and it would now be a paid-product failure instead of a free-site embarrassment.

---

## 2. The living pricing dataset pipeline

The critique (#15) called this out: two reports named the living dataset as the centerpiece premium feature, and neither defined where the data comes from. Here is the pipeline. It is also the structural fix for the audit's staleness findings — the audit counted **5+ contradictory pricing tables** (guide.md, `data.ts` presets, `hub.tsx` MODELS table, `token-pricing-reference.md`, trends/) each rotting on its own schedule. One source of truth cannot contradict itself.

**Single source of truth:** `data/pricing.json` in this repo (D6). Everything renders from it: the site's pricing tables, all six calculators' presets, any figure quoted in docs (via build-time injection, not hand-typed numbers), and the published premium dataset itself. The five legacy tables are deleted, not synchronized — see [01-product-and-packaging.md](01-product-and-packaging.md) for the content-repair workplan.

**Upstream:** [LiteLLM's community-maintained `model_prices_and_context_window.json`](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json) as the change-detection feed — it is updated within days of provider changes by a large community, which is exactly the early-warning layer a solo operator can't replicate. It is **not** trusted blind: every change that lands in `data/pricing.json` is manually verified against the provider's own pricing page, and the changelog cites the provider page, not LiteLLM.

**Monthly procedure (the day-1–2 calendar slot, ≈3–4 hrs):**
1. Diff current LiteLLM snapshot against last month's archived snapshot (scripted; ~10 min).
2. For each diff touching a tracked model: open the provider's pricing page, confirm the number, note the URL and date.
3. Update `data/pricing.json`; each entry carries `verified_date` and `source_url` fields.
4. Append changelog entries; commit; deploy (site, calculators, and dataset update atomically).
5. Send Token Price Watch (§1.2).

**Changelog format** (published publicly — it is the freshness proof even for non-buyers, per D5/D8):

```
2026-07-02 · Anthropic · Opus 4.5 input $5.00 → $4.50 /MTok · https://www.anthropic.com/pricing
2026-07-02 · OpenAI · GPT-5 cached-input discount 90% → 87.5% · https://openai.com/api/pricing
2026-07-02 · No change: Google, Mistral, DeepSeek, Cohere (verified)
```

The "No change: … (verified)" line matters: it distinguishes "reviewed and stable" from "not looked at," which is precisely the distinction the old "Last reviewed: June 2026" label failed to make.

**Published SLA (print this on the product page and in the dataset README):**

> *Reviewed monthly. Provider pricing changes reflected within 7 days of the provider's announcement. Every figure carries a verification date and a source link.*

Two intentional properties: "reviewed monthly" is achievable solo forever, and "within 7 days" covers off-cycle major changes (a GPT-price cut mid-month gets a hotfix release, ~1 hr) without promising real-time monitoring. Out-of-scope models and enterprise/negotiated pricing are explicitly excluded in the README so the SLA has edges.

---

## 3. Support operations

Support is designed to round to zero. Polar as merchant of record (see [02-pricing-and-platforms.md](02-pricing-and-platforms.md)) absorbs the two historically worst categories — tax/invoices and payment disputes — and its [self-service customer portal](https://polar.sh/docs/api-reference/customer-portal/license-keys/activate) absorbs activation management. What remains:

| # | Ticket type | Expected volume | Handling | Response target |
|---|---|---|---|---|
| 1 | Activation cap reached / device resets | Near-zero reaching you — buyers deactivate old devices in Polar's portal themselves | Canned reply: link to portal, one-paragraph walkthrough. Escalation: manual deactivate via Polar API | 2 business days |
| 2 | Lost license key | Low | Canned reply: Polar order-lookup link (key is on the receipt + portal). Never re-issue by email without an order match | 2 business days |
| 3 | Invoice / VAT receipt requests | Near-zero reaching you — MoR checkout issues compliant invoices | Canned reply: where to find the invoice in the Polar receipt/portal; MoR explanation sentence for finance teams | 2 business days |
| 4 | Refund requests | Target <5% of sales (early-warning threshold in §8) | Grant within policy without argument (30-day, §4.1). Process in Polar → key auto-revokes → denylist propagates per [03-licensing-architecture.md](03-licensing-architecture.md). Ask (optionally answered): "what was missing?" | 1 business day |
| 5 | Corporate procurement (POs, W-9, vendor forms, security questionnaires) | Rare but high-value (Team tier) | Pre-built vendor pack: W-9, company info sheet, the license text (§4.2), the expense-request template from [01-product-and-packaging.md](01-product-and-packaging.md). Politely decline 40-page security questionnaires below ~$2k deal size | 3 business days |

**Published support policy:** email-only (`support@` on the domain), response within 2 business days (1 for refunds), no live chat, no phone. Stated plainly on the site — solo-operator honesty is a trust signal for this audience, not a weakness.

**Canned responses** live as five markdown files in a private `ops/` directory, written once in launch week. Every novel ticket that recurs twice gets promoted to a canned response or a public FAQ entry — the support FAQ is a ratchet that keeps the ~4 hrs/week bucket flat as sales grow.

---

## 4. Legal package

> **Status: all text in this section is a working draft for professional review.** A 1–2 hour review by a lawyer (digital-goods/licensing familiarity) is a **launch-week purchase, budgeted in [06-roadmap-90-days.md](06-roadmap-90-days.md) — not a blocker to drafting or building.** Resolves critique #9 and #10.

### 4.1 Terms of sale (outline)

1. **Seller / merchant of record.** Purchases are processed by Polar.sh (or Gumroad, on that storefront) as merchant of record; they handle payment, sales tax/VAT, and invoicing.
2. **What you buy.** A license (per §4.2) to the edition purchased — digital content, delivered by download and license-gated web access. No physical goods except KDP paperback (sold under Amazon's terms, separately).
3. **Updates.** Edition-based (D4): every update to the 2026–27 edition for at least 12 months from purchase, plus monthly pricing-dataset refreshes during that window. Next-edition upgrades offered to owners at ~50% off. **No perpetual/lifetime update promise is made anywhere.**
4. **Refunds.** 30-day money-back guarantee, no questions required. Refund revokes the license key and web access. EU/UK consumers: see §4.5.
5. **License enforcement.** Keys have activation limits; the seller may revoke keys obtained fraudulently, charged back, or used in breach of the license.
6. **Disclaimers.** Content provided "as is"; results disclaimer per §4.3; liability capped at the purchase price.
7. **Changes.** Terms may change for future purchases; the terms at your time of purchase govern your license.

### 4.2 Content license — full draft text (~400 words)

> **DRAFT — REQUIRES PROFESSIONAL REVIEW BEFORE PUBLICATION**
>
> **TokenOps Pro Content License (2026–27 Edition)**
>
> This license governs your use of the TokenOps Pro materials: the TokenOps Handbook (all formats), the Operator Toolkit (spreadsheets, decks, document templates), the companion code repository, the pricing dataset, trend briefings, and license-gated web content (together, "the Materials").
>
> **1. Grant.** Subject to payment, you are granted a perpetual, non-exclusive, non-transferable license to use the Materials. An Individual license covers one named person. A Team license covers up to ten (10) named individuals within one organization; seats may be reassigned when a person leaves the organization, but not shared serially to exceed ten concurrent users.
>
> **2. What you may do.**
> (a) Use the Materials for your own learning and your organization's internal business purposes.
> (b) Modify, adapt, and extend the templates, spreadsheets, and code for internal use.
> (c) Incorporate adapted templates, worksheets, and code into deliverables you produce for your clients, provided the Materials themselves are not the deliverable (you may ship a cost model built from the spreadsheet; you may not ship the Handbook).
> (d) Quote brief excerpts with attribution in presentations, reviews, or internal documentation.
>
> **3. What you may not do.**
> (a) Redistribute, resell, sublicense, rent, or publicly post the Materials or substantial portions of them, in any format, whether or not modified, whether or not for payment.
> (b) Share license keys or account access outside the licensed individual(s).
> (c) Use the Materials, in whole or in part, to train, fine-tune, or evaluate machine-learning models, or include them in any dataset distributed for such purposes.
> (d) Remove watermarks, license notices, or attribution from the Materials.
> (e) Circumvent access controls or activation limits.
>
> **4. Updates.** This license includes every update published to the 2026–27 edition for at least twelve (12) months from purchase, and monthly pricing-dataset refreshes during that period. Future editions are separate products; owners receive discounted upgrade pricing.
>
> **5. Termination.** This license terminates automatically on refund or chargeback, and may be terminated for material breach of Section 3. On termination, access to gated content and downloads ends; internal copies already incorporated into your work under Section 2 need not be destroyed.
>
> **6. Ownership.** The Materials are copyrighted work. All rights not expressly granted are reserved.
>
> Files are individually watermarked with purchaser details. Questions and edge cases: support@tokenops.kalilurrahman.com — asking first is always free.

### 4.3 Results disclaimer (verbatim, wherever savings percentages appear in marketing or content — D9)

> *Savings figures describe results achievable with these techniques under the stated assumptions; they are illustrative, not a promise. Your results depend on your workload, providers, and implementation. Worked examples labeled "illustrative scenario" are constructed for teaching, not measured from a named production system.*

This directly answers the audit's finding of invented numbers styled as data and the critique's warning (#10) that "teams routinely cut 30–60%" repeats the unverifiable-claim pattern. Rule: any percentage in marketing copy links to the technique that produces it, and the disclaimer rides along.

### 4.4 Privacy policy scope (GDPR)

One page covering the three personal-data surfaces, with lawful bases:

| Surface | Data | Basis | Notes |
|---|---|---|---|
| Kit (ConvertKit) email list | Email, tags, opens | Consent (double opt-in for lead magnets/newsletter); legitimate interest/contract for buyer onboarding emails | Unsubscribe honored immediately; buyer-list sync from Polar disclosed (§6) |
| License session cookie | Signed HttpOnly cookie: license-key hash + purchaser email (for watermarking), 30-day expiry | Contract performance (delivering purchased access) | Strictly necessary — no consent banner needed; disclosed in the policy per [03-licensing-architecture.md](03-licensing-architecture.md) |
| [Plausible](https://plausible.io) analytics | Aggregate, cookieless, no personal data | Legitimate interest | The reason no consent banner exists site-wide (critique #13) |

Plus: Polar/Gumroad as processors-slash-controllers for purchase data, retention (list pruned of 12-month-inactive non-buyers), and a contact address for data requests.

### 4.5 EU/UK 14-day withdrawal

Digital-content purchases carry a 14-day withdrawal right unless the consumer expressly consents to immediate delivery and acknowledges losing the withdrawal right. **As merchant of record, Polar operates this consent-on-delivery flow in its checkout — you do not build it** (the same applies on Gumroad, MoR since [January 2025](https://gumroad.gumroad.com/p/gumroad-is-becoming-a-merchant-of-record-more-updates)). Your 30-day guarantee is strictly more generous than the statutory right, which keeps the policy simple: in practice you grant every in-window refund request regardless of jurisdiction, and the MoR handles the mechanics. Verify the consent checkbox is enabled on the Polar checkout during launch-week testing.

---

## 5. Piracy stance

**Posture: accept, watermark, out-fresh.** (Resolves critique #5.)

**The existing library is already leaked — treat it as such.** The 46-document library sat in `public/` world-readable, was shipped in full inside the client JS bundle (`documents.json`, 663 KiB), is archived on archive.org, and lives in cached bundles and AI-crawler corpora invited in by `llms.txt` ("the open reference"). Retroactively walling it protects nothing — which is exactly why the locked free/premium split (D5) puts the paid value in **corrected, unified, NEW material plus the freshness stream**, not behind-the-wall copies of what's already out.

**The moat is structural, not technical.** A pirated copy of the Handbook is, by construction, a stale copy: no monthly pricing refreshes, no edition updates, no scenario-saving calculators, no dataset. The product's core promise — "always the current edition, always current prices" — is the one thing a torrent cannot replicate. Every download is additionally per-buyer watermarked at download time (`pdf-lib` footer on every page + XMP metadata, e.g. `Licensed to jane@example.com · Order #4821 · tokenops.kalilurrahman.com` — details in [03-licensing-architecture.md](03-licensing-architecture.md)), which converts "forward the file" into "forward the file with your name and order number on every page." Watermarking deters the casual 90% of sharing; the moat handles the rest.

**Lightweight DMCA routine (≤30 min/month, inside the ops bucket):**
- Monthly 10-minute search: `"TokenOps Handbook" filetype:pdf`, the product name on the usual Gumroad-rip aggregator sites, and any watermark string that surfaces.
- One saved takedown template (identify the work, the infringing URL, good-faith statement, signature). Send to: the host's designated DMCA agent (per their site/whois), and Google's search removal form for de-indexing. Rip-aggregators comply mechanically with well-formed notices; this is form-filling, not litigation.
- If a watermark identifies the leaker: one polite email noting the license terms. Nothing further.

**What you will NOT do:** DRM or encrypted EPUBs (hostile to buyers, trivially stripped), copy/paste or right-click blocking (breaks accessibility, stops no one), browser fingerprinting (GDPR-fraught; the cookie is already the device binding), lawsuits, or chasing individual sharers. Per the gating research: price fairly, watermark, and accept residual leakage as marketing.

---

## 6. Platform-dependency hedges

(Resolves critique #17.) Polar is the right primary — and a young one (v1.0 September 2024, [repriced once already in May 2026](https://polar.sh/blog/introducing-polar-plans)). The hedges:

1. **Own the buyer list — continuously.** Every Polar sale flows into Kit (webhook or Zapier bridge) with a `buyer` tag and product tag; Gumroad buyers likewise (D11). Verified weekly in the ops check, reconciled monthly (§1.2). If a platform freezes, sunsets, or repricies you off it, the buyer relationship survives because it lives in your ESP, not their dashboard. This is the single most important hedge in this document.
2. **Monthly platform-data export.** Full customer/order CSV from Polar (and Gumroad) archived off-platform on the day-20 calendar slot. Recovery time from a platform loss: one import, not a support-ticket archaeology project.
3. **`LicenseService` is the migration valve.** All platform contact goes through one interface with Polar and Gumroad adapters (D2, detailed in [03-licensing-architecture.md](03-licensing-architecture.md)). The integration surface is deliberately small — validate/activate/deactivate plus webhooks — so a migration to the named fallbacks (Stripe Managed Payments + [Keygen](https://keygen.sh/), or Paddle + Keygen) is an adapter, not a rewrite. Buyers would re-enter a key once; the denylist and session layer don't change.
4. **Polar-youth mitigations.** Polar is [Apache-2.0 open source and self-hostable](https://docs.polar.sh/developers/open-source) with a [$10M Accel-led seed](https://polar.sh/blog/polar-seed-announcement) — a shutdown is survivable and a repricing is switchable, precisely because of hedges 1–3. Budget fees at the current [Starter 5% + $0.50, with payout fees of $2/payout month + 0.25% + $0.25](https://polar.sh/docs/merchant-of-record/fees), and treat any further repricing as an early-warning signal (§8), not a crisis.
5. **The Gumroad payout-minimum ambiguity — verify before relying on it.** Sources conflict: [$10 minimum](https://insightraider.com/en/answers/when-does-gumroad-pay-out) vs [reports of a $100 threshold since March 2026](https://blog.scriptbuybd.com/product/gumroad-payout-threshold-10-vs-100) ($10 for verified sellers). Check the actual number in your Gumroad dashboard before launch, and regardless: **never plan cash flow around Gumroad payouts.** It is a secondary storefront whose ~13.5% effective direct fee and 30% Discover fee are [customer-acquisition cost](https://gumroad.com/help/article/66-gumroads-fees), per D2 — Polar is the revenue home.

---

## 7. Analytics & attribution

(D11; resolves critique #13 — the repo currently has zero analytics, so no launch hypothesis is currently testable.)

**Setup:** [Plausible](https://plausible.io) site-wide — cookieless, no consent banner (§4.4), one script tag. Goals configured for the four funnel events plus email signups:

| Event | Fired when |
|---|---|
| `teaser_view` | A gated doc's teaser renders for an unlicensed visitor |
| `unlock_cta` | Click on any Unlock/Buy CTA (with source-page prop) |
| `checkout` | Redirect out to Polar/Gumroad checkout (platform confirms the sale) |
| `activation` | License key successfully activated on `/unlock` |

**UTM discipline:** every link you control carries `utm_source/utm_medium/utm_campaign` from a small documented convention (`source`: kit, hn, ph, x, linkedin, kdp; `campaign`: presale, launch, pricewatch-YYYY-MM). The KDP back-of-book CTA uses a dedicated short URL + discount code so the funnel from the $9.99 Kindle edition into Pro is directly measurable (see [04-marketing-and-launch.md](04-marketing-and-launch.md)).

**Weekly ritual (≈30 min, inside the marketing bucket):** one pass over funnel conversion by step and by source, email list growth, and top teaser pages. Written down as four numbers in a running log — trend beats snapshot.

**Which decisions each metric gates:**

| Metric | Threshold | Decision it gates |
|---|---|---|
| teaser_view → unlock_cta | <3% after 4 weeks | Teaser length/CTA copy rework before any price change |
| unlock_cta → checkout | <25% | Pricing-page problem: ladder presentation, guarantee visibility |
| checkout → activation | <85% | Delivery/onboarding bug — treat as a support incident, fix that week |
| List growth | <plan in [04-marketing-and-launch.md](04-marketing-and-launch.md) | Delay presale until runway targets hit (list-first is the strategy, D8) |
| Refund rate | >5% | Stop marketing spend; content-quality investigation (§8) |
| KDP-code redemptions | ongoing | Whether the KDP funnel earns continued effort |

Search Console is the sixth instrument: watch impressions/clicks on pages converted to teasers (301s from old raw `.md` URLs per D7) to quantify the SEO transition cost flagged in critique #4.

---

## 8. Risk register

| # | Risk | Likelihood | Impact | Mitigation | Early-warning signal |
|---|---|---|---|---|---|
| 1 | **Content staleness recurs** in the paid product — the audit's failure, now with refunds | Medium | High | §2 pipeline; never-drop rule (§1.4); SLA scoped to what's sustainable; sell-pause rule | A month with no changelog entry; a support email citing a wrong price |
| 2 | **Polar failure/repricing/freeze** | Low–Med | High | §6: owned buyer list, monthly exports, `LicenseService` adapters, named fallbacks (Stripe Managed Payments + Keygen; Paddle + Keygen) | Fee-change announcement; payout latency; support degradation |
| 3 | **SEO traffic loss** from paywalling indexed pages | Medium | Medium | D5 keeps the whole Optimize hub + guide.md free; honest 15–20% teasers + `isAccessibleForFree:false` JSON-LD; 301s from raw `.md` URLs; Search Console watch (§7) | >30% organic-click drop on converted pages within 8 weeks |
| 4 | **Launch flop** (list too small, offer unproven) | Medium | High | 8–10 week list runway *before* presale (D8); presale to the list first at ~33% off validates before full build-out ([04-marketing-and-launch.md](04-marketing-and-launch.md)) | List growth below plan at week 6; presale conversion <2% of list |
| 5 | **Solo burnout / life event** | Medium | High | The ≤10 hr budget itself; drop order (§1.4); edition-based promises that can be honored and then *ended* cleanly; sell-pause option | Two consecutive months over budget; calendar slots slipping >1 week |
| 6 | **Provider-pricing chaos** (rapid repricing waves invalidating content) | Medium | Medium | Single source of truth means one fix propagates everywhere (§2); hotfix path within the 7-day SLA; chaos is *good* for a freshness-based product — each wave is a Token Price Watch issue that proves the value | Two+ major provider changes in one month (also: a marketing opportunity) |
| 7 | **Refund spike** (quality gap at a tier) | Low–Med | Medium | Launch-blocking quality bar (D6) before any sale; disclaimer discipline (§4.3); refund exit-question | Refund rate >5% in any 30-day window |
| 8 | **Key-sharing at scale** (Team key or leaked Individual key circulating) | Low–Med | Low–Med | Polar-enforced activation limits; watermarked downloads; denylist; per-key download logging with manual review flag | One key active from an anomalous device/IP spread |
| 9 | **Lovable deploy pipeline doesn't pass wrangler bindings** — silently breaks KV/R2 gating | Medium (unverified) | High (blocks the whole in-site architecture) | **Week-1 spike, per D7 and critique #16:** confirm bindings pass through, else move deploys to plain `wrangler deploy` in CI *before* building on the bindings | The spike itself — do not write gating code before it passes |
| 10 | **Competitor entry** into the empty $79–349 middle (market research: window measured in quarters) | Medium | Medium | Ship inside the 90-day plan ([06-roadmap-90-days.md](06-roadmap-90-days.md)); moats a fast-follower can't copy quickly: the maintained dataset + changelog history, list, brand hooks (caveman), KDP shelf presence | A credible "LLM cost handbook" launch on HN/PH; the $67 Gumroad incumbent shipping a template ecosystem |

**Review cadence:** the risk register's early-warning column is scanned in the day-25 monthly ops review (§1.2). Any tripped signal gets a one-line dated note and a decision — act, watch, or accept — in the ops log. That's the whole process; anything heavier would violate §1.
