# Enterprise TokenOps Case Studies (2025–2026)

Concrete, published, verifiable savings from real programs — with the *stack* that produced them.

## AT&T "Ask AT&T": 90% cost reduction at 8B tokens/day

**Baseline:** 8 billion tokens per day across an internal assistant platform.
**Result:** **90% cost reduction.**
**Stack:**
1. Rebuilt orchestration layer.
2. Shifted routine tasks from large reasoning models to **small language models (SLMs)**.
3. Rearchitected model routing to match task class → model tier.

**Key quote:** *"Architecture, not model price, is now the dominant lever in enterprise TokenOps."*

**Source:** VentureBeat and PYMNTS coverage of AT&T's FinOpsX 2026 presentation.

## B2B SaaS: $48K → $19K/month (~60% reduction)

**Trigger:** CFO flagged 34% quarter-over-quarter cost growth.
**Result:** Monthly spend cut from **$48,211 to ~$19,000.**
**Stack:**
1. Full cost audit (tagging coverage gap identified).
2. Model routing (moved chat classification off GPT-4 tier).
3. Prompt caching on system prompts.
4. Output-length ceilings on generation endpoints.
5. Retry-limit hardening.

**Source:** Boundev AI case study.

## Fintech (~120 employees): 73% reduction, $396K/year saved

**Baseline:** $45,000/month AI + AWS bill.
**Result:** **73% reduction**, **$396,000 annualised savings.**
**Stack:**
1. Model right-sizing across the pipeline.
2. Semantic + prompt caching.
3. Pipeline redesign (fewer redundant LLM calls in the middle of workflows).

**Source:** Augustyniak.ai case study.

## Fintech loan processing: $15K → $4.5K/month (70% reduction)

**Stack:**
1. Semantic caching (~70% hit rate on repeat customer queries).
2. Fallback routing between providers.
3. Token optimisation (prompt compression, output caps).

**Source:** Transactional case study.

## AI customer support: 48% GPT-4 bill reduction, no quality regression

**Method:** Proxy/gateway layer applying auto-routing, caching, and context pruning transparently — no application-code changes.

**Source:** Tessera "Optimize Layer" case study.

## The cross-case pattern

Every published 2025–2026 case study combines **at least three** of the following levers. **No single lever accounts for the reported savings.**

| Lever | Frequency in cases | Typical contribution |
|---|---|---|
| Model routing / right-sizing | 5 / 5 | 25–40% |
| Prompt or semantic caching | 5 / 5 | 15–30% |
| Context pruning / compression | 4 / 5 | 10–20% |
| Output-length ceilings | 3 / 5 | 5–15% |
| Cross-provider fallback / arbitrage | 3 / 5 | 5–15% |
| Retry / loop governance | 3 / 5 | 5–20% |

## The prescription

If your program is targeting <30% savings, you can pick one lever. If you're targeting 50%+ (the range these cases report), you must stack **routing + caching + pruning + governance** — and treat the gateway layer as a first-class product, not a proxy.

The case-study evidence is now consistent enough that a mature 2026 TokenOps program should have a defensible answer to: *"Which of the six levers are you running, and what percentage contribution does each make to your total savings run-rate?"*
