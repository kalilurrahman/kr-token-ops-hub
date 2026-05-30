# Multi-Tenant Token Billing Guide

**Audience:** Platform engineers building SaaS products with LLM features  
**Purpose:** Implement per-tenant token usage tracking, billing, and margin management

---

## Why Per-Tenant Billing Matters

In a multi-tenant SaaS platform, LLM costs are shared infrastructure. Without per-tenant tracking:

- **Margin erosion:** Heavy users subsidized by light users
- **No accountability:** No team or customer owns their consumption
- **Abuse exposure:** No mechanism to limit excessive usage
- **Pricing blindness:** Cannot price AI features accurately

---

## Architecture

```
Tenant Request ──► API Gateway ──► Tenant Tagger ──► LLM Router ──► Provider API
                      │                                    │
                      └──► Usage Logger ◄──────────────────┘
                              │
                      ┌───────▼───────┐
                      │ Usage Database │──► Billing Engine ──► Invoice
                      └───────────────┘
```

### Tagging Schema

```yaml
tenant_metadata:
  tenant_id: "tenant_abc123" # Required
  plan_tier: "enterprise" # free | team | enterprise
  feature: "chatbot" # Which AI feature
  model: "gpt-4.1-mini" # Model used
  input_tokens: 1200 # Logged after call
  output_tokens: 350 # Logged after call
  cost_usd: 0.00072 # Calculated
  timestamp: "2026-05-27T12:00:00Z"
```

---

## Billing Models

### Model 1: Per-Token Billing

```
Monthly Cost = (input_tokens × input_rate + output_tokens × output_rate)
Markup = 1.5× to 3× provider cost (your margin)
Customer Price = Monthly Cost × Markup
```

**Pros:** Fair, transparent, scales linearly  
**Cons:** Unpredictable bills for customers, requires usage visibility

### Model 2: Tiered Plans with Included Tokens

| Plan       | Monthly Price | Included Tokens | Overage Rate     |
| ---------- | ------------- | --------------- | ---------------- |
| Free       | $0            | 100K tokens     | Blocked at limit |
| Starter    | $29           | 2M tokens       | $0.008/1K tokens |
| Pro        | $99           | 10M tokens      | $0.006/1K tokens |
| Enterprise | Custom        | Custom          | Custom           |

**Pros:** Predictable for customers, simple pricing  
**Cons:** Must estimate usage tiers carefully

### Model 3: Per-Request Pricing

```
Customer Price = $X per AI-powered request (regardless of tokens)
Your Cost = Actual token cost (variable)
Your Margin = Price − Cost
```

**Pros:** Simple for customers, easy to communicate  
**Cons:** Variable margin; large requests cost you more

### Model 4: Usage-Based with Caps

```yaml
plan:
  base_fee: $49/month
  included_requests: 1000
  max_requests: 5000
  overage_per_request: $0.05
  hard_cap: true # Stop service at max
```

---

## Database Schema

```sql
-- Tenant registry
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan_tier TEXT NOT NULL DEFAULT 'free',
  monthly_token_budget BIGINT NOT NULL DEFAULT 100000,
  overage_allowed BOOLEAN DEFAULT false,
  overage_rate_per_1k NUMERIC(10,6) DEFAULT 0.008,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage logs (append-only, partitioned by month)
CREATE TABLE token_usage_logs (
  id BIGSERIAL,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  request_id UUID NOT NULL,
  feature TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cost_usd NUMERIC(12,8) NOT NULL,
  latency_ms INTEGER,
  cached BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE token_usage_logs_2026_05 PARTITION OF token_usage_logs
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE token_usage_logs_2026_06 PARTITION OF token_usage_logs
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

-- Monthly usage summaries (materialized for billing)
CREATE TABLE tenant_monthly_usage (
  id BIGSERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  billing_month DATE NOT NULL,
  total_requests BIGINT NOT NULL DEFAULT 0,
  total_input_tokens BIGINT NOT NULL DEFAULT 0,
  total_output_tokens BIGINT NOT NULL DEFAULT 0,
  total_cost_usd NUMERIC(12,4) NOT NULL DEFAULT 0,
  cached_requests BIGINT NOT NULL DEFAULT 0,
  UNIQUE (tenant_id, billing_month)
);

-- Indexes for fast queries
CREATE INDEX idx_usage_tenant_date ON token_usage_logs (tenant_id, created_at);
CREATE INDEX idx_monthly_tenant ON tenant_monthly_usage (tenant_id, billing_month);
```

---

## Usage Tracking Middleware

