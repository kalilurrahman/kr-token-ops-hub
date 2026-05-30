# Playbook: Migrating from Single-Model to Multi-Model Architecture

**Duration:** 8 weeks  
**Team Required:** 1–2 platform engineers, 1 ML engineer (part-time), 1 FinOps partner  
**Expected Outcome:** 30–60% blended cost reduction with equivalent or better quality

---

## Why Migrate?

Using a single frontier model for all LLM tasks is the most common — and most expensive — pattern in production AI. A multi-model architecture routes each request to the cheapest model that meets quality requirements, achieving dramatic savings on simple tasks while preserving quality on complex ones.

---

## Phase 1: Assessment (Weeks 1–2)

### Step 1: Catalog All Use Cases

Create a spreadsheet of every LLM API call site:

| #   | Service       | Feature             | Task Type                   | Complexity | Monthly Volume | Current Model | Monthly Cost |
| --- | ------------- | ------------------- | --------------------------- | ---------- | -------------- | ------------- | ------------ |
| 1   | Support Bot   | FAQ Response        | Classification + Generation | Simple     | 380,000        | GPT-4o        | $18,500      |
| 2   | Support Bot   | Escalation Analysis | Complex Reasoning           | Complex    | 45,000         | GPT-4o        | $8,200       |
| 3   | Email Gen     | Subject Lines       | Generation                  | Simple     | 200,000        | GPT-4o        | $6,400       |
| 4   | Data Pipeline | Entity Extraction   | Extraction                  | Medium     | 1,200,000      | GPT-4o        | $42,000      |
| 5   | Code Review   | Security Analysis   | Complex Reasoning           | Complex    | 60,000         | GPT-4o        | $12,800      |
| 6   | Reports       | Summarization       | Summarization               | Medium     | 90,000         | GPT-4o        | $7,300       |

### Step 2: Score Each Use Case

For each use case, assign scores:

**Complexity Score (1–5):**

- 1 = Binary classification, simple extraction
- 2 = Multi-class classification, template generation
- 3 = Summarization, structured extraction
- 4 = Multi-step reasoning, creative generation
- 5 = Complex analysis, nuanced judgment

**Quality Sensitivity (1–5):**

- 1 = Internal tool, low stakes
- 2 = Customer-facing, tolerant of minor errors
- 3 = Customer-facing, moderate accuracy needed
- 4 = Financial/legal, high accuracy required
- 5 = Safety-critical, zero tolerance for errors

**Downgrade Candidate Score = Volume × (5 − Complexity) × (5 − Quality Sensitivity)**

Higher scores = better candidates for cheaper models.

### Step 3: Prioritize Migration Targets

Sort by Downgrade Candidate Score. The top 3–5 use cases by score are your migration targets.

**Decision Framework:**

```
IF complexity ≤ 2 AND quality_sensitivity ≤ 3:
    → Strong candidate for economy model (GPT-4o-mini, Haiku, Flash)
    → Expected savings: 80–95%

ELIF complexity ≤ 3 AND quality_sensitivity ≤ 3:
    → Candidate for balanced model (GPT-4o-mini, Sonnet)
    → Expected savings: 30–70%

ELIF complexity ≥ 4 OR quality_sensitivity ≥ 4:
    → Keep on frontier model
    → Optimize via prompt compression, caching instead

ELSE:
    → Evaluate case-by-case with benchmarking
```

---

## Phase 2: Model Evaluation (Weeks 2–4)

### Step 1: Build Test Sets

For each migration target, create a benchmark test set:

| Task Type      | Minimum Test Set Size | What to Include                                          |
| -------------- | --------------------- | -------------------------------------------------------- |
| Classification | 500 samples           | All classes represented, edge cases, ambiguous samples   |
| Extraction     | 300 samples           | Various document types, missing fields, malformed inputs |
| Summarization  | 100 samples           | Short and long inputs, different domains                 |
| Generation     | 100 samples           | Various tones, lengths, formats                          |
| Reasoning      | 200 samples           | Easy + hard problems, multi-step chains                  |

**Test set requirements:**

- [ ] Ground-truth labels from human annotators or validated production outputs
- [ ] Include edge cases (10–15% of set)
- [ ] Include adversarial examples (5% of set)
- [ ] Representative of production distribution
- [ ] Stored in version control for reproducibility

### Step 2: Evaluate Candidate Models

Run each test set against 3–5 candidate models:

**Candidate Models (as of May 2026):**

