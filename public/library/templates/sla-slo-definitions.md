# SLA / SLO Definitions — LLM-Powered Features

**Version:** 1.0  
**Last Updated:** May 2026  
**Owner:** Platform Engineering / TokenOps  
**Review Cadence:** Quarterly  
**Applies to:** All production services that consume LLM APIs

---

## 1. SLO Framework Overview

### 1.1 Why SLOs for LLM Features?

LLM-powered features introduce cost, latency, and quality dimensions that traditional SLOs don't cover. A chatbot might be "available" but producing hallucinated responses at 3x the expected cost. Standard uptime SLAs are necessary but insufficient.

This framework defines **four SLO categories** for LLM features:

| Category         | What It Measures                          | Why It Matters                           |
| ---------------- | ----------------------------------------- | ---------------------------------------- |
| **Availability** | Is the feature accessible and responsive? | User experience; business continuity     |
| **Latency**      | How fast does the feature respond?        | User experience; perceived quality       |
| **Cost**         | Is the feature operating within budget?   | Financial sustainability; unit economics |
| **Quality**      | Is the output accurate and useful?        | User trust; business value; risk         |

### 1.2 Terminology

| Term                              | Definition                                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **SLI** (Service Level Indicator) | A quantitative measure of service behavior (e.g., % of requests < 2s latency)                           |
| **SLO** (Service Level Objective) | A target value for an SLI (e.g., 99% of requests < 2s latency)                                          |
| **SLA** (Service Level Agreement) | A contractual commitment with consequences for missing SLOs                                             |
| **Error Budget**                  | The allowable amount of SLO violation before corrective action (e.g., 100% − 99.5% = 0.5% error budget) |

### 1.3 SLO Tiers

Not all features require the same service levels. Define tiers based on business criticality:

| Tier                     | Description                                                              | Examples                                                      | Availability Target | Latency Target | Cost Scrutiny             |
| ------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------- | ------------------- | -------------- | ------------------------- |
| **Tier 1 — Critical**    | Revenue-impacting, customer-facing, real-time                            | Production chatbot, checkout assistant, fraud detection       | 99.9%               | p99 < 3s       | High — per-request budget |
| **Tier 2 — Important**   | Customer-facing but not on critical path; internal tools with wide usage | Search enhancement, content recommendations, internal copilot | 99.5%               | p99 < 5s       | Medium — daily budget cap |
| **Tier 3 — Standard**    | Internal tools, batch processes, non-blocking features                   | Report generation, data enrichment, email drafts              | 99.0%               | p99 < 30s      | Low — monthly budget cap  |
| **Tier 4 — Best Effort** | Experimental features, POCs, development environments                    | Feature prototypes, A/B test variants, staging                | No SLO              | No SLO         | Monitored only            |

---

## 2. Availability SLOs

### 2.1 Definition

**SLI:** The proportion of valid requests that are served successfully (HTTP 2xx) within the timeout period.

```
Availability = (Successful Requests) / (Total Valid Requests) × 100%
```

**Exclusions:**

- Requests rejected by rate limiting (HTTP 429) — counted separately
- Requests with invalid input (HTTP 400) — not counted as failures
- Scheduled maintenance windows (announced ≥ 48 hours in advance)

### 2.2 Targets by Tier

| Tier   | Monthly Availability SLO | Allowed Downtime / Month | Measurement Window |
| ------ | ------------------------ | ------------------------ | ------------------ |
| Tier 1 | 99.9%                    | 43 minutes               | Rolling 30 days    |
| Tier 2 | 99.5%                    | 3.6 hours                | Rolling 30 days    |
| Tier 3 | 99.0%                    | 7.3 hours                | Rolling 30 days    |
| Tier 4 | Best effort              | N/A                      | N/A                |

### 2.3 Measurement Method

```yaml
availability_sli:
  numerator:
    query: |
      count(llm_requests{status=~"2..", service="$service"})
  denominator:
    query: |
      count(llm_requests{status!~"4[0-2].", service="$service"})
  window: 30d
  granularity: 1m # Evaluate every minute

# Alert when error rate exceeds budget burn rate
alerts:
  - name: availability_budget_fast_burn
    condition: error_rate_1h > (error_budget_monthly * 0.02)
    description: "Burning >2% of monthly error budget in 1 hour"
    severity: P1

  - name: availability_budget_slow_burn
    condition: error_rate_24h > (error_budget_monthly * 0.10)
    description: "Burning >10% of monthly error budget in 24 hours"
    severity: P2
```

