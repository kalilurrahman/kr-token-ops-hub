<!-- AUTO-GENERATED FROM data/pricing.json — DO NOT HAND-EDIT.
     Run `node scripts/gen-pricing-tables.mjs` after editing pricing.json.
     Pipeline and SLA: data/README.md. -->

# LLM Provider Comparison Matrix

> **Snapshot of `data/pricing.json` (v2026.09) — reviewed 2026-09-27.**
> Regenerated from the dataset; edit `data/pricing.json` to correct.
> **Live changelog:** [data/pricing-changelog.md](https://github.com/kalilurrahman/kr-token-ops-hub/blob/main/data/pricing-changelog.md).

---

## Per-Token Pricing (USD per 1M tokens)

| Provider | Model | Access | Input | Cached Input | Output | Context | Tier |
|---|---|---|---|---|---|---|---|
| **OpenAI** | GPT-6 Astra | Proprietary | $10 | $1 | $50 | 1.05M | Frontier |
| **OpenAI** | GPT-5.6 Sol | Proprietary | $4 | $0.4 | $20 | 1.05M | Frontier |
| **OpenAI** | GPT-5.6 Terra | Proprietary | $2 | $0.2 | $12 | 1.05M | Mid |
| **OpenAI** | GPT-5.6 Luna | Proprietary | $0.2 | $0.02 | $1.2 | 1.05M | Cheap |
| **OpenAI** | gpt-oss-120b | Open source | — | — | — | 128K | Open model |
| **OpenAI** | gpt-oss-20b | Open source | — | — | — | 128K | Open model |
| **Anthropic** | Claude Fable 5.1 | Proprietary | $10 | $0.25 | $50 | 1M | Frontier |
| **Anthropic** | Claude Opus 5 | Proprietary | $5 | $0.5 | $25 | 1M | Frontier |
| **Anthropic** | Claude Sonnet 5 | Proprietary | $2 | $0.2 | $10 | 1M | Mid |
| **Anthropic** | Claude Haiku 4.5 | Proprietary | $1 | $0.1 | $5 | 200K | Cheap |
| **Google** | Gemini 3.1 Pro | Proprietary | $2 | $0.2 | $12 | 1M | Frontier |
| **Google** | Gemini 3.8 Flash | Proprietary | $0.75 | $0.075 | $3.75 | 1.048576M | Mid |
| **Google** | Gemini 3.1 Flash-Lite | Proprietary | $0.3 | $0.03 | $2.5 | 1.048576M | Cheap |
| **DeepSeek** | DeepSeek V4 Pro | Open weight | — | — | — | 1M | Open model |
| **DeepSeek** | DeepSeek V4 Flash | Open weight | — | — | — | 1M | Open model |
| **Meta** | Llama 4 Scout | Open weight | — | — | — | 10M | Open model |
| **Meta** | Llama 4 Maverick | Open weight | — | — | — | 1M | Open model |
| **Qwen** | Qwen3.8-Flash-Next | Open weight | — | — | — | 262.144K | Open model |
| **Mistral AI** | Mistral Large | Proprietary | $2 | — | $6 | 128K | Frontier |
| **Mistral AI** | Ministral 8B | Open weight | — | — | — | 128K | Open model |

### Batch API discounts

| Provider | Batch discount | SLA |
|---|---|---|
| OpenAI | 50% off | ~24h |
| Anthropic | 50% off | ~24h |
| Google | 50% off | ~24h |

### Prompt caching

- **OpenAI:** Automatic prefix caching; model-specific cached-input rates shown below.
- **Anthropic:** Explicit cache control; cache writes and reads are billed separately.
- **Google:** Model-specific context caching and batch rates apply; verify region and long-context tiers.
- **DeepSeek:** Hosted cache rates and availability vary by endpoint; self-hosting is compute-priced.
- **Meta:** No universal token price; rates depend on cloud host or owned infrastructure.
- **Qwen:** No universal token price for downloaded weights; hosted rates vary.
- **Mistral AI:** API and self-deployment options differ by model and licence.

## Reading open-model costs

A dash for token price means there is no universal vendor API rate for the downloadable weights. It does **not** mean inference is free. Use the site's open-model infrastructure calculator with measured throughput, utilisation, accelerator, platform, and operations costs.

Open weight means model parameters are downloadable under model-specific terms. Open source is reserved here for permissively licensed releases; always review the exact model card and acceptable-use terms.

---

## Provider pricing pages

| Provider | URL |
|---|---|
| OpenAI | https://developers.openai.com/api/docs/pricing |
| Anthropic | https://docs.anthropic.com/en/docs/about-claude/pricing |
| Google | https://ai.google.dev/gemini-api/docs/pricing |
| DeepSeek | https://api-docs.deepseek.com/quick_start/pricing |
| Meta | https://llama.com/llama4/license |
| Qwen | https://huggingface.co/Qwen |
| Mistral AI | https://mistral.ai/pricing |