| Tier     | Models                                           | Approximate Cost      |
| -------- | ------------------------------------------------ | --------------------- |
| Economy  | GPT-4.1-nano, Gemini 2.5 Flash, Llama 4 Scout    | $0.05–0.30/1M tokens  |
| Balanced | GPT-4.1-mini, Claude Haiku 3.5, Llama 4 Maverick | $0.15–4.00/1M tokens  |
| Frontier | GPT-4.1, Claude Sonnet 4, Gemini 2.5 Pro         | $1.25–15.00/1M tokens |

### Step 3: Record Results

| Use Case     | Model             | Accuracy/Quality | Latency (p95) | Cost/Request | Quality vs. Baseline | Cost Savings |
| ------------ | ----------------- | ---------------- | ------------- | ------------ | -------------------- | ------------ |
| FAQ Response | GPT-4o (baseline) | 97.2%            | 1.8s          | $0.048       | —                    | —            |
| FAQ Response | GPT-4.1-mini      | 96.1%            | 0.9s          | $0.003       | −1.1%                | 94%          |
| FAQ Response | Gemini 2.5 Flash  | 95.4%            | 0.6s          | $0.001       | −1.8%                | 98%          |
| FAQ Response | Llama 4 Maverick  | 95.8%            | 1.1s          | $0.004       | −1.4%                | 92%          |

### Step 4: Set Quality Thresholds

Define minimum acceptable quality for each use case:

| Use Case          | Metric         | Threshold       | Rationale                       |
| ----------------- | -------------- | --------------- | ------------------------------- |
| FAQ Response      | Accuracy       | ≥ 94%           | Customer-facing but low stakes  |
| Entity Extraction | Field-level F1 | ≥ 93%           | Data quality impacts downstream |
| Summarization     | Human eval ≥   | 4.0/5.0         | Must be coherent and complete   |
| Subject Lines     | A/B CTR delta  | < 3% regression | Revenue impact                  |
| Security Analysis | Detection rate | ≥ 98%           | Safety-critical                 |

---

## Phase 3: Routing Architecture (Weeks 3–5)

### Step 1: Design the Router

```
                    ┌─────────────────┐
                    │  API Gateway     │
                    │  (tag + log)     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Task Classifier │
                    │  (rule-based)    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼──────┐ ┌────▼──────┐ ┌─────▼─────┐
     │ Economy Tier  │ │ Balanced  │ │ Frontier  │
     │ GPT-4.1-nano  │ │ GPT-4.1-  │ │ GPT-4.1   │
     │ Gemini Flash  │ │  mini     │ │ Claude    │
     │               │ │ Haiku 3.5 │ │ Sonnet 4  │
     └───────────────┘ └───────────┘ └───────────┘
```

**Routing Rules (YAML):**

```yaml
routing:
  rules:
    - match:
        task_type: classification
        complexity: [simple, medium]
      route_to: economy
      fallback: balanced

    - match:
        task_type: extraction
        complexity: simple
      route_to: economy
      fallback: balanced

    - match:
        task_type: [extraction, summarization]
        complexity: medium
      route_to: balanced
      fallback: frontier

    - match:
        task_type: [reasoning, analysis]
        complexity: [medium, complex]
      route_to: frontier
      fallback: null # No downgrade for complex reasoning

    - match:
        quality_sensitivity: [4, 5]
      route_to: frontier
      fallback: null # Never downgrade safety-critical tasks

  default: balanced
```

### Step 2: Implement Fallback Chains

```python
FALLBACK_CHAINS = {
    "economy":  ["gpt-4.1-nano", "gemini-2.5-flash", "gpt-4.1-mini"],
    "balanced": ["gpt-4.1-mini", "claude-haiku-3.5", "gpt-4.1"],
    "frontier": ["gpt-4.1", "claude-sonnet-4", "gemini-2.5-pro"],
}

async def route_request(request, tier):
    for model in FALLBACK_CHAINS[tier]:
        if circuit_breaker.is_healthy(model):
            try:
                return await call_model(model, request)
            except (RateLimitError, TimeoutError):
                circuit_breaker.record_failure(model)
                continue
    raise AllModelsUnavailableError(tier)
```

### Step 3: Circuit Breaker Configuration

```yaml
circuit_breaker:
  failure_threshold: 5 # failures before opening circuit
  recovery_timeout_seconds: 30 # time before attempting recovery
  half_open_requests: 3 # test requests during recovery
  window_seconds: 60 # sliding window for failure counting
```

---

## Phase 4: Migration Rollout (Weeks 5–8)

### Week 5: Shadow Testing (5% traffic)

- Route 5% of production traffic to the new model in shadow mode
- Log both responses (current model + new model) without serving the new one
- Compare quality metrics side-by-side

**Shadow Test Analysis:**

