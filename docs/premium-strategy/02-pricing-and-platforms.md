# 02 — Pricing, Tiers & Sales Platforms

**What this document decides.** This memo fixes the price ladder for the TokenOps Pro product line ($59 Handbook / $149 Pro / $599 Team, presale ≈33% off), replaces "lifetime updates" with an edition-based promise, sets the presale mechanics and a phase-2 purchasing-power-parity plan, and commits the sales stack: Polar.sh as primary checkout and license authority, Gumroad retained only as a secondary Discover storefront, Amazon KDP as a $9.99 credibility-floor funnel, with Stripe Managed Payments + Keygen and Paddle + Keygen as named fallbacks. It closes with the refund policy and three honest revenue scenarios. What goes *inside* each tier is defined in [01-product-and-packaging.md](01-product-and-packaging.md); how licenses are enforced in code is [03-licensing-architecture.md](03-licensing-architecture.md); the launch calendar that executes this pricing is [04-marketing-and-launch.md](04-marketing-and-launch.md).

---

## 1. The pricing ladder

| Tier | Full price | Presale (~33% off) | What it is |
|---|---|---|---|
| The TokenOps Handbook, 2026 Edition (PDF/EPUB, watermarked) | **$59** | $39 | The book alone |
| **TokenOps Pro — the operator's edition** (default tier) | **$149** | $99 | Handbook + Operator Toolkit (.xlsx cost model, .pptx exec deck, .docx templates, companion code repo) + license-gated web access + advanced calculators with scenario save/export + full trends archive + living pricing dataset + every 2026–27 edition update |
| Team edition (10 seats, one key) | **$599** | $449 | Everything in Pro × 10 activations + workshop deck + expense-request template + proper invoices |
| Kindle/paperback condensed edition (KDP) | $9.99 / ~$24.95 | — | Narrative handbook only; funnel, not product (§7) |

A "Complete" tier with video walkthroughs at $249–299 is deliberately **not** at launch — it enters the roadmap only if video production proves feasible (see [06-roadmap-90-days.md](06-roadmap-90-days.md) and the drop-order in [05-operations-legal-sustainability.md](05-operations-legal-sustainability.md)).

### Why these exact numbers

