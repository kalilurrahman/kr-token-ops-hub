<!-- AUTO-GENERATED FROM data/pricing.json — DO NOT HAND-EDIT.
     Run `node scripts/gen-pricing-tables.mjs` after editing pricing.json.
     Pipeline and SLA: data/README.md. -->

# Token Pricing Reference — Major LLM Providers

> **Snapshot of `data/pricing.json` (v2026.09) — reviewed 2026-09-27.**
> This file is regenerated from the dataset. To propose a correction, edit `data/pricing.json` and re-run the generator.
> **Live changelog:** [data/pricing-changelog.md](https://github.com/kalilurrahman/kr-token-ops-hub/blob/main/data/pricing-changelog.md). **SLA:** Reviewed monthly. Provider pricing changes reflected within 7 days. Every figure carries a verification date and a source link.

---

## Pricing Tables

### OpenAI

| Model | Access | Deployment / licence | Input ($/1M) | Cached Input ($/1M) | Output ($/1M) | Context | Tier | Source |
|---|---|---|---|---|---|---|---|---|
| GPT-6 Astra | Proprietary | Hosted API; Proprietary | $10 | $1 | $50 | 1.05M | Frontier | [verified 2026-09-27](https://developers.openai.com/api/docs/pricing) |
| GPT-5.6 Sol | Proprietary | Hosted API; Proprietary | $4 | $0.4 | $20 | 1.05M | Frontier | [verified 2026-09-27](https://developers.openai.com/api/docs/models/gpt-5.6-sol) |
| GPT-5.6 Terra | Proprietary | Hosted API; Proprietary | $2 | $0.2 | $12 | 1.05M | Mid | [verified 2026-09-27](https://openai.com/index/advancing-the-price-performance-frontier-with-gpt-5-6/) |
| GPT-5.6 Luna | Proprietary | Hosted API; Proprietary | $0.2 | $0.02 | $1.2 | 1.05M | Cheap | [verified 2026-09-27](https://openai.com/index/advancing-the-price-performance-frontier-with-gpt-5-6/) |
| gpt-oss-120b | Open source | Self-hosted or third-party inference; Apache 2.0 | — | — | — | 128K | Open model | [verified 2026-09-27](https://github.com/openai/gpt-oss) |
| gpt-oss-20b | Open source | Self-hosted or third-party inference; Apache 2.0 | — | — | — | 128K | Open model | [verified 2026-09-27](https://github.com/openai/gpt-oss) |

_Caching:_ Automatic prefix caching; model-specific cached-input rates shown below.

_Batch API:_ 50% off standard rates, ~24h SLA.

### Anthropic

| Model | Access | Deployment / licence | Input ($/1M) | Cached Input ($/1M) | Output ($/1M) | Context | Tier | Source |
|---|---|---|---|---|---|---|---|---|
| Claude Fable 5.1 | Proprietary | Hosted API; Proprietary | $10 | $0.25 | $50 | 1M | Frontier | [verified 2026-09-27](https://docs.anthropic.com/en/docs/about-claude/pricing) |
| Claude Opus 5 | Proprietary | Hosted API; Proprietary | $5 | $0.5 | $25 | 1M | Frontier | [verified 2026-09-27](https://www.anthropic.com/news/claude-opus-5) |
| Claude Sonnet 5 | Proprietary | Hosted API; Proprietary | $2 | $0.2 | $10 | 1M | Mid | [verified 2026-09-27](https://www.anthropic.com/news/claude-sonnet-5) |
| Claude Haiku 4.5 | Proprietary | Hosted API; Proprietary | $1 | $0.1 | $5 | 200K | Cheap | [verified 2026-09-27](https://docs.anthropic.com/en/docs/about-claude/pricing) |

_Caching:_ Explicit cache control; cache writes and reads are billed separately.

_Batch API:_ 50% off standard rates, ~24h SLA.

### Google

| Model | Access | Deployment / licence | Input ($/1M) | Cached Input ($/1M) | Output ($/1M) | Context | Tier | Source |
|---|---|---|---|---|---|---|---|---|
| Gemini 3.1 Pro | Proprietary | Hosted API; Proprietary | $2 / $4 (>200K ctx) | $0.2 | $12 / $18 (>200K ctx) | 1M | Frontier | [verified 2026-09-27](https://ai.google.dev/gemini-api/docs/pricing) |
| Gemini 3.8 Flash | Proprietary | Hosted API; Proprietary | $0.75 | $0.075 | $3.75 | 1.048576M | Mid | [verified 2026-09-27](https://ai.google.dev/gemini-api/docs/pricing) |
| Gemini 3.1 Flash-Lite | Proprietary | Hosted API; Proprietary | $0.3 | $0.03 | $2.5 | 1.048576M | Cheap | [verified 2026-09-27](https://ai.google.dev/gemini-api/docs/pricing) |

_Caching:_ Model-specific context caching and batch rates apply; verify region and long-context tiers.

_Batch API:_ 50% off standard rates, ~24h SLA.

### DeepSeek

| Model | Access | Deployment / licence | Input ($/1M) | Cached Input ($/1M) | Output ($/1M) | Context | Tier | Source |
|---|---|---|---|---|---|---|---|---|
| DeepSeek V4 Pro | Open weight | Self-hosted or third-party inference; DeepSeek model licence | — | — | — | 1M | Open model | [verified 2026-09-27](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro) |
| DeepSeek V4 Flash | Open weight | Self-hosted or third-party inference; DeepSeek model licence | — | — | — | 1M | Open model | [verified 2026-09-27](https://www.deepseek.com/en/news/v4-preview/) |

_Caching:_ Hosted cache rates and availability vary by endpoint; self-hosting is compute-priced.

### Meta

| Model | Access | Deployment / licence | Input ($/1M) | Cached Input ($/1M) | Output ($/1M) | Context | Tier | Source |
|---|---|---|---|---|---|---|---|---|
| Llama 4 Scout | Open weight | Self-hosted or third-party inference; Llama 4 Community License | — | — | — | 10M | Open model | [verified 2026-09-27](https://github.com/meta-llama/llama-models/blob/main/models/llama4/MODEL_CARD.md) |
| Llama 4 Maverick | Open weight | Self-hosted or third-party inference; Llama 4 Community License | — | — | — | 1M | Open model | [verified 2026-09-27](https://github.com/meta-llama/llama-models/blob/main/models/llama4/MODEL_CARD.md) |

_Caching:_ No universal token price; rates depend on cloud host or owned infrastructure.

### Qwen

| Model | Access | Deployment / licence | Input ($/1M) | Cached Input ($/1M) | Output ($/1M) | Context | Tier | Source |
|---|---|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next | Open weight | Self-hosted or third-party inference; Check model card | — | — | — | 262.144K | Open model | [verified 2026-09-27](https://huggingface.co/Qwen) |

_Caching:_ No universal token price for downloaded weights; hosted rates vary.

### Mistral AI

| Model | Access | Deployment / licence | Input ($/1M) | Cached Input ($/1M) | Output ($/1M) | Context | Tier | Source |
|---|---|---|---|---|---|---|---|---|
| Mistral Large | Proprietary | Hosted API; Proprietary | $2 | — | $6 | 128K | Frontier | [verified 2026-09-27](https://mistral.ai/pricing) |
| Ministral 8B | Open weight | Self-hosted or third-party inference; Mistral model licence | — | — | — | 128K | Open model | [verified 2026-09-27](https://mistral.ai/news/ministraux) |

_Caching:_ API and self-deployment options differ by model and licence.

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
