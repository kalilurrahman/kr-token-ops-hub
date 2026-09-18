# GPT-5.6 Sol, Terra and Luna: portfolio routing economics

> **Reviewed:** 18/09/2026 · **Status:** Current public API information · **Audience:** Platform engineering, product owners and FinOps

OpenAI's GPT-5.6 family creates a clean three-tier routing ladder. Sol targets complex professional work, Terra balances intelligence and cost, and Luna targets high-volume workloads. All three list a 1.05M context window, 128K maximum output and configurable reasoning effort. The TokenOps opportunity is to treat them as a portfolio—not three isolated model choices.

## Current rate card

| Model | Intended tier | Input / 1M | Cached input / 1M | Output / 1M |
|---|---|---:|---:|---:|
| GPT-5.6 Sol | Complex professional work | $4.00 | $0.40 | $20.00 |
| GPT-5.6 Terra | Balanced intelligence and cost | $2.00 | $0.20 | $12.00 |
| GPT-5.6 Luna | Cost-sensitive volume | $0.20 | $0.02 | $1.20 |

Prompts above 272K input tokens are listed at 2× input and 1.5× output for the full request. Cache writes are 1.25× uncached input. Sol's published rate is promotional through at least 21/11/2026, so forecasts need a review event rather than treating it as permanent.

## Why output control dominates

For a 10K-input, 2K-output request without caching:

| Model | Input cost | Output cost | Total |
|---|---:|---:|---:|
| Sol | $0.04 | $0.04 | $0.08 |
| Terra | $0.02 | $0.024 | $0.044 |
| Luna | $0.002 | $0.0024 | $0.0044 |

Luna is about 18× cheaper than Sol for this shape. But routing decisions must use accepted-outcome economics. A cheap model that creates retries or human corrections can erase its unit-price advantage.

## A production cascade

```text
1. Luna: classify, extract, normalize, route, draft
2. Validate: schema, confidence, business rules, grounded citations
3. Terra: retry ambiguous or medium-complexity cases
4. Validate again
5. Sol: escalate only high-value failures or pre-approved task classes
```

Do not let the models grade themselves as the sole quality control. Use deterministic checks where possible and a separately calibrated evaluator for subjective tasks.

## Routing score

A simple decision score makes policy auditable:

```text
complexity score = domain risk + ambiguity + tool depth + context size + reversibility
```

Score each dimension from 0–2. Suggested starting policy:

- **0–3:** Luna
- **4–6:** Terra
- **7–10:** Sol
- **Regulated or irreversible action:** human approval regardless of score

Tune thresholds with production outcomes, not benchmark headlines.

## Cache-aware prompt design

Place stable content first: policy, schemas, tool definitions, long reference material. Put volatile user data and timestamps last. Track:

- prefix hash and version;
- cache writes and reads;
- hit rate by route and tenant;
- cache-adjusted input cost;
- invalidations caused by prompt changes.

At a 90% cache hit ratio, 100K repeated input tokens on Sol have an average read cost near $0.076 per request after a single $0.50 cache write amortized across ten requests, versus $0.40 each without caching. Real savings depend on provider semantics and traffic reuse.

## Migration experiment

Run a shadow evaluation across representative tasks:

| Metric | Guardrail |
|---|---|
| Accepted outcome rate | No more than agreed quality loss |
| Cost per accepted outcome | Must improve, not merely cost per call |
| p95 latency | Within product SLO |
| Escalation rate | Stable and explainable |
| Retry amplification | No hidden loop growth |
| Long-context incidence | Below budgeted threshold |

Start by moving deterministic and reversible work to Luna. Move medium-risk generation to Terra only after the low tier is stable. Keep Sol capacity for the cases where additional capability changes the business result.

## Contract and forecast controls

- Version the rate card and store its effective date.
- Add an alert before Sol promotional pricing expires.
- Model Standard, Batch/Flex and Fast-mode scenarios separately.
- Include tool-call charges and regional processing uplift.
- Forecast by workload shape: input, cached input, output and calls—not requests alone.
- Re-run the routing evaluation after every model snapshot change.

## Sources

- [GPT-5.6 Sol model documentation](https://developers.openai.com/api/docs/models/gpt-5.6-sol)
- [GPT-5.6 Terra model documentation](https://developers.openai.com/api/docs/models/gpt-5.6-terra)
- [GPT-5.6 Luna model documentation](https://developers.openai.com/api/docs/models/gpt-5.6-luna)
- [OpenAI API pricing](https://developers.openai.com/api/docs/pricing)

> Pricing and promotional terms change. Verify the provider pages before implementation.
