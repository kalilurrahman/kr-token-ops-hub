# TokenOps Implementation Playbook

> **Goal:** Stand up a complete TokenOps (FinOps for LLM tokens) practice in 12 weeks.  
> **Audience:** Platform engineering, FinOps, and AI/ML leadership.  
> **Approach:** Ship incrementally. Each phase builds on the prior one and produces concrete deliverables.

---

## Timeline Overview

```
Week  1  2  3  4  5  6  7  8  9  10  11  12
      ├──────┤                                   Phase 1: Baseline Audit
         ├────────────┤                           Phase 2: Instrumentation
            ├────────────┤                        Phase 3: Allocation & Reporting
                  ├────────────────┤              Phase 4: Optimization
                              ├────────────────┤  Phase 5: Governance
```

---

## Phase 1 — Baseline Audit (Weeks 1–2)

> **Objective:** Understand what you're spending today, where the money goes, and where the biggest levers are.

### Step 1.1 · Inventory All LLM Integrations

Catalog every service, pipeline, and tool that calls an LLM API.

| Action | Detail |
|--------|--------|
| Search codebase for API client imports | `openai`, `anthropic`, `google.generativeai`, `litellm`, `langchain` |
| Query cloud billing for LLM API spend | Filter by OpenAI, Anthropic, Google AI, AWS Bedrock, Azure OpenAI |
| Interview team leads | Ask: "Does your team use any LLM API?" — catch shadow usage |
| Record in service inventory | Spreadsheet or internal wiki with: service, team, model, estimated volume |

**Deliverable:** Service inventory spreadsheet with columns:

| Service | Team | Model(s) | Est. Daily Requests | Est. Monthly Cost | Environment | Owner |
|---------|------|----------|--------------------|--------------------|-------------|-------|
| _e.g., support_chatbot_ | _cx-platform_ | _GPT-4o-mini_ | _4,000_ | _$120_ | _Production_ | _@alex_ |

### Step 1.2 · Pull Billing Data

Gather 90 days of historical billing data from every LLM provider.

| Action | Detail |
|--------|--------|
| Export invoices / usage reports | OpenAI dashboard, Anthropic console, cloud billing |
| Normalize to common format | Columns: date, provider, model, input_tokens, output_tokens, cost |
| Aggregate by month, team, model | Identify the top cost drivers |

**Deliverable:** Billing history spreadsheet (90-day lookback) with:
- Monthly spend by provider
- Monthly spend by model
- Top-5 services by cost
- Month-over-month growth rate

### Step 1.3 · Identify Top Cost Drivers

Rank services by total cost and cost-efficiency.

| Action | Detail |
|--------|--------|
| Rank services by total monthly spend | Top-3 services typically account for >70% of total cost |
| Calculate cost per request for each service | Flag services with cost/request >2× the median |
| Identify quick wins | Services using expensive models for simple tasks (e.g., GPT-4o for classification) |
| Estimate savings potential | For each quick win, estimate the monthly savings from model downgrade or prompt compression |

**Deliverable:** Prioritized optimization backlog:

| Rank | Service | Current Cost | Optimization Opportunity | Est. Monthly Savings |
|------|---------|-------------|-------------------------|---------------------|
| 1 | _data_pipeline_ | _$8,400_ | _Switch extraction from GPT-4o to GPT-4o-mini_ | _$6,300_ |
| 2 | _support_chatbot_ | _$3,200_ | _Prompt compression (−30% tokens)_ | _$960_ |
| 3 | _email_generator_ | _$1,800_ | _Add semantic cache_ | _$540_ |

---

## Phase 2 — Instrumentation (Weeks 2–4)

> **Objective:** Add metadata tagging and telemetry to every LLM call so you can attribute costs accurately.

### Step 2.1 · Deploy Request Tagging

Implement the tagging schema across all services.

| Action | Detail |
|--------|--------|
| Adopt the tagging schema | Use [`request-tagging-schema.yaml`](./request-tagging-schema.yaml) as the standard |
| Instrument the LLM gateway / client wrapper | Inject tags automatically from service config |
| Validate in staging | Fire test requests and confirm tags appear in logs |
| Enforce tagging in production | Reject or flag untagged requests |

**Deliverable:**
- [ ] Tagging schema deployed to gateway
- [ ] 100% of production LLM calls carry required metadata
- [ ] Gateway rejects untagged requests (or logs warnings during rollout)

### Step 2.2 · Set Up Telemetry Pipeline

Ship enriched request logs to the data warehouse and observability platform.

| Action | Detail |
|--------|--------|
| Configure log export | Gateway → data warehouse (BigQuery, Snowflake, etc.) |
| Define the log schema | `timestamp`, `service`, `team`, `feature`, `model`, `input_tokens`, `output_tokens`, `cost`, `latency_ms`, `status`, all tag fields |
| Set up observability metrics | Emit `tokenops.requests.*` metrics with tag dimensions to Datadog / Prometheus / CloudWatch |
| Verify data flow | Confirm logs arrive within ≤1 hour; metrics update in real-time |

