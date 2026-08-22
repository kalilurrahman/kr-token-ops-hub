# Model Routing & Cascades

Routing moves each request to the cheapest model that clears the quality bar. Mature 2026 programs route 60–90% of traffic away from their flagship model with no measurable quality loss.

## 1. The three routing strategies

**Static routing (start here).** Map endpoint → model by task class. No runtime classifier, no latency cost, easy to reason about. Captures most of the available savings.

**Cascade routing.** Try the cheap model; escalate on a confidence or validation failure.

```
expected_cost = c_small + p_escalate × (c_large + overhead)
```

A cascade only wins when `p_escalate` is low. With a small model at 1/20th the price, escalation must stay under roughly 50% for the cascade to beat always-large; under 20% for a comfortable win.

**Learned routing.** A small classifier predicts difficulty and picks a tier. Worth it above roughly 1M requests/month; below that, the maintenance and misroute risk exceeds the savings.

## 2. Task-to-tier mapping

| Task class | Tier | Notes |
|---|---|---|
| Classification, routing, tagging, PII redaction | Nano / small | Often a fine-tuned or open-weight 3–8B model |
| Extraction, summarisation, format conversion | Small | Strict schema; low reasoning |
| Drafting, rewriting, standard code edits | Mid | Cache the style guide prefix |
| Multi-file refactor, hard analysis, planning | Flagship | Reasoning budget medium/high |
| Adversarial, safety-critical, legal review | Flagship + human | Never auto-approve |

## 3. Escalation signals that actually work

- Schema validation failure (deterministic, free).
- Self-reported confidence below threshold — weak alone, useful combined.
- Judge-model disagreement on a sampled subset, not on every call.
- Downstream tool failure or empty retrieval.
- User-visible correction or regenerate click — the strongest label you own.

Avoid escalating on response length or on the model saying "I'm not sure" in prose.

## 4. Fallback vs routing

Keep them separate in code and in metrics:

- **Routing** is a cost decision, made before the call.
- **Fallback** is an availability decision, made after a 429/5xx.

Fallback should prefer a *different provider at similar quality*, not a cheaper tier — silently degrading quality during an incident is how routing programs lose trust.

## 5. Quality gates before a swap

1. Golden set of 200+ graded real requests per endpoint.
2. Head-to-head with the incumbent; require parity within a defined tolerance.
3. Shadow traffic for 3–7 days, comparing cost, latency p95, retry rate.
4. Canary at 5% → 25% → 100% with automatic rollback on retry-rate regression.
5. Record the decision in an ADR with the measured numbers.

## 6. Common failure modes

- Routing on prompt length rather than task difficulty.
- Letting the classifier itself cost more than the savings (use a tiny model or heuristics).
- Cascades that re-send the full context on escalation instead of reusing a cached prefix.
- No per-tier dashboards — you cannot defend routing without per-tier quality metrics.