### 2.4 Provider Dependency

LLM feature availability depends on upstream provider availability. Account for this:

| Scenario                     | Mitigation                                                    | Impact on SLO                                |
| ---------------------------- | ------------------------------------------------------------- | -------------------------------------------- |
| Primary provider outage      | Automatic failover to secondary provider                      | Downtime limited to failover latency (< 30s) |
| Primary provider degradation | Detect via latency SLI; route to secondary if p95 > threshold | May increase cost; preserves availability    |
| All providers unavailable    | Serve cached responses or graceful degradation message        | Partial availability; report as degraded     |

---

## 3. Latency SLOs

### 3.1 Definition

**SLI:** The time from request received to full response delivered (end-to-end latency), measured at the application edge (after the LLM gateway).

For **streaming responses**, measure:

- **Time to First Token (TTFT):** Time from request to first token streamed
- **Total Completion Time:** Time from request to final token

### 3.2 Targets by Tier and Model Class

#### Non-Streaming Endpoints

| Tier   | p50 Target | p95 Target | p99 Target | Timeout |
| ------ | ---------- | ---------- | ---------- | ------- |
| Tier 1 | < 1.5s     | < 3.0s     | < 5.0s     | 10s     |
| Tier 2 | < 3.0s     | < 6.0s     | < 10.0s    | 15s     |
| Tier 3 | < 10.0s    | < 30.0s    | < 60.0s    | 120s    |

#### Streaming Endpoints

| Tier   | TTFT p50 | TTFT p95 | TTFT p99 | Completion p95 |
| ------ | -------- | -------- | -------- | -------------- |
| Tier 1 | < 200ms  | < 500ms  | < 1.0s   | < 5s           |
| Tier 2 | < 400ms  | < 1.0s   | < 2.0s   | < 10s          |
| Tier 3 | < 1.0s   | < 2.0s   | < 5.0s   | < 30s          |

#### By Model Class (Informational)

These are expected ranges; actual targets are set per feature tier.

| Model Class       | Expected p50 | Expected p95 | Examples                                |
| ----------------- | ------------ | ------------ | --------------------------------------- |
| Small / Fast      | 200–500ms    | 500ms–1.5s   | GPT-4o Mini, Gemini Flash, Claude Haiku |
| Medium            | 500ms–2s     | 1.5s–5s      | GPT-4o, Claude Sonnet                   |
| Large / Reasoning | 2s–10s       | 5s–30s       | o1, Claude Opus, deep reasoning modes   |

### 3.3 Measurement Method

```yaml
latency_sli:
  metric: llm_request_duration_seconds
  labels:
    service: "$service"
    tier: "$tier"
  percentiles: [0.50, 0.95, 0.99]
  window: 30d

alerts:
  - name: latency_p95_breach
    condition: histogram_quantile(0.95, llm_request_duration_seconds) > $tier_p95_target
    for: 10m
    severity: P2

  - name: latency_p99_breach
    condition: histogram_quantile(0.99, llm_request_duration_seconds) > $tier_p99_target
    for: 5m
    severity: P1
```

---

## 4. Cost SLOs

### 4.1 Definition

Cost SLOs ensure that LLM features operate within budget and maintain sustainable unit economics. These are unique to TokenOps and are not typically found in traditional SLO frameworks.

**SLIs:**

| SLI                        | Formula                                        | Purpose                                      |
| -------------------------- | ---------------------------------------------- | -------------------------------------------- |
| **Cost per Request**       | Total cost ÷ Total requests                    | Unit economics — is each request affordable? |
| **Daily Budget Adherence** | Daily spend ÷ Daily budget                     | Guardrail — are we within planned spend?     |
| **Token Yield Rate**       | Valuable output tokens ÷ Total tokens consumed | Efficiency — are tokens producing value?     |
| **Cost per User Action**   | Total feature cost ÷ User actions completed    | Business metric — cost of delivering value   |

### 4.2 Targets by Tier

| SLI                      | Tier 1 Target            | Tier 2 Target            | Tier 3 Target            |
| ------------------------ | ------------------------ | ------------------------ | ------------------------ |
| Cost per request (avg)   | < $0.05                  | < $0.02                  | < $0.005                 |
| Cost per request (p99)   | < $0.25                  | < $0.10                  | < $0.02                  |
| Daily budget adherence   | ≤ 100% of daily budget   | ≤ 110% of daily budget   | ≤ 120% of daily budget   |
| Monthly budget adherence | ≤ 100% of monthly budget | ≤ 105% of monthly budget | ≤ 110% of monthly budget |
| Token yield rate         | > 80%                    | > 75%                    | > 70%                    |

