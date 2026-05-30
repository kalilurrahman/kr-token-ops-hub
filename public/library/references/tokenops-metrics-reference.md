# TokenOps Metrics Reference

> Complete reference for every metric used in TokenOps. Use this to build dashboards, configure alerts, and establish KPIs.

---

## Cost Metrics

### 1. Total AI Spend

| Field               | Value                                                      |
| ------------------- | ---------------------------------------------------------- |
| **Formula**         | `SUM(cost_usd)` across all LLM API calls                   |
| **Unit**            | USD                                                        |
| **Target**          | Within approved monthly budget                             |
| **Data Source**     | Gateway cost logger / provider billing API                 |
| **Dashboard Panel** | Stat card + time series line chart                         |
| **Alert Threshold** | > 90% of monthly budget                                    |
| **Interpretation**  | Primary cost metric. Track trend, not just absolute value. |

### 2. Cost per Request

| Field               | Value                                                                          |
| ------------------- | ------------------------------------------------------------------------------ |
| **Formula**         | `total_cost / total_requests`                                                  |
| **Unit**            | USD                                                                            |
| **Target**          | Depends on use case; typical $0.001–$0.10                                      |
| **Data Source**     | Gateway logs                                                                   |
| **Dashboard Panel** | Time series, segmented by service                                              |
| **Alert Threshold** | > 2× rolling 7-day average                                                     |
| **Interpretation**  | Rising cost/request suggests prompt bloat, model change, or cache degradation. |

### 3. Cost per 1M Tokens (Blended Rate)

| Field               | Value                                                        |
| ------------------- | ------------------------------------------------------------ |
| **Formula**         | `(total_cost / total_tokens) × 1,000,000`                    |
| **Unit**            | USD per 1M tokens                                            |
| **Target**          | < $5.00 for blended multi-model architecture                 |
| **Data Source**     | Gateway logs                                                 |
| **Dashboard Panel** | Gauge chart with zones (green/yellow/red)                    |
| **Alert Threshold** | > 150% of target                                             |
| **Interpretation**  | Reflects model mix efficiency. Lower = better model tiering. |

### 4. Cost per Outcome

| Field               | Value                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------- |
| **Formula**         | `total_ai_cost / total_business_outcomes` (e.g., tickets resolved, documents processed) |
| **Unit**            | USD per outcome                                                                         |
| **Target**          | Defined by product team                                                                 |
| **Data Source**     | Gateway logs + product analytics                                                        |
| **Dashboard Panel** | Time series, segmented by feature                                                       |
| **Alert Threshold** | > 120% of baseline                                                                      |
| **Interpretation**  | The ultimate ROI metric. Connects AI cost to business value.                            |

### 5. Cost per User

| Field               | Value                                                         |
| ------------------- | ------------------------------------------------------------- |
| **Formula**         | `total_ai_cost / monthly_active_users`                        |
| **Unit**            | USD per user per month                                        |
| **Target**          | < revenue per user × AI cost ratio target                     |
| **Data Source**     | Gateway logs + user analytics                                 |
| **Dashboard Panel** | Stat card + trend                                             |
| **Alert Threshold** | > customer LTV / 12                                           |
| **Interpretation**  | Must stay below revenue per user for positive unit economics. |

### 6. Budget Utilization

| Field               | Value                                                         |
| ------------------- | ------------------------------------------------------------- |
| **Formula**         | `(month_to_date_spend / monthly_budget) × 100`                |
| **Unit**            | Percentage                                                    |
| **Target**          | 70–90% (under 70% = over-provisioned, over 100% = overspend)  |
| **Data Source**     | Gateway logs + finance budget data                            |
| **Dashboard Panel** | Progress bar with threshold markers                           |
| **Alert Threshold** | > 90% with > 5 days remaining in month                        |
| **Interpretation**  | Prorated: (spend / budget) vs (day_of_month / days_in_month). |

### 7. Cost Variance

| Field               | Value                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------- |
| **Formula**         | `(actual_cost − forecast_cost) / forecast_cost × 100`                                  |
| **Unit**            | Percentage                                                                             |
| **Target**          | ±10%                                                                                   |
| **Data Source**     | Gateway logs + forecast model                                                          |
| **Dashboard Panel** | Bar chart (actual vs forecast)                                                         |
| **Alert Threshold** | > ±20%                                                                                 |
| **Interpretation**  | Large variance indicates forecasting model needs updating or unexpected usage changes. |

