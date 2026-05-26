# Architecture Decision Record — AI Feature Cost Analysis

> **Template Purpose:** Evaluate the cost, ROI, and operational implications of every new AI-powered feature *before* it reaches production. Fill in every section; mark "N/A" only with justification.

---

## Header

| Field | Value |
|-------|-------|
| **Feature Name** | _e.g., Intelligent Ticket Routing_ |
| **ADR Number** | _ADR-XXXX_ |
| **Date** | _YYYY-MM-DD_ |
| **Status** | `PROPOSED` · `ACCEPTED` · `DEPRECATED` · `SUPERSEDED` |
| **Author(s)** | _@handle, @handle_ |
| **Reviewers** | _Engineering Lead, FinOps, Product Owner_ |
| **Service** | _e.g., support_chatbot_ |
| **Cost Center** | _e.g., CC-5520-CX_ |

---

## 1 · Context

> Describe the business problem, why an LLM-based solution is being considered, and what alternatives were evaluated.

_Example:_

> Our support team manually triages ~4,000 tickets/day across 15 queues.
> Mis-routing causes an average 2.1-hour delay and costs $8.50 per re-route
> in agent time. We propose using an LLM to classify and route tickets
> automatically, reducing mis-routes by ≥60% and saving agent time.

### Alternatives Considered

| # | Alternative | Pros | Cons | Outcome |
|---|------------|------|------|---------|
| 1 | Rule-based classifier | Zero LLM cost, fast | Low accuracy (~72%), brittle | Rejected |
| 2 | Fine-tuned BERT model | Low inference cost | 3-month training cycle, narrow scope | Deferred |
| 3 | LLM classification (this ADR) | High accuracy (~95%), fast to ship | Token cost, vendor dependency | **Proposed** |

---

## 2 · Cost Analysis

### 2.1 Per-Request Estimate

| Component | Value | Notes |
|-----------|-------|-------|
| **Avg. input tokens / request** | _~350_ | Ticket subject + body + routing taxonomy |
| **Avg. output tokens / request** | _~40_ | Category label + confidence + reasoning |
| **Model** | _GPT-4o-mini_ | Cheapest model that meets 95% accuracy |
| **Input rate** | _$0.15 / 1M tokens_ | As of May 2026 |
| **Output rate** | _$0.60 / 1M tokens_ | As of May 2026 |
| **Cost / request** | _$0.000077_ | (350 × $0.15 + 40 × $0.60) / 1,000,000 |

### 2.2 Volume Projections

| Timeframe | Daily Requests | Daily Cost | Monthly Cost (30 d) |
|-----------|---------------|------------|---------------------|
| **Launch (Month 1)** | 1,000 | $0.08 | $2.31 |
| **Ramp (Month 3)** | 4,000 | $0.31 | $9.24 |
| **Steady state (Month 6)** | 6,000 | $0.46 | $13.86 |
| **Growth (Month 12)** | 10,000 | $0.77 | $23.10 |

### 2.3 Total Cost of Ownership (First 12 Months)

| Line Item | Cost |
|-----------|------|
| LLM inference | $165 |
| Engineering build (2 engineers × 3 weeks) | $30,000 |
| Monitoring & observability tooling | $1,200 |
| Prompt engineering & evaluation | $3,000 |
| **Total Year-1 Cost** | **$34,365** |

---

## 3 · Unit Economics

### 3.1 Manual vs. Automated Cost

| Metric | Manual (Current) | Automated (Proposed) | Δ |
|--------|-----------------|---------------------|---|
| Cost per ticket triage | $1.20 (agent time) | $0.000077 (LLM) | −99.99% |
| Avg. time to route | 8 min | <1 sec | −99.99% |
| Mis-route rate | 18% | 5% (projected) | −72% |
| Cost of mis-route | $8.50 / re-route | $8.50 / re-route | — |
| Monthly mis-route cost | $18,360 | $5,100 | −$13,260 |

### 3.2 ROI Calculation

```
Annual agent-time savings     = 4,000 tickets/day × $1.20 × 365    = $1,752,000
Annual mis-route savings      = ($18,360 − $5,100) × 12            = $159,120
Total annual benefit          =                                       $1,911,120

Total Year-1 cost             =                                       $34,365

ROI                           = ($1,911,120 − $34,365) / $34,365   = 5,460%
Payback period                ≈ 1 week
```

