# Cost Anomaly Detection — LLM Token Spend

> **Purpose:** Detect, investigate, and respond to unexpected spikes or drops in LLM token costs before they become budget-breaking incidents. This guide covers statistical methods, alert configuration, investigation workflows, and automated remediation.

---

## 1 · What Constitutes an Anomaly?

An **anomaly** is any data point that falls outside the expected range of normal behavior. In the context of LLM token spend, we define anomalies statistically:

| Type                | Definition                                                                   | Example                                                     |
| ------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Spike**           | Spend exceeds the rolling average by more than **2 standard deviations (σ)** | Daily cost jumps from $120 ± $15 to $280                    |
| **Sustained drift** | 5+ consecutive data points above **1.5σ** from the rolling average           | Gradual creep from $120 → $160 over a week                  |
| **Drop**            | Spend falls below the rolling average by more than **2σ**                    | Costs drop to $30 — may indicate a broken pipeline          |
| **Pattern break**   | Deviation from expected periodic patterns (e.g., weekday vs. weekend)        | Saturday cost equals Tuesday cost (suggests runaway batch)  |
| **Rate anomaly**    | Cost-per-request changes suddenly even if volume is stable                   | $/req jumps from $0.003 to $0.012 — model misconfiguration? |

> **Why 2σ?** For normally distributed data, ~95.4% of values fall within ±2σ. A data point beyond 2σ has a <5% chance of being normal variation, making it a strong signal without excessive false positives.

---

## 2 · Detection Methods

### 2.1 Z-Score Detection

The simplest method. Compare each data point to the rolling mean and standard deviation.

```
z_score = (current_value - rolling_mean) / rolling_stddev

if |z_score| > 2.0 → WARNING
if |z_score| > 3.0 → CRITICAL
```

**Parameters:**

| Parameter            | Recommended | Notes                                        |
| -------------------- | ----------- | -------------------------------------------- |
| Rolling window       | 14 days     | Long enough to smooth weekly cycles          |
| Min data points      | 7           | Don't alert until sufficient baseline exists |
| Threshold (warning)  | 2.0σ        | Catches ~5% false positive rate              |
| Threshold (critical) | 3.0σ        | Catches ~0.3% false positive rate            |

**Pseudocode:**

```python
def detect_zscore_anomaly(daily_costs: list[float], window: int = 14) -> list[Alert]:
    alerts = []
    for i in range(window, len(daily_costs)):
        window_data = daily_costs[i - window : i]
        mean = statistics.mean(window_data)
        stddev = statistics.stdev(window_data)
        if stddev == 0:
            continue
        z = (daily_costs[i] - mean) / stddev
        if abs(z) > 3.0:
            alerts.append(Alert(severity="critical", z_score=z, date=dates[i]))
        elif abs(z) > 2.0:
            alerts.append(Alert(severity="warning", z_score=z, date=dates[i]))
    return alerts
```

### 2.2 Rolling Average Deviation

Compare the current value to a weighted moving average. More resilient to trends than raw Z-score.

```
ema = exponential_moving_average(costs, alpha=0.15)
deviation_pct = (current - ema) / ema * 100

if deviation_pct > 50% → WARNING
if deviation_pct > 100% → CRITICAL
```

### 2.3 Percentage Change (Day-over-Day / Week-over-Week)

Simple and intuitive. Compare today's cost to yesterday's or the same day last week.

```yaml
# Alert rules
day_over_day:
  warning_threshold_pct: 40 # Today > yesterday by 40%
  critical_threshold_pct: 80 # Today > yesterday by 80%

week_over_week:
  warning_threshold_pct: 30 # Today > same-day-last-week by 30%
  critical_threshold_pct: 60
```

### 2.4 Absolute Threshold

A hard ceiling that should never be crossed. Derived from budget guardrails.