### 8. Input vs Output Cost Ratio

| Field               | Value                                                                           |
| ------------------- | ------------------------------------------------------------------------------- |
| **Formula**         | `input_cost / output_cost`                                                      |
| **Unit**            | Ratio                                                                           |
| **Target**          | Depends on task type; generation-heavy ≈ 0.5, extraction-heavy ≈ 3.0            |
| **Data Source**     | Gateway logs                                                                    |
| **Dashboard Panel** | Stacked bar chart                                                               |
| **Alert Threshold** | Significant shift from baseline ratio                                           |
| **Interpretation**  | Shifts indicate prompt bloat (rising input) or verbose outputs (rising output). |

---

## Efficiency Metrics

### 9. Token Yield Rate

| Field               | Value                                                                        |
| ------------------- | ---------------------------------------------------------------------------- |
| **Formula**         | `useful_output_tokens / total_tokens × 100`                                  |
| **Unit**            | Percentage                                                                   |
| **Target**          | ≥ 70%                                                                        |
| **Data Source**     | Gateway logs + output analysis                                               |
| **Dashboard Panel** | Gauge chart                                                                  |
| **Alert Threshold** | < 50%                                                                        |
| **Interpretation**  | Low yield = excessive input tokens, verbose outputs, or low cache hit rates. |

### 10. Cache Hit Rate

| Field               | Value                                                                            |
| ------------------- | -------------------------------------------------------------------------------- |
| **Formula**         | `cached_responses / total_requests × 100`                                        |
| **Unit**            | Percentage                                                                       |
| **Target**          | ≥ 30% for cacheable workloads                                                    |
| **Data Source**     | Cache middleware logs                                                            |
| **Dashboard Panel** | Time series, split by exact vs semantic                                          |
| **Alert Threshold** | Drop > 20% from baseline in 24 hours                                             |
| **Interpretation**  | Low hit rate = cache misconfiguration, TTL too short, or non-cacheable workload. |

### 11. Context Utilization Ratio

| Field               | Value                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------- |
| **Formula**         | `relevant_context_tokens / total_context_tokens × 100`                                   |
| **Unit**            | Percentage                                                                               |
| **Target**          | ≥ 60%                                                                                    |
| **Data Source**     | RAG pipeline logs + relevance scoring                                                    |
| **Dashboard Panel** | Distribution histogram                                                                   |
| **Alert Threshold** | < 40% sustained                                                                          |
| **Interpretation**  | Low ratio = sending too many irrelevant chunks. Reduce top_k or add relevance filtering. |

### 12. Retry Rate

| Field               | Value                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| **Formula**         | `retried_requests / total_requests × 100`                                                          |
| **Unit**            | Percentage                                                                                         |
| **Target**          | < 2%                                                                                               |
| **Data Source**     | Gateway retry logs                                                                                 |
| **Dashboard Panel** | Time series with error type breakdown                                                              |
| **Alert Threshold** | > 5% for 15 minutes                                                                                |
| **Interpretation**  | High retry rate = wasted tokens. Investigate: rate limits, provider issues, or malformed requests. |

### 13. Batch Utilization Rate

| Field               | Value                                                         |
| ------------------- | ------------------------------------------------------------- |
| **Formula**         | `batch_requests / (batch_requests + realtime_requests) × 100` |
| **Unit**            | Percentage                                                    |
| **Target**          | ≥ 40% of eligible workloads                                   |
| **Data Source**     | Gateway routing logs                                          |
| **Dashboard Panel** | Pie chart (batch vs real-time)                                |
| **Alert Threshold** | N/A (optimization metric)                                     |
| **Interpretation**  | Higher batch utilization = more 50% discounts realized.       |

### 14. Prompt Compression Ratio

| Field               | Value                                                             |
| ------------------- | ----------------------------------------------------------------- |
| **Formula**         | `(original_tokens − compressed_tokens) / original_tokens × 100`   |
| **Unit**            | Percentage                                                        |
| **Target**          | 20–50% for system prompts                                         |
| **Data Source**     | Prompt registry (version comparison)                              |
| **Dashboard Panel** | Bar chart by prompt version                                       |
| **Alert Threshold** | N/A (optimization metric)                                         |
| **Interpretation**  | Track compression over time. Negative compression = prompt bloat. |

