# Model Reference Refresh — Data as of 27 September 2026

Purpose: source-backed dataset and editorial recommendations for updating the site's model tables/calculators beyond the current May/July 2026 baseline. All figures below are drawn from vendor-primary sources (pricing pages, model cards, official announcements) retrieved via live search; anything not independently confirmed on a vendor page is flagged **[UNVERIFIED]**.

## 1. Proprietary frontier / efficient models

### OpenAI
| Model | Context / max output | Input $/M | Cached input $/M | Output $/M | Notes | Source |
|---|---|---|---|---|---|---|
| GPT-6 Astra (flagship, short ctx) | — | $10.00 | $1.00 | $50.00 | Long-context (>200K, up to 272K threshold) tier: $20/$2/$75. Frontier reasoning/agent model, rolling out to ChatGPT + API + Azure + Bedrock. | [OpenAI pricing](https://developers.openai.com/api/docs/pricing), [GPT-6 Astra launch](https://openai.com/index/gpt-6-astra/) |
| GPT-5.6 Sol | 1.05M in / 128K out | $4.00 (promo, list $2 base tier per pricing page short-context row) | $0.20–$0.40 | $20.00 | Promotional pricing confirmed through at least 21 Nov 2026; >272K input tokens billed 2x input/1.5x output. | [GPT-5.6 Sol model page](https://developers.openai.com/api/docs/models/gpt-5.6-sol) |
| GPT-5.6 Terra | — | $4.00 (Fast-mode table) | — | $24.00 | "Balanced everyday work" tier; cut 20% at July 30 2026 price change. | [Fast mode pricing](https://openai.com/api-fast-mode/), [price-performance post](https://openai.com/index/advancing-the-price-performance-frontier-with-gpt-5-6/) |
| GPT-5.6 Luna | — | $0.10–$0.20 | $0.01–$0.02 | $0.50–$0.75 | Cut ~80% on 30 Jul 2026; cheapest tier, used for high-volume tool-using workflows. | [Fast mode pricing](https://openai.com/api-fast-mode/) |
| gpt-oss-120b / gpt-oss-20b | n/a (self-hosted) | n/a | n/a | n/a | **Open-weight**, Apache 2.0, not served via OpenAI API; run on vLLM/Ollama/llama.cpp. Baseline reference for OpenAI's open tier — no newer open-weight OpenAI release confirmed as of this date. | [gpt-oss help center](https://help.openai.com/en/articles/11870455-openai-open-weight-models-gpt-oss), [GitHub](https://github.com/openai/gpt-oss) |

Editorial note: "Fast mode" replaced "Priority processing" on 30 Jul 2026 (same service_tier values still accepted). Regional/data-residency endpoints carry a 10% uplift for eligible post–5 Mar 2026 models.

### Anthropic
| Model | Context / max output | Input $/M | 5m cache write | Output $/M | Notes | Source |
|---|---|---|---|---|---|---|
| Claude Fable 5 / Mythos 5 | 1M in / 128K out (300K on Batch beta) | $10 | $12.50 | $50 | Fable 5 = GA flagship (9 Jun 2026, briefly suspended 12 Jun–1 Jul); Mythos 5 = safety-gate-lifted variant, limited availability via Project Glasswing. Cache-hit price differs from Fable 5.1 (see below). | [Claude Fable 5 & Mythos 5](https://www.anthropic.com/news/claude-fable-5-mythos-5), [pricing table](https://docs.anthropic.com/en/docs/about-claude/pricing) |
| Claude Fable 5.1 / Mythos 5.1 | 1M / 128K | $10 | $12.50 | $50 | Successor point release; cache-hit price $0.25/M vs $1/M on Fable 5. | [Anthropic pricing](https://docs.anthropic.com/en/docs/about-claude/pricing) |
| Claude Opus 5 | 1M / 128K (200K unless `[1m]` suffix set — confirmed community bug report) | $5 | $6.25 | $25 | Launched 24 Jul 2026; ~half Fable-class price at near-frontier coding/agentic quality. US-only-inference SKU +10%. | [Opus 5 launch](https://www.anthropic.com/news/claude-opus-5), [list-price PDF](https://www-cdn.anthropic.com/files/4zrzovbb/website/14082576b71dc6b532c2d49094cf4661e957cd69.pdf) |
| Claude Opus 5.5 | 1M / 128K | ~$4 (per Sonnet-5 doc comparison table) | — | ~$20 | **[UNVERIFIED price row]** — appears only in a comparison table on the Sonnet 5 docs page, not confirmed against a dedicated Opus 5.5 pricing page; treat as directional until corroborated. | [Sonnet 5 overview comparison table](https://platform.claude.com/docs/en/models/sonnet-5/overview) |
| Claude Sonnet 5 | 1M / 128K | $2 | $2.50 | $10 | Launched 30 Jun 2026; default on Free/Pro; drop-in for Sonnet 4.6 with adaptive thinking always on and legacy sampling params now erroring. | [Sonnet 5 launch](https://www.anthropic.com/news/claude-sonnet-5), [pricing](https://docs.anthropic.com/en/docs/about-claude/pricing) |
| Claude Haiku 4.5 (still current small tier) | 200K / 64K | $1 | $1.25 | $5 | No Haiku 5 confirmed as of 27 Sep 2026. | [Anthropic pricing](https://docs.anthropic.com/en/docs/about-claude/pricing) |

Editorial note: Anthropic ships **no open-weight models**; all Claude 5-family models are proprietary/API-only, deployed via Claude API, Bedrock, Vertex AI, and Microsoft Foundry.

### Google
| Model | Context / max output | Input $/M | Cached input $/M | Output $/M | Notes | Source |
|---|---|---|---|---|---|---|
| Gemini 3.1 Pro (Preview) | up to 200K then long-ctx tier | $2.00 → $4.00 (>200K) | $0.20 → $0.40 | $12.00 → $18.00 | Frontier Gemini 3 tier referenced as the reasoning ceiling other vendors benchmark against. | [Agent Platform pricing](https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing) |
| Gemini 3.8 Flash | 1,048,576 in / 65,536 out | $0.75 (intro, through 31 Dec 2026) | $0.075 | $3.75 | Standard pricing doubles to $1.50/$0.15/$7.50 on 1 Jan 2027. Non-global regions +10%. | [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing), [Agent Platform pricing](https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing) |
| Gemini 3.7 / 3.6 Flash | 1,048,576 / 65,536 | $0.75 (intro) | $0.075 | $3.75 | Same intro pricing/window as 3.8 Flash; positioned as prior-gen workhorses. | [DevTk pricing summary](https://devtk.ai/en/blog/gemini-api-pricing-guide-2026/) — third-party aggregator, cross-check against ai.google.dev before publishing |
| Gemini 3.5 Flash / Flash-Lite | 1,048,576 / 65,536 | $1.50 / $0.30 | $0.15 / $0.03 | $9.00 / $2.50 | Retained as mid/cheap tier alongside Gemini 2.5 line. | [Gemini API pricing (.md)](https://ai.google.dev/gemini-api/docs/pricing.md.txt) |

## 2. Open-weight families available by 27 Sep 2026

| Family | License | Params (active/total) | Context | Notes | Source |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro / V4-Flash | Open weights (DeepSeek license, check redistribution terms on HF card before calling it "open-source") | 49B/1.6T (Pro), 13B/284B (Flash) | 1M native, default across DeepSeek services | Released 24 Apr 2026; hybrid CSA/HCA attention, Muon optimizer; positioned just behind Gemini 3.1 Pro on world knowledge, ahead of other open models. | [DeepSeek-V4 preview](https://www.deepseek.com/en/news/v4-preview/), [HF model card](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro), [HF blog](https://huggingface.co/blog/deepseekv4) |
| Qwen3.8-Flash-Next | Open-weight preview (verify exact license on model card — likely Apache 2.0/Qwen license, not confirmed here) | 6B active / 125B total | 262,144 native, extensible to 1M | Released 26 Aug 2026; previews Qwen4 hybrid-attention architecture (Gated DeltaNet + Qwen Sparse Attention); efficiency-focused, not a capability flagship. | [Unite.AI coverage](https://www.unite.ai/qwen3-8-flash-next-previews-qwen4-architecture-with-6b-active-parameters/) — secondary source; confirm on Qwen/HF model card before treating specs as final |
| Llama 4 Scout / Maverick | Llama 4 Community License (custom, **not** OSI open-source; commercial-use gated over ~700M MAU) | 17B active / 109B (Scout), 17B active / 400B (Maverick) | 10M (Scout), 1M (Maverick) | Still Meta's newest publicly released Llama generation as of this date — no confirmed Llama 5 found in this research pass. **Flag for re-check**: verify no newer Llama release before publishing. | [License](https://llama.com/llama4/license), [Model card](https://github.com/meta-llama/llama-models/blob/main/models/llama4/MODEL_CARD.md) |
| gpt-oss-120b / gpt-oss-20b | Apache 2.0 (true open-source) | 5.1B/117B, 3.6B/21B | not specified above (128K typical per model card) | OpenAI's only open-weight release; self-hosted only, not via OpenAI API. | [gpt-oss GitHub](https://github.com/openai/gpt-oss) |

**Open-weight vs open-source distinction (for site glossary):** Only gpt-oss carries a true OSI-style permissive license (Apache 2.0) with no usage-based gating. Llama 4 is open-weight but license-gated (custom commercial terms, MAU threshold). DeepSeek-V4 and Qwen3.8-Flash-Next are open-weight preview/production releases; exact redistribution terms should be pulled from each model's Hugging Face license field before the site asserts "open-source."

## 3. Editorial recommendations for the site

1. **model-comparison.ts is already current** (dated 18/09/2026) with GPT-6 Astra, GPT-5.6 portfolio, Claude Fable 5.1, and Gemini 3.8 Flash — no changes needed there beyond adding Claude Opus 5 / Sonnet 5 and an open-weight row (DeepSeek-V4) for portfolio completeness.
2. **`src/routes/glossary.tsx` is stale**: context-window and tiering examples still cite "GPT-5," "Claude Opus 4.5," "Gemini 3 Pro," "DeepSeek V3.2," and "Llama 4 Scout" as if current-generation. Update to GPT-6 Astra/GPT-5.6, Claude Opus 5/Sonnet 5, Gemini 3.1 Pro/3.8 Flash, and DeepSeek-V4, while keeping Llama 4 Scout only as the long-context open-weight example (still accurate — no confirmed Llama 5).
3. **`src/routes/index.tsx` trend-library card** references `trends/2026-pricing-landscape.md` listing GPT-5/Opus 4.5/Gemini 3/DeepSeek V3.2 — either refresh that source file's contents or point the card at this new file plus a rewritten landscape doc.
4. **`src/routes/dashboard.tsx`** sample spend row already says "Claude Sonnet 5" — consistent with the verified launch; no change needed, but confirm any adjacent sample rows (GPT/Gemini) are equally current.
5. **Add Claude Opus 5 and Sonnet 5 as their own comparison entries** (currently only Fable 5.1 represents Anthropic) since Opus 5/Sonnet 5 sit at materially different price/latency points relevant to routing decisions.
6. **Add one open-weight row** (recommend DeepSeek-V4-Flash, given verified 1M context and cost-efficiency claims) to the comparison table and workload adviser so self-hosted/open-weight routing shows up as an option, clearly labeled "self-hosted — no vendor token price; cost = compute."
7. **Flag, don't publish, the Claude Opus 5.5 price row and the Qwen3.8-Flash-Next license** until corroborated on a primary pricing/model-card page — both currently rest on secondary/comparison-table evidence only.
8. **Add a glossary note on Fast mode vs Priority processing** (renamed 30 Jul 2026) and on Anthropic's tokenizer change at Opus 4.7 (affects "tokens per word" assumptions used in any cost calculator).

## Verification status legend
- Confirmed on vendor primary source (pricing page, model card, or official blog): default for all rows above unless noted.
- **[UNVERIFIED]**: Claude Opus 5.5 pricing, Qwen3.8-Flash-Next exact license terms, DeepSeek-V4 redistribution license terms, Gemini 3.7/3.6 Flash pricing as sourced from a third-party aggregator (devtk.ai) rather than ai.google.dev directly.
