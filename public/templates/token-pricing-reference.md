# Token Pricing Reference — Major LLM Providers

> **Purpose:** A single reference for comparing LLM token costs across providers and models.  
> **⚠️ Prices change frequently.** Verify current rates at each provider's pricing page before making financial commitments.  
> **Last verified:** May 2026

---

## Pricing Tables

### OpenAI

| Model | Input ($/1M tokens) | Output ($/1M tokens) | Context Window | Best For |
|-------|---------------------|----------------------|----------------|----------|
| GPT-4.1 | $2.00 | $8.00 | 1M | Complex reasoning, coding, long-context analysis |
| GPT-4.1 mini | $0.40 | $1.60 | 1M | Balanced cost/quality for most tasks |
| GPT-4.1 nano | $0.10 | $0.40 | 1M | High-volume, low-complexity tasks |
| GPT-4o | $2.50 | $10.00 | 128K | Multimodal tasks, complex generation |
| GPT-4o mini | $0.15 | $0.60 | 128K | Classification, extraction, simple generation |
| o3 | $10.00 | $40.00 | 200K | Advanced reasoning, math, science |
| o3-mini | $1.10 | $4.40 | 200K | Cost-effective reasoning tasks |
| o4-mini | $1.10 | $4.40 | 200K | Latest reasoning, STEM tasks |

### Anthropic

| Model | Input ($/1M tokens) | Output ($/1M tokens) | Context Window | Best For |
|-------|---------------------|----------------------|----------------|----------|
| Claude Opus 4 | $15.00 | $75.00 | 200K | Highest quality, complex analysis, agentic coding |
| Claude Sonnet 4 | $3.00 | $15.00 | 200K | Balanced performance, sustained coding tasks |
| Claude Haiku 3.5 | $0.80 | $4.00 | 200K | Fast classification, extraction, lightweight tasks |

### Google

| Model | Input ($/1M tokens) | Output ($/1M tokens) | Context Window | Best For |
|-------|---------------------|----------------------|----------------|----------|
| Gemini 2.5 Pro | $1.25 / $2.50 | $10.00 / $15.00 | 1M | Complex reasoning, coding (tiered by 200K boundary) |
| Gemini 2.5 Flash | $0.15 / $0.30 | $0.60 / $1.80 | 1M | High-volume tasks, cost-sensitive workloads (tiered by 200K) |
| Gemini 2.0 Flash | $0.10 | $0.40 | 1M | Lowest-cost option for simple tasks |
| Gemini 2.0 Flash Lite | $0.075 | $0.30 | 1M | Ultra-low-cost, high-throughput |

> **Note:** Google Gemini 2.5 models use tiered pricing: lower rate for the first 200K tokens of context, higher rate beyond 200K.

### Meta (Llama — via hosted providers)

| Model | Input ($/1M tokens) | Output ($/1M tokens) | Context Window | Best For |
|-------|---------------------|----------------------|----------------|----------|
| Llama 4 Maverick | $0.20 | $0.60 | 1M | Strong open-weight option, multimodal |
| Llama 4 Scout | $0.15 | $0.40 | 10M | Ultra-long context, document processing |
| Llama 3.3 70B | $0.20 | $0.20 | 128K | General-purpose, self-hosted or via API |
| Llama 3.1 8B | $0.05 | $0.08 | 128K | Lightweight tasks, edge deployment |

> **Note:** Llama models are open-weight. Prices above reflect typical hosted-provider rates (e.g., Together, Fireworks, Groq). Self-hosting costs depend on your GPU infrastructure.

### Mistral

| Model | Input ($/1M tokens) | Output ($/1M tokens) | Context Window | Best For |
|-------|---------------------|----------------------|----------------|----------|
| Mistral Large | $2.00 | $6.00 | 128K | Complex tasks, multilingual, code |
| Mistral Medium (Pixtral) | $0.40 | $1.20 | 128K | Balanced cost/performance, multimodal |
| Mistral Small | $0.10 | $0.30 | 32K | Classification, extraction, simple tasks |
| Codestral | $0.30 | $0.90 | 256K | Code generation, code review |
| Mistral Embed | $0.10 | — | 8K | Embedding generation |

---

## Volume Tiers & Committed-Use Discounts

Many providers offer discounts for high-volume or committed usage.

### OpenAI

| Tier | Spend Level | Discount | Notes |
|------|------------|----------|-------|
| Tier 1 (default) | $0 – $1K/mo | 0% | Standard pricing |
| Tier 2 | $1K – $10K/mo | Varies | Higher rate limits |
| Tier 3 | $10K – $50K/mo | Varies | Priority access |
| Tier 4 | $50K – $100K/mo | Varies | Dedicated capacity available |
| Tier 5 | $100K+/mo | Negotiable | Custom enterprise agreement |

### Anthropic

| Tier | Description | Discount |
|------|------------|----------|
| Standard | Pay-as-you-go | 0% |
| Scale | High-volume, via AWS Bedrock or GCP Vertex | Provider-dependent |
| Enterprise | Direct agreement | Negotiable (typically 10–30%) |

### Google