```yaml
absolute_thresholds:
  daily_cost:
    warning: 500.00 # $500/day
    critical: 1000.00 # $1,000/day — something is very wrong
  hourly_cost:
    warning: 60.00
    critical: 120.00
  cost_per_request:
    warning: 0.10
    critical: 0.50
```

### 2.5 Combined Scoring (Recommended)

Use an **anomaly score** that combines multiple signals for higher confidence:

```python
def composite_anomaly_score(
    z_score: float,
    pct_change_dod: float,
    pct_change_wow: float,
    above_absolute: bool
) -> float:
    """
    Weighted composite score. Higher = more anomalous.
    Returns 0-100 scale.
    """
    score = 0
    score += min(abs(z_score) * 15, 40)          # Max 40 points from z-score
    score += min(abs(pct_change_dod) * 0.3, 25)  # Max 25 from day-over-day
    score += min(abs(pct_change_wow) * 0.2, 20)  # Max 20 from week-over-week
    if above_absolute:
        score += 15                               # Bonus for absolute breach
    return min(score, 100)

# Thresholds
# 0-30:   Normal
# 30-60:  Warning — investigate when convenient
# 60-80:  High — investigate within 1 hour
# 80-100: Critical — investigate immediately
```

---

## 3 · Common Root Causes

When an anomaly fires, these are the most frequent causes. Use this table to guide your initial investigation:

| #   | Root Cause                     | Symptoms                                                            | Typical Cost Impact           | Detection Signal                             | MTTR           |
| --- | ------------------------------ | ------------------------------------------------------------------- | ----------------------------- | -------------------------------------------- | -------------- |
| 1   | **Prompt regression**          | Token count per request increases; output quality may not change    | +20–200% per request          | Cost-per-request spike with stable volume    | 1–4 hours      |
| 2   | **Upstream volume spike**      | Request volume jumps; cost per request is stable                    | +50–500% total cost           | Volume anomaly, not rate anomaly             | 2–8 hours      |
| 3   | **Retry storm**                | High error rate + high retry count; same request repeated           | +100–1000% total cost         | Error rate spike + volume spike              | 30 min–2 hours |
| 4   | **Model migration error**      | Requests routed to wrong (more expensive) model                     | +200–2000% per request        | Model distribution shift                     | 15 min–1 hour  |
| 5   | **Cache invalidation**         | Cache hit rate drops suddenly; same queries re-executed             | +30–80% total cost            | Cache hit rate drop + volume stable          | 1–2 hours      |
| 6   | **New feature launch**         | New service or endpoint starts sending requests                     | +20–100% total cost           | New `service` or `feature` tag appears       | 2–4 hours      |
| 7   | **Context window stuffing**    | Input tokens per request balloons (e.g., full conversation history) | +50–300% per request          | Input token count anomaly                    | 2–8 hours      |
| 8   | **Batch job misconfiguration** | Off-hours cost spike; single service dominates                      | +100–500% during batch window | Time-of-day anomaly + service concentration  | 1–2 hours      |
| 9   | **Provider pricing change**    | Cost-per-token increases with identical usage pattern               | +10–100% total cost           | Cost-per-token anomaly, stable volume/tokens | N/A (external) |
| 10  | **Runaway agent loop**         | Agent calls itself or tools repeatedly without termination          | +500–5000% total cost         | Extreme volume spike from single session     | 15 min–1 hour  |

---

## 4 · Alert Configuration

### 4.1 Alert Rule Definitions