**Deliverable:**
- [ ] Enriched request logs landing in the data warehouse
- [ ] Real-time metrics emitting to the observability platform
- [ ] Data verified with manual spot-check (5 requests)

### Step 2.3 · Implement Cost Computation

Automatically compute dollar cost for every request.

| Action | Detail |
|--------|--------|
| Create a pricing lookup table | Model → input_rate, output_rate (from [`token-pricing-reference.md`](./token-pricing-reference.md)) |
| Add a transformation step | `cost = (input_tokens × input_rate + output_tokens × output_rate) / 1,000,000` |
| Store computed cost per request | New column in the warehouse table |
| Validate accuracy | Compare computed costs against provider invoices (±5% tolerance) |

**Deliverable:**
- [ ] Per-request cost column in the warehouse
- [ ] Costs validated against provider invoices for the most recent billing period
- [ ] Pricing lookup table documented and version-controlled

---

## Phase 3 — Allocation & Reporting (Weeks 3–5)

> **Objective:** Build dashboards and reports that give every team visibility into their LLM spend.

### Step 3.1 · Build Cost Dashboards

Create self-serve dashboards that answer: "How much am I spending and on what?"

| Dashboard | Key Visualizations |
|-----------|-------------------|
| **Executive summary** | Total spend (MTD vs. budget), MoM trend, top-5 services |
| **Team view** | Spend by service, by feature, by model; cost per request distribution |
| **Model mix** | % of spend by model, migration progress chart |
| **Anomaly view** | Services with >2× daily spike, top cost outlier requests |
| **Unit economics** | Cost per conversation, cost per document processed, cost per user tier |

**Deliverable:**
- [ ] Executive dashboard live and accessible to leadership
- [ ] Team-level dashboards live and accessible to each team lead
- [ ] Dashboards reviewed and validated with at least 2 stakeholders

### Step 3.2 · Establish Chargeback / Showback

Attribute costs to the teams that incur them.

| Action | Detail |
|--------|--------|
| Choose model: showback vs. chargeback | **Showback** (visibility only) is recommended for Month 1; upgrade to **chargeback** (actual budget impact) in Q2 |
| Map services → cost centers | Use the `cost_center` tag from the tagging schema |
| Generate monthly allocation reports | Email to each team: their services, total spend, top features, MoM change |
| Review with Finance | Align on cost-center mapping and approval for chargeback (if applicable) |

**Deliverable:**
- [ ] Monthly allocation report template created
- [ ] First report distributed to all teams
- [ ] Finance sign-off on cost-center mapping

### Step 3.3 · Set Budgets

Define monthly token budgets for each service and team.

| Action | Detail |
|--------|--------|
| Set initial budgets | Use baseline data (Phase 1) + 20% buffer for growth |
| Configure in [`budget-guardrails.yaml`](./budget-guardrails.yaml) | `monthly_token_budget`, `soft_alert`, `hard_limit` per service |
| Communicate budgets to teams | Each team acknowledges their budget and understands the alert/limit behavior |
| Schedule first budget review | Add to the [Monthly TokenOps Cost Review](./monthly-cost-review.md) |

**Deliverable:**
- [ ] Budgets set for all production services
- [ ] Budget guardrails config deployed to gateway
- [ ] All teams notified and acknowledged

---

## Phase 4 — Optimization (Weeks 5–8)

> **Objective:** Systematically reduce cost per request without degrading quality.

### Strategy 4.1 · Model Downgrade

Move workloads to cheaper models where quality thresholds are met.

| Action | Detail |
|--------|--------|
| Identify candidates | Services using GPT-4o / Claude Sonnet for classification, extraction, or simple generation |
| Run the [Model Selection Matrix](./model-selection-matrix.md) | Offline eval → shadow mode → A/B test → full migration |
| Track savings | Record actual savings in the optimization tracker |

**Expected impact:** 40–80% cost reduction on downgraded workloads.

### Strategy 4.2 · Prompt Compression

Reduce input tokens per request.

| Action | Detail |
|--------|--------|
| Audit top-5 prompts by token count | Use the [Prompt Optimization Checklist](./prompt-optimization-checklist.md) |
| Remove redundancy, compress examples | Target 20–40% input token reduction |
| Validate quality | Test on ≥100 cases; A/B at 10% before full rollout |
| Set output token caps | Add `max_tokens` to API calls where appropriate |

**Expected impact:** 20–50% input token reduction.

### Strategy 4.3 · Caching

Avoid redundant LLM calls.

| Action | Detail |
|--------|--------|
| Implement exact-match cache | Cache identical prompts (e.g., repeated FAQ questions) |
| Implement semantic cache | Use embeddings to match semantically similar prompts |
| Set cache TTL | Balance freshness vs. savings (start with 24-hour TTL) |
| Monitor cache-hit rate | Target ≥30% cache-hit rate for conversational workloads |

