# LLM Provider Comparison Matrix (May 2026)

> **Note:** Pricing and capabilities change frequently. Verify with provider documentation before making decisions. Last updated: May 2026.

---

## Pricing Comparison

### Per-Token Pricing (USD per 1M tokens)

| Provider | Model | Input | Output | Batch Input | Batch Output | Context Window |
|----------|-------|-------|--------|-------------|-------------|----------------|
| **OpenAI** | GPT-4.1 | $2.00 | $8.00 | $1.00 | $4.00 | 1M |
| | GPT-4.1-mini | $0.40 | $1.60 | $0.20 | $0.80 | 1M |
| | GPT-4.1-nano | $0.10 | $0.40 | $0.05 | $0.20 | 1M |
| | o3 | $2.00 | $8.00 | $1.00 | $4.00 | 200K |
| | o4-mini | $1.10 | $4.40 | $0.55 | $2.20 | 200K |
| **Anthropic** | Claude Sonnet 4 | $3.00 | $15.00 | $1.50 | $7.50 | 200K |
| | Claude Haiku 3.5 | $0.80 | $4.00 | $0.40 | $2.00 | 200K |
| **Google** | Gemini 2.5 Pro | $1.25–2.50 | $10.00–15.00 | N/A | N/A | 1M |
| | Gemini 2.5 Flash | $0.15–0.30 | $2.50–3.50 | N/A | N/A | 1M |
| **Meta** | Llama 4 Scout (via API) | ~$0.15 | ~$0.60 | Varies | Varies | 10M |
| | Llama 4 Maverick (via API) | ~$0.35 | ~$1.40 | Varies | Varies | 1M |
| **Mistral** | Mistral Large | $2.00 | $6.00 | N/A | N/A | 128K |
| | Mistral Medium | $0.40 | $1.20 | N/A | N/A | 128K |
| **Cohere** | Command R+ | $2.50 | $10.00 | N/A | N/A | 128K |

> **Prompt caching discounts:** OpenAI (~75% off cached input), Anthropic (~90% off cached input), Google (varies). Always factor caching into blended cost.

---

## Capabilities Comparison

| Capability | GPT-4.1 | GPT-4.1-mini | Claude Sonnet 4 | Claude Haiku 3.5 | Gemini 2.5 Pro | Gemini 2.5 Flash |
|-----------|---------|-------------|----------------|-----------------|---------------|-----------------|
| **Function/Tool Calling** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Structured Output (JSON)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Vision (Image Input)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Video Input** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Audio Input** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Streaming (SSE)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Batch API** | ✅ (50% off) | ✅ (50% off) | ✅ (50% off) | ✅ (50% off) | ❌ | ❌ |
| **Fine-tuning** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Prompt Caching** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Extended Thinking** | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Code Execution** | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| **Grounding/Search** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## Quality Benchmarks by Task Type

| Task Type | GPT-4.1 | GPT-4.1-mini | Claude Sonnet 4 | Gemini 2.5 Pro | Gemini 2.5 Flash |
|-----------|---------|-------------|----------------|---------------|-----------------|
| **Complex Reasoning** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Code Generation** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Classification** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Extraction** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Summarization** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Creative Writing** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Instruction Following** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Multilingual** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Long Context** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Math/Science** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## Enterprise Features

| Feature | OpenAI | Anthropic | Google | Meta (via providers) | Mistral |
|---------|--------|-----------|--------|---------------------|---------|
| **SOC 2 Type II** | ✅ | ✅ | ✅ | N/A | ✅ |
| **HIPAA BAA** | ✅ | ✅ | ✅ | N/A | ❌ |
| **Data Residency (EU)** | ✅ | ✅ | ✅ | N/A | ✅ (EU-native) |
| **VPC/Private Link** | ✅ | ✅ | ✅ | N/A | ✅ |
| **Training Data Opt-Out** | ✅ (default) | ✅ (default) | ✅ | N/A | ✅ |
| **SLA (Uptime)** | 99.9% | 99.5% | 99.9% | N/A | 99.5% |
| **Enterprise Support** | ✅ | ✅ | ✅ | N/A | ✅ |
| **Usage API** | ✅ | ✅ | ✅ | N/A | ✅ |
| **Custom Rate Limits** | ✅ | ✅ | ✅ | N/A | ✅ |
| **Model Versioning/Pinning** | ✅ | ✅ | ✅ | N/A | ✅ |

