# 01 — Product & Packaging: from content hub to book-quality product line

**What this document decides.** This is the product definition for the TokenOps commercial line: what stays free on TokenOps Atlas, what becomes TokenOps Pro, exactly which assets sit on each side of the paywall, the full table of contents for *The TokenOps Handbook, 2026 Edition*, the specifications for every new paid artifact (spreadsheet model, exec deck, fillable templates, companion code repo, benchmark program, living pricing dataset), the editorial quality bar the paid line must clear, and the itemized content-upgrade workplan that is the critical path for the schedule in 06-roadmap-90-days.md. Pricing and platform economics are argued in 02-pricing-and-platforms.md; the gating implementation in 03-licensing-architecture.md; launch sequencing in 04-marketing-and-launch.md.

---

## 1. The honest starting point

You have ~90,000+ words of published content (a 74,205-word markdown library of 46 documents, an 11-file starter-template pack of 12,319 words, a 6,602-word master guide, and 4,476 words of Optimize-hub content), 22 interactive routes, and six working calculators. The audit's verdict, compressed: **roughly 25–30% of the corpus is genuinely differentiated and can anchor a paid product after a fact/pricing/math pass; the remaining ~70% is competent commodity material that works as free marketing surface but is not sellable as-is.** The corpus today justifies perhaps $19–29 as a template bundle. The $149 Pro tier is earned by the upgrade work in this document, not by the archive.

**What is genuinely worth money today:**