### 4.3 Cost Anomaly Detection

```yaml
cost_alerts:
  - name: cost_per_request_spike
    condition: avg_cost_per_request_1h > (baseline_avg * 2.0)
    severity: P2
    description: "Average cost per request has doubled vs. baseline"

  - name: daily_budget_breach
    condition: projected_daily_spend > daily_budget
    severity: P2
    description: "Projected daily spend exceeds budget"
    action: "Review top consumers; consider rate limiting"

  - name: daily_budget_critical
    condition: daily_spend > (daily_budget * 1.5)
    severity: P1
    description: "Daily spend at 150% of budget"
    action: "Execute incident response runbook"

  - name: token_yield_degradation
    condition: token_yield_rate_24h < 0.60
    severity: P3
    description: "Token yield rate below 60% — significant waste"
```

### 4.4 Cost SLO Measurement

```sql
-- Daily cost SLI calculation
SELECT
  service,
  feature,
  DATE(timestamp) AS day,
  SUM(total_cost) AS daily_cost,
  budget.daily_budget,
  ROUND(SUM(total_cost) / budget.daily_budget * 100, 1) AS budget_utilization_pct,
  AVG(total_cost / NULLIF(request_count, 0)) AS avg_cost_per_request,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY request_cost) AS p99_cost_per_request,
  SUM(valuable_output_tokens) / NULLIF(SUM(total_tokens), 0) AS token_yield_rate
FROM llm_cost_log
JOIN service_budgets budget ON budget.service = llm_cost_log.service
WHERE DATE(timestamp) = CURRENT_DATE
GROUP BY service, feature, DATE(timestamp), budget.daily_budget;
```

---

## 5. Quality SLOs

### 5.1 Definition

Quality SLOs measure whether LLM outputs are accurate, safe, and useful. These are the hardest SLOs to measure automatically but are critical for user trust.

### 5.2 Quality SLIs

| SLI                    | Measurement Method                                                            | Frequency                     |
| ---------------------- | ----------------------------------------------------------------------------- | ----------------------------- |
| **Accuracy**           | Automated eval against labeled test set; human eval on sample                 | Daily (auto) / Weekly (human) |
| **Hallucination Rate** | Automated fact-checking against source documents; human review sample         | Daily (auto) / Weekly (human) |
| **Format Compliance**  | % of responses matching expected schema (JSON valid, required fields present) | Real-time                     |
| **Refusal Rate**       | % of valid requests where model refuses to answer                             | Real-time                     |
| **User Satisfaction**  | Thumbs up/down ratio; CSAT score; task completion rate                        | Continuous                    |

### 5.3 Targets by Tier

| SLI                             | Tier 1  | Tier 2 | Tier 3 |
| ------------------------------- | ------- | ------ | ------ |
| Accuracy (auto eval)            | > 95%   | > 90%  | > 85%  |
| Hallucination rate              | < 2%    | < 5%   | < 10%  |
| Format compliance (JSON/schema) | > 99.5% | > 98%  | > 95%  |
| Refusal rate on valid requests  | < 1%    | < 2%   | < 5%   |
| User satisfaction (thumbs up %) | > 85%   | > 75%  | > 65%  |

### 5.4 Quality Monitoring

```yaml
quality_monitoring:
  automated_eval:
    schedule: daily
    test_set_size: 500 # Labeled examples per task
    metrics: [accuracy, f1, rouge_l, json_validity]
    alert_on_regression: true
    regression_threshold: 5% # Alert if metric drops by >5% vs 7-day avg

  hallucination_detection:
    method: "source_document_comparison"
    sample_rate: 0.10 # Check 10% of RAG responses
    alert_threshold: 0.05 # Alert if >5% contain unsupported claims

  format_compliance:
    method: "json_schema_validation"
    sample_rate: 1.00 # Validate every response
    schema_registry: "schemas/$service/$feature.json"

  human_eval:
    schedule: weekly
    sample_size: 100
    rubric: [accuracy, helpfulness, safety, coherence]
    evaluators: 2 # Two evaluators per sample
    inter_rater_threshold: 0.80 # Cohen's kappa
```

---

## 6. Error Budget Policy

### 6.1 How Error Budgets Work

An error budget is the inverse of an SLO — it quantifies how much failure is acceptable.