```yaml
# tokenops-anomaly-alerts.yaml
# Place alongside budget-guardrails.yaml in your gateway config directory.

schema_version: "1.0.0"

alert_rules:
  # --- Hourly Cost Spike ---
  - name: hourly_cost_spike
    description: "Hourly cost exceeds 2σ from 14-day rolling average"
    metric: hourly_total_cost_usd
    detection:
      method: z_score
      window_days: 14
      warning_threshold: 2.0
      critical_threshold: 3.0
    evaluation_interval: 5m
    notification:
      warning:
        channels: [slack]
        message: >
          ⚠️ Hourly LLM cost anomaly detected.
          Current: ${{ current_value }} | Expected: ${{ expected_value }} ± ${{ stddev }}
          Z-score: {{ z_score }} | Service: {{ top_service }}
      critical:
        channels: [slack, pagerduty]
        message: >
          🚨 CRITICAL: Hourly LLM cost is {{ z_score }}σ above normal.
          Current: ${{ current_value }} | Expected: ${{ expected_value }}
          Investigate immediately. Top contributor: {{ top_service }}
    suppression:
      # Don't re-alert for the same anomaly within this window
      cooldown_minutes: 30

  # --- Cost-Per-Request Anomaly ---
  - name: cost_per_request_anomaly
    description: "Average cost per request deviates significantly"
    metric: avg_cost_per_request_usd
    detection:
      method: z_score
      window_days: 14
      warning_threshold: 2.0
      critical_threshold: 3.0
    group_by: [service, model]
    evaluation_interval: 15m
    notification:
      warning:
        channels: [slack]
        message: >
          ⚠️ Cost-per-request anomaly for {{ service }} on {{ model }}.
          Current: ${{ current_value }}/req | Baseline: ${{ expected_value }}/req
          Possible causes: prompt regression, model switch, context bloat.
      critical:
        channels: [slack, email]
        message: >
          🚨 Cost-per-request for {{ service }} is {{ pct_change }}% above normal.
          Likely causes: model routing error or prompt regression.

  # --- Volume Spike ---
  - name: request_volume_spike
    description: "Request volume exceeds expected range"
    metric: hourly_request_count
    detection:
      method: percentage_change
      comparison: same_hour_last_week
      warning_threshold_pct: 50
      critical_threshold_pct: 100
    group_by: [service]
    evaluation_interval: 10m
    notification:
      warning:
        channels: [slack]
        message: >
          ⚠️ Request volume for {{ service }} is {{ pct_change }}% above
          the same hour last week. Investigate upstream traffic patterns.

  # --- Error Rate / Retry Storm ---
  - name: retry_storm
    description: "Error rate + retry volume exceeds normal thresholds"
    metric: error_rate
    detection:
      method: absolute_threshold
      warning_threshold: 0.10 # 10% error rate
      critical_threshold: 0.25 # 25% error rate
    secondary_metric: retry_count_per_hour
    secondary_detection:
      method: z_score
      warning_threshold: 2.0
    group_by: [service, provider]
    evaluation_interval: 5m
    notification:
      critical:
        channels: [slack, pagerduty]
        message: >
          🚨 Retry storm detected for {{ service }} on {{ provider }}.
          Error rate: {{ error_rate }}% | Retries/hour: {{ retry_count }}
          Circuit breaker may be needed.

  # --- Cache Hit Rate Drop ---
  - name: cache_degradation
    description: "Semantic cache hit rate drops below baseline"
    metric: cache_hit_rate
    detection:
      method: percentage_change
      comparison: rolling_average_7d
      warning_threshold_pct: -30 # 30% drop from baseline
      critical_threshold_pct: -50
    evaluation_interval: 15m
    notification:
      warning:
        channels: [slack]
        message: >
          ⚠️ Cache hit rate dropped to {{ current_value }}%
          (baseline: {{ baseline }}%). Check for cache invalidation events.

  # --- Daily Budget Pace ---
  - name: daily_budget_pace
    description: "Projected daily cost will exceed daily budget allocation"
    metric: projected_daily_cost_usd
    detection:
      method: absolute_threshold
      # Calculated as: monthly_budget / days_in_month * overage_factor
      warning_threshold: "{{ daily_budget * 1.2 }}"
      critical_threshold: "{{ daily_budget * 1.5 }}"
    evaluation_interval: 30m
    notification:
      warning:
        channels: [slack]
        message: >
          ⚠️ Today's projected cost (${{ projected }}) will exceed the
          daily budget (${{ daily_budget }}) by {{ overage_pct }}%.

  # --- Model Distribution Shift ---
  - name: model_distribution_shift
    description: "Traffic distribution across models changes unexpectedly"
    metric: model_request_share
    detection:
      method: distribution_divergence
      baseline_window_days: 7
      kl_divergence_threshold: 0.15
    evaluation_interval: 1h
    notification:
      warning:
        channels: [slack]
        message: >
          ⚠️ Model traffic distribution has shifted significantly.
          This may indicate a routing config change or model availability issue.
          Top change: {{ model }} went from {{ baseline_pct }}% → {{ current_pct }}%.
```