**$59 for the book** sits precisely in the proven band for opinionated solo-author technical ebooks: Daniel Vassallo's *The Good Parts of AWS* — the closest structural analog, an opinionated cloud-cost PDF — sold at **$65** and did [$45k in 14 days and $140k+ across 7,800 sales](https://www.writerontheside.com/40k-in-16-days-from-daniel-vassallo-and-the-good-parts-of-aws/) ([$210k+ across products](https://www.linkedin.com/pulse/how-i-made-210822-selling-pdf-video-internet-daniel-vassallo?articleId=6711186613663354880)). swyx's *Coding Career Handbook* book tier was [$59](https://learninpublic.org/). O'Reilly anchors "a serious AI book" at [$39.99 (Chip Huyen's *AI Engineering* ebook)](https://huyenchip.com/books/). Going below $59 repeats swyx's documented regret: on his $39/$79/$199 ladder the underpriced base dragged his blended ASP to **$42** on a $25k launch, and [he and his commenters concluded the base tier was too cheap for the audience](https://www.swyx.io/writing/coding-career-launch). The Handbook's job in this ladder is not to maximize its own sales — it exists to make Pro look like the obvious choice.

**$149 for Pro** is the launch price of the most-cited comparable in existence: Refactoring UI's Complete Package launched at **$149** (book + videos + asset libraries) and [now sells at $249](https://refactoringui.gumroad.com/l/MyQsm); Thomas Frank's Notion template products sit at [$129–199 and grossed $1M in a year](https://www.easy.tools/blog/thomas-frank). The market band for "ebook + templates/tools bundle" is **$79–149** across every comp in the research. Two anchors bracket us and prove the middle is empty: the [$67 "LLM Cost Killer Playbook" on Gumroad](https://agentgenius.gumroad.com/l/ocxnk) (thin, no tooling, no brand) at the bottom, and the [FinOps Foundation's $500 "FinOps for AI" certification exam](https://thenewstack.io/finops-foundation-launches-new-finops-for-ai-certification/) at the top. **Nobody currently sells a premium, engineer-first, provider-neutral LLM token-cost package in the $79–349 middle.** $149 owns it with room to raise later, exactly as Wathan/Schoger did ($149 → $249).

**$599 for Team (10 seats)** is ~4× Pro, inside the research's observed **2.5–5× individual price for 5–10 seat licenses** ([swyx sold 10-seat tiers at $279–479 on lower base prices](https://learninpublic.org/)). Per seat it is $59.90 — the price of the book — against the $500-per-person certification alternative. That comparison goes on the pricing page.

### The psychology of the ladder (and why Pro is the default)

Three evidence-backed rules govern how these tiers are presented:

1. **Three tiers, priced roughly 1× / 2.5× / 10×.** Nathan Barry's tested 3-tier model (book / book+resources / complete package) produced a [**+$50k, 170% revenue increase** on a single launch from packaging changes alone, and an estimated +$76k across two books](https://nathanbarry.com/double-launch-revenue/); the majority of revenue came from the top tiers, not the base. [Jason Cohen independently reached $100k+ with the same multi-package structure](https://blog.asmartbear.com/selling-ebook/).
2. **Pitch the expensive option first.** The pricing page lists Team first, Pro second (visually highlighted, "most popular"), Handbook last — the [*Authority* playbook](https://robsobers.com/summary-of-nathan-barrys-authority/), and the layout of the [canonical Refactoring UI pricing-page teardown](https://marketingexamples.com/landing-page/pricing). After seeing $599, $149 reads as reasonable; after seeing $149, $59 reads as the compromise.
3. **Higher prices convert better, not worse, for this buyer.** Maven's platform data: [courses priced $950+ earned **50–100% more revenue per landing-page visit** than cheaper ones](https://maven.com/resources/course-price-and-length), and the top-grossing course on the platform is a [$5,000 AI-evals course](https://maven.com/parlance-labs/evals). The TokenOps buyer has a literal monthly bill this product reduces; a $149 price is not a barrier to someone spending $2k+/month on tokens — it is a signal of seriousness. (Every savings claim used in that framing carries the results-not-guaranteed disclaimer required by [05-operations-legal-sustainability.md](05-operations-legal-sustainability.md).)

The ASP guardrail: if post-launch blended ASP falls below ~$120, the mix is skewing to the Handbook and the presentation (not the prices) needs fixing — that is the swyx failure mode, and it is a page-design problem before it is a pricing problem.

---

## 2. Updates: edition-based, never "lifetime"

The research initially framed "lifetime updates" as the moat for a fast-moving topic ([swyx sold it as an explicit tier feature](https://learninpublic.org/)). The critique correctly killed it: for pricing data that changes monthly, lifetime updates on a one-time purchase is an **unbounded labor liability for a solo creator** — the exact mechanism that produced the current site's falsely claimed "Last reviewed: June 2026" staleness. The sustainability budget is ≤10 hrs/week ([05-operations-legal-sustainability.md](05-operations-legal-sustainability.md)); the promise must fit inside it.

**Exact customer-facing wording (use verbatim on the pricing page and receipts):**

> **What "updates" means.** Your purchase includes every update to the **2026–27 edition** — at least 12 months of revisions — plus **monthly pricing-dataset refreshes** with a public changelog. When the next edition ships, owners get **~50% off the upgrade**. We don't promise "lifetime updates," because in this field that promise is always a lie within a year; we promise a maintained edition with a visible pulse.

The public changelog and the "Token Price Watch" newsletter ([04-marketing-and-launch.md](04-marketing-and-launch.md)) are the proof-of-life that makes this promise credible — the freshness stream is the product's real anti-piracy and anti-free-content moat, not the paywall.

**Upgrade mechanics at the next edition.** The 2028 edition is a new Polar product. Owners receive a ~50% discount code by email (the buyer list lives in Kit, continuously exported from the platform — the migration hedge in [05-operations-legal-sustainability.md](05-operations-legal-sustainability.md)). On Polar, entitlements are "benefits" decoupled from the license key ([benefit docs](https://polar.apidocumentation.com/documentation/features/benefits/license-keys)), so an upgrade grants the new edition's benefit to the existing key — no re-activation ceremony for the buyer, no key-migration support tickets for you. This is one of the concrete reasons Polar wins §5.

Pricing precedent for the upgrade discount: [Pragmatic Engineer's once-a-year $120-vs-$150 deal](https://blog.pragmaticengineer.com/reduced-price-faor-the-newsletter/) and [Wathan's recurring Black Friday discounts](https://adamwathan.me/black-friday/) show a ~20–50% periodic discount reactivates owners without cheapening the brand.

---

## 3. Presale / early-access design

**Who:** the email list only, first. The 8–10 week list-building runway precedes the presale ([04-marketing-and-launch.md](04-marketing-and-launch.md)); the list gets a 48–72 hour exclusive window before the presale link is public. Every comp that mattered was list-driven: [Josh Comeau turned a $50k goal into $550k of pre-orders off his blog audience](https://www.indiehackers.com/post/launched-my-first-course-earned-over-us-500-000-ama-4382405cd5), and [swyx took $12k of his $25k launch in presales](https://www.swyx.io/writing/coding-career-launch).

**Discount:** ~33% — $39 / $99 / $449. This is conservative next to Comeau's early-access gap ([$129 early vs. $349 full](https://www.failory.com/interview/css-for-js-developers)), deliberately so: a 33% gap creates urgency without training buyers to wait for sales. The presale price exists **only** during the launch window (10–14 days). After it closes, prices go to full and stay there; the next discount is the following year's reactivation event.

**What ships at presale vs. launch — tied to 01's go/no-go bar.** Presale does not open until the launch-blocking quality bar in [01-product-and-packaging.md](01-product-and-packaging.md) passes: the fact/math pass on the guide, one pricing source of truth (`data/pricing.json`), the contradictory pricing tables killed, and the compiled Handbook PDF/EPUB building cleanly. Presale buyers get, on day one: the corrected Handbook, license-gated web access, and the calculators. The Operator Toolkit artifacts (.xlsx, .pptx, .docx, companion repo) may ship on a stated date up to public launch day — the checkout page shows the delivery date for each artifact explicitly. Selling an honest "arriving on {date}" is fine; selling silence is how refund machines are built. Under no circumstance does presale open on the current corpus — the audit's verdict ("would trigger refunds if sold") stands until the bar is passed.

---

## 4. Purchasing-power parity — phase 2, not launch

PPP is high-leverage for this product specifically: LLM cost pain is global, with heavy API usage in India, LATAM, and SEA. Evidence: [Wes Bos pioneered PPP for courses and reports it "helps sell more product"](https://wesbos.com/parity-purchasing-power); [one creator measured **+15% overall revenue over seven months** from PPP](https://www.paritydeals.com/blog/why-purchasing-power-parity-pricing-is-a-must-for-digital-products/); [Comeau](https://www.failory.com/interview/css-for-js-developers) and [Orosz](https://newsletter.pragmaticengineer.com/about) both run it.

**But it is a phase-2 move, with an honest caveat the research flagged: platform support is unverified.** Nobody has confirmed whether Polar or Gumroad supports automatic geo-priced checkouts versus manual geo-restricted discount codes, and the gating design doesn't yet consider PPP-tier keys. Before enabling PPP (target: 60–90 days post-launch, [06-roadmap-90-days.md](06-roadmap-90-days.md)):

1. Verify the mechanism on Polar (geo-restricted discount codes at minimum; automatic geo-pricing if available) and decide whether Gumroad's storefront gets parity too or stays full-price.
2. Set the tolerance stance up front: **accept VPN abuse.** Every PPP practitioner eats some; the alternative (IP-verification arms races) costs more support hours than it saves revenue. A PPP purchase delivers an identical license — no PPP-tier key logic in [03-licensing-architecture.md](03-licensing-architecture.md), keeping the license model single-shape.
3. Start with 3–5 country bands at 40–60% off, monitor for a quarter against the +15% benchmark.

---

## 5. Platform decision (decision memo)

**Decision: Polar.sh is the primary checkout and the license authority. Gumroad survives only as a secondary storefront for its Discover marketplace and name recognition. Lemon Squeezy is excluded. Stripe-direct is excluded as primary. Two named fallbacks are on the shelf.** All integration code goes behind one `LicenseService` interface with Polar and Gumroad adapters ([03-licensing-architecture.md](03-licensing-architecture.md)).

### 5.1 The fee reality

Rates exactly as verified in July 2026 research: Polar new-org Starter **5% + $0.50** (paid Pro plan $20/mo → **3.8% + $0.40**; [fee docs](https://polar.sh/docs/merchant-of-record/fees), [Polar Plans announcement](https://polar.sh/blog/introducing-polar-plans)); Gumroad direct **10% flat + 2.9% + $0.30 processing** (~13.5% effective; [official fee article](https://gumroad.com/help/article/66-gumroads-fees), [Cartmango breakdown](https://cartmango.com/gumroad-pricing/)); Gumroad Discover **30% all-inclusive**; Paddle **5% + $0.50** ([Dodo analysis](https://dodopayments.com/blogs/paddle-fees-explained)); Stripe direct **2.9% + $0.30 + 0.5% Stripe Tax** ([fee guide](https://checkoutpage.com/blog/stripe-processing-fees)).

Net-to-you on the relevant price points (domestic US card; buyer-side tax on MoR platforms is added on top of price and excluded):

| Platform | $49 | $149 | $199 | $599 | Effective % at $149 |
|---|---|---|---|---|---|
| Stripe direct (+Stripe Tax) — *you are the merchant of record* | $47.03 | $143.63 | $191.93 | $578.33 | 3.6% |
| Polar, Pro plan ($20/mo) | $46.74 | $142.94 | $191.04 | $575.84 | 4.1% |
| Polar, Starter (new org) | $46.05 | $141.05 | $188.55 | $568.55 | 5.3% |
| Paddle | $46.05 | $141.05 | $188.55 | $568.55 | 5.3% |
| Gumroad direct | $42.38 | $129.48 | $173.03 | $521.43 | 13.1% |
| Gumroad Discover | $34.30 | $104.30 | $139.30 | $419.30 | 30% |

Footnotes that matter: Polar additionally charges payout fees of **$2 per payout month + 0.25% + $0.25 per withdrawal** — batch payouts monthly and it's noise. Several third-party sources report an extra **$0.50/transaction on Gumroad direct** beyond the official fee page ([Dodo](https://dodopayments.com/blogs/gumroad-fees-explained), [Swell](https://www.swell.is/content/gumroad-pricing)) — verify on the first live sale, budget ~13%. Upgrade to Polar's $20/mo Pro plan once you clear ~11 paid orders/month — at a $149 ASP each sale saves $1.89, so the plan pays for itself above that volume.

The stakes at scale, per the critique: **at 1,000 Pro-tier sales, Gumroad-direct vs. Polar is roughly an $11–13k fee difference.** That alone disqualifies Gumroad as the home base.

### 5.2 Merchant-of-record and tax, for a solo creator

Stripe-direct's 3.6% is a trap for a one-person operation: Stripe Tax *calculates* tax but **does not register or file for you**. You would personally monitor US economic-nexus thresholds (typically $100k or 200 transactions per state post-Wayfair), register state by state, and file EU VAT OSS returns ([MoR guide](https://fungies.io/merchant-of-record-guide/), [digital-goods tax guide](https://www.taxually.com/blog/sales-tax-on-digital-goods-a-guide-for-businesses)). That is the single biggest hidden cost in the comparison and it lands entirely inside your ≤10 hrs/week budget. Polar, Gumroad ([full MoR since Jan 1, 2025](https://gumroad.gumroad.com/p/gumroad-is-becoming-a-merchant-of-record-more-updates)), and Paddle are all merchants of record: they calculate, collect, and remit globally, and they issue the tax invoices. The ~1.7-point fee premium over Stripe-direct is the cheapest bookkeeper you will ever hire.

### 5.3 License capability — the decisive axis

Fees are within two points of each other among the MoR options; licensing capability is not. This product's core promise is license-gated web access, so the license layer is the real product decision:

| Capability | Polar | Gumroad | Lemon Squeezy | Paddle |
|---|---|---|---|---|
| Activation/device limits | **Enforced**, per-instance labels | None — raw `uses_count`, you enforce in code | Enforced | No native licensing (pair Keygen) |
| Revocation on refund | **Automatic** (key revoked when benefit revoked, configurable) | **Manual** — verify keeps succeeding; you must check `refunded` flags / disable via API | Effectively webhook-driven/manual for one-time orders | Yours to build |
| Customer self-service portal (seat management) | **Yes, hosted** | No | No | No |
| Public-safe validate/activate endpoints | Yes | Verify is public (quirk: `increment_uses_count` defaults **true**) | Yes (60 req/min) | n/a |
| Entitlement changes without new keys | **Yes — benefits decoupled from keys** | No entitlement model | Per-order keys; upgrades issue new keys | n/a |

Sources: [Polar license-key API](https://polar.sh/docs/api-reference/customer-portal/license-keys/activate), [Gumroad verify API](https://dev.to/zsevic/license-key-verification-with-gumroad-api-58f9), [LicenseSeat on Gumroad's licensing limits](https://licenseseat.com/alternative-to-gumroad), [LS license API](https://docs.lemonsqueezy.com/api/license-api).

Polar is the only MoR that ships enforced activation limits, automatic refund revocation, and a hosted seat-management portal — which is exactly the admin tooling you would otherwise hand-build (and, on Gumroad, *did* hand-build in the first draft of the gating architecture: the `uses_count` cap, the webhook-as-hint trust model, and manual refund revocation are all workarounds for Gumroad weaknesses Polar doesn't have). [03-licensing-architecture.md](03-licensing-architecture.md) is written Polar-first accordingly, with the Gumroad adapter carrying those workarounds only for the secondary channel.

**Why not Lemon Squeezy, despite an excellent license API:** [acquired by Stripe in July 2024](https://www.lemonsqueezy.com/blog/stripe-acquires-lemon-squeezy); its successor, Stripe Managed Payments, went public preview February 2026, and the LS team is [openly building migration paths off LS](https://www.lemonsqueezy.com/blog/2026-update). Never build a new integration on a sunsetting product.

### 5.4 Platform risks and the two fallbacks

Polar's risk profile is honest but acceptable: a young company (v1.0 September 2024), [$10M Accel-led seed](https://polar.sh/blog/polar-seed-announcement), and it has already repriced once (May 2026 — grandfathering pre-existing orgs at 4% + $0.40). Mitigants: the platform is [Apache-2.0 open source and self-hostable](https://docs.polar.sh/developers/open-source), and your integration surface — validate/activate/deactivate plus webhooks — is deliberately small behind `LicenseService`. If Polar falters:

- **Fallback 1: Stripe Managed Payments + Keygen.** Stripe-grade rails *with* MoR (public preview Feb 2026, GA expected); [Keygen](https://keygen.sh/) is Fair Source with a self-hostable Community Edition and a [documented Stripe integration](https://keygen.sh/integrate/stripe/). The natural landing spot.
- **Fallback 2: Paddle + Keygen.** The most durable boring MoR ([established, strict onboarding vetting](https://dodopayments.com/blogs/paddle-review)), at the cost of owning the license layer. Note Paddle keeps its fee on refunds.

Migration cost in either case: implement one new `LicenseService` adapter, re-point checkout links, and email the buyer list (which you own, in Kit — the reason the continuous buyer-export in [05-operations-legal-sustainability.md](05-operations-legal-sustainability.md) is non-negotiable).

### 5.5 Why Gumroad survives at all, and what the dual channel costs

Gumroad keeps a job because it has two assets Polar doesn't: consumer brand recognition ("buy it on Gumroad" needs no explanation) and the **Discover marketplace**, which puts the product in front of buyers you didn't acquire. Discover's 30% is indefensible as a fee and perfectly fine as a **customer-acquisition cost** — a $149 Discover sale netting $104.30 is a paid-marketing channel where the ad only costs money when it converts, and the buyer's email still lands in Kit.

Operational cost of the dual channel, priced honestly:

- **Two adapters** behind `LicenseService` ([03-licensing-architecture.md](03-licensing-architecture.md)): the Gumroad adapter carries the extra weight — `increment_uses_count: false` on re-verifies, in-code activation caps, refund handling via webhook-then-confirm because [refunds do not kill Gumroad keys](https://licenseseat.com/alternative-to-gumroad).
- **Two webhook endpoints, two revocation paths** (Polar automatic, Gumroad manual-via-API).
- **Two buyer-export jobs** into Kit, and per-channel UTM/attribution discipline (Plausible funnel events tagged by platform).
- **A cash-flow caveat to resolve before relying on it:** sources conflict on whether Gumroad's payout minimum rose from $10 to **$100 in March 2026** ([report](https://blog.scriptbuybd.com/product/gumroad-payout-threshold-10-vs-100)) — verify in the dashboard; Gumroad also carries 2025–26 reports of frozen balances and slow support ([Swell](https://www.swell.is/content/gumroad-pricing)). Treat Gumroad revenue as delayed and Gumroad as expendable.

If the Discover channel doesn't produce sales within two quarters, kill the storefront and the adapter and simplify.

---

## 6. Team edition: operational design

The team tier is the highest-margin SKU and previously had zero operational design. Here is the whole machine:

**Licensing.** One Polar license key with **10 enforced activations** — Polar's activation limits with per-instance labels make one-key-N-seats native ([license-key benefits](https://polar.apidocumentation.com/documentation/features/benefits/license-keys)). No per-seat key generation, no seat-assignment admin UI to build.

**Buyer-side flow.** The buyer (usually a platform lead or eng manager) purchases once, receives one key and a one-page "distribute this" note: forward the key + `/unlock` URL to up to 10 named users; each activation is labeled (person's name or machine) and visible in **Polar's hosted customer portal**, where the buyer can free a seat themselves when someone leaves. Self-service seat management is the difference between a Team tier and a support queue. License terms: Team = 10 **named** users, per [05-operations-legal-sustainability.md](05-operations-legal-sustainability.md).

**Invoices, POs, W-9s.** Because Polar is the merchant of record, checkout produces a proper tax invoice — the thing Gumroad is weak at and procurement departments require. When procurement asks for a W-9 or vendor form, the answer is that the seller of record is the MoR platform, not you personally; supply Polar's merchant details and your standard reply template. Expect a handful of procurement emails per quarter; they fit inside the ~4 hrs/week support budget (D10, [05-operations-legal-sustainability.md](05-operations-legal-sustainability.md)). You field them — there is no one else — but with a saved-replies file, each is minutes.

**The expense-request template is a sales asset, not an afterthought.** [Orosz publishes a ready-made request-to-expense template](https://blog.pragmaticengineer.com/request-to-expense-the-pragmatic-engineer-newsletter/) and [Lenny sells an explicit $300 "I Can Expense It" tier](https://www.lennysnewsletter.com/p/productpass) — because the real Team-tier buyer journey is an IC convincing a manager. A cost-*reduction* product is the easiest expense claim in software. Ship the fillable expense-request .docx inside Pro (so individuals can upgrade themselves into Team) and link it prominently on the pricing page: "Want your company to pay? Use this."

**When to graduate to custom quotes.** Triggers: >10 seats requested, a security questionnaire, or PO-based invoicing on a deal ≥ ~$2k. Response: manual quote (per-seat pricing off the $59.90/seat baseline, volume discount at 25+), invoiced through the platform where possible. Do **not** build sales infrastructure for this until it happens at least monthly; until then it is an email thread, and that is fine.

---

## 7. The Amazon KDP / Leanpub complement

The cheap edition is a funnel and a credibility floor, not a revenue line. The evidence for bothering at all: [Amazon KDP drove ~60% of week-one volume for Arvid Kahl's *Zero to Sold*](https://www.indiehackers.com/post/zero-to-sold-1000-books-sold-in-7-days-here-are-the-numbers-0954b31c39), and traditional books anchor the category's credibility at $10–65 ([Huyen $39.99](https://huyenchip.com/books/), [Packt $29.99](https://www.packtpub.com/en-us/product/llm-engineers-handbook-9781836200079), [Walling's $10 SaaS Playbook](https://saasplaybook.com/order)). "Available on Amazon" is a trust signal no Gumroad page provides.

**Royalty math.** Kindle at **$9.99** sits at the top of KDP's 70% royalty band ($2.99–9.99): ≈ **$7.00/sale** before Amazon's small per-MB delivery fee — a text-only book loses cents, not dollars. The **~$24.95 print-on-demand paperback** earns standard print royalties (60% of list minus printing cost), realistically **~$8–11 per copy** for a book this size; treat the paperback as a business card that pays for itself. Verify both at KDP setup — these are list-standard figures, not contract terms.

**Price-separation logic — why $9.99 doesn't cannibalize $149.** The KDP edition is the **condensed narrative handbook only**: no Operator Toolkit, no calculators, no web access, no living pricing dataset, no updates (a printed book about token prices is stale by design — say so in its introduction, and make staleness itself the argument for Pro). The $149 buyer is buying artifacts and freshness; the $9.99 buyer is buying an airplane read. These are different products for different moments, and the cheap one is allowed to sell the expensive one: the **back-of-book CTA** offers a discount code into Pro ("this book's living edition, calculators, and toolkit: tokenops.kalilurrahman.com/pro — code PAPERBACK for $20 off"), converting Amazon's audience — which you can't email — into site buyers you can. Track the code in Plausible/Polar as its own channel.

**ISBN.** Kindle ebooks need no ISBN; KDP assigns a free ISBN for the paperback (adequate — a purchased ISBN matters only if wide print distribution ever matters, which it doesn't yet).

**Leanpub** is the optional third leg: markdown-native (this repo's pipeline feeds it almost directly), **80% royalty**, and its in-progress publishing model suits shipping the Handbook chapter-by-chapter during the presale runway if you want public momentum. Keep it strictly as a distribution experiment: canonical sales, license keys, and the buyer relationship stay on Polar. Do not let a third storefront add a third adapter — Leanpub sells only the plain book, never the licensed product.

---

## 8. Refund policy

**Customer-facing guarantee (verbatim, on pricing page and receipts):**

> **30-day guarantee.** If the Handbook or Toolkit isn't worth what you paid, reply to your receipt within 30 days and you'll get a full refund — no forms, no questions. Refunds deactivate the license key and web access.

Thirty days is the norm across the comps and a proven conversion lever; a confident guarantee costs less than the sales it creates, *provided* the content passes 01's quality bar first — the guarantee is exactly why the fact/math pass is launch-blocking.

**EU 14-day withdrawal.** EU consumers hold a 14-day withdrawal right on digital content, waived when the buyer expressly consents to immediate delivery and acknowledges losing the right. As merchant of record, Polar (and Gumroad) implement this consent-on-delivery flow in checkout — verify the consent step is enabled on each product at setup ([05-operations-legal-sustainability.md](05-operations-legal-sustainability.md) owns the policy text). Practically, the 30-day guarantee is more generous than the statutory right, so the waiver never becomes a customer-facing fight.

**Refund → revocation linkage.** A refund is a license event, not just a payment event: platform webhook → confirm against the verify API → KV denylist → key dead, downloads stop, web session lapses at next re-verify. On Polar this revocation is automatic at the platform level as well; on Gumroad the adapter does it manually. Full flow in [03-licensing-architecture.md](03-licensing-architecture.md). One accounting note for the fallback path: [Paddle returns the buyer's money but keeps its fee on refunds](https://dodopayments.com/blogs/paddle-fees-explained) — a small structural argument for keeping refund rates low through quality rather than policy.

---

## 9. Revenue scenarios — the honest math

Assumptions stated first; every number below is derived from them, and none of this is a forecast — it is a sanity check that the effort clears a bar worth ≤10 hrs/week.

- **Tier mix:** 30% Handbook / 62% Pro / 8% Team — consistent with [Barry's top-tiers-dominate revenue data](https://nathanbarry.com/double-launch-revenue/) while assuming most *units* are cheap.
- **ASP from that mix:** presale ≈ **$109** (0.30×$39 + 0.62×$99 + 0.08×$449); full price ≈ **$158**.
- **List conversion in the launch window: 2–3%** — deliberately below [Barry's 5.3% visitor→lead capture rate](https://nathanbarry.com/ongoing-sales/) (a different, easier metric) and consistent with warm-list buying norms.
- **Launch spike** (HN/PH/social, per [04-marketing-and-launch.md](04-marketing-and-launch.md)): 0.5–1× the list-driven unit count, at full price.
- **Fees:** Polar Starter ≈ 5.3–6% all-in → net multiplier ~0.94.

| | Conservative | Base | Upside |
|---|---|---|---|
| List at launch (Kit, after 8–10 wk runway) | 1,500 | 3,000 | 5,000 |
| List conversion → units | 2.0% → 30 | 2.5% → 75 | 3.0% → 150 |
| List revenue @ $109 ASP | $3.3k | $8.2k | $16.4k |
| Spike units @ $158 ASP | 15 → $2.4k | 40 → $6.3k | 90 → $14.2k |
| **Launch-window gross** | **≈ $5.6k** | **≈ $14.5k** | **≈ $30.6k** |
| Steady state (mo 2–12) | 12 sales/mo → $1.9k/mo | 25 sales/mo → $4.0k/mo | 45 sales/mo → $7.1k/mo |
| KDP + code-redemption trickle | ~$1k/yr | ~$3k/yr | ~$5k/yr |
| Black Friday / reactivation event | — | — | ~$8k |
| **Year-1 gross** | **≈ $26k** | **≈ $59k** | **≈ $118k** |
| **Year-1 net of platform fees** | **≈ $24k** | **≈ $55k** | **≈ $111k** |

Sanity anchors, not aspirations: swyx's launch did [$25k on ~600 units at a $42 ASP](https://www.swyx.io/writing/coding-career-launch) with a far larger audience than this list will have — the base case's $14.5k launch is appropriately below it. Vassallo's [$45k in 14 days](https://www.writerontheside.com/40k-in-16-days-from-daniel-vassallo-and-the-good-parts-of-aws/) rode a large Twitter following; the upside case approaches but doesn't assume it. Comeau's $550k is the outlier that proves the audience-first mechanism, not a planning input.

What the scenarios are sensitive to, in order: **(1) list size at launch** — which is why the runway in [04-marketing-and-launch.md](04-marketing-and-launch.md) precedes everything; **(2) tier mix** — watch the ASP guardrail in §1; **(3) steady-state sales rate** — driven by the freshness stream (Token Price Watch, monthly dataset refreshes) that keeps the product visibly alive. Nothing here assumes virality, Discover performing, PPP, or the video tier. Each of those is upside on top of a plan that already clears the bar without them.
