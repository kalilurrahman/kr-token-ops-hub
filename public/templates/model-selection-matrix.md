# Model Selection Matrix — Cost-Optimized LLM Routing

> **Purpose:** Match each task type to the cheapest model that meets quality requirements.  
> **Principle:** Start with the smallest viable model; upgrade only when measurable quality thresholds are missed.  
> **Last Updated:** 2026-05-25

---

## Decision Matrix

| Task Type | Example Use Cases | Baseline Model | Cheaper Alternative | Quality Threshold | Testing Steps | Expected Savings |
|-----------|------------------|----------------|--------------------|--------------------|---------------|-----------------|
| **Classification** | Intent detection, sentiment analysis, spam filtering, content moderation, topic tagging | GPT-4o | GPT-4o-mini / Gemini 2.5 Flash | ≥95% accuracy vs. baseline on held-out test set (n ≥ 500) | 1. Label 500 examples with baseline 2. Run cheaper model 3. Compare accuracy & F1 | 60–80% per request |
| **Extraction** | Named entity recognition, field extraction from invoices, address parsing, key-value extraction from contracts | GPT-4o | GPT-4o-mini / Claude Haiku | ≥93% field-level F1; zero tolerance on critical fields (amounts, dates) | 1. Curate 200 annotated documents 2. Run both models 3. Score per-field F1 | 50–75% per request |
| **Summarization** | Meeting notes, article summaries, support ticket digests, changelog summaries | Claude Sonnet | GPT-4o-mini / Gemini 2.5 Flash | ROUGE-L ≥ 0.40 AND human preference rating ≥ 4.0/5.0 on 50-sample eval | 1. Generate summaries with both 2. Auto-score ROUGE 3. Human-rate 50 samples | 40–65% per request |
| **Generation** | Email drafts, marketing copy, product descriptions, chatbot replies | GPT-4o | GPT-4o-mini / Claude Haiku | Human preference A/B: cheaper model preferred or tied ≥ 60% of the time | 1. Generate 100 pairs 2. Blind human eval 3. Statistical significance test | 50–70% per request |
| **Complex Reasoning** | Multi-step math, legal analysis, medical Q&A, financial modeling, research synthesis | GPT-4o / Claude Opus | Claude Sonnet / GPT-4o | ≥90% correctness on curated benchmark (n ≥ 100); no regression on edge cases | 1. Build domain-specific benchmark 2. Run both models 3. Expert review failures | 20–40% per request |
| **Code Generation** | Function implementation, code review, bug fixing, test generation, refactoring | Claude Sonnet / GPT-4o | GPT-4o-mini / Gemini 2.5 Flash | Pass rate ≥ 90% on unit test suite; no security regressions on SAST scan | 1. Collect 50 real coding tasks 2. Auto-run test suites 3. SAST scan outputs | 30–60% per request |

---

## Routing Logic

The gateway evaluates every inbound request and selects the optimal model based on task type, quality constraints, and cost.

```
┌──────────────┐
│ Incoming      │
│ LLM Request   │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ 1. Classify use_case │  ← from request tags (see request-tagging-schema.yaml)
│    (task type)       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ 2. Look up model candidates for this task    │
│    Candidates = MODEL_MATRIX[use_case]       │
│    Ordered: cheapest → most expensive        │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ 3. Check quality gate                        │
│    IF quality_score[candidate] >= threshold  │
│       → SELECT candidate                     │
│    ELSE                                      │
│       → TRY next candidate (more expensive)  │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ 4. Apply overrides                           │
│    IF priority == "critical"                 │
│       → FORCE baseline model                 │
│    IF environment != "production"            │
│       → ALLOW cheapest model always          │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│ Route to      │
│ selected      │
│ model         │
└──────────────┘
```

### Pseudocode