### 4.2 Alert Severity Matrix

| Anomaly Score | Severity     | Response Time  | Channels          | Escalation                     |
| ------------- | ------------ | -------------- | ----------------- | ------------------------------ |
| 30–60         | **Warning**  | Within 4 hours | Slack             | Service owner                  |
| 60–80         | **High**     | Within 1 hour  | Slack + Email     | Service owner + FinOps         |
| 80–100        | **Critical** | Within 15 min  | Slack + PagerDuty | FinOps + Engineering Lead + VP |

---

## 5 · Investigation Workflow

When an anomaly alert fires, follow this systematic workflow:

### Step 1: Confirm the Anomaly (2 min)

- [ ] Check the alert details: which metric, what magnitude, which service
- [ ] Open the cost dashboard and visually confirm the spike/drop
- [ ] Rule out known causes: scheduled batch jobs, planned launches, pricing changes

### Step 2: Identify the Scope (5 min)

- [ ] Is it one service or multiple services?
- [ ] Is it one provider/model or across providers?
- [ ] Is it a volume anomaly, a rate anomaly, or both?
- [ ] When did it start? (Correlate with deployments, config changes)

```sql
-- Identify top cost contributors in the anomaly window
SELECT
    service,
    model,
    COUNT(*)                                    AS request_count,
    SUM(total_tokens)                           AS total_tokens,
    SUM(estimated_cost_usd)                     AS total_cost,
    AVG(estimated_cost_usd)                     AS avg_cost_per_req,
    AVG(input_tokens)                           AS avg_input_tokens,
    AVG(output_tokens)                          AS avg_output_tokens
FROM llm_usage_log
WHERE created_at >= NOW() - INTERVAL '2 hours'
GROUP BY service, model
ORDER BY total_cost DESC
LIMIT 10;
```

### Step 3: Drill into the Root Cause (10 min)

- [ ] **If cost-per-request increased:** Check prompt changes, model routing, context window size
- [ ] **If volume increased:** Check upstream traffic, retry counts, new features
- [ ] **If both:** Check for retry storms or runaway loops

```sql
-- Compare current period to baseline
WITH current_period AS (
    SELECT
        service,
        model,
        AVG(input_tokens)           AS avg_input,
        AVG(output_tokens)          AS avg_output,
        AVG(estimated_cost_usd)     AS avg_cost,
        COUNT(*)                    AS req_count,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END)::float
            / COUNT(*)              AS error_rate
    FROM llm_usage_log
    WHERE created_at >= NOW() - INTERVAL '1 hour'
    GROUP BY service, model
),
baseline AS (
    SELECT
        service,
        model,
        AVG(input_tokens)           AS avg_input,
        AVG(output_tokens)          AS avg_output,
        AVG(estimated_cost_usd)     AS avg_cost,
        COUNT(*) / 14.0             AS avg_hourly_req_count  -- 14d baseline
    FROM llm_usage_log
    WHERE created_at >= NOW() - INTERVAL '14 days'
      AND created_at <  NOW() - INTERVAL '1 hour'
      AND EXTRACT(HOUR FROM created_at) = EXTRACT(HOUR FROM NOW())
    GROUP BY service, model
)
SELECT
    c.service,
    c.model,
    c.req_count                                     AS current_reqs,
    ROUND(b.avg_hourly_req_count)                   AS baseline_reqs,
    ROUND((c.req_count - b.avg_hourly_req_count)
        / NULLIF(b.avg_hourly_req_count, 0) * 100)  AS volume_change_pct,
    ROUND(c.avg_cost::numeric, 6)                    AS current_avg_cost,
    ROUND(b.avg_cost::numeric, 6)                    AS baseline_avg_cost,
    ROUND((c.avg_cost - b.avg_cost)
        / NULLIF(b.avg_cost, 0) * 100)               AS cost_change_pct,
    ROUND(c.avg_input)                               AS current_avg_input_tokens,
    ROUND(b.avg_input)                               AS baseline_avg_input_tokens,
    ROUND(c.error_rate * 100, 1)                     AS error_rate_pct
FROM current_period c
JOIN baseline b ON c.service = b.service AND c.model = b.model
ORDER BY (c.req_count * c.avg_cost) DESC;
```

