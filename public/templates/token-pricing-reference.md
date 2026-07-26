<!-- AUTO-GENERATED FROM data/pricing.json — DO NOT HAND-EDIT.
     Run `node scripts/gen-pricing-tables.mjs` after editing pricing.json.
     Pipeline and SLA: data/README.md. -->

# Token Pricing Reference — Major LLM Providers

> **Snapshot of `data/pricing.json` (v2026.07) — reviewed 2026-07-26.**
> This file is regenerated from the dataset. To propose a correction, edit `data/pricing.json` and re-run the generator.
> **Live changelog:** [data/pricing-changelog.md](https://github.com/kalilurrahman/kr-token-ops-hub/blob/main/data/pricing-changelog.md). **SLA:** Reviewed monthly. Provider pricing changes reflected within 7 days. Every figure carries a verification date and a source link.

---

## Pricing Tables

### OpenAI

| Model | Input ($/1M) | Cached Input ($/1M) | Output ($/1M) | Context | Tier | Source |
|---|---|---|---|---|---|---|
| GPT-5 | $1.25 | $0.125 | $10 | 400K | Frontier | [verified 2026-07-26](https://openai.com/api/pricing) |
| GPT-5 Mini | $0.25 | $0.025 | $2 | 400K | Mid | [verified 2026-07-26](https://openai.com/api/pricing) |
| GPT-5 Nano | $0.05 | $0.005 | $0.4 | 128K | Cheap | [verified 2026-07-26](https://openai.com/api/pricing) |
| o3 | $2 | — | $8 | 200K | Reasoning | [verified 2026-07-26](https://openai.com/api/pricing) |

_Caching:_ Automatic caching on repeated context; ~75-90% off cached input on current-gen models.

_Batch API:_ 50% off standard rates, ~24h SLA.

### Anthropic

| Model | Input ($/1M) | Cached Input ($/1M) | Output ($/1M) | Context | Tier | Source |
|---|---|---|---|---|---|---|
| Claude Opus 4.5 | $5 | $0.5 | $25 | 200K | Frontier | [verified 2026-07-26](https://www.anthropic.com/pricing) |
| Claude Sonnet 5 | $2 | $0.2 | $10 | 200K | Frontier | [verified 2026-07-26](https://www.anthropic.com/pricing) |
| Claude Haiku 4.5 | $1 | $0.1 | $5 | 200K | Mid | [verified 2026-07-26](https://www.anthropic.com/pricing) |

_Caching:_ Explicit cache control; 5-min TTL default. Cache writes billed at 1.25x (5-min) or 2.0x (1-hr) base input; cache reads at ~10% of base input.

_Batch API:_ 50% off standard rates, ~24h SLA.

### Google

| Model | Input ($/1M) | Cached Input ($/1M) | Output ($/1M) | Context | Tier | Source |
|---|---|---|---|---|---|---|
| Gemini 3 Pro | $2 / $3.5 (>200K ctx) | — | $12 / $14 (>200K ctx) | 1M | Frontier | [verified 2026-07-26](https://ai.google.dev/pricing) |
| Gemini 2.5 Flash | $0.15 / $0.3 (>200K ctx) | — | $0.6 / $1.8 (>200K ctx) | 1M | Mid | [verified 2026-07-26](https://ai.google.dev/pricing) |
| Gemini 2.0 Flash Lite | $0.075 | — | $0.3 | 1M | Cheap | [verified 2026-07-26](https://ai.google.dev/pricing) |

_Caching:_ Implicit automatic caching on Gemini 2.5+; discount surfaces on the invoice.

### DeepSeek

| Model | Input ($/1M) | Cached Input ($/1M) | Output ($/1M) | Context | Tier | Source |
|---|---|---|---|---|---|---|
| DeepSeek V3.2 | $0.28 | $0.028 | $0.42 | 128K | Cheap | [verified 2026-07-26](https://api-docs.deepseek.com/quick_start/pricing) |

_Caching:_ Disk-based cache; ~90% discount on cached input.

### Meta Llama (hosted)

| Model | Input ($/1M) | Cached Input ($/1M) | Output ($/1M) | Context | Tier | Source |
|---|---|---|---|---|---|---|
| Llama 4 Scout | $0.15 | — | $0.4 | 10M | Cheap | [verified 2026-07-26](https://www.together.ai/pricing) |
| Llama 4 Maverick | $0.35 | — | $1.4 | 1M | Mid | [verified 2026-07-26](https://www.together.ai/pricing) |

_Caching:_ Varies by host.

### Mistral

| Model | Input ($/1M) | Cached Input ($/1M) | Output ($/1M) | Context | Tier | Source |
|---|---|---|---|---|---|---|
| Mistral Large | $2 | — | $6 | 128K | Frontier | [verified 2026-07-26](https://mistral.ai/products) |
| Mistral Medium | $0.4 | — | $1.2 | 128K | Mid | [verified 2026-07-26](https://mistral.ai/products) |

---

## How to price a request

```
cost_per_request = (input_tokens  × input_$/M  ÷ 1_000_000)
                 + (output_tokens × output_$/M ÷ 1_000_000)
```

With prompt caching on the input:
```
cost_per_request ≈ ((1-hit_rate) × input_tokens × input_$/M
                  +  hit_rate    × input_tokens × cached_input_$/M
                  +  output_tokens × output_$/M) ÷ 1_000_000
```

The site's calculators (`/calculator`, `/hub`) apply these formulas against this same dataset.