| Tier | Description | Discount |
|------|------------|----------|
| Pay-as-you-go | Standard Vertex AI pricing | 0% |
| Committed use | 1-year or 3-year commitment | 10–25% |
| Free tier | Gemini models via AI Studio | Limited RPM, no SLA |

---

## Batch Pricing Discounts

Batch APIs process requests asynchronously (typically 24-hour SLA) at significantly reduced rates.

| Provider | Batch Discount | Batch SLA | Best For |
|----------|---------------|-----------|----------|
| **OpenAI** | 50% off standard rates | 24 hours | Data enrichment, bulk classification, offline summarization |
| **Anthropic** | 50% off (Message Batches API) | 24 hours | Document processing, batch extraction |
| **Google** | Varies by model | Varies | Large-scale data processing |

### When to Use Batch Pricing

- The task is **not latency-sensitive** (e.g., nightly data pipeline, weekly report generation)
- You can tolerate a **24-hour turnaround**
- Volume is high enough that the **discount meaningfully impacts cost**

> **Rule of thumb:** If a workload runs on a schedule (cron job, ETL pipeline) rather than in response to a user action, it's a batch candidate.

---

## Cost Calculation Formulas

### Cost Per Request

```
cost_per_request = (input_tokens × input_rate / 1,000,000)
                 + (output_tokens × output_rate / 1,000,000)
```

**Example:** GPT-4o, 500 input tokens, 200 output tokens

```
cost = (500 × $2.50 / 1,000,000) + (200 × $10.00 / 1,000,000)
     = $0.00125 + $0.00200
     = $0.00325 per request
```

### Monthly Forecast

```
monthly_cost = cost_per_request × requests_per_day × 30
```

**Example:** $0.00325/request × 10,000 requests/day × 30 days

```
monthly_cost = $0.00325 × 10,000 × 30 = $975 / month
```

### Blended Rate (Multi-Model)

When a service uses multiple models (e.g., cheap model for 80% of traffic, expensive model for 20%):

```
blended_cost_per_request = Σ (traffic_share_i × cost_per_request_i)
```

**Example:** 80% routed to GPT-4o-mini ($0.00021/req), 20% to GPT-4o ($0.00325/req)

```
blended = (0.80 × $0.00021) + (0.20 × $0.00325)
        = $0.000168 + $0.000650
        = $0.000818 per request

monthly  = $0.000818 × 10,000 × 30 = $245 / month
```

> **Savings vs. 100% GPT-4o:** $975 → $245 = **75% reduction**

### Cost Per Conversation (Multi-Turn)

```
cost_per_conversation = Σ (cost_per_turn_i)   for i = 1 to N turns
```

> **Important:** In multi-turn conversations, each turn resends the conversation history. Token costs grow quadratically with turn count unless you implement history truncation or summarization.

| Turn | Cumulative Input Tokens | New Output Tokens | Turn Cost (GPT-4o) |
|------|------------------------|-------------------|---------------------|
| 1 | 500 | 200 | $0.0033 |
| 2 | 1,200 | 250 | $0.0055 |
| 3 | 2,150 | 300 | $0.0084 |
| 4 | 3,200 | 200 | $0.0100 |
| **Total** | — | — | **$0.0272** |

---

## Quick-Reference: Cost Index

Normalize all models to a common baseline for fast comparison.

| Model | Cost Index (GPT-4o = 1.00×) | Category |
|-------|----------------------------|----------|
| GPT-4.1 nano | 0.04× | 💚 Ultra-low |
| Llama 3.1 8B | 0.02× | 💚 Ultra-low |
| Gemini 2.0 Flash Lite | 0.03× | 💚 Ultra-low |
| GPT-4o mini | 0.06× | 💚 Low |
| Gemini 2.5 Flash | 0.06× | 💚 Low |
| Mistral Small | 0.04× | 💚 Low |
| Llama 4 Scout | 0.06× | 💚 Low |
| Claude Haiku 3.5 | 0.32× | 🟡 Medium |
| GPT-4.1 mini | 0.16× | 🟡 Medium |
| Gemini 2.5 Pro | 0.80× | 🟡 Medium |
| GPT-4o | 1.00× | 🟠 Standard |
| GPT-4.1 | 0.80× | 🟠 Standard |
| Claude Sonnet 4 | 1.20× | 🟠 Standard |
| Mistral Large | 0.80× | 🟠 Standard |
| o3-mini | 0.44× | 🟠 Standard |
| o3 | 4.00× | 🔴 Premium |
| Claude Opus 4 | 6.00× | 🔴 Premium |

---

## Provider Pricing Pages

| Provider | Pricing URL |
|----------|------------|
| OpenAI | [https://openai.com/api/pricing](https://openai.com/api/pricing) |
| Anthropic | [https://www.anthropic.com/pricing](https://www.anthropic.com/pricing) |
| Google | [https://ai.google.dev/pricing](https://ai.google.dev/pricing) |
| Meta (Llama) | Varies by host (Together, Fireworks, AWS Bedrock) |
| Mistral | [https://mistral.ai/products](https://mistral.ai/products) |

---

*Template version 1.0 — Prices are approximate and subject to change. Always verify with the provider.*
