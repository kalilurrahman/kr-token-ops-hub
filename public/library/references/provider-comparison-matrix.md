<!-- AUTO-GENERATED FROM data/pricing.json — DO NOT HAND-EDIT.
     Run `node scripts/gen-pricing-tables.mjs` after editing pricing.json.
     Pipeline and SLA: data/README.md. -->

# LLM Provider Comparison Matrix

> **Snapshot of `data/pricing.json` (v2026.07) — reviewed 2026-07-26.**
> Regenerated from the dataset; edit `data/pricing.json` to correct.
> **Live changelog:** [data/pricing-changelog.md](https://github.com/kalilurrahman/kr-token-ops-hub/blob/main/data/pricing-changelog.md).

---

## Per-Token Pricing (USD per 1M tokens)

| Provider | Model | Input | Cached Input | Output | Context | Tier |
|---|---|---|---|---|---|---|
| **OpenAI** | GPT-5 | $1.25 | $0.125 | $10 | 400K | Frontier |
| **OpenAI** | GPT-5 Mini | $0.25 | $0.025 | $2 | 400K | Mid |
| **OpenAI** | GPT-5 Nano | $0.05 | $0.005 | $0.4 | 128K | Cheap |
| **OpenAI** | o3 | $2 | — | $8 | 200K | Reasoning |
| **Anthropic** | Claude Opus 4.5 | $5 | $0.5 | $25 | 200K | Frontier |
| **Anthropic** | Claude Sonnet 5 | $2 | $0.2 | $10 | 200K | Frontier |
| **Anthropic** | Claude Haiku 4.5 | $1 | $0.1 | $5 | 200K | Mid |
| **Google** | Gemini 3 Pro | $2 | — | $12 | 1M | Frontier |
| **Google** | Gemini 2.5 Flash | $0.15 | — | $0.6 | 1M | Mid |
| **Google** | Gemini 2.0 Flash Lite | $0.075 | — | $0.3 | 1M | Cheap |
| **DeepSeek** | DeepSeek V3.2 | $0.28 | $0.028 | $0.42 | 128K | Cheap |
| **Meta Llama (hosted)** | Llama 4 Scout | $0.15 | — | $0.4 | 10M | Cheap |
| **Meta Llama (hosted)** | Llama 4 Maverick | $0.35 | — | $1.4 | 1M | Mid |
| **Mistral** | Mistral Large | $2 | — | $6 | 128K | Frontier |
| **Mistral** | Mistral Medium | $0.4 | — | $1.2 | 128K | Mid |

### Batch API discounts

| Provider | Batch discount | SLA |
|---|---|---|
| OpenAI | 50% off | ~24h |
| Anthropic | 50% off | ~24h |

### Prompt caching

- **OpenAI:** Automatic caching on repeated context; ~75-90% off cached input on current-gen models.
- **Anthropic:** Explicit cache control; 5-min TTL default. Cache writes billed at 1.25x (5-min) or 2.0x (1-hr) base input; cache reads at ~10% of base input.
- **Google:** Implicit automatic caching on Gemini 2.5+; discount surfaces on the invoice.
- **DeepSeek:** Disk-based cache; ~90% discount on cached input.
- **Meta Llama (hosted):** Varies by host.

---

## Provider pricing pages

| Provider | URL |
|---|---|
| OpenAI | https://openai.com/api/pricing |
| Anthropic | https://www.anthropic.com/pricing |
| Google | https://ai.google.dev/pricing |
| DeepSeek | https://api-docs.deepseek.com/quick_start/pricing |
| Meta Llama (hosted) | https://www.together.ai/pricing |
| Mistral | https://mistral.ai/products |