```sql
SELECT
  use_case,
  model,
  COUNT(*) AS total_requests,
  AVG(quality_score) AS avg_quality,
  AVG(latency_ms) AS avg_latency,
  SUM(cost_usd) AS total_cost
FROM shadow_test_results
WHERE test_date >= CURRENT_DATE - 7
GROUP BY use_case, model
ORDER BY use_case, model;
```

**Quality Gate: Proceed if**

- [ ] Quality delta ≤ 2% vs. baseline on all metrics
- [ ] No new failure modes discovered
- [ ] Latency within SLO bounds

### Week 6: Canary Deployment (25% traffic)

- Route 25% of traffic through the new model, serving responses to real users
- Monitor quality, latency, cost, and user feedback

**Rollback Triggers (automatic):**

- Quality score drops > 3% below baseline for 15 minutes
- Error rate exceeds 2× baseline
- P95 latency exceeds SLO for 10 minutes
- Customer complaint rate increases by > 50%

### Week 7: Expanded Rollout (50% traffic)

- Increase to 50% if Week 6 metrics are clean
- Enable chargeback: new model costs assigned to teams
- Continue monitoring all metrics

### Week 8: Full Rollout (100% traffic)

- Complete migration for all validated use cases
- Update cost dashboards and baselines
- Document new model assignments
- Archive old model configurations (keep for 30 days for rollback)

---

## Migration Tracking Dashboard

### SQL: Migration Progress by Use Case

```sql
SELECT
  use_case,
  CASE
    WHEN pct_new_model >= 100 THEN '✅ Complete'
    WHEN pct_new_model >= 50 THEN '🟡 Expanded'
    WHEN pct_new_model >= 25 THEN '🟠 Canary'
    WHEN pct_new_model > 0 THEN '🔵 Shadow'
    ELSE '⬜ Not Started'
  END AS migration_status,
  old_model,
  new_model,
  pct_new_model,
  quality_delta_pct,
  cost_savings_pct
FROM migration_tracker
ORDER BY pct_new_model DESC;
```

---

## Risk Register

| Risk                                                | Likelihood | Impact | Mitigation                                                  |
| --------------------------------------------------- | ---------- | ------ | ----------------------------------------------------------- |
| Quality regression on edge cases                    | Medium     | High   | Include edge cases in test set; monitor quality per-segment |
| Provider outage during migration                    | Low        | High   | Fallback chains; multi-provider routing                     |
| Prompt incompatibility with new model               | Medium     | Medium | Test all prompts during shadow phase; adjust formatting     |
| Rate limit differences between models               | Medium     | Low    | Check rate limits before migration; configure gateway       |
| Team resistance to model changes                    | Low        | Medium | Show quality benchmarks; involve team leads in evaluation   |
| Cost increase due to higher retry rate on new model | Low        | Medium | Monitor retry rate; set cost ceiling per request            |

---

## Stakeholder Communications

### Kickoff Email Template

```
Subject: TokenOps Migration: Moving to Multi-Model Architecture

Team,

We're beginning an 8-week migration from [Current Model] to a multi-model
routing architecture. This will reduce our blended token cost by an estimated
30-60% while maintaining quality standards.

Timeline:
- Weeks 1-2: Assessment & benchmarking
- Weeks 3-4: Model evaluation & routing design
- Weeks 5-6: Shadow testing & canary rollout
- Weeks 7-8: Full rollout

What this means for your team:
- No action required during Weeks 1-4
- We'll share benchmark results before any production changes
- You'll have rollback capability at every stage

Questions? Join the #tokenops-migration channel.
```

### Weekly Status Template

```
Subject: TokenOps Migration — Week [N] Status

Status: 🟢 On Track / 🟡 At Risk / 🔴 Blocked

Progress:
- [Completed items this week]

Metrics:
- Quality delta: [X]% vs baseline (threshold: ≤ 2%)
- Cost savings to date: $[X]
- Traffic on new models: [X]%

Next week:
- [Planned items]

Risks / Blockers:
- [Any issues]
```

---

## Post-Migration Validation Checklist

- [ ] All target use cases migrated to optimal model tier
- [ ] Quality metrics verified within threshold for each use case
- [ ] Cost savings validated against projections (±10%)
- [ ] Dashboards updated with new model assignments
- [ ] Alerts recalibrated for new baselines
- [ ] Runbooks updated with new model fallback procedures
- [ ] Monthly cost review agenda updated
- [ ] Team trained on new routing architecture
- [ ] Documentation updated in architecture decision records

---

_Template from the TokenOps Atlas — [tokenops-atlas](https://github.com/kalilurrahman/tokenops-atlas)_