---

## Quality Metrics

### 15. Accuracy / Quality Score

| Field               | Value                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------- |
| **Formula**         | Task-specific (accuracy, F1, ROUGE, human eval)                                         |
| **Unit**            | Percentage or score                                                                     |
| **Target**          | Defined per use case (typically ≥ 90%)                                                  |
| **Data Source**     | Evaluation pipeline                                                                     |
| **Dashboard Panel** | Time series by model + task                                                             |
| **Alert Threshold** | Drop > 2% from baseline                                                                 |
| **Interpretation**  | Quality regression may indicate model update, prompt drift, or data distribution shift. |

### 16. Hallucination Rate

| Field               | Value                                                                              |
| ------------------- | ---------------------------------------------------------------------------------- |
| **Formula**         | `responses_with_hallucination / total_responses × 100`                             |
| **Unit**            | Percentage                                                                         |
| **Target**          | < 3% for factual tasks                                                             |
| **Data Source**     | Quality evaluation pipeline                                                        |
| **Dashboard Panel** | Time series with trend line                                                        |
| **Alert Threshold** | > 5% sustained                                                                     |
| **Interpretation**  | Rising hallucination rate may indicate context quality issues or model regression. |

### 17. Format Compliance Rate

| Field               | Value                                                                              |
| ------------------- | ---------------------------------------------------------------------------------- |
| **Formula**         | `valid_format_responses / total_responses × 100`                                   |
| **Unit**            | Percentage                                                                         |
| **Target**          | ≥ 99% with structured output mode                                                  |
| **Data Source**     | Output validation layer                                                            |
| **Dashboard Panel** | Stat card                                                                          |
| **Alert Threshold** | < 95%                                                                              |
| **Interpretation**  | Low compliance causes downstream failures. Enable JSON mode or structured outputs. |

### 18. Latency — Time to First Token (TTFT)

| Field               | Value                                                                     |
| ------------------- | ------------------------------------------------------------------------- |
| **Formula**         | Time from request sent to first token received                            |
| **Unit**            | Milliseconds                                                              |
| **Target**          | P50 < 300ms, P95 < 800ms, P99 < 1500ms                                    |
| **Data Source**     | Gateway timing logs                                                       |
| **Dashboard Panel** | Percentile time series (P50, P95, P99)                                    |
| **Alert Threshold** | P95 > 2× target for 10 minutes                                            |
| **Interpretation**  | TTFT affects perceived responsiveness. Varies by model and provider load. |

### 19. Latency — Tokens per Second (TPS)

| Field               | Value                                                                  |
| ------------------- | ---------------------------------------------------------------------- |
| **Formula**         | `output_tokens / generation_time_seconds`                              |
| **Unit**            | Tokens/second                                                          |
| **Target**          | ≥ 50 TPS for streaming applications                                    |
| **Data Source**     | Gateway timing logs                                                    |
| **Dashboard Panel** | Time series with percentile bands                                      |
| **Alert Threshold** | < 50% of baseline TPS                                                  |
| **Interpretation**  | Low TPS causes slow user experience. May indicate provider throttling. |

### 20. Error Rate

| Field               | Value                                                                |
| ------------------- | -------------------------------------------------------------------- |
| **Formula**         | `error_responses / total_requests × 100`                             |
| **Unit**            | Percentage                                                           |
| **Target**          | < 0.5%                                                               |
| **Data Source**     | Gateway logs                                                         |
| **Dashboard Panel** | Time series by error type (4xx, 5xx, timeout)                        |
| **Alert Threshold** | > 2% for 5 minutes                                                   |
| **Interpretation**  | Spikes indicate provider issues, rate limits, or malformed requests. |

---

## Business Metrics

### 21. TokenOps ROI

| Field               | Value                                                                   |
| ------------------- | ----------------------------------------------------------------------- |
| **Formula**         | `(total_savings − tokenops_program_cost) / tokenops_program_cost × 100` |
| **Unit**            | Percentage                                                              |
| **Target**          | ≥ 300%                                                                  |
| **Data Source**     | Finance + optimization tracking                                         |
| **Dashboard Panel** | Stat card, updated quarterly                                            |
| **Alert Threshold** | N/A                                                                     |
| **Interpretation**  | Justifies continued investment in TokenOps program.                     |

