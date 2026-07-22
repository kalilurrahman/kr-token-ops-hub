# GreenOps & FOCUS: TokenOps' Environmental Twin

## FOCUS: the FinOps standard extends to AI

The **FinOps Open Cost and Usage Specification (FOCUS)** reached **v1.4** in June 2026 and now has a dedicated **"FOCUS for AI"** workstream to standardise token-based billing data across vendors. FOCUS 1.5 (in progress) explicitly scopes AI cost accountability improvements.

This matters because AI/token spend does not map cleanly to traditional cloud cost categories:
- Cost driver is *tokens*, not compute-hours.
- Same "resource" (a model call) has three price components (input, cached input, output).
- Reasoning tokens are output-priced but conceptually distinct.
- Fine-tuning, batch, and real-time pricing tiers coexist.

**Enterprise signal:** Walmart is publicly using FOCUS to unify multi-cloud and AI cost accountability — a leading indicator that Fortune 500 FinOps teams are extending existing cloud governance to token spend rather than building parallel systems.

## GreenOps: same techniques, second scoreboard

The 2025–2026 research wave (ACL 2025, arXiv, Google Research) has produced a consistent finding: **the same techniques that cut TokenOps dollars also cut carbon and water footprint.**

- **"Unveiling Environmental Impacts of LLM Serving"** (ACL 2025) argues for standardising environmental impact per *functional unit* (useful response) — not per raw token — because context length and reasoning-token volume distort per-token comparisons.
- **"How Hungry is AI?"** (arXiv 2505.09598) benchmarks energy, **water**, and carbon across LLM inference — introducing water as a third accounting axis for ESG reporting.
- **Google's "Measuring the Environmental Impact of Delivering AI at Google Scale"** (arXiv 2508.15734, Patterson & Dean) is emerging as the de facto methodology enterprises cite for per-query energy/carbon estimation.
- **CMU/Hugging Face "Energy Considerations of LLM Inference"** (ACL 2025) ties efficiency techniques (caching, speculative decoding, quantisation) directly to measurable energy reduction.

## The dual-reporting playbook

For each 2026 TokenOps optimisation, report both scoreboards:

| Optimisation | Dollar impact | Carbon impact (typical range) |
|---|---|---|
| Prompt caching (90% hit rate on 30% of tokens) | −25% $ | −25% CO₂e |
| Route 70% of traffic to Nano/Haiku tier | −40% $ | −35% CO₂e (smaller models = less energy) |
| Context pruning (halve avg context) | −30% $ | −25% CO₂e |
| Reasoning-tier governance (right-size effort) | −15% $ | −20% CO₂e (thinking tokens are energy-heavy) |

## What to add to your 2026 reporting

1. **Cost per useful output**, not cost per token.
2. **Energy per useful output** (kWh), using Google/CMU methodology.
3. **Water per useful output** — increasingly requested by ESG teams.
4. **Cached-token ratio** — a leading indicator of both cost efficiency *and* carbon efficiency.
5. **Reasoning-token ratio** — high reasoning ratio is a red flag on both scoreboards.

## The convergence

GreenOps is not a parallel discipline; it is **TokenOps reported against a second axis**. Teams that mature their FinOps-for-AI practice inherit their GreenOps reporting nearly for free — the metrics, dashboards, and interventions are the same.
