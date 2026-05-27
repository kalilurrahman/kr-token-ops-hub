# TokenOps KPI Dashboard Specification

> Technical specification for building a comprehensive TokenOps monitoring dashboard.

---

## Architecture Overview

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ LLM Gateway  │   │ Provider     │   │ Product      │
│ (request     │   │ Billing APIs │   │ Analytics    │
│  logs)       │   │              │   │              │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       └──────────┬───────┴──────────────────┘
                  │
          ┌───────▼───────┐
          │   ETL / CDC   │
          │   Pipeline    │
          └───────┬───────┘
                  │
       ┌──────────┼──────────┐
       │                     │
┌──────▼──────┐   ┌──────────▼──────────┐
│ Time-Series │   │  Data Warehouse     │
│ DB          │   │  (BigQuery/Snowflake│
│ (Prometheus)│   │   /Postgres)        │
└──────┬──────┘   └──────────┬──────────┘
       │                     │
       └──────────┬──────────┘
                  │
          ┌───────▼───────┐
          │   Dashboard   │
          │   (Grafana /  │
          │   Tableau)    │
          └───────────────┘
```

### Data Sources
1. **Gateway logs:** Real-time request/response data (tokens, cost, latency, model, tags)
2. **Provider billing APIs:** Monthly invoices, usage reports, rate changes
3. **Product analytics:** User activity, feature usage, business outcomes
4. **Finance data:** Budgets, cost centers, chargeback allocations

### Data Pipeline
- **Real-time path:** Gateway → Prometheus (metrics) → Grafana (dashboards)
- **Analytical path:** Gateway → Message queue → ETL → Data warehouse → BI tool
- **Refresh intervals:** Real-time metrics every 15s, cost aggregates every 5 min, billing data daily

---

## View 1: Executive Dashboard

_Audience: VP Engineering, CTO, CFO_  
_Refresh: Daily_

### Panel 1.1: Key Metrics Cards (top row)

| Card | Metric | SQL |
|------|--------|-----|
| **Total Spend** | Month-to-date AI spend | `SELECT SUM(cost_usd) FROM usage WHERE created_at >= DATE_TRUNC('month', NOW())` |
| **Budget Status** | % of monthly budget used | `SELECT SUM(cost_usd) / budget * 100 FROM usage CROSS JOIN budgets WHERE ...` |
| **Savings Rate** | Cumulative savings vs. unoptimized baseline | `SELECT (baseline_cost - actual_cost) / baseline_cost * 100` |
| **Cost/User** | AI cost per active user | `SELECT SUM(cost_usd) / COUNT(DISTINCT user_id) FROM usage WHERE ...` |

### Panel 1.2: Monthly Cost Trend (line chart)

```sql
SELECT
  DATE_TRUNC('month', created_at) AS month,
  SUM(cost_usd) AS actual_cost,
  MAX(budget) AS budget
FROM usage u
LEFT JOIN monthly_budgets b ON DATE_TRUNC('month', u.created_at) = b.month
WHERE created_at >= NOW() - INTERVAL '12 months'
GROUP BY 1
ORDER BY 1;
```

### Panel 1.3: Top 5 Cost Drivers (horizontal bar chart)

```sql
SELECT
  service,
  SUM(cost_usd) AS monthly_cost,
  SUM(cost_usd) / SUM(SUM(cost_usd)) OVER () * 100 AS pct_of_total
FROM usage
WHERE created_at >= DATE_TRUNC('month', NOW())
GROUP BY service
ORDER BY monthly_cost DESC
LIMIT 5;
```

### Panel 1.4: Team Budget Adherence (table with RAG status)

```sql
SELECT
  team,
  budget_usd,
  SUM(cost_usd) AS actual_usd,
  ROUND(SUM(cost_usd) / budget_usd * 100, 1) AS utilization_pct,
  CASE
    WHEN SUM(cost_usd) / budget_usd > 1.0 THEN '🔴 Over'
    WHEN SUM(cost_usd) / budget_usd > 0.9 THEN '🟡 Near'
    ELSE '🟢 OK'
  END AS status