### Step 4: Correlate with Events (5 min)

- [ ] Check deployment logs: was there a release in the last 2 hours?
- [ ] Check config changes: routing rules, prompt updates, feature flags
- [ ] Check external factors: provider status page, pricing announcements
- [ ] Check cache metrics: hit rate changes, eviction events

### Step 5: Remediate (variable)

| Root Cause             | Immediate Action                         | Long-term Fix                  |
| ---------------------- | ---------------------------------------- | ------------------------------ |
| Prompt regression      | Rollback to previous prompt version      | Add token-count CI gate        |
| Volume spike           | Apply rate limiting or throttle upstream | Capacity planning review       |
| Retry storm            | Enable circuit breaker; fix root error   | Improve error handling         |
| Model misconfiguration | Fix routing rule; redeploy               | Add routing integration tests  |
| Cache invalidation     | Warm cache; fix invalidation bug         | Cache health monitoring        |
| Runaway agent          | Kill the session; add loop limits        | Max-iteration guardrails       |
| New feature launch     | Apply budget guardrails to new service   | Require cost ADR before launch |

### Step 6: Document & Close (5 min)

- [ ] Write a brief incident report (even for warnings)
- [ ] Update anomaly thresholds if the alert was a false positive
- [ ] Add the root cause to your runbook if it was novel
- [ ] Update budget forecasts if the anomaly represents a new normal

---

## 6 · Dashboard Design

Build a dedicated **Cost Anomaly Monitoring** dashboard with these panels:

### Row 1: High-Level Indicators

| Panel                       | Type                | Description                                                    |
| --------------------------- | ------------------- | -------------------------------------------------------------- |
| **Current Anomaly Score**   | Single stat (gauge) | Composite anomaly score (0–100), color-coded: green/yellow/red |
| **Daily Cost vs. Forecast** | Time series + band  | Actual daily cost with ±2σ confidence band shaded              |
| **Active Alerts**           | Alert list          | Currently firing anomaly alerts with severity and age          |

### Row 2: Cost Decomposition

| Panel                | Type                      | Description                                                                   |
| -------------------- | ------------------------- | ----------------------------------------------------------------------------- |
| **Cost by Service**  | Stacked bar (hourly)      | Hourly cost broken down by service; highlights which service drives anomalies |
| **Cost by Model**    | Stacked bar (hourly)      | Same, broken down by model; reveals model-routing shifts                      |
| **Cost per Request** | Time series (per service) | Avg $/request per service; detects rate anomalies independent of volume       |

### Row 3: Volume & Error Metrics

| Panel              | Type                       | Description                                                  |
| ------------------ | -------------------------- | ------------------------------------------------------------ |
| **Request Volume** | Time series (per service)  | Hourly request count; overlayed with baseline                |
| **Error Rate**     | Time series (per provider) | Error % per provider; spikes indicate retry storms           |
| **Cache Hit Rate** | Time series                | Semantic cache hit rate; drops correlate with cost increases |

