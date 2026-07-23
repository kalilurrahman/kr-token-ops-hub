# TokenOps KPI Benchmarks (2026)

*Numbers your program can be measured against — sourced from published case studies, vendor benchmarks, and 2026 FinOps for AI reports.*

## Tier 1: cost efficiency

| KPI | Definition | 2026 benchmark |
|---|---|---|
| **Cost per successful outcome** | $ per user-defined success event | Track relative; industry median declining ~40% YoY |
| **Cost per DAU** | Monthly LLM spend ÷ daily active users | $0.10–$2.00 consumer; $5–$50 enterprise |
| **Token yield** | Useful output tokens ÷ total output tokens | Target **>80%**; <60% indicates retry waste |
| **Cached input ratio** | Cached input ÷ total input | Mature program: **>50%**; best-in-class: >70% |
| **Reasoning ratio** | Reasoning tokens ÷ total output | Should be **<2×** overall; >5× on any feature = misrouting |

## Tier 2: reliability & governance

| KPI | Definition | 2026 benchmark |
|---|---|---|
| **Tagging coverage** | % of spans with tenant + feature + model tags | **>95%** required |
| **Budget-alert MTTR** | Time from alert to mitigation | <2h hard limits; <24h warnings |
| **Kill-switch time-to-halt** | Alert → agent terminated | <60 seconds |
| **Model-version drift** | # of undeclared model versions in prod | **0** — every version pinned |
| **Prompt-registry coverage** | % of prompts under version control | **100%** — no exceptions |

## Tier 3: quality & user impact

| KPI | Definition | 2026 benchmark |
|---|---|---|
| **Regeneration rate** | User-triggered re-runs ÷ total generations | <10% healthy; >20% quality regression |
| **Thumbs-down rate** | Explicit negative feedback ÷ generations | <5% target |
| **P95 latency (TTFT)** | Time to first token | <1s frontier chat; <300ms SLM classification |
| **Eval regression rate** | % of golden-set items regressed vs previous | <3% per version change |

## Tier 4: environmental

| KPI | Definition | 2026 benchmark |
|---|---|---|
| **Energy per useful output (kWh)** | Google/CMU methodology | Report; benchmarks emerging |
| **Water per useful output (mL)** | Data-center water withdrawal | Report; ESG-team driven |
| **CO2e per 1K requests** | FOCUS-AI carbon accounting | Report + trend |

## The maturity signal

A Level 4 (Governed) TokenOps program in 2026 can answer, on demand:
1. Cost per successful outcome by feature, MoM.
2. Cached-input ratio and its trend.
3. Which three features contribute >60% of spend, and each one's plan.
4. Total reasoning-token spend last month, and whether it was justified.
5. Carbon per 1K requests.
6. Smallest model validated as capable for each task class.

If any of these produces a shrug, the program is Level 2 (Reactive) or below, regardless of dashboard count.

## Anti-benchmarks (numbers that lie)

- **Total token count.** Increasing volume ≠ inefficiency; may be growth.
- **Average cost per call.** Averages hide long tails. Use P50 / P95 / P99.
- **Model-provider count.** More providers ≠ more resilience if routing is broken.
- **Dashboard count.** 12 dashboards with no owners < 1 dashboard with accountability.

## Reporting cadence

| Cadence | Audience | KPIs |
|---|---|---|
| Real-time | On-call | Budget-burn %, kill-switch triggers, P95 latency |
| Daily | Feature owners | Cost per outcome, regeneration rate |
| Weekly | Eng leads | Cache hit trend, model-mix drift, top-10 spend deltas |
| Monthly | Finance / CFO | Total spend, forecast vs budget, per-tenant allocation |
| Quarterly | Exec / board | Cost per DAU trend, ROI, carbon per outcome, roadmap |