---

## Rate Limits (Default Tier)

| Provider | Model | RPM | TPM | Daily Limit |
|----------|-------|-----|-----|------------|
| OpenAI | GPT-4.1 | 500–10,000 | 200K–10M | No hard cap |
| OpenAI | GPT-4.1-mini | 500–30,000 | 200K–150M | No hard cap |
| Anthropic | Claude Sonnet 4 | 50–4,000 | 80K–400K | No hard cap |
| Google | Gemini 2.5 Pro | 100–2,000 | 500K–4M | No hard cap |
| Google | Gemini 2.5 Flash | 500–6,000 | 1M–10M | No hard cap |
| Mistral | Mistral Large | 100–1,000 | 200K–2M | No hard cap |

> **Note:** Rate limits vary by tier and can be increased via enterprise agreements.

---

## Best-For Recommendations

| Use Case | Recommended Model | Why |
|----------|------------------|-----|
| **Simple classification** | GPT-4.1-nano / Gemini Flash | Cheapest; quality sufficient for binary/multi-class |
| **Data extraction (structured)** | GPT-4.1-mini | Best price-performance for extraction tasks |
| **Customer support chatbot** | GPT-4.1-mini + Claude Haiku | Tiered: simple → mini, complex → Haiku |
| **Code generation** | Claude Sonnet 4 / GPT-4.1 | Best code quality from frontier models |
| **Document summarization** | Claude Sonnet 4 | Strong at long-document comprehension |
| **Complex reasoning** | o3 / Gemini 2.5 Pro | Purpose-built for multi-step reasoning |
| **Batch data processing** | GPT-4.1-mini (Batch) | 50% batch discount + strong quality |
| **Multimodal (image+text)** | Gemini 2.5 Pro/Flash | Native multimodal with competitive pricing |
| **Multilingual content** | Gemini 2.5 Pro | Strongest multilingual performance |
| **Cost-sensitive high-volume** | GPT-4.1-nano / Llama 4 Scout | Lowest cost per token |
| **Security-critical analysis** | Claude Sonnet 4 / GPT-4.1 | Highest quality, justify the cost |
| **Creative writing** | Claude Sonnet 4 | Best creative and nuanced writing |

---

## Provider Strengths & Considerations

### OpenAI
**Strengths:** Broadest model lineup (nano → o3), batch API (50% off), fine-tuning, largest ecosystem  
**Considerations:** Premium pricing on frontier models, output tokens expensive  
**Best for:** Organizations wanting a single-provider solution with model tiering

### Anthropic
**Strengths:** Best creative writing and code quality, extended thinking, strong safety  
**Considerations:** Smaller model lineup, no fine-tuning, higher per-token cost  
**Best for:** Quality-focused use cases, code generation, content creation

### Google
**Strengths:** Longest context (1M), native multimodal, best multilingual, grounding/search  
**Considerations:** No batch API, complex pricing tiers  
**Best for:** Multimodal applications, long-document processing, search-augmented tasks

### Meta (Llama 4)
**Strengths:** Open weights, self-hostable, extreme context (10M Scout), no API vendor lock-in  
**Considerations:** Must be hosted (Fireworks, Together, etc.), quality varies by provider  
**Best for:** Organizations with GPU infrastructure, data sovereignty requirements

### Mistral
**Strengths:** EU data residency (native), competitive pricing, strong multilingual (European)  
**Considerations:** Smaller ecosystem, fewer enterprise features  
**Best for:** EU-based organizations, multilingual European content

---

*Reference from the TokenOps Atlas — [tokenops-atlas](https://github.com/kalilurrahman/tokenops-atlas)*