### Row 4: Deep-Dive Panels

| Panel                         | Type                   | Description                                                              |
| ----------------------------- | ---------------------- | ------------------------------------------------------------------------ |
| **Token Distribution**        | Box plot / histogram   | Distribution of input + output tokens per request; detects context bloat |
| **Model Traffic Share**       | Pie chart (rolling 1h) | Current model distribution vs. baseline; reveals routing shifts          |
| **Top 10 Expensive Requests** | Table                  | Specific request IDs, cost, tokens, and service for the costliest calls  |

### Row 5: Trend Analysis

| Panel                        | Type                     | Description                                        |
| ---------------------------- | ------------------------ | -------------------------------------------------- |
| **7-Day Cost Trend**         | Sparkline per service    | Compact trend view across services                 |
| **Month-to-Date vs. Budget** | Progress bar             | MTD spend as % of monthly budget per service       |
| **Cost Forecast (30-day)**   | Time series + projection | Linear projection of current trend to end of month |

---

## 7 · Automated Response

For high-confidence anomalies (composite score ≥ 80), the gateway can take automated action before a human investigates:

### 7.1 Automated Response Rules

```yaml
automated_responses:
  # Automatically downgrade to cheaper model during cost spikes
  - name: auto_model_downgrade
    trigger:
      anomaly_score: ">= 80"
      anomaly_type: cost_spike
      duration_minutes: 15 # Must persist for 15 min
    action:
      type: model_downgrade
      from_tier: frontier
      to_tier: balanced
      affected_services: all
      exclude_services: [critical_safety_review] # Never downgrade these
    notification:
      channels: [slack, email]
      message: >
        🤖 AUTO-RESPONSE: Frontier models temporarily downgraded to balanced
        tier due to cost anomaly (score: {{ score }}). Manual review required.
    auto_revert:
      after_minutes: 60
      condition: anomaly_score < 50

  # Rate-limit a specific service during volume spikes
  - name: auto_rate_limit
    trigger:
      anomaly_score: ">= 70"
      anomaly_type: volume_spike
      service: "*" # Any service
    action:
      type: rate_limit
      reduce_rpm_by_pct: 50 # Cut RPM in half
      min_rpm: 5 # Never go below 5 RPM
    notification:
      channels: [slack]
      message: >
        🤖 AUTO-RESPONSE: Rate limit for {{ service }} reduced by 50%
        due to volume anomaly. Current RPM cap: {{ new_rpm }}.
    auto_revert:
      after_minutes: 30
      condition: volume < baseline * 1.3

  # Kill runaway sessions (agent loops)
  - name: auto_kill_runaway
    trigger:
      session_cost_usd: "> 10.00"
      session_request_count: "> 100"
      session_duration_minutes: "< 5"
    action:
      type: terminate_session
      response_code: 429
      response_message: "Session terminated: cost limit exceeded"
    notification:
      channels: [slack, pagerduty]
      message: >
        🤖 AUTO-RESPONSE: Runaway session terminated.
        Session ID: {{ session_id }} | Cost: ${{ cost }} | Requests: {{ count }}
```

### 7.2 Automated Response Safety Rules

To prevent automated responses from causing more harm than good:

- [ ] **Minimum anomaly duration:** Never auto-respond to a spike shorter than 10 minutes (could be a data lag artifact)
- [ ] **Exclude critical services:** Maintain a whitelist of services that must never be auto-degraded or rate-limited
- [ ] **Auto-revert:** Every automated action must have a time-bound auto-revert policy
- [ ] **Human confirmation for escalation:** Automated responses can downgrade or throttle, but cannot fully block a service without human confirmation
- [ ] **Audit log:** Every automated action is logged with full context for post-incident review

---

## 8 · SQL Queries for Anomaly Detection

These queries run against the `llm_usage_log` table from the TokenOps database schema.