FROM usage u
JOIN team_budgets tb ON u.team = tb.team
WHERE created_at >= DATE_TRUNC('month', NOW())
GROUP BY team, budget_usd
ORDER BY utilization_pct DESC;
```

---

## View 2: Engineering Dashboard

_Audience: Platform engineers, SREs_  
_Refresh: Real-time (15s)_

### Panel 2.1: Cost by Service Heatmap

```sql
SELECT
  service,
  DATE_TRUNC('hour', created_at) AS hour,
  SUM(cost_usd) AS hourly_cost
FROM usage
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY service, hour
ORDER BY service, hour;
```

### Panel 2.2: Model Distribution (pie chart)

```sql
SELECT
  model,
  COUNT(*) AS request_count,
  SUM(cost_usd) AS total_cost,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS pct_requests
FROM usage
WHERE created_at >= DATE_TRUNC('month', NOW())
GROUP BY model
ORDER BY total_cost DESC;
```

### Panel 2.3: Latency Percentiles (time series)

```sql
SELECT
  DATE_TRUNC('5 minutes', created_at) AS time_bucket,
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY latency_ms) AS p50,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) AS p95,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms) AS p99
FROM usage
WHERE created_at >= NOW() - INTERVAL '6 hours'
GROUP BY 1
ORDER BY 1;
```

### Panel 2.4: Cache Hit Rate (time series with target line)

```sql
SELECT
  DATE_TRUNC('hour', created_at) AS hour,
  COUNT(CASE WHEN cached THEN 1 END) * 100.0 / COUNT(*) AS hit_rate_pct
FROM usage
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY 1
ORDER BY 1;
```

### Panel 2.5: Error Rate by Provider (stacked area chart)

```sql
SELECT
  DATE_TRUNC('5 minutes', created_at) AS time_bucket,
  provider,
  COUNT(CASE WHEN status_code >= 400 THEN 1 END) * 100.0 / COUNT(*) AS error_rate
FROM usage
WHERE created_at >= NOW() - INTERVAL '6 hours'
GROUP BY 1, 2
ORDER BY 1;
```

### Panel 2.6: Token Usage Distribution (histogram)

```sql
SELECT
  width_bucket(total_tokens, 0, 10000, 20) AS bucket,
  COUNT(*) AS request_count
FROM usage
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY 1
ORDER BY 1;
```

### Panel 2.7: Anomaly Detection (stat + alert panel)

```sql
-- Z-score anomaly detection on hourly cost
WITH hourly_costs AS (
  SELECT
    DATE_TRUNC('hour', created_at) AS hour,
    SUM(cost_usd) AS hourly_cost
  FROM usage
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY 1
),
stats AS (
  SELECT
    AVG(hourly_cost) AS mean_cost,
    STDDEV(hourly_cost) AS stddev_cost
  FROM hourly_costs
  WHERE hour < NOW() - INTERVAL '1 hour'
)
SELECT
  h.hour,
  h.hourly_cost,
  (h.hourly_cost - s.mean_cost) / NULLIF(s.stddev_cost, 0) AS z_score,
  CASE
    WHEN ABS((h.hourly_cost - s.mean_cost) / NULLIF(s.stddev_cost, 0)) > 3 THEN '🔴 ANOMALY'
    WHEN ABS((h.hourly_cost - s.mean_cost) / NULLIF(s.stddev_cost, 0)) > 2 THEN '🟡 WARNING'
    ELSE '🟢 NORMAL'
  END AS status
FROM hourly_costs h
CROSS JOIN stats s
WHERE h.hour >= NOW() - INTERVAL '24 hours'
ORDER BY h.hour DESC;
```

---

## View 3: Finance Dashboard

_Audience: Finance partner, FinOps team_  
_Refresh: Daily_

### Panel 3.1: Cost by Cost Center (stacked bar chart)

```sql
SELECT
  DATE_TRUNC('month', created_at) AS month,
  cost_center,
  SUM(cost_usd) AS monthly_cost
FROM usage
WHERE created_at >= NOW() - INTERVAL '6 months'
GROUP BY 1, 2
ORDER BY 1, 2;
```

### Panel 3.2: Budget vs Actual (grouped bar chart)

```sql
SELECT
  team,
  b.budget_usd,
  SUM(u.cost_usd) AS actual_usd,
  b.budget_usd - SUM(u.cost_usd) AS variance
