# 04 — Marketing, Audience & Launch

**What this document decides.** This memo fixes the positioning (one primary statement, two persona-assigned variants, and a claims-hygiene policy that bans unverifiable savings percentages), commits the audience-first runway that precedes everything else (Kit as ESP, four capture points on named routes, an 8–10 week pre-launch calendar, list targets anchored to real capture data), sets the SEO transition plan for paywalling already-indexed pages without backlash, assembles the tactics from the research into one dated launch sequence (T-10w through T+4w plus the Black Friday reactivation), defines the steady-state content flywheel inside the ≤10 hrs/week budget, the affiliate program, and the B2B motion for the Team tier — including the actual expense-request template text. What is being sold is defined in [01-product-and-packaging.md](01-product-and-packaging.md); prices and platforms in [02-pricing-and-platforms.md](02-pricing-and-platforms.md); the gating mechanics in [03-licensing-architecture.md](03-licensing-architecture.md); ops load and legal terms in [05-operations-legal-sustainability.md](05-operations-legal-sustainability.md); the day-by-day execution schedule in [06-roadmap-90-days.md](06-roadmap-90-days.md).

---

## 1. Positioning: one primary statement, two persona variants, zero unverifiable claims

### 1.1 The primary statement (homepage, Hacker News, engineer-facing everything)

> **"The Good Parts of AWS, for your token bill."**
> TokenOps Pro is the opinionated field guide to LLM unit economics: exactly which caching, routing, and compression levers to pull, in what order, with the math done for you. Skip six months of trial-and-error across provider docs; one prevented mistake covers the price.

This anchors to the single most-proven category in the research: Daniel Vassallo's opinionated cloud-cost PDF did [$45k in 14 days and $140k+ across 7,800 sales at $65](https://www.writerontheside.com/40k-in-16-days-from-daniel-vassallo-and-the-good-parts-of-aws/). It targets the IC/tech-lead buyer, it is honest (opinion + curation is exactly what the product is), and it makes no measurable claim that can be falsified.

### 1.2 Persona-assigned variants