```python
def select_model(request):
    """Select the cheapest model that meets the quality threshold."""
    
    task_type  = request.tags["use_case"]
    priority   = request.tags.get("priority", "medium")
    env        = request.tags["environment"]

    candidates = MODEL_MATRIX[task_type]  # ordered cheapest → expensive

    # Override: critical requests always use baseline
    if priority == "critical":
        return candidates.baseline_model

    # Override: non-prod always uses cheapest
    if env != "production":
        return candidates[0]

    # Standard path: cheapest model that clears the quality gate
    for model in candidates:
        if model.quality_score >= candidates.quality_threshold:
            return model

    # Fallback: baseline model
    return candidates.baseline_model


def evaluate_quality(model, task_type, test_set):
    """Run the model against a labeled test set and return quality score."""
    
    predictions = [model.predict(sample.input) for sample in test_set]
    
    if task_type in ("classification", "extraction"):
        return compute_f1(predictions, test_set.labels)
    
    elif task_type == "summarization":
        rouge  = compute_rouge_l(predictions, test_set.references)
        human  = human_preference_score(predictions, test_set.references)
        return min(rouge, human)  # both gates must pass
    
    elif task_type == "generation":
        return human_ab_preference(predictions, test_set.baseline_outputs)
    
    elif task_type == "complex_reasoning":
        return accuracy(predictions, test_set.gold_answers)
    
    elif task_type == "code_generation":
        pass_rate  = run_test_suites(predictions, test_set.test_suites)
        sast_clean = sast_scan(predictions)
        return pass_rate if sast_clean else 0.0
```

---

## A/B Testing Protocol

Follow these steps before promoting a cheaper model to production.

### Step 1 — Offline Evaluation

| Action | Detail |
|--------|--------|
| Curate test set | ≥100 representative examples with ground-truth labels or human judgments |
| Run both models | Generate outputs from baseline and candidate on the full test set |
| Score automatically | Compute task-specific metrics (accuracy, F1, ROUGE, pass rate) |
| Human evaluation | For generation & summarization: blind side-by-side rating (≥50 samples) |
| Statistical test | Ensure candidate meets threshold with p < 0.05 (paired t-test or McNemar's) |

### Step 2 — Shadow Mode (1 Week)

| Action | Detail |
|--------|--------|
| Deploy candidate in shadow | Candidate runs in parallel but responses are discarded |
| Compare latency | Candidate P99 latency must be ≤ 1.5× baseline |
| Monitor errors | Candidate error rate must be ≤ baseline |
| Validate cost | Confirm projected cost savings are within ±10% of estimate |

### Step 3 — Live A/B Test (2 Weeks)

| Action | Detail |
|--------|--------|
| Traffic split | Route 10% of production traffic to candidate model |
| Monitor metrics | Track quality metrics, latency, error rate, and user satisfaction |
| Escalation criteria | Roll back immediately if quality drops >2% or error rate doubles |
| Expand gradually | 10% → 25% → 50% → 100% over 2 weeks if metrics hold |
| Document results | Record final metrics, savings, and any edge-case failures |

### Step 4 — Post-Migration

| Action | Detail |
|--------|--------|
| Update routing config | Set candidate as primary model for this task type |
| Archive baseline | Keep baseline available for fallback (do not delete) |
| Set review cadence | Re-evaluate quality quarterly or when provider ships a new model version |
| Update cost model | Refresh forecasts with actual post-migration costs |

---

## Cost Comparison Quick-Reference

> Prices as of May 2026. Always verify current rates with the provider.

| Model | Input ($/1M tokens) | Output ($/1M tokens) | Relative Cost Index |
|-------|---------------------|----------------------|---------------------|
| GPT-4o | $2.50 | $10.00 | 1.00× (baseline) |
| GPT-4o-mini | $0.15 | $0.60 | 0.06× |
| Claude Opus 4 | $15.00 | $75.00 | 6.00× |
| Claude Sonnet 4 | $3.00 | $15.00 | 1.20× |
| Claude Haiku 3.5 | $0.80 | $4.00 | 0.32× |
| Gemini 2.5 Pro | $1.25 | $10.00 | 0.80× |
| Gemini 2.5 Flash | $0.15 | $0.60 | 0.06× |

---

## Decision Checklist

Before finalizing a model selection:

- [ ] Quality threshold defined with a specific, measurable metric
- [ ] Test set curated with ≥100 representative examples
- [ ] Offline evaluation completed and threshold met
- [ ] Shadow mode run for ≥1 week with no anomalies
- [ ] A/B test run at 10% traffic for ≥1 week
- [ ] Rollback plan documented and tested
- [ ] Cost savings validated against projection
- [ ] Routing config updated and peer-reviewed
- [ ] Monitoring alerts set for quality regression
- [ ] Results documented in the optimization tracker

---

*Template version 1.0 — Maintained by the TokenOps team.*