> **Note:** Even if LLM costs were 100× higher, the ROI would remain strongly positive. The dominant cost is engineering time, not tokens.

---

## 4 · Model Selection Rationale

| Criterion | GPT-4o | GPT-4o-mini (Selected) | Claude Haiku |
|-----------|--------|----------------------|-------------|
| Accuracy on test set (n=500) | 97.2% | 95.4% | 94.1% |
| Cost / request | $0.0009 | $0.000077 | $0.00032 |
| Latency P50 | 820 ms | 310 ms | 450 ms |
| Context window | 128K | 128K | 200K |
| Meets 95% threshold? | ✅ | ✅ | ❌ (93.8% on edge cases) |

**Decision:** GPT-4o-mini at ~12× lower cost than GPT-4o while exceeding the 95% accuracy threshold.

---

## 5 · Optimization Roadmap

| Quarter | Initiative | Expected Impact | Owner |
|---------|-----------|----------------|-------|
| **Q1** | Launch with GPT-4o-mini; instrument all calls; set budget alerts | Baseline established | @platform |
| **Q2** | Prompt compression: reduce taxonomy injection from 350 → 200 tokens | −40% input cost | @ml-eng |
| **Q3** | Semantic caching for repeated ticket patterns | −25% total requests | @platform |
| **Q4** | Evaluate fine-tuned small model to replace LLM entirely | −80% inference cost | @ml-eng |

---

## 6 · Risk Assessment

### 6.1 Cost Scenarios

| Scenario | Assumptions | Monthly Cost | Annual Cost | Action |
|----------|------------|-------------|-------------|--------|
| **Base case** | 6K req/day, GPT-4o-mini | $14 | $166 | Proceed |
| **2× volume** | 12K req/day, same model | $28 | $332 | Monitor; no action needed |
| **5× volume** | 30K req/day, same model | $69 | $831 | Trigger caching + batching |
| **Model price hike (2×)** | Same volume, 2× rates | $28 | $332 | Evaluate alternative provider |
| **Quality regression** | Forced upgrade to GPT-4o | $165 | $1,978 | Invest in fine-tuning |
| **Worst case** | 5× volume + model upgrade to GPT-4o | $825 | $9,900 | Still <1% of savings; proceed |

### 6.2 Non-Cost Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Provider API outage | Medium | High (tickets unrouted) | Fallback to rule-based router |
| Model deprecation / breaking change | Low | Medium | Pin model version; test before upgrade |
| Data privacy (ticket content sent to LLM) | — | High | Use data-processing agreement; redact PII |
| Prompt injection via ticket content | Medium | Medium | Input sanitization; output validation |
| Accuracy drift over time | Medium | Medium | Weekly accuracy sampling (n=100) |

---

## 7 · Decision

> **We will proceed with the LLM-based ticket routing feature using GPT-4o-mini.**  
> The annual benefit ($1.9M) exceeds the total Year-1 cost ($34K) by >55×.  
> Even under worst-case cost assumptions, the feature remains strongly ROI-positive.

---

## 8 · Consequences

### Positive

- Immediate reduction in ticket mis-routes and agent idle time
- Foundation for expanding LLM-based automation to other support workflows
- Establishes tagging, monitoring, and budgeting patterns reusable across services

### Negative / Trade-offs

- Introduces vendor dependency on OpenAI (mitigated by provider-agnostic gateway)
- Requires ongoing prompt maintenance as ticket categories evolve
- Small residual risk of incorrect routing on novel ticket types

### Follow-up Actions

| # | Action | Owner | Due |
|---|--------|-------|-----|
| 1 | Implement feature behind feature flag | @eng-lead | +2 weeks |
| 2 | Deploy request tagging per `request-tagging-schema.yaml` | @platform | +2 weeks |
| 3 | Set budget alert at $50/month (3.6× steady-state) | @finops | +1 week |
| 4 | Schedule first quality review (n=200 sample) | @ml-eng | +4 weeks |
| 5 | Present ROI results at monthly cost review | @product | +6 weeks |

---

## Approval

| Role | Name | Date | Decision |
|------|------|------|----------|
| Engineering Lead | | | `APPROVE` / `REJECT` |
| FinOps Lead | | | `APPROVE` / `REJECT` |
| Product Owner | | | `APPROVE` / `REJECT` |
| Security / Privacy | | | `APPROVE` / `REJECT` |

---

*Template version 1.0 — Maintained by the TokenOps team.*