**Expected impact:** 15–35% request volume reduction.

### Strategy 4.4 · Batching

Use batch APIs for non-latency-sensitive workloads.

| Action | Detail |
|--------|--------|
| Identify batch candidates | ETL pipelines, nightly jobs, weekly reports |
| Migrate to batch API | OpenAI Batch API, Anthropic Message Batches API |
| Validate SLA tolerance | Confirm 24-hour turnaround is acceptable for each workload |

**Expected impact:** 50% cost reduction on batch-eligible workloads.

### Deliverables

- [ ] ≥2 model downgrades completed and savings verified
- [ ] ≥3 prompts optimized using the checklist
- [ ] Caching deployed for at least 1 high-volume service
- [ ] Batch API adopted for at least 1 pipeline

---

## Phase 5 — Governance (Weeks 8–12)

> **Objective:** Establish organizational structure, processes, and culture to sustain cost efficiency.

### 5.1 · Organizational Structure

| Role | Responsibility | Who |
|------|---------------|-----|
| **TokenOps Lead** | Owns the practice; runs the monthly review; sets strategy | FinOps or Platform Eng lead |
| **Service Owners** | Manage budget for their service; execute optimizations | Engineering leads |
| **FinOps Partner** | Aligns LLM costs with organizational budgets; manages chargeback | Finance team member |
| **AI/ML Platform** | Builds and maintains tooling (gateway, dashboards, caching) | Platform engineering |
| **Executive Sponsor** | Provides air cover; approves budget exceptions >$50K | VP Engineering or CTO |

### 5.2 · Review Cadence

| Cadence | Meeting | Attendees | Duration | Purpose |
|---------|---------|-----------|----------|---------|
| **Weekly** | Cost standup | TokenOps Lead + top-3 service owners | 15 min | Review alerts, anomalies, in-progress optimizations |
| **Monthly** | [TokenOps Cost Review](./monthly-cost-review.md) | All stakeholders | 60 min | Full metrics review, forecast, priorities |
| **Quarterly** | Executive briefing | Leadership + Finance | 30 min | ROI summary, budget adjustments, strategic direction |

### 5.3 · Policy Documents

Create and distribute these governance documents:

- [ ] **Cost review policy:** Defines meeting cadence, attendees, escalation thresholds
- [ ] **Budget exception policy:** Defines the process for requesting budget overrides (see `budget-guardrails.yaml` → `exception_process`)
- [ ] **New feature cost review:** Every new AI feature must complete an [Architecture Decision Record](./architecture-decision-record.md) before launch
- [ ] **Model selection policy:** No model upgrade without running the [Model Selection Matrix](./model-selection-matrix.md)
- [ ] **Prompt change policy:** No prompt change to production without completing the [Prompt Optimization Checklist](./prompt-optimization-checklist.md) validation section

### 5.4 · Continuous Improvement

| Action | Cadence | Detail |
|--------|---------|--------|
| Re-evaluate model selection | Quarterly | New models and price drops happen frequently |
| Re-run prompt optimization | Quarterly | Prompts accumulate cruft over time |
| Review provider contracts | Annually | Negotiate volume discounts, committed-use deals |
| Benchmark against industry | Semi-annually | Compare cost-per-request with published benchmarks |
| Update pricing reference | Monthly | Refresh [`token-pricing-reference.md`](./token-pricing-reference.md) |

### Deliverables

- [ ] Org structure documented and communicated
- [ ] Monthly review on the calendar with all stakeholders
- [ ] All 5 policy documents created and distributed
- [ ] Continuous improvement cadence established

---

## Success Metrics

Track these KPIs to measure the maturity and impact of your TokenOps practice.

| KPI | Baseline (Week 1) | Target (Week 12) | Stretch Goal |
|-----|-------------------|-------------------|-------------|
| % of LLM calls tagged | 0% | 100% | 100% |
| Cost attribution coverage | 0% | 100% | 100% |
| Monthly cost vs. budget | Unknown | Within 10% | Within 5% |
| Avg. cost per request | _Measured_ | −30% | −50% |
| Cache-hit rate | 0% | 25% | 40% |
| Time to detect cost anomaly | Days | <1 hour | <15 min |
| Teams with self-serve dashboards | 0 | All | All |
| Services with budget guardrails | 0 | All production | All (incl. staging) |

---

## Quick-Start: First 5 Things to Do

If you only have a day, do these five things:

1. **Export last month's LLM invoices** — Know your total spend.
2. **List every service that calls an LLM** — Know your surface area.
3. **Find your most expensive service** — Know your biggest lever.
4. **Check if it could use a cheaper model** — The fastest win.
5. **Set a calendar reminder for a monthly cost review** — Build the habit.

---

*Template version 1.0 — Maintained by the TokenOps team.*