### 8.1 Daily Cost with Z-Score

```sql
-- Calculate daily cost with Z-score against 14-day rolling average
WITH daily_costs AS (
    SELECT
        DATE(created_at)                                AS cost_date,
        SUM(estimated_cost_usd)                         AS daily_cost
    FROM llm_usage_log
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(created_at)
),
rolling_stats AS (
    SELECT
        cost_date,
        daily_cost,
        AVG(daily_cost) OVER (
            ORDER BY cost_date
            ROWS BETWEEN 14 PRECEDING AND 1 PRECEDING
        )                                               AS rolling_mean,
        STDDEV(daily_cost) OVER (
            ORDER BY cost_date
            ROWS BETWEEN 14 PRECEDING AND 1 PRECEDING
        )                                               AS rolling_stddev
    FROM daily_costs
)
SELECT
    cost_date,
    ROUND(daily_cost::numeric, 2)                       AS daily_cost,
    ROUND(rolling_mean::numeric, 2)                     AS rolling_mean,
    ROUND(rolling_stddev::numeric, 2)                   AS rolling_stddev,
    ROUND(
        (daily_cost - rolling_mean) / NULLIF(rolling_stddev, 0), 2
    )                                                   AS z_score,
    CASE
        WHEN ABS((daily_cost - rolling_mean) / NULLIF(rolling_stddev, 0)) > 3.0
            THEN '🚨 CRITICAL'
        WHEN ABS((daily_cost - rolling_mean) / NULLIF(rolling_stddev, 0)) > 2.0
            THEN '⚠️ WARNING'
        ELSE '✅ NORMAL'
    END                                                 AS status
FROM rolling_stats
WHERE rolling_stddev IS NOT NULL
ORDER BY cost_date DESC
LIMIT 30;
```

### 8.2 Hourly Cost-Per-Request Anomalies by Service

```sql
-- Detect services with abnormal cost-per-request in the last 4 hours
WITH hourly_rates AS (
    SELECT
        DATE_TRUNC('hour', created_at)                  AS hour,
        service,
        model,
        COUNT(*)                                        AS request_count,
        AVG(estimated_cost_usd)                         AS avg_cost_per_req
    FROM llm_usage_log
    WHERE created_at >= NOW() - INTERVAL '14 days'
    GROUP BY DATE_TRUNC('hour', created_at), service, model
),
baselines AS (
    SELECT
        service,
        model,
        AVG(avg_cost_per_req)                           AS baseline_avg,
        STDDEV(avg_cost_per_req)                        AS baseline_stddev
    FROM hourly_rates
    WHERE hour < NOW() - INTERVAL '4 hours'
    GROUP BY service, model
    HAVING COUNT(*) >= 24                               -- Minimum 24 hours of data
),
recent AS (
    SELECT *
    FROM hourly_rates
    WHERE hour >= NOW() - INTERVAL '4 hours'
)
SELECT
    r.hour,
    r.service,
    r.model,
    r.request_count,
    ROUND(r.avg_cost_per_req::numeric, 6)               AS current_avg_cost,
    ROUND(b.baseline_avg::numeric, 6)                   AS baseline_avg_cost,
    ROUND(
        (r.avg_cost_per_req - b.baseline_avg)
        / NULLIF(b.baseline_stddev, 0), 2
    )                                                   AS z_score,
    ROUND(
        (r.avg_cost_per_req - b.baseline_avg)
        / NULLIF(b.baseline_avg, 0) * 100, 1
    )                                                   AS pct_change
FROM recent r
JOIN baselines b ON r.service = b.service AND r.model = b.model
WHERE ABS(
    (r.avg_cost_per_req - b.baseline_avg) / NULLIF(b.baseline_stddev, 0)
) > 2.0
ORDER BY z_score DESC;
```

### 8.3 Retry Storm Detection