### 22. AI Cost Ratio

| Field               | Value                                                                         |
| ------------------- | ----------------------------------------------------------------------------- |
| **Formula**         | `monthly_ai_spend / monthly_revenue × 100`                                    |
| **Unit**            | Percentage                                                                    |
| **Target**          | < 3% of revenue                                                               |
| **Data Source**     | Finance data + gateway logs                                                   |
| **Dashboard Panel** | Trend line with target marker                                                 |
| **Alert Threshold** | > 5% of revenue                                                               |
| **Interpretation**  | Benchmark against industry. Rising ratio = costs growing faster than revenue. |

### 23. Unit Economics

| Field               | Value                                                                   |
| ------------------- | ----------------------------------------------------------------------- |
| **Formula**         | `ai_cost_per_customer − ai_revenue_per_customer`                        |
| **Unit**            | USD per customer per month                                              |
| **Target**          | Positive margin for ≥ 90% of customers                                  |
| **Data Source**     | Per-tenant billing data                                                 |
| **Dashboard Panel** | Distribution histogram                                                  |
| **Alert Threshold** | > 10% of customers margin-negative                                      |
| **Interpretation**  | Identifies customers whose AI usage exceeds their revenue contribution. |

### 24. Optimization Velocity

| Field               | Value                                                                 |
| ------------------- | --------------------------------------------------------------------- |
| **Formula**         | `optimization_initiatives_completed / quarter`                        |
| **Unit**            | Initiatives per quarter                                               |
| **Target**          | ≥ 3 per quarter                                                       |
| **Data Source**     | TokenOps program tracking                                             |
| **Dashboard Panel** | Quarterly bar chart                                                   |
| **Alert Threshold** | 0 initiatives in a quarter                                            |
| **Interpretation**  | Measures organizational momentum. Stalling = risk of cost regression. |

---

## Governance Metrics

### 25. Tagging Coverage

| Field               | Value                                                      |
| ------------------- | ---------------------------------------------------------- |
| **Formula**         | `tagged_requests / total_requests × 100`                   |
| **Unit**            | Percentage                                                 |
| **Target**          | 100%                                                       |
| **Data Source**     | Gateway logs                                               |
| **Dashboard Panel** | Stat card                                                  |
| **Alert Threshold** | < 95%                                                      |
| **Interpretation**  | Untagged requests = unattributable costs. Fix immediately. |

### 26. Budget Adherence Rate

| Field               | Value                                                                   |
| ------------------- | ----------------------------------------------------------------------- |
| **Formula**         | `teams_within_budget / total_teams × 100`                               |
| **Unit**            | Percentage                                                              |
| **Target**          | 100% of teams within ±10%                                               |
| **Data Source**     | Finance + gateway logs                                                  |
| **Dashboard Panel** | Scorecard by team                                                       |
| **Alert Threshold** | Any team > 120% of budget                                               |
| **Interpretation**  | Teams exceeding budgets need optimization support or budget adjustment. |

### 27. Architecture Review Compliance

| Field               | Value                                                                 |
| ------------------- | --------------------------------------------------------------------- |
| **Formula**         | `features_reviewed / features_launched × 100`                         |
| **Unit**            | Percentage                                                            |
| **Target**          | 100%                                                                  |
| **Data Source**     | Architecture review board records                                     |
| **Dashboard Panel** | Quarterly compliance scorecard                                        |
| **Alert Threshold** | Any feature launched without review                                   |
| **Interpretation**  | Unreviewed features often use expensive models without justification. |

### 28. Mean Time to Detect Cost Anomaly (MTTD)

| Field               | Value                                                             |
| ------------------- | ----------------------------------------------------------------- |
| **Formula**         | `anomaly_detected_at − anomaly_started_at`                        |
| **Unit**            | Minutes                                                           |
| **Target**          | < 15 minutes                                                      |
| **Data Source**     | Incident tracking system                                          |
| **Dashboard Panel** | Distribution chart                                                |
| **Alert Threshold** | > 60 minutes average                                              |
| **Interpretation**  | Longer MTTD = more wasted spend. Improve alerting and monitoring. |

---

_Reference from the TokenOps Atlas — [tokenops-atlas](https://github.com/kalilurrahman/tokenops-atlas)_