| Statement | Persona | Channels |
|---|---|---|
| **"FinOps certification teaches the framework. TokenOps ships the playbook."** — the FinOps Foundation charges [$500 for its FinOps-for-AI certification exam](https://thenewstack.io/finops-foundation-launches-new-finops-for-ai-certification/); TokenOps Pro is the hands-on engineer's edition at $149, with a living pricing dataset refreshed monthly. | Eng manager / platform lead | LinkedIn, the pricing page's Team-tier framing, the exec briefing deck, outbound-lite (§7) |
| **"The only technical purchase that shows up as a credit on your next invoice."** — every chapter maps to a line on your bill: prompt caching, model routing, RAG token budgets, agent spend caps. Expense-request template included. | CFO / FinOps / the person approving the Team tier | LinkedIn, the expense-template flow, Token Price Watch footer, KDP back-of-book CTA |

### 1.3 Claims hygiene — the policy (fixes the audit's liability, binding on all copy)

The market research's original third statement contained "teams routinely cut 30–60% of LLM spend" — precisely the unverifiable-claim pattern the content audit flags as a refund and credibility liability (the same texture as the $67 Gumroad competitor's ["Slash Your Bill by 25–75%"](https://agentgenius.gumroad.com/l/ocxnk)). That sentence is dead. Three rules replace it, effective across the site, emails, launch posts, ads, and the KDP listing:

1. **Cite mechanisms, not outcomes.** Allowed: "prompt caching cuts repeated-context input cost by up to 90% — a provider-documented discount, reflected live in `data/pricing.json`"; "batch APIs are billed at a documented ~50% discount"; "routing eligible traffic from a frontier model to a mid-tier model changes the per-token price by the exact ratio in the pricing table." Every such claim must trace to a provider pricing page or to the living dataset. Banned: any aggregate "teams typically save X%" figure, because you have no primary data (the audit found zero anywhere in the corpus).
2. **Make the ROI personal, not statistical.** The payback framing from the research is the strongest honest pitch in this category: *"If your team spends $2,000/month on tokens, a 20% saving pays for Pro in 11 days."* The free blended calculator on `/calculator` outputs exactly this sentence with the visitor's own numbers — the reader supplies the assumption, so the claim is theirs, not yours. This doubles as capture point #4 (§2.2).
3. **Disclaim everywhere savings are mentioned.** Per [05-operations-legal-sustainability.md](05-operations-legal-sustainability.md), any surface citing a savings percentage — including the payback calculator output and the expense template — carries the results-not-guaranteed disclaimer. Illustrative scenarios are labeled "illustrative," full stop; this is the same D6 bar the content itself must pass.

Honesty here is not defensive; it is the differentiator. The niche is saturated with hollow 50–80% claims ([even the Udemy competitor makes them](https://marcelclasses.udemy.com/course/llm-observability-cost/)), and the comps that won — Vassallo, swyx, Kahl — turned radical transparency into marketing assets ([Kahl published his exact launch numbers](https://www.indiehackers.com/post/zero-to-sold-1000-books-sold-in-7-days-here-are-the-numbers-0954b31c39)).

---

## 2. The audience-first runway (this precedes everything)

Every comp that mattered was list-driven: [Josh Comeau turned a $50k goal into $550k of pre-orders off his existing audience](https://www.indiehackers.com/post/launched-my-first-course-earned-over-us-500-000-ama-4382405cd5); [swyx took $12k of his $25k launch in presales to his list](https://www.swyx.io/writing/coding-career-launch); [Nathan Barry's sample-chapter form converted 5.3% of 21,500 sales-page visitors into leads](https://nathanbarry.com/ongoing-sales/) that an autoresponder then sold over weeks. The site currently has **zero email capture**. Fixing that is a bigger launch determinant than the paywall, so it starts at T-10w — before the content upgrade finishes, before any gating ships.

### 2.1 Kit setup (week one of the runway)

- One Kit account; double opt-in on (GDPR-clean per [05-operations-legal-sustainability.md](05-operations-legal-sustainability.md)); sender domain authenticated on tokenops.kalilurrahman.com.
- **Tags at capture:** `magnet:tagging-schema`, `magnet:cost-review`, `magnet:prompt-checklist`, `sample-chapter`, `price-watch`, `calc-results` — tag = intent signal, and it drives which sequence fires and how you segment the presale.
- **Two sequences:** the sample-chapter sequence (§2.5) and a two-email Token Price Watch welcome. Buyer emails flow in continuously from Polar/Gumroad exports tagged `buyer:handbook|pro|team` (the platform-migration hedge, D11).
- **One broadcast rhythm:** Token Price Watch ships monthly from day one — it is simultaneously the newsletter, the public proof-of-life for the living pricing dataset, and the changelog announcement channel promised in [02-pricing-and-platforms.md](02-pricing-and-platforms.md).

### 2.2 The four capture points and where they live

| # | Capture point | Routes | Mechanics |
|---|---|---|---|
| 1 | **3 lead-magnet templates** — `request-tagging-schema.yaml`, `monthly-cost-review.md`, `prompt-optimization-checklist.md` (per D5, these leave the free-download pile and become email-gated) | `/templates`, their `/library` cards, contextual links inside `/optimize` pages | Kit inline form → instant delivery email → tag → joins sample-chapter sequence after 3 days |
| 2 | **Free sample chapter: "The Prompt Caching Chapter"** — the strongest single chapter of the Handbook, chosen because caching is the most provider-documented mechanism (rule 1.3.1) | Dedicated `/sample-chapter` landing; inline CTA on `/guide` (top and bottom); `/caveman` and `/techniques` footers | Kit form → PDF (the only free artifact rendered with the same book design as the paid Handbook — it *is* the quality proof) → sequence §2.5 |
| 3 | **Token Price Watch** — the pricing-changelog newsletter | Site-wide footer; `/library` trends section header; every trend-briefing page; the pricing-dataset teaser page | "Model prices changed 7 times last quarter. Get the diff monthly." One-field form |
| 4 | **Calculator-result email gate** | `/calculator` (the free blended calculator) | Calculator is free to use with results on screen — no dark pattern. The *export* ("email me this scenario + the payback math as a PDF") is email-gated. Output includes the personal payback sentence (§1.3.2) with disclaimer |

Placement rule: never more than one form visible per viewport, and the Optimize hub's viral pages (`/caveman`, `/tool-guides`) get the least intrusive treatment (footer only) — they are for earning links, not harvesting emails.

### 2.3 The 8–10 week pre-launch content calendar

The runway does not require writing much new marketing content — the audit identified the viral assets already in the repo. Each existing asset becomes one launch post, republished/threaded with a capture CTA. This is Wathan's method: [he marketed his course by publishing the material as posts while building part-time](https://microconf.gen.co/adam-wathan/).

| Week | Publish (from existing assets) | Capture push |
|---|---|---|
| T-10w | Plausible + Kit live; Token Price Watch #1 (July pricing diff) | Footer forms live site-wide |
| T-9w | **"Caveman compression"** standalone post + HN/Reddit/X thread — the brandable hook, the single most linkable asset | Sample-chapter CTA in post footer |
| T-8w | **"The agentic loop tax"** (from `trends/`) — the briefing with the sharpest editorial idea for the agent-building audience | Token Price Watch CTA |
| T-7w | **Tool-guide #1: Claude Code credit playbook** (from `/tool-guides` — the audit calls these "content almost nobody else has written") | Lead-magnet #3 (prompt-optimization checklist) |
| T-6w | Tool-guide #2: Cursor; Token Price Watch #2 | Lead magnets #1–2 |
| T-5w | **"Cached input is the new base rate"** (from `trends/`) + sample-chapter launch — the chapter goes live as the flagship magnet | Sample chapter, hard push |
| T-4w | Tool-guide #3: Copilot/Lovable; **the repositioning post (§3.5)** | Price Watch + waitlist tag `presale-interest` |
| T-3w | "What we fixed" corrections post (§3.5) + Handbook TOC reveal; Token Price Watch #3 | Waitlist push to full list |
| T-2w | **Presale opens to the list** (48–72h exclusive, then presale link public — mechanics in [02-pricing-and-platforms.md](02-pricing-and-platforms.md)) | — |
| T-1w | Mid-presale proof email (what shipped to presale buyers already); final-48-hours email | — |

### 2.4 Realistic list targets

Honesty first: there is no traffic baseline — the repo has no analytics (critique-confirmed), so Plausible at T-10w establishes it. Anchors: Barry's **5.3% visitor→lead on a dedicated sales page with a sample-chapter offer** is the ceiling reference; site-wide blended capture across mixed-intent pages runs well below a dedicated page, so target **3–5% of unique visitors** across the four capture points, with `/sample-chapter` itself judged against the 5.3% figure directly.

Scenario math (labeled illustrative, per our own rules): at 4,000–6,000 uniques over the 10-week runway (plausible if two of the seven calendar posts travel), 3–5% capture yields **150–300 subscribers organically, 400–800 if one post hits the HN front page**. The go/no-go: **do not open the presale below ~400 subscribers** — under that, a 3% presale conversion produces ~12 sales, too little signal to judge pricing, and the fix is two more weeks of runway, not a lower price. This is why the calendar has slack (8–10 weeks, not fixed).

### 2.5 The sample-chapter sequence (6 emails, Barry's autoresponder model)

1. **Day 0 — Delivery + the caching math.** The chapter PDF, one worked example from it, and a question that starts replies: "What's your monthly token bill? Reply with a number — I read every one." (Replies = presale research + deliverability signal.)
2. **Day 2 — The loop tax.** Condensed agentic-loop-tax briefing; ends with the archive CTA (§5) — first exposure to "there's a paid archive."
3. **Day 5 — Caveman compression.** The story + keep/drop rules; pure value, no pitch; this is the email that gets forwarded.
4. **Day 8 — "Are you overspending?"** Links the calculator, walks the payback framing with the subscriber invited to run their own numbers; results-not-guaranteed disclaimer inline.
5. **Day 11 — What the Handbook is.** Full TOC, the edition-based update promise verbatim from [02-pricing-and-platforms.md](02-pricing-and-platforms.md), the corrections story ("we found our own math errors and fixed them in public") — trust as the pitch.
6. **Day 14 — The offer.** Presale price with deadline if the window is open; otherwise waitlist tag + "you'll get 48 hours before anyone else." Team-tier paragraph links the expense template (§7) for the "I'd need my manager" segment.

---

## 3. SEO transition: paywalling indexed pages without the backlash

### 3.1 Current state (the problem)

Everything is indexed and advertised: `robots.txt` is allow-all, the sitemap enumerates routes, all 46 library documents are world-readable at raw `.md` URLs *and* shipped inside the 663 KiB `documents.json` in the client bundle, and `public/llms.txt` announces the site to AI crawlers as **"the open reference."** Turning known-free pages into paywalled ones is a repositioning event with ranking mechanics *and* reputation mechanics; both need managing.

### 3.2 The migration (mechanics per [03-licensing-architecture.md](03-licensing-architecture.md))

- Premium docs move server-side; their routes serve honest server-rendered **15–20% teasers to everyone** — crawlers get exactly what an anonymous human gets (flexible sampling, not cloaking; never special-case Googlebot).
- Teaser pages carry JSON-LD `CreativeWork` with `isAccessibleForFree: false` and `hasPart`/`cssSelector` on the gated body — Google's documented mechanism distinguishing paywall from cloaking.
- **301 map, not 404s:** every raw premium `.md` URL (`/library/advanced/*.md`, `/library/playbooks/*.md`, `/library/templates/*.md`, `/library/checklists/*.md`, archived `/library/trends/*.md`) 301s to its teaser route at `/read/…`. Retired docs (`case-studies-detailed.md`, `provider-comparison-matrix.md`, `token-pricing-reference.md`, per 01's map) 301 to their successor pages. `INTEGRATION.md` is deleted and returns 410. Free docs' raw URLs 301 to their reader routes too, for one canonical URL per document.
- **`guide.md` stays free and canonical** — corrected, it is the credibility magnet and keeps its accumulated equity; the free surface (guide, Optimize hub, glossary, patterns) is untouched by gating and *improves* through 01's consolidation of the three glossaries and duplicate calculators.
- Sitemap keeps teaser routes (they are indexable pages); `llms.txt` is rewritten (§3.5).

### 3.3 Search Console monitoring checklist

1. Before migration: verify the domain property; export 12 weeks of queries/pages as the baseline (this plus Plausible's first weeks is the only baseline that will ever exist).
2. Migration day: resubmit the sitemap; URL-inspect the top 10 premium teaser routes — confirm the rendered HTML shows teaser + JSON-LD and that the paywalled markup is detected.
3. Weekly for 8 weeks: Page Indexing report — confirm 301'd `.md` URLs drop out as "Page with redirect," not soft-404; watch for accidental "Blocked" or "Duplicate" states on teaser routes.
4. Weekly for 8 weeks: Performance report filtered to migrated URLs vs. the baseline export — track impressions and clicks separately for free vs. premium pages.
5. Action threshold: a migrated teaser losing >40% of clicks with stable impressions means the teaser isn't satisfying the query — lengthen that teaser toward 20–25% or restructure it to front-load the answer the query wants, before considering anything else.

### 3.4 Expected ranking effects, stated honestly

Premium pages **will lose long-tail rankings** — a 15–20% teaser cannot rank for queries the removed 80% answered, and JSON-LD paywall markup preserves eligibility, not position. Expect a meaningful decline in clicks to migrated pages over 4–8 weeks. This is an acceptable, planned cost: those clicks were un-monetized traffic to content the audit classifies as leaked anyway, and the pages that drive the funnel (guide, caveman, tool-guides, calculator, glossary) stay full-text and should strengthen as consolidation removes internal duplication. The metric that matters shifts from "clicks to library pages" to "teaser view → unlock CTA → checkout" (§8). What would *not* be acceptable is losing free-surface rankings — that is what checklist item 4 separates out.

### 3.5 The messaging that prevents backlash

The line, used everywhere and made true by D5: **"The reference stays free — the operator's edition is paid."**

- **The repositioning post (T-4w), titled "The reference stays free."** Contents: (a) TokenOps Atlas remains free and is getting *better* — the corrections pass, one canonical glossary, one pricing source of truth; (b) what's becoming paid is the operator's edition — the compiled Handbook, the toolkit artifacts, the archive, the maintained dataset — i.e., overwhelmingly *new* material; (c) the honest acknowledgment that the existing library has been public and archived, and you're not pretending to claw it back — the paid product is corrected, unified, new, and *maintained*, which no snapshot can be; (d) the edition-based update promise. Publishing this *before* the paywall appears converts "they walled the free stuff" into "they told us the plan" — and the post itself is a launch asset in the transparency tradition that worked for [Vassallo](https://www.linkedin.com/pulse/how-i-made-210822-selling-pdf-video-internet-daniel-vassallo?articleId=6711186613663354880) and [Kahl](https://www.indiehackers.com/post/zero-to-sold-1000-books-sold-in-7-days-here-are-the-numbers-0954b31c39).
- **The corrections post (T-3w), "What we fixed."** Owns the audit's findings in public: the stale pricing tables, the arithmetic errors in the guide, the "29 guides" count (actual: 46). Nothing builds pre-launch trust in a numbers product like publicly fixing your own numbers.
- **`llms.txt` rewrite (ships with the paywall):** *"TokenOps Atlas is the free, open reference for LLM token cost optimization: the master guide, techniques, tool guides, glossary, patterns, and the blended cost calculator — free, no login. TokenOps Pro — the operator's edition — is a paid product: The TokenOps Handbook (2026 Edition), the Operator Toolkit, the full trends archive, advanced calculators, and a monthly-maintained pricing dataset. Premium URLs serve free excerpts."*

---

## 4. The launch sequence

T0 = public launch day. Everything left of T-2w is the runway (§2.3); the presale does not open until the D6 quality bar passes (the go/no-go in [01-product-and-packaging.md](01-product-and-packaging.md)) **and** the list clears ~400 (§2.4). If either slips, the whole right side slips — never launch on the current corpus.

| When | What |
|---|---|
| **T-10w → T-3w** | List building per §2.3; gating + content upgrade proceed in parallel per [06-roadmap-90-days.md](06-roadmap-90-days.md) |
| **T-4w** | Repositioning post; paywall + 301s + llms.txt ship this week (before money is asked, after the messaging) |
| **T-2w** | **Presale opens to the list first** — 48–72h exclusive, then the presale link is public. $39/$99/$449 (≈33% off, per D3). Presale window totals 10–14 days and closes at T0; prices then go to full permanently |
| **T-1w** | Mid-presale proof email; Amazon KDP condensed edition submitted so it is live for launch week ([KDP drove ~60% of Kahl's week-one volume](https://www.indiehackers.com/post/zero-to-sold-1000-books-sold-in-7-days-here-are-the-numbers-0954b31c39)) |
| **T0 (Tue)** | **Product Hunt: "TokenOps Pro — the operator's edition."** The product launch, at full price, maker comment tells the corrections story. PH-then-HN sequencing per the [launch-platform comparison](https://smollaunch.com/compare/product-hunt-vs-hacker-news) |
| **T0+2 (Thu)** | **Show HN: the free Atlas + calculator as the artifact** — "Show HN: A free field guide + calculators for cutting LLM token costs." HN gets the free thing; [Show HN suits technical products and comment engagement drove +60% traffic in one dataset](https://smollaunch.com/compare/product-hunt-vs-hacker-news) — stay in the thread all day. The paid tier is discovered, not pitched ([dev-tool launch lessons](https://medium.com/@baristaGeek/lessons-launching-a-developer-tool-on-hacker-news-vs-product-hunt-and-other-channels-27be8784338b)) |
| **T0 week, continuous** | **LinkedIn for the manager/CFO personas**: statement-2 and statement-3 posts (§1.2), the exec-deck one-pager, the expense-template post ("here's the email to send your manager") — the channel where the Team tier is won |
| **T+1w → T+4w** | Post-launch drip: launch-numbers transparency post (the Vassallo/Kahl move — it markets itself); affiliate recruiting begins (§6); non-buyer segment gets a 3-email nurture (best launch content + payback calculator); buyers get the onboarding email (unlock flow, toolkit tour, Team upsell for Pro buyers) |
| **First Black Friday ≥8 weeks after T0** | The single annual public discount event: ~25% off for new buyers, plus an owner-only Handbook→Pro upgrade offer. Precedent: [Wathan runs Black Friday sales up to 70% off](https://adamwathan.me/black-friday/); [Orosz's once-a-year $120-vs-$150 deal](https://blog.pragmaticengineer.com/reduced-price-faor-the-newsletter/). Ours stays shallower than the presale (25% < 33%) so presale buyers stay best-treated. If T0 lands within 8 weeks of Black Friday, skip it that year — don't train buyers to wait |

**Expectation-setting, verbatim from the evidence:** launch platforms produce **one-time traffic spikes, not sustained growth** — the [comparison data](https://smollaunch.com/compare/product-hunt-vs-hacker-news) and [Indie Hackers conversion figures](https://awesome-directories.com/blog/indie-hackers-launch-strategy-guide-2025/) agree, and Vassallo's and Kahl's launches were carried by their own audiences with platforms as amplifiers. Plan revenue around the list converting (§8), treat a front-page day as list-building fuel, and judge launch week by subscribers captured as much as by sales.

---

## 5. The content flywheel (steady state, D10-compatible)

One monthly cycle, ~4 hrs of the 10 hrs/week content budget, four outputs from one piece of work:

1. **Monthly trend briefing** (1–2 per month, 400–600 words each) — written once, published to the trends section.
2. **Newest-2-free rotation** — each new briefing is free for its first 30 days; publishing it pushes the oldest free briefing into the paid archive. The freshness signal stays public; the archive compounds as paid value (D5's resolution of the trends conflict). **Every free briefing ends with the archive CTA:** "This briefing is free for 30 days. The archive — N briefings and counting — is in TokenOps Pro."
3. **Token Price Watch** — the monthly pricing-dataset refresh (LiteLLM upstream + manual verification, per D6) produces the changelog; the newsletter is the changelog plus a 3-sentence take from the month's briefing. The dataset update and the newsletter are one task, not two.
4. **Social derivatives** — each briefing yields one X/LinkedIn thread and one link post; the pricing changelog yields a "what changed this month" post. No original social content is ever required; the flywheel feeds the channels.

Under pressure, the D10 drop order applies (video first, then benchmarks, then new playbooks) — the flywheel's pricing refresh and briefing cadence are in the never-drop set, because they *are* the edition promise made visible.

---

## 6. Affiliates

Run the program on the platforms' native rails — affiliate support is standard across Gumroad, Lemon Squeezy, and Polar, and every comp in this category runs one. **Commission: 20–30%** (start at 25%; 30% for the top handful by hand). Launch it at T+2w, not before — affiliates amplify a proven page, they don't rescue an unproven one.

Who to recruit, in order: (1) **newsletter authors in the AI-engineering niche** — the audience already paying for [Pragmatic Engineer-style products](https://newsletter.pragmaticengineer.com/about) overlaps exactly with the Pro buyer, and a single dedicated send from a mid-size AI-eng newsletter can outperform launch week; (2) authors of the tools covered in `/tool-guides` content and adjacent YouTube/course creators covering Claude Code, Cursor, and Copilot workflows; (3) the first cohort of enthusiastic buyers (offer inside the onboarding email). Give every affiliate a ready-made kit: the payback framing, two pre-written posts that pass the §1.3 claims policy, and the sample chapter to give away — affiliates repeating "cut costs 60%!" would burn the positioning, so the kit is the guardrail, and the affiliate terms require sticking to it.

Note the fee interaction from [02-pricing-and-platforms.md](02-pricing-and-platforms.md): affiliate commission stacks on top of platform fees (Polar Starter 5% + $0.50), so an affiliate Pro sale nets roughly $149 − ~$8 fees − $37 commission ≈ $104 — still comfortably worth it as pure customer acquisition, which is also exactly how Gumroad Discover's 30% is treated (D2).

## 7. The B2B motion for the Team tier

The Team tier ($599, 10 seats, one Polar key with 10 activations) is the highest-margin product and it sells through a different motion: not conversion pages but **removing friction from "I'll ask my manager."** The evidence: Lenny sells an explicit [$300 "I Can Expense It" tier](https://www.lennysnewsletter.com/p/productpass); Orosz publishes a [ready-made request-to-expense template](https://blog.pragmaticengineer.com/request-to-expense-the-pragmatic-engineer-newsletter/) precisely because the email to the manager is the real checkout page; [swyx sold 10-seat team licenses at 2.5–5× individual price](https://learninpublic.org/). A cost-optimization product is the easiest expense claim in software — the product's job is to make the email take 30 seconds.

**The expense-request template** (shipped as a copy-paste page at `/expense`, inside the Team-tier checkout flow, in email 6 of the sequence, and in the Team edition itself):

> **Subject:** Approval request: TokenOps Pro Team license — $599 one-time
>
> Hi {manager},
>
> I'd like approval to expense a Team license for **TokenOps Pro** (tokenops.kalilurrahman.com) — **$599 one-time** for 10 seats ($59.90/seat, not a subscription).
>
> **What it is:** an operator's handbook and toolkit for managing our LLM API costs: *The TokenOps Handbook (2026 Edition)*, a cost-model spreadsheet, an executive briefing deck, incident-response/QBR/SLA templates, five cost calculators, and a model-pricing dataset that's refreshed monthly with a public changelog.
>
> **Why now:** we currently spend about **${X}/month** on LLM APIs. The techniques it covers are provider-documented pricing mechanisms — prompt caching (up to ~90% off repeated-context input on supported providers), batch processing (~50% documented discount), and model routing. If we reduce spend by even 10%, the license pays for itself in **{Y} days**. (Savings depend on our workload; no specific result is guaranteed.)
>
> **For finance:** one-time purchase; a proper invoice with tax handled is issued at checkout by the merchant of record (Polar); 30-day money-back guarantee; the license covers 10 named users for internal use, including modification and use in client deliverables.
>
> OK to proceed?

(Placeholders only — `{manager}`, `${X}` — per the D9 rule; the license-terms sentence matches [05-operations-legal-sustainability.md](05-operations-legal-sustainability.md) verbatim.)

**Outbound-lite** (fits inside the 2 hrs/week marketing budget; no cold-email machine): the **.pptx executive briefing deck is the leave-behind**. When a Pro buyer's company appears (from the platform's buyer data flowing into Kit), one personal email offers the deck: "You bought Pro — here's the 12-slide version for your team lead; the Team tier upgrade credits your purchase." Additionally, the deck's first two slides are a free download on `/expense`, watermarked "TokenOps Pro Team edition preview" — the CFO-facing artifact does the selling in meetings you're not in. Team-tier operational mechanics (invoices, POs, seat management via Polar's customer portal) are specified in [02-pricing-and-platforms.md](02-pricing-and-platforms.md) and [05-operations-legal-sustainability.md](05-operations-legal-sustainability.md).

---

## 8. Metrics and targets per phase

Stack per D11: Plausible (privacy-light, no consent banner) with custom events, UTM discipline on every link in every post/email/affiliate kit, and the funnel instrumented end to end: `teaser_view → unlock_cta_click → checkout_start (outbound to Polar) → activation (unlock success)`, plus `email_capture` by capture point and platform-side sales attribution reconciled weekly. Buyer emails export continuously to Kit.

Targets are pre-committed so success and failure are judgeable, with the comp anchor for each. Where no direct comp exists, the anchor is labeled as a heuristic and the real test is trend-vs-own-baseline.

| Phase | Metric | Target | Anchor |
|---|---|---|---|
| Runway (T-10w→T-3w) | Site-wide visitor→subscriber capture rate | 3–5% | [Barry: 5.3% on a dedicated sales page](https://nathanbarry.com/ongoing-sales/) — site-wide blended runs below a dedicated page; `/sample-chapter` alone is judged against 5.3% directly |
| Runway | List size at presale open | ≥400 (go/no-go), 800 stretch | §2.4 scenario math; below 400, extend the runway — don't cut the price |
| Presale (T-2w→T0) | List→buyer conversion inside the window | 2.5–5% | Heuristic; directional comps: [swyx took ~half his launch in presales from his list](https://www.swyx.io/writing/coding-career-launch), [Comeau's list pre-ordered 11× his goal](https://www.failory.com/interview/css-for-js-developers). Below 1.5% = offer/pricing-page problem; above 5% = raise next year's prices |
| Presale + launch | Blended ASP | ≥$120 | The guardrail from [02-pricing-and-platforms.md](02-pricing-and-platforms.md); swyx's $42 ASP on a $39-base ladder is the documented failure mode |
| Launch week (T0→T+1w) | Pricing-page visitor→buyer | 0.5–1.5% on cold launch traffic | Heuristic — launch-spike traffic converts poorly ([platform-comparison evidence](https://smollaunch.com/compare/product-hunt-vs-hacker-news)); judge launch week equally on `email_capture` volume (target: ≥1 subscriber per 20 launch-week uniques) |
| Post-launch steady state | Teaser view → unlock CTA click | ≥8% after week 4 | No published comp exists — treat the first 4 weeks as baseline, then improve teaser composition against it (§3.3's 20–25% lengthening lever) |
| Post-launch steady state | Unlock CTA → checkout start | ≥25% | Heuristic; below that, the CTA promises what the checkout page doesn't repeat — fix the page, not the price |
| Ongoing | Refund rate | <5% of orders | 30-day guarantee per [05-operations-legal-sustainability.md](05-operations-legal-sustainability.md); a spike localized to one artifact identifies the quality gap — the audit's "refund machine" warning is this metric's reason to exist |
| Ongoing | Token Price Watch open rate; list growth | >40% opens; +5%/month net | Newsletter norms for a niche technical list; open rate is the edition-promise's public pulse |
| KDP funnel | Back-of-book discount-code redemptions | Track from day one; judge at 90 days | [KDP was ~60% of Kahl's week-one volume](https://www.indiehackers.com/post/zero-to-sold-1000-books-sold-in-7-days-here-are-the-numbers-0954b31c39); the condensed edition's job is Pro conversions, and the code redemptions measure exactly that |

Review cadence: weekly during runway/launch, monthly in steady state, folded into the ops hour budget in [05-operations-legal-sustainability.md](05-operations-legal-sustainability.md). Every number in this table is a target, not a prediction — the same discipline the content itself now lives by.