```sql
-- Detect retry storms: services with high error rates AND high volume
SELECT
    service,
    provider,
    model,
    COUNT(*)                                            AS total_requests,
    COUNT(CASE WHEN status_code >= 400 THEN 1 END)      AS error_count,
    ROUND(
        COUNT(CASE WHEN status_code >= 400 THEN 1 END)::numeric
        / COUNT(*) * 100, 1
    )                                                   AS error_rate_pct,
    SUM(estimated_cost_usd)                             AS wasted_cost,
    COUNT(CASE WHEN is_retry = true THEN 1 END)          AS retry_count
FROM llm_usage_log
WHERE created_at >= NOW() - INTERVAL '1 hour'
GROUP BY service, provider, model
HAVING
    COUNT(*) > 50                                       -- Min volume threshold
    AND COUNT(CASE WHEN status_code >= 400 THEN 1 END)::numeric
        / COUNT(*) > 0.10                               -- >10% error rate
ORDER BY wasted_cost DESC;
```

### 8.4 Token Count Drift Detection

```sql
-- Detect prompt/context bloat: average token counts trending upward
WITH weekly_tokens AS (
    SELECT
        DATE_TRUNC('week', created_at)                  AS week,
        service,
        AVG(input_tokens)                               AS avg_input_tokens,
        AVG(output_tokens)                              AS avg_output_tokens,
        PERCENTILE_CONT(0.95) WITHIN GROUP
            (ORDER BY input_tokens)                     AS p95_input_tokens
    FROM llm_usage_log
    WHERE created_at >= CURRENT_DATE - INTERVAL '8 weeks'
    GROUP BY DATE_TRUNC('week', created_at), service
)
SELECT
    w.week,
    w.service,
    ROUND(w.avg_input_tokens)                           AS avg_input,
    ROUND(w.p95_input_tokens)                           AS p95_input,
    ROUND(w.avg_output_tokens)                          AS avg_output,
    ROUND(
        (w.avg_input_tokens - LAG(w.avg_input_tokens) OVER (
            PARTITION BY w.service ORDER BY w.week
        )) / NULLIF(LAG(w.avg_input_tokens) OVER (
            PARTITION BY w.service ORDER BY w.week
        ), 0) * 100, 1
    )                                                   AS input_growth_pct
FROM weekly_tokens w
ORDER BY w.service, w.week;
```

### 8.5 New Service / Feature Detection

```sql
-- Find services or features that appeared in the last 24 hours
-- but were not seen in the previous 14 days (i.e., new traffic sources)
SELECT
    service,
    feature,
    model,
    MIN(created_at)                                     AS first_seen,
    COUNT(*)                                            AS request_count,
    SUM(estimated_cost_usd)                             AS total_cost
FROM llm_usage_log
WHERE created_at >= NOW() - INTERVAL '24 hours'
  AND service NOT IN (
      SELECT DISTINCT service
      FROM llm_usage_log
      WHERE created_at >= NOW() - INTERVAL '15 days'
        AND created_at <  NOW() - INTERVAL '24 hours'
  )
GROUP BY service, feature, model
ORDER BY total_cost DESC;
```

---

## 9 · Checklist: Setting Up Anomaly Detection

- [ ] **Instrument all LLM calls** with cost, tokens, model, service, and feature tags
- [ ] **Establish a 14-day baseline** before enabling anomaly alerts
- [ ] **Deploy Z-score alerts** for daily cost and cost-per-request
- [ ] **Deploy absolute threshold alerts** based on budget guardrails
- [ ] **Build the anomaly dashboard** with the panels described in Section 6
- [ ] **Write runbooks** for each root cause in Section 3
- [ ] **Configure automated responses** for high-confidence anomalies (Section 7)
- [ ] **Schedule weekly review** of anomaly alert accuracy (false positive / false negative rate)
- [ ] **Tune thresholds quarterly** as usage patterns evolve

---

_Template version 1.0 — Maintained by the TokenOps team._