FROM usage u
JOIN team_budgets b ON u.team = b.team AND DATE_TRUNC('month', u.created_at) = b.month
WHERE u.created_at >= DATE_TRUNC('month', NOW())
GROUP BY team, b.budget_usd;
```

### Panel 3.3: Cost Forecast (line chart with confidence bands)

```sql
-- Simple linear projection from last 3 months
WITH monthly AS (
  SELECT
    DATE_TRUNC('month', created_at) AS month,
    SUM(cost_usd) AS cost
  FROM usage
  WHERE created_at >= NOW() - INTERVAL '3 months'
  GROUP BY 1
)
SELECT
  month,
  cost,
  'actual' AS type
FROM monthly
UNION ALL
SELECT
  DATE_TRUNC('month', NOW()) + INTERVAL '1 month' * gs AS month,
  (SELECT AVG(cost) FROM monthly) * (1 + 0.05 * gs) AS cost,
  'forecast' AS type
FROM generate_series(1, 3) gs;
```

### Panel 3.4: Chargeback Report (table)

```sql
SELECT
  team,
  cost_center,
  SUM(cost_usd) AS charged_amount,
  COUNT(*) AS total_requests,
  SUM(input_tokens + output_tokens) AS total_tokens
FROM usage
WHERE created_at >= DATE_TRUNC('month', NOW())
  AND created_at < DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
GROUP BY team, cost_center
ORDER BY charged_amount DESC;
```

---

## View 4: Product Dashboard

_Audience: Product managers_  
_Refresh: Daily_

### Panel 4.1: Cost per Feature (table)

```sql
SELECT
  feature,
  COUNT(*) AS requests,
  SUM(cost_usd) AS monthly_cost,
  AVG(cost_usd) AS avg_cost_per_request,
  SUM(cost_usd) / NULLIF(COUNT(DISTINCT user_id), 0) AS cost_per_user
FROM usage
WHERE created_at >= DATE_TRUNC('month', NOW())
GROUP BY feature
ORDER BY monthly_cost DESC;
```

### Panel 4.2: Unit Economics Trend (line chart)

```sql
SELECT
  DATE_TRUNC('week', u.created_at) AS week,
  SUM(u.cost_usd) / NULLIF(COUNT(DISTINCT u.user_id), 0) AS cost_per_user,
  SUM(r.revenue) / NULLIF(COUNT(DISTINCT r.user_id), 0) AS revenue_per_user
FROM usage u
LEFT JOIN revenue r ON DATE_TRUNC('week', u.created_at) = DATE_TRUNC('week', r.date)
WHERE u.created_at >= NOW() - INTERVAL '6 months'
GROUP BY 1
ORDER BY 1;
```

---

## Alert Configuration

### Critical Alerts (page on-call)

| Alert | Condition | Severity |
|-------|-----------|----------|
| Budget exceeded | `month_to_date_spend > monthly_budget` | P1 |
| Cost anomaly | `hourly_cost z-score > 3` | P1 |
| Provider outage | `error_rate > 10% for 5 min` | P1 |

### Warning Alerts (Slack notification)

| Alert | Condition | Severity |
|-------|-----------|----------|
| Budget approaching | `utilization > 80% with > 7 days remaining` | P2 |
| Cache degradation | `cache_hit_rate < 50% of baseline` | P2 |
| Latency spike | `p95_latency > 2× target for 15 min` | P2 |
| Cost per request increase | `avg_cost_per_request > 150% of 7-day avg` | P3 |
| Retry rate elevated | `retry_rate > 5% for 30 min` | P3 |

---

## Implementation Recommendations

### Recommended Stack

| Component | Recommended Tool | Alternative |
|-----------|-----------------|-------------|
| Time-series metrics | Prometheus | Datadog, CloudWatch |
| Dashboards | Grafana | Tableau, Metabase |
| Data warehouse | PostgreSQL/BigQuery | Snowflake, Redshift |
| Alerting | Grafana Alerts + PagerDuty | Opsgenie, Slack |

### Refresh Intervals

| Dashboard | Refresh |
|-----------|---------|
| Engineering (real-time) | 15 seconds |
| Executive | Daily (9 AM) |
| Finance | Daily (end of day) |
| Product | Daily |
| Alerts | Continuous (15s evaluation) |

---

*Reference from the TokenOps Atlas — [tokenops-atlas](https://github.com/kalilurrahman/tokenops-atlas)*