```
Error Budget = 100% − SLO Target

Example (Tier 1 Availability):
  SLO: 99.9%
  Error Budget: 0.1% = 43 minutes/month

  If the service is down for 20 minutes this month:
  Error Budget Remaining: 23 minutes (53% remaining)

  If the service is down for 50 minutes this month:
  Error Budget Exhausted: -7 minutes (exceeded by 16%)
```

### 6.2 Error Budget Calculation

| SLO Category           | SLO Target       | Error Budget (monthly)    | Unit                 |
| ---------------------- | ---------------- | ------------------------- | -------------------- |
| Availability (Tier 1)  | 99.9%            | 43 minutes                | Downtime             |
| Availability (Tier 2)  | 99.5%            | 3.6 hours                 | Downtime             |
| Latency p95 (Tier 1)   | < 3s             | 5% of requests            | Slow requests        |
| Cost (daily adherence) | ≤ 100% of budget | 2 days/month              | Over-budget days     |
| Quality (accuracy)     | > 95%            | 5% of evaluated responses | Inaccurate responses |

### 6.3 Error Budget Exhaustion Policy

When an error budget is exhausted (or projected to exhaust before month end):

| Budget Status        | Action                                                               | Who Decides    |
| -------------------- | -------------------------------------------------------------------- | -------------- |
| **> 50% remaining**  | Normal operations; ship features, experiment freely                  | Team           |
| **25–50% remaining** | Caution: prioritize reliability fixes; limit risky changes           | Team lead      |
| **< 25% remaining**  | Freeze non-critical changes; focus exclusively on reliability / cost | Eng manager    |
| **Exhausted (0%)**   | **Feature freeze** — no new features until budget is restored        | VP Engineering |

### 6.4 Error Budget Recovery Actions

| SLO Category     | Recovery Actions                                                                  |
| ---------------- | --------------------------------------------------------------------------------- |
| **Availability** | Add provider failover; improve retry logic; increase redundancy                   |
| **Latency**      | Optimize prompts; enable caching; route to faster models; reduce context          |
| **Cost**         | Model downgrade; prompt compression; rate limiting; disable non-critical features |
| **Quality**      | Upgrade model; improve prompts; add guardrails; increase human review coverage    |

### 6.5 Error Budget Review

- **Weekly:** Review error budget consumption in team standups
- **Monthly:** Review all SLO/error budget status in Monthly Cost Review
- **Quarterly:** Evaluate SLO targets — adjust if consistently over/under target

---

## 7. Monitoring & Alerting Setup

### 7.1 What to Monitor

| Category         | Metric                                  | Source              | Granularity |
| ---------------- | --------------------------------------- | ------------------- | ----------- |
| **Availability** | Request success rate                    | LLM Gateway         | Per-minute  |
| **Availability** | Provider health status                  | Provider status API | Per-minute  |
| **Latency**      | E2E latency percentiles (p50, p95, p99) | Application metrics | Per-minute  |
| **Latency**      | Time to first token (streaming)         | LLM Gateway         | Per-minute  |
| **Cost**         | Token consumption (input + output)      | LLM Gateway         | Per-request |
| **Cost**         | Cost per request                        | Calculated          | Per-request |
| **Cost**         | Cumulative daily spend                  | Aggregated          | Per-5-min   |
| **Cost**         | Budget utilization %                    | Calculated          | Per-hour    |
| **Quality**      | Format compliance rate                  | Schema validator    | Per-request |
| **Quality**      | Hallucination rate (automated)          | Eval pipeline       | Per-hour    |
| **Quality**      | User satisfaction (thumbs up/down)      | Application         | Per-request |
| **Efficiency**   | Cache hit rate                          | Cache layer         | Per-minute  |
| **Efficiency**   | Token yield rate                        | Calculated          | Per-hour    |
| **Efficiency**   | Retry rate                              | LLM Gateway         | Per-minute  |

### 7.2 Alert Thresholds