```python
class TenantUsageTracker:
    """Middleware that wraps LLM calls to track per-tenant usage."""

    def __init__(self, db, llm_client, pricing):
        self.db = db
        self.client = llm_client
        self.pricing = pricing  # model → {input_rate, output_rate}

    async def call(self, tenant_id, feature, model, messages, **kwargs):
        # 1. Check budget before calling
        remaining = await self.get_remaining_budget(tenant_id)
        estimated_cost = self.estimate_cost(messages, model)

        if estimated_cost > remaining:
            tenant = await self.db.get_tenant(tenant_id)
            if not tenant.overage_allowed:
                raise BudgetExceededError(tenant_id, remaining)

        # 2. Make LLM call
        start = time.monotonic()
        response = await self.client.chat.completions.create(
            model=model, messages=messages, **kwargs
        )
        latency_ms = int((time.monotonic() - start) * 1000)

        # 3. Calculate actual cost
        usage = response.usage
        rates = self.pricing[model]
        cost = (
            usage.prompt_tokens * rates["input"] / 1_000_000
            + usage.completion_tokens * rates["output"] / 1_000_000
        )

        # 4. Log usage
        await self.db.insert_usage_log(
            tenant_id=tenant_id,
            feature=feature,
            model=model,
            input_tokens=usage.prompt_tokens,
            output_tokens=usage.completion_tokens,
            cost_usd=cost,
            latency_ms=latency_ms,
            cached=getattr(response, 'cached', False)
        )

        # 5. Update monthly summary (async)
        await self.update_monthly_summary(tenant_id, usage, cost)

        return response

    async def get_remaining_budget(self, tenant_id):
        """Get remaining token budget for current billing month."""
        tenant = await self.db.get_tenant(tenant_id)
        current_usage = await self.db.get_monthly_usage(
            tenant_id, date.today().replace(day=1)
        )
        budget_usd = self.tokens_to_cost(
            tenant.monthly_token_budget, tenant.plan_tier
        )
        return budget_usd - (current_usage.total_cost_usd if current_usage else 0)
```

---

## Margin Analysis

### Per-Tenant Profitability Query

```sql
SELECT
  t.name AS tenant_name,
  t.plan_tier,
  u.billing_month,
  u.total_cost_usd AS llm_cost,
  CASE t.plan_tier
    WHEN 'free' THEN 0
    WHEN 'starter' THEN 29
    WHEN 'pro' THEN 99
    ELSE COALESCE(t.custom_price, 0)
  END AS revenue,
  CASE t.plan_tier
    WHEN 'free' THEN 0
    WHEN 'starter' THEN 29
    WHEN 'pro' THEN 99
    ELSE COALESCE(t.custom_price, 0)
  END - u.total_cost_usd AS margin,
  ROUND(
    (1 - u.total_cost_usd / NULLIF(CASE t.plan_tier
      WHEN 'starter' THEN 29 WHEN 'pro' THEN 99
      ELSE COALESCE(t.custom_price, 1) END, 0)) * 100, 1
  ) AS margin_pct
FROM tenant_monthly_usage u
JOIN tenants t ON t.id = u.tenant_id
WHERE u.billing_month = DATE_TRUNC('month', CURRENT_DATE)
ORDER BY margin ASC;  -- Show worst margins first
```

### Identifying Margin-Negative Tenants

```sql
SELECT tenant_name, plan_tier, llm_cost, revenue, margin
FROM tenant_profitability_view
WHERE margin < 0
ORDER BY margin ASC;
```

**Actions for margin-negative tenants:**

1. Upgrade their plan tier (if usage warrants it)
2. Apply rate limiting to reduce their consumption
3. Optimize their specific usage patterns (model tiering, caching)
4. Negotiate custom enterprise pricing

---

## Rate Limiting by Tenant

```yaml
rate_limits:
  free:
    requests_per_minute: 10
    tokens_per_day: 50_000
    monthly_budget_usd: 5
    hard_cap: true
  starter:
    requests_per_minute: 60
    tokens_per_day: 500_000
    monthly_budget_usd: 50
    hard_cap: false # Allow overage
  pro:
    requests_per_minute: 300
    tokens_per_day: 5_000_000
    monthly_budget_usd: 200
    hard_cap: false
  enterprise:
    requests_per_minute: 1000
    tokens_per_day: custom
    monthly_budget_usd: custom
    hard_cap: false
```

---

## Dashboard Panels

### Per-Tenant Usage View

- **Top 10 tenants by cost** (bar chart)
- **Tenant cost distribution** (histogram)
- **Margin-negative tenants** (alert list)
- **Usage trend per tenant** (sparklines)

### Billing Summary

- **Revenue vs. cost by plan tier** (stacked bar)
- **Average margin by tier** (metric cards)
- **Overage revenue** (line chart)
- **Budget utilization distribution** (histogram)

---

_Template from the TokenOps Atlas — [tokenops-atlas](https://github.com/kalilurrahman/tokenops-atlas)_