- **The Optimize hub** (`src/data/tokenopsContent.ts`) — the best writing in the repo: current (Claude's 5-minute cache TTL, +25%/+100% cache-write surcharges, batch-stacking to ~75%), opinionated, and tool-specific. The per-tool credit guides (Cursor, Lovable, Copilot, Claude Code) are content almost nobody else has written.
- **The Caveman compression method** — a memorable, brandable hook. Keep it free and loud; it is the viral asset.
- **The `trends/` pack** (17 briefings) — fresh 2026 material (GPT-5 $1.25/$10, Opus 4.5 $5/$25, DeepSeek V3.2, Gemini 3) with real editorial ideas ("cached input is the new base rate," "anti-benchmarks"). Each is only ~450 words — teasers today, chapter seeds tomorrow.
- **`advanced/cost-anomaly-detection.md`** — real engineering (z-score/EMA/composite scoring with code, a 10-row root-cause table with MTTR estimates, alert YAML). The closest thing to a paid-quality chapter that exists.
- **The vendor negotiation kit** (negotiation checklist + evaluation scorecard + provider matrix) — artifacts a platform lead would actually print.
- **The 6 calculators** — the audit verified the formulas in `src/tokenops/data.ts` are genuine, correct arithmetic. With fresh pricing presets plus scenario save/compare/export they are a legitimate premium feature.

**What fails the book bar — with file-level evidence:**

- **`guide.md` is the weakest major asset and would trigger refunds if sold.** Its header says "May 2026" but its pricing universe is mid-2024 (GPT-4o $5/$15, Claude 3.5 Sonnet as current, GPT-4 Turbo as "frontier"), directly contradicting `trends/2026-pricing-landscape.md` in the same product. Documented arithmetic errors: §3.1 states "$15,000 / 10B = $0.0015 per token" (actually $0.0000015 — the doc silently means per-1K); Case Study 1's stated volumes (100,000 daily calls × 5,000 tokens) imply ~15B tokens/month while the text claims 500M at $750; the forecast formula `$0.0015 × (1 − 0.10^(6/12))` evaluates to ~$0.001026, not the $0.00141 shown; the tokenization example presents invented token IDs as fact.
- **Zero primary data anywhere.** Case studies are disclosed composites, but downstream tables carry false precision ($5,040/mo, 96.2% accuracy, 6.3-month payback), and `roi-justification-template.md` hardcodes "$285,000 investment / $540,000 savings / 89% ROI" as if measured. The CFO/FinOps persona will not tolerate this; it is why the fact pass is launch-blocking.
- **Staleness infects four surfaces at once**: `guide.md`, the `data.ts` calculator presets, the `hub.tsx` MODELS table, and `templates/token-pricing-reference.md` — 5+ mutually contradictory pricing tables in one product.
- **Three voices, three glossaries.** Formal consultant (guide), punchy analyst (trends), fill-in-the-blank workbook (templates); glossaries in `hub.tsx`, `tokenopsContent.ts`, and `guides/tokenops-glossary.md`; two model-selection matrices; two savings calculators (`/hub` vs `/calculator`).
- **Hygiene defects**: `public/library/INTEGRATION.md` ships internal build instructions publicly; the site claims "29 guides" (`library.tsx`, `llms.txt`) against an actual 46 documents; `/dashboard` renders 100% hardcoded illustrative data without a label; the entire 663 KiB `documents.json` corpus ships inside the client JS bundle to every visitor.

That last point drives the whole packaging posture, next.

## 2. Product line architecture

Per the locked brand architecture: **TokenOps Atlas** is and remains the free open reference — it gets *better* (corrected, deduplicated), never smaller in spirit. The paid line is **TokenOps Pro — the operator's edition**, whose flagship is ***The TokenOps Handbook, 2026 Edition***.

**Why "new value, not retroactive walls" is forced, not chosen.** Every current library file is world-readable at a stable URL, the full text of all 46 documents is compiled into the client JS bundle (663 KiB) shipped to every visitor, and the site is indexed, sitemapped, and advertised to AI crawlers via `llms.txt` as "the open reference." The material is in web archives. Treat the existing library as leaked: paywalling it protects nearly nothing and reads as a bait-and-switch against your own published positioning. The paid product's value is therefore (a) corrected, unified, book-quality *versions* of the best material, (b) genuinely *new* artifacts (benchmarks, spreadsheet model, code repo, exec deck), and (c) the *freshness stream* (monthly pricing dataset + trend briefings + edition updates) that a static rip can never replicate. Watermarked downloads plus "always current" is the anti-piracy moat; the paywall is just the checkout.

**The ladder** (full pricing rationale and comps in 02-pricing-and-platforms.md; presale ≈33% off during the launch window only):

| Product | Price | What it IS | Primary persona |
|---|---|---|---|
| Kindle/paperback condensed edition (Amazon KDP) | $9.99 ebook / ~$24.95 paperback | Narrative handbook only — no toolkit, no updates, no calculators. Credibility floor + funnel; back-of-book CTA with a discount code into Pro. | Browsers, gift-buyers, "saw it on Amazon" credibility check |
| The Handbook (PDF/EPUB, per-buyer watermarked) | $59 (presale $39) | The full 2026 Edition book, delivered stamped from your infrastructure. | AI engineer who just wants the book |
| **TokenOps Pro — the default tier** | **$149 (presale $99)** | Handbook + Operator Toolkit (.xlsx cost model, .pptx exec deck, .docx fillable templates, companion code repo) + license-gated web access + the 5 advanced calculators with scenario save/export + full trends archive + living pricing dataset + every 2026–27 edition update. | Eng manager / senior IC who expenses it |
| Team edition | $599 (presale $449) | Everything in Pro × 10 seats via one Polar key with 10 activations, + internal workshop deck + expense-request template + proper invoices. | Platform lead buying for the team; CFO/FinOps rides along |
| "Complete" tier with video walkthroughs | $249–299, **later, only if video proves feasible** | Not at launch. Priced here only as a roadmap anchor. | — |

**Persona fit** (willingness-to-pay bands from the audit): the **AI engineer** ($30–80) buys for the advanced pack, calculators, and a code repo that actually runs — today's offering is thin for them (one YAML config is the only runnable artifact), which is what the companion repo fixes. The **eng manager** ($50–150) buys playbooks, checklists, maturity model, RACI, QBR — the closest-to-sellable segment today after a formatting upgrade; they are the Pro default buyer. The **platform lead** ($150–300 team budget) is the strongest current fit — the ops pack, negotiation kit, and gateway architecture map directly onto their job; they buy Team. The **CFO/FinOps persona** will not buy standalone; the ROI template, exec deck, and benchmarks ride along in Team — and this persona is precisely why no invented number may ever again be presented as measured data. The updates promise is edition-based, never "lifetime": *every update to the 2026–27 edition (12+ months) + monthly pricing-dataset refreshes; owners get ~50% off the next edition* (sustainability math in 05-operations-legal-sustainability.md).

## 3. The canonical free↔premium asset map

This table is the single source of truth; it supersedes the split proposals in earlier internal analyses. Old raw `.md` URLs for premium items 301 to teaser routes (15–20% server-rendered teasers with `isAccessibleForFree:false` markup — mechanics in 03-licensing-architecture.md).

| Asset | Today | Disposition | Treatment |
|---|---|---|---|
| Landing, `/about`, `/roadmap`, `/toolkit`, `/resources`, `/templates`, `/sources` | Free routes | **FREE** | Light copy refresh; add Pro cross-sell modules |
| `/patterns` | Free route | **FREE** | Keep |
| `/glossary` | 1 of 3 glossaries | **FREE** | Becomes the ONE canonical glossary; merge `hub.tsx` inline + `guides/tokenops-glossary.md` into it |
| `/optimize`, `/techniques`, `/tool-guides`, `/caveman`, `/prompt-templates` | Free routes | **FREE** | The viral hooks; keep prominent, keep current |
| `/guide` (guide.md) | Free, broken | **FREE — corrected** | Full fact/math pass; the credibility magnet. Its compiled PDF ancestor `TokenOps_Guide.pdf` is retired and replaced with a teaser edition |
| `/calculator` — blended savings calculator | Free | **FREE** | Headline calculator; repoint presets at `data/pricing.json` |
| Calculators: RAG, routing, caching ROI, budget burn, TCO | Free | **PREMIUM** | Add scenario save/compare/CSV export; license-gated |
| `/dashboard` | Unlabeled mock | **FREE** | Relabel "sample data demo" explicitly |
| `/hub` | Mega-page, duplicative, stale | **CONSOLIDATE** | Kill duplicate calculator + stale MODELS table; fold unique pieces into `/calculator` and `/glossary`; redirect |
| `/library` index | Free | **FREE** | All 46 cards visible; premium cards locked with unlock CTA; fix "29 guides" → 46 |
| `/read/$` reader | Serves full text from client bundle | **SPLIT** | Free docs stay client-side; premium docs server-rendered as 15–20% teasers, full text behind license |
| `library/trends/` (17 briefings) | Free | **HYBRID** | The 2 newest briefings free for their first 30 days each, then archived behind the paywall; full archive + new monthly briefings = premium |
| `library/advanced/` (5 docs incl. cost-anomaly-detection, gateway architecture, routing YAML) | Free (leaked) | **PREMIUM** | Corrected/expanded premium versions; teaser routes for old URLs |
| `library/playbooks/` (4) | Free (leaked) | **PREMIUM** | Same |
| `library/templates/` — operating templates (incident runbook, QBR, SLA/SLO, roi-justification, vendor scorecard) | Free (leaked) | **PREMIUM** | Corrected; ROI template's invented figures replaced with labeled worked examples; .docx versions in Toolkit |
| `library/checklists/` (4, incl. vendor-contract-negotiation) | Free (leaked) | **PREMIUM** | Negotiation checklist anchors the vendor kit |
| `library/guides/` — FAQ, maturity model, RACI matrix | Free | **FREE** | Commodity-tier funnel content; also condensed into Handbook Part IV |
| `library/guides/case-studies-detailed.md` | Fictional composites | **RETIRE** | Superseded by the new evidence chapter (Part VI); do not sell fiction |
| `library/guides/tokenops-glossary.md` | 1 of 3 glossaries | **MERGE** | Into `/glossary` |
| `library/references/` — metrics-reference, kpi-dashboard-spec, tool-landscape | Free | **FREE** | Fact-passed; feed Handbook Part II |
| `library/references/provider-comparison-matrix.md` | Stale pricing table | **RETIRE** | Superseded by the living pricing dataset (premium) + a free auto-generated summary table |
| `library/INTEGRATION.md` | Internal doc shipped publicly | **DELETE** | Immediately |
| Starter templates: `request-tagging-schema.yaml`, `monthly-cost-review.md`, `prompt-optimization-checklist.md` | Free downloads | **FREE, email-gated** | The 3 lead magnets (Kit capture, see 04-marketing-and-launch.md) |
| Starter templates: `budget-guardrails.yaml`, `supabase-schema.sql` | Free | **PREMIUM** | Move into the companion code repo as runnable config |
| Starter templates: `implementation-playbook.md`, ADR, `instrumentation-checklist.md`, `model-selection-matrix.md` | Free | **PREMIUM** | Absorbed into Handbook chapters + .docx/.xlsx Toolkit artifacts |
| `token-pricing-reference.md` | Stale | **RETIRE** | Superseded by `data/pricing.json` |
| **NEW** — *The TokenOps Handbook, 2026 Edition* (PDF/EPUB) | — | **PREMIUM** ($59 alone; in Pro) | §4 below |
| **NEW** — .xlsx interactive cost model | — | **PREMIUM** (Pro) | §6 |
| **NEW** — .pptx executive briefing deck | — | **PREMIUM** (Pro) | §6 |
| **NEW** — .docx fillable operating templates | — | **PREMIUM** (Pro) | §6 |
| **NEW** — companion code repo | — | **PREMIUM** (Pro) | §6 |
| **NEW** — benchmark reports | — | **PREMIUM** (Pro); free summary chart as marketing | §6 |
| **NEW** — living pricing dataset (`data/pricing.json` + public changelog) | — | **PREMIUM** dataset; **FREE** changelog + "Token Price Watch" newsletter | §6 |
| **NEW** — workshop deck + expense-request template | — | **TEAM only** | §6 |
| **NEW** — free sample chapter ("The Prompt Caching Chapter") | — | **FREE, email-gated** | Book-final quality; the taste test |
| **NEW** — KDP condensed edition | — | **PAID, off-site** ($9.99/$24.95) | Funnel; no toolkit/updates |

## 4. The TokenOps Handbook, 2026 Edition — table of contents

Target: **55–70k finished words** (~63k budgeted below). The book reorganizes the corpus into one narrative arc — *understand → measure → optimize → operate → buy → prove* — in one voice. "Merge" means multiple sources fuse into one chapter; "fact-pass" means content survives with corrections; "rewrite" means the skeleton survives, the prose doesn't; "NEW" means written from scratch. Every trends briefing (~450 words each) is a seed, not a chapter — expansion is real writing work.

**Part I — The Token Economy** (~8k words)

| # | Chapter | Source | Work |
|---|---|---|---|
| 1 | Why your token bill is now a P&L line | guide.md Part 1 + new framing | Rewrite |
| 2 | How tokens are priced: the 2026 landscape | trends/2026-pricing-landscape + pricing dataset | Rewrite + expand; every figure from `data/pricing.json`; the unsourced "~30% more tokens" tokenizer claim is cut or sourced |
| 3 | Unit economics: cost per request, conversation, outcome | guide.md §3 + hub unit-econ material | Rewrite — this chapter contains the documented arithmetic errors; every formula re-derived and machine-checked |

**Part II — Measure** (~9k words)

| # | Chapter | Source | Work |
|---|---|---|---|
| 4 | Instrumentation and tagging | instrumentation-checklist + request-tagging-schema.yaml | Merge + expand |
| 5 | Metrics, KPIs, and anti-benchmarks | metrics-reference + kpi-dashboard-spec + trends/tokenops-kpis-benchmarks | Merge; keep the Level-4 maturity quiz and "numbers that lie" |
| 6 | Cost anomaly detection | advanced/cost-anomaly-detection | Fact-pass + light edit — the strongest existing chapter; code moves to companion repo |

**Part III — Optimize: the levers** (~21k words; the heart of the book)

| # | Chapter | Source | Work |
|---|---|---|---|
| 7 | Prompt and context engineering (featuring Caveman compression) | tokenopsContent techniques + caveman + trends/context-engineering | Merge; expand Caveman into a full method chapter with keep/drop rules |
| 8 | Prompt caching economics | trends/prompt-caching + tokenopsContent 3-provider caching comparison | Expand to book depth — **this is the free sample chapter**, so it must be finished first and best |
| 9 | Model selection and routing | model-selection-matrix + trends/model-arbitrage-playbook + multi-provider-routing-config.yaml + playbooks/migration-from-single-model | Merge — kills the duplicate matrices |
| 10 | Batch, semantic caching, and structured output | trends/batch-api-arbitrage + semantic-caching + structured-output-json-mode | Merge + expand |
| 11 | RAG cost optimization | playbooks/rag-cost-optimization + trends/embedding-and-vector-db-costs | Expand |
| 12 | Agents, loops, and reasoning-token governance | trends/agentic-cost-loop-tax + multi-agent-orchestration-cost + reasoning-token-governance | Merge + substantial new writing — thinnest sources, hottest topic |
| 13 | Fine-tuning and small models | trends/fine-tuning-economics + slm-production | Merge + expand |

**Part IV — Operate** (~10k words)

| # | Chapter | Source | Work |
|---|---|---|---|
| 14 | Gateway architecture | advanced/llm-gateway-architecture | Fact-pass |
| 15 | Budgets, guardrails, and multi-tenant billing | budget-guardrails.yaml + playbooks/multi-tenant-billing | Merge |
| 16 | Incident response and prompt-change governance | templates/incident-response-runbook + advanced/prompt-versioning-workflow | Merge + adapt from template voice to narrative |
| 17 | The operating cadence: maturity, RACI, QBR | maturity-model + team-raci-matrix + quarterly-business-review | Heavy condensation — commodity material earns ~2.5k words, not 9k |

**Part V — Buy** (~6k words)

| # | Chapter | Source | Work |
|---|---|---|---|
| 18 | Vendor evaluation and negotiation | vendor-contract-negotiation-checklist + vendor-evaluation-scorecard + provider matrix | Merge — genuinely differentiated; the printable kit stays as .docx artifacts |
| 19 | Making the business case | roi-justification + playbooks/executive-briefing | Rewrite — strip every invented figure; worked examples labeled illustrative, benchmark figures cited from Part VI |

**Part VI — Evidence** (~6k words, **entirely NEW** — the moat)

| # | Chapter | Source | Work |
|---|---|---|---|
| 20 | The TokenOps benchmarks | — | **NEW**: accuracy × cost across 6–8 models on 3 task classes, published methodology (§6) |
| 21 | Field notes: what real deployments show | — | **NEW**: 2–3 verifiable case studies — your own project telemetry at minimum, anonymized-but-attested external data if outreach lands. Replaces the retired fictional composites |

**Appendices** (~3k words): A. The canonical glossary (one, merged from three). B. Pricing snapshot + pointer to the living dataset and changelog. C. Tool landscape. D. Checklist index (full checklists live as Toolkit artifacts, not book padding).

The KDP condensed edition is Parts I–V at roughly 40% length, no appendix artifacts, closing with the Part VI summary chart and the Pro CTA + discount code.

## 5. Editorial standards: the "book quality" gate

Every chapter must pass all seven checks before it ships in anything a buyer pays for. This operationalizes the locked quality bar:

1. **One pricing source of truth.** Every price, rate, and surcharge renders from `data/pricing.json` (site, calculators, book build, docs). The 5+ contradictory pricing tables (guide.md, data.ts presets, hub.tsx MODELS, token-pricing-reference.md, provider-comparison-matrix.md) are deleted or regenerated from the dataset. Grep-level check: no hardcoded $/MTok figure outside the dataset and its build outputs.
2. **No invented numbers presented as measurement.** Every quantitative claim is one of: (a) sourced (link or dataset row), (b) computed (formula shown, machine-checked), or (c) **labeled illustrative** in-line — "illustrative scenario, not measured data" — following the correct disclosure pattern case-studies-detailed.md already used and its downstream tables violated. The $285k/$540k/89% ROI hardcodes and the 96.2%-style false precision go first.
3. **Arithmetic is machine-checked.** Every worked example in the manuscript lives in a small script (`scripts/check-math.ts`) that recomputes it in CI; the three documented guide.md errors are the founding test cases.
4. **Dated-review stamps that are true.** "Last reviewed" appears only on files actually reviewed on that date, set by the review workflow, never hand-typed. The current "May 2026" header over mid-2024 prices is the anti-pattern.
5. **One voice.** A one-page voice guide (direct, practitioner-first, opinionated, second person, no hedging filler, savings ranges only with stated conditions) applied in a dedicated pass. The tell to eliminate: jittering signature ranges ("30–60%," "40–70%," "20–50%") restated across documents.
6. **One glossary, one matrix, one calculator per job.** No concept defined in two places; hub.tsx duplicates die.
7. **Claims hygiene.** Unverifiable claims are cut or sourced; every marketing surface citing savings percentages carries the results-not-guaranteed disclaimer (wording in 05-operations-legal-sustainability.md).

## 6. New-asset specifications

**`.xlsx` interactive cost model** (Toolkit). One workbook, five tabs: (1) Inputs — traffic, token mix, cache-hit assumptions, model choices from a dropdown fed by a pricing sheet; (2) Pricing — pasted export of `data/pricing.json` with a version/date cell; (3) Scenarios — three side-by-side configurations with deltas; (4) TCO/ROI — the site's TCO calculator logic reimplemented in formulas (no macros, opens clean in Excel and Google Sheets); (5) Charts — monthly spend projection and savings bridge. This is the artifact a FinOps analyst can open in a budget meeting; fill-in-the-blank markdown underscores are not a premium deliverable.

**`.pptx` executive briefing deck** (Toolkit). 12–15 slides rebuilt from `playbooks/executive-briefing-template.md`: the problem in one chart, unit-economics framing, the six levers ranked by effort/impact, benchmark summary chart (from the program below), 90-day rollout plan, ask slide. Every number sourced or labeled illustrative; a one-slide "how to adapt this" note. The Team edition adds a longer internal **workshop deck** (~25 slides with exercises) plus the **expense-request template** (the tactic behind Pragmatic Engineer's [request-to-expense post](https://blog.pragmaticengineer.com/request-to-expense-the-pragmatic-engineer-newsletter/) and Lenny's ["I Can Expense It" tier](https://www.lennysnewsletter.com/p/productpass)).

**`.docx` fillable templates** (Toolkit). Eight conversions with real form fields, tables, and completion guidance: incident runbook, QBR, SLA/SLO definitions, ROI justification, vendor evaluation scorecard, vendor negotiation checklist, ADR, implementation playbook. Any example license/watermark text uses fictional identities only (jane@example.com).

**Companion code repo** (Toolkit; private GitHub, access granted on license activation). Contents, all runnable: a LiteLLM gateway configuration implementing the book's routing policy (grown from `multi-provider-routing-config.yaml`); the anomaly-detection service from Chapter 6 as a deployable job with the z-score/EMA/composite scoring and alert YAML; request-tagging middleware (the YAML schema as working Express/ASGI middleware); `budget-guardrails.yaml` and `supabase-schema.sql` wired into a docker-compose demo that ingests sample usage logs and renders the KPI dashboard spec; the benchmark harness (below); a README that gets a reader from clone to running gateway in under 15 minutes. The engineer persona pays for code that runs, not pseudocode — this is the repo's entire job.

**Benchmark program** (the moat; feeds Chapter 20 and quarterly premium reports). Methodology sketch: 3 task classes chosen to match the book's levers — structured extraction (JSON mode), RAG-grounded Q&A against a fixed corpus, and long-document summarization/classification — run across 6–8 models spanning the price spectrum in the trends pack (GPT-5-class, Claude Opus/Sonnet-class, Gemini 3, DeepSeek V3.2, one or two open-weight models). For each cell: task-accuracy score against a published rubric, empirically measured input/output token counts (not estimates), and cost per 1,000 tasks computed from measured tokens × dataset prices. Publish the harness config, prompts, and scoring rubric in the companion repo so results are reproducible; publish raw run manifests so they are auditable. Cadence: full run quarterly plus re-runs on major model releases; one free summary chart per run as marketing, full report premium. Budget ~$100–300 API spend per run. This is the asset the audit says nothing in the repo has and no competitor at the [$67 playbook tier](https://agentgenius.gumroad.com/l/ocxnk) can match.

**Living pricing dataset** (`data/pricing.json` + public changelog). Pipeline: upstream is LiteLLM's community-maintained model-prices JSON ([model_prices_and_context_window.json](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)); a monthly job pulls it, diffs against the current dataset, and opens a review; you manually verify every changed row against the provider's own pricing page before merging (upstream is an input, never blindly trusted). Each merge appends a changelog entry: `{date, provider, model, field, old, new, source_url}`. Consumers: the site's tables, all six calculators, the book build, the .xlsx pricing tab. The changelog renders publicly and is digested into the **Token Price Watch** newsletter (per 04-marketing-and-launch.md) — the public, verifiable proof that the freshness promise is real, which is exactly what the falsified "Last reviewed" stamps were pretending to be. SLA: refreshed monthly (by the 5th), best-effort fast-follow within a week on headline provider changes. Ongoing cost: ~2–3 h/month, inside the sustainability budget in 05-operations-legal-sustainability.md.

## 7. Content-upgrade workplan

This is the critical path 06-roadmap-90-days.md schedules. Estimates assume you, working solo, at editing throughput of ~1,500 existing words/hour and new writing at ~500 finished words/hour.

**Phase A — presale gate (launch-blocking for taking anyone's money):**

| # | Workstream | Hours |
|---|---|---|
| A1 | Pricing source of truth: build `data/pricing.json` + LiteLLM diff job + changelog; repoint calculators, site tables, docs; delete the 5+ contradictory tables | 12–16 |
| A2 | guide.md fact/math pass: fix the documented errors, reprice from the dataset, label illustrative material, add `check-math.ts` with the three errors as test cases; republish free | 10–14 |
| A3 | Corpus hygiene: delete INTEGRATION.md; fix "29 guides"→46 everywhere; label `/dashboard` as sample data; merge to one glossary; retire token-pricing-reference.md, provider-comparison-matrix.md, TokenOps_Guide.pdf (replace with teaser edition); consolidate `/hub` | 8–10 |
| A4 | Voice guide (1 page) + editorial checklist wired into the review workflow | 2–3 |
| A5 | Sample chapter — "The Prompt Caching Chapter" at final book quality (also the email lead magnet) | 10–12 |
| A6 | Final Handbook TOC + 2 more chapters at final quality (Ch. 6 fact-pass, Ch. 7 merge) so presale buyers receive real material on day one | 14–18 |
| | **Phase A subtotal** | **56–73** |

**Phase B — launch gate (full Pro delivery):**

| # | Workstream | Hours |
|---|---|---|
| B1 | Handbook manuscript: remaining ~16 chapters + appendices (merge/rewrite ~35k existing words ≈ 25 h; ~25k new/expanded words ≈ 50 h; structure + voice pass ≈ 12 h) | 80–95 |
| B2 | Book production: pandoc/Typst template, cover, EPUB, per-buyer watermark hook (build detail in 03-licensing-architecture.md) | 10–15 |
| B3 | .xlsx cost model | 12–18 |
| B4 | .pptx exec deck + Team workshop deck + expense template | 12–16 |
| B5 | .docx fillable templates (8) | 8–12 |
| B6 | Companion code repo v1 (gateway config, anomaly service, tagging middleware, compose demo) | 20–30 |
| B7 | Case-study chapter: own telemetry write-up + 2 external outreach attempts (external cooperation is the risk; fallback = own telemetry only, honestly framed) | 15–25 |
| | **Phase B subtotal** | **157–211** |

**Phase C — launch-window or first-edition-update (not blocking):** benchmark program v1 — harness + first full run + Chapter 20 + premium report (30–40 h + API spend). Target it for launch; if it slips, it ships as the first free 2026-edition update within 30 days — the edition promise makes this honest. Post-launch: KDP condensed edition (15–20 h), quarterly benchmark reruns, monthly trend briefings.

**Total to full launch: ~215–285 hours.** At 15–20 focused h/week that is 11–15 weeks — consistent with the 8–10-week list-building runway running in parallel (04-marketing-and-launch.md) and the 90-day schedule in 06-roadmap-90-days.md, with Phase A complete before presale opens to the list.

**Go/no-go bar — the presale cannot open unless all of these are true:**

1. `data/pricing.json` is live, every calculator and table consumes it, and zero contradictory pricing tables remain.
2. guide.md is corrected, machine-checked, and republished free.
3. INTEGRATION.md is deleted; counts fixed; dashboard labeled; one glossary.
4. The sample chapter exists at final book quality.
5. The final TOC plus ≥3 finished chapters are deliverable to presale buyers on day one, with a dated delivery schedule for the rest.
6. No unlabeled invented number exists anywhere a buyer or prospect will read.
7. The edition-based update promise (D4 wording) and the results-not-guaranteed disclaimer are on the sales page.

And the full-launch gate: complete manuscript through Part V, all four Toolkit artifact classes shipped, watermarked delivery working end-to-end, and the first pricing-changelog entry published — because the freshness promise must be demonstrably true before you charge $149 for it.