| Alert                   | Condition                             | Severity | Notification            |
| ----------------------- | ------------------------------------- | -------- | ----------------------- |
| Availability < SLO      | Error rate > budget burn for 10 min   | P1       | PagerDuty + Slack       |
| Latency p95 breach      | p95 > target for 10 min               | P2       | Slack #alerts           |
| Latency p99 breach      | p99 > target for 5 min                | P1       | PagerDuty + Slack       |
| Daily budget at 80%     | Spend > 80% of daily budget           | P3       | Slack #tokenops         |
| Daily budget exceeded   | Spend > 100% of daily budget          | P2       | Slack #tokenops + email |
| Daily budget critical   | Spend > 150% of daily budget          | P1       | PagerDuty + Slack       |
| Cost per request 2x     | Avg cost > 2x baseline for 1 hr       | P2       | Slack #tokenops         |
| Quality regression      | Accuracy drops > 5% vs. 7-day avg     | P2       | Slack #quality          |
| Format compliance < 95% | Schema validation failures > 5%       | P2       | Slack #alerts           |
| Cache hit rate drop     | Hit rate < 50% of baseline for 30 min | P3       | Slack #tokenops         |
| Token yield < 60%       | Yield rate below 60% for 24 hrs       | P3       | Slack #tokenops         |

### 7.3 Dashboard Layout

Recommended dashboard sections for each LLM-powered service:

```
┌─────────────────────────────────────────────────────────────┐
│  SERVICE: [Name]         Tier: [1/2/3]        Status: 🟢    │
├─────────────────────────────────────────────────────────────┤
│  AVAILABILITY          │  LATENCY              │  COST      │
│  Current: 99.95%       │  p50: 1.2s            │  Today: $X │
│  SLO: 99.9%            │  p95: 2.8s            │  Budget: $Y│
│  Budget: 72% remaining │  p99: 4.1s            │  Util: 85% │
├─────────────────────────────────────────────────────────────┤
│  QUALITY               │  EFFICIENCY                        │
│  Accuracy: 96.2%       │  Cache Hit: 58%                    │
│  Hallucination: 1.3%   │  Token Yield: 81%                  │
│  Format: 99.8%         │  Retry Rate: 1.2%                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Escalation Matrix

### 8.1 Escalation by Severity and Duration

| Severity | Time Elapsed | Escalation Action                      | Escalated To                        |
| -------- | ------------ | -------------------------------------- | ----------------------------------- |
| **P1**   | 0 min        | Alert fired; on-call engineer paged    | On-call engineer                    |
| **P1**   | 15 min       | If not acknowledged                    | Secondary on-call + Team lead       |
| **P1**   | 30 min       | If not contained                       | Engineering Manager + FinOps Lead   |
| **P1**   | 60 min       | If not resolved or actively mitigating | VP Engineering + Finance Director   |
| **P2**   | 0 min        | Alert sent to Slack + email            | Service owner                       |
| **P2**   | 1 hr         | If not acknowledged                    | Team lead                           |
| **P2**   | 4 hr         | If not resolved or plan in place       | Engineering Manager                 |
| **P3**   | 0 min        | Alert sent to Slack                    | Service owner                       |
| **P3**   | 24 hr        | If not acknowledged                    | Team lead                           |
| **P3**   | 1 week       | If not resolved                        | Engineering Manager (weekly review) |

### 8.2 Escalation Contacts

| Role                         | Name | Contact       | Escalation Path        |
| ---------------------------- | ---- | ------------- | ---------------------- |
| On-Call Engineer (Primary)   |      | PagerDuty     | First responder        |
| On-Call Engineer (Secondary) |      | PagerDuty     | P1 backup              |
| Team Lead                    |      | Slack DM      | P1 at 15min, P2 at 1hr |
| Engineering Manager          |      | Email + Phone | P1 at 30min, P2 at 4hr |
| FinOps Lead                  |      | Email         | P1 cost incidents      |
| VP Engineering               |      | Phone         | P1 at 60min            |
| Provider Account Manager     |      | Email         | Provider-side issues   |

---

## 9. SLA Templates for Internal Consumers

### 9.1 Internal SLA — Platform to Product Teams

Use this template when the platform team provides LLM capabilities to product teams:

---

**LLM Platform Service Level Agreement**

**Provider:** Platform Engineering Team  
**Consumer:** [Product Team Name]  
**Service:** [LLM Feature / API Endpoint]  
**Effective Date:** ****\_\_\_\_****
**Review Date:** ****\_\_\_\_****

#### Service Description

The Platform team provides access to LLM inference via the LLM Gateway, including model routing, cost tracking, caching, and rate limiting.

#### Service Levels

| SLI                    | Target    | Measurement Period | Exclusions                                    |
| ---------------------- | --------- | ------------------ | --------------------------------------------- |
| Availability           | [99.X%]   | Calendar month     | Scheduled maintenance; provider force majeure |
| Latency (p95)          | [< Xs]    | Calendar month     | Requests > [Y] input tokens                   |
| Cost per request (avg) | [< $X.XX] | Calendar month     | Model upgrades requested by consumer          |
| Format compliance      | [> X%]    | Calendar month     | Schema changes by consumer                    |

#### Consumer Responsibilities

- Tag all requests with required metadata (team, service, feature)
- Stay within allocated RPM and TPM rate limits
- Use approved models for each task type
- Report quality issues within 24 hours
- Participate in monthly cost review

#### Platform Responsibilities

- Maintain LLM Gateway availability per SLO
- Provide cost visibility dashboard
- Alert on budget threshold breaches
- Process rate limit increase requests within 2 business days
- Provide 30-day notice for model deprecations or API changes

#### Credits (Optional)

If the platform misses the availability SLO, consumer receives credit toward next month's token budget allocation:

| Availability Achieved | Credit                     |
| --------------------- | -------------------------- |
| 99.0% – 99.X%         | 5% of monthly token spend  |
| 98.0% – 99.0%         | 10% of monthly token spend |
| < 98.0%               | 25% of monthly token spend |

#### Dispute Resolution

1. Consumer raises issue in #tokenops-support Slack channel
2. Platform triage within 1 business day
3. If unresolved, escalate to Engineering Manager
4. If still unresolved, VP Engineering arbitration

---

### 9.2 SLA Review Checklist

Use this checklist when reviewing SLAs quarterly:

- [ ] Are SLO targets still appropriate? (Too easy = raising targets; too many breaches = reassess achievability)
- [ ] Has the service tier changed? (Increased business criticality = higher tier)
- [ ] Are measurement methods accurate? (Validate SLI calculation logic)
- [ ] Has the cost baseline shifted? (Update cost SLO targets for new pricing)
- [ ] Are error budgets being consumed appropriately? (Too much = reliability focus; none consumed = targets too loose)
- [ ] Do consumers understand their SLAs? (Check during monthly review)
- [ ] Are new quality metrics needed? (New failure modes discovered?)
- [ ] Does the escalation matrix reflect current team structure?

---

## Appendix A: SLO Template — Blank

Copy this template for each new LLM-powered feature:

```yaml
service_name: ""
feature_name: ""
tier: "" # 1, 2, 3, or 4
owner: ""
created: ""
last_reviewed: ""

slos:
  availability:
    target: "" # e.g., 99.9%
    window: "30d"
    measurement: "" # Success rate query

  latency:
    ttft_p95: "" # e.g., 500ms
    e2e_p95: "" # e.g., 3s
    e2e_p99: "" # e.g., 5s
    timeout: "" # e.g., 10s
    window: "30d"

  cost:
    avg_cost_per_request: "" # e.g., $0.05
    p99_cost_per_request: "" # e.g., $0.25
    daily_budget: "" # e.g., $500
    monthly_budget: "" # e.g., $15,000
    token_yield_target: "" # e.g., 80%

  quality:
    accuracy_target: "" # e.g., 95%
    hallucination_max: "" # e.g., 2%
    format_compliance: "" # e.g., 99.5%
    user_satisfaction: "" # e.g., 85%

error_budget_policy:
  freeze_threshold: "0%" # Feature freeze when budget hits 0
  caution_threshold: "25%" # Limit risky changes below 25%
  review_cadence: "weekly"

alerts:
  - metric: ""
    condition: ""
    severity: ""
    channel: ""
```

## Appendix B: SLO Adoption Roadmap

| Phase                      | Timeline    | Activities                                                                     | Outcome                         |
| -------------------------- | ----------- | ------------------------------------------------------------------------------ | ------------------------------- |
| **Phase 1: Foundation**    | Weeks 1–4   | Define tiers; assign features to tiers; instrument SLIs                        | SLIs visible in dashboards      |
| **Phase 2: Targets**       | Weeks 4–8   | Set initial SLO targets based on baseline data; configure alerts               | SLOs published; alerts firing   |
| **Phase 3: Error Budgets** | Weeks 8–12  | Implement error budget tracking; define exhaustion policy                      | Teams managing to error budgets |
| **Phase 4: SLAs**          | Weeks 12–16 | Publish internal SLAs between platform and consumer teams                      | Formal agreements in place      |
| **Phase 5: Culture**       | Ongoing     | Monthly SLO reviews; quarterly target adjustments; error budget retrospectives | SLO-driven engineering culture  |

---

_Template from the TokenOps Atlas — [tokenops-atlas](https://github.com/kalilurrahman/tokenops-atlas)_
