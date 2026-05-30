# TokenOps Glossary

> **Purpose:** A comprehensive reference of terms used in TokenOps — the discipline of applying FinOps principles to LLM token consumption.  
> **Audience:** Engineering, product, finance, and leadership teams working with LLM APIs.  
> **How to use:** Search or browse alphabetically. Each entry includes a clear definition with practical context.

---

## A

### API Gateway (LLM Gateway)

A centralized proxy layer that sits between your application services and LLM provider APIs. In a TokenOps context, the gateway enforces request tagging, applies routing rules, collects telemetry (token counts, latency, cost), enforces budget guardrails, and manages rate limits. Examples include LiteLLM Proxy, Portkey, Helicone, and custom-built solutions. The gateway is the single most important piece of TokenOps infrastructure — it is the enforcement point for virtually every policy.

### Architecture Decision Record (ADR)

A lightweight document that captures the context, options considered, decision made, and consequences of an architectural choice. In TokenOps, ADRs are used to document model selection decisions, caching strategies, context management approaches, and other design choices that affect token cost. A cost analysis section — including estimated monthly spend and cost-per-request — is a required component of a TokenOps ADR.

---

## B

### Batch API

An API endpoint offered by LLM providers (e.g., OpenAI Batch API, Anthropic Message Batches API) that processes requests asynchronously with a typical 24-hour turnaround window. Batch APIs offer a significant discount — usually 50% off standard pricing — in exchange for relaxed latency requirements. They are ideal for ETL pipelines, nightly processing jobs, and bulk content generation where real-time response is not needed.

### Blended Cost

The weighted average cost per token across all models used by a service or organization. Calculated as total LLM spend divided by total tokens consumed. Blended cost is useful for high-level budgeting and forecasting but can mask inefficiencies — a service with a low blended cost might still have individual workloads on unnecessarily expensive models. Always complement blended cost with per-model and per-workload cost analysis.

### BPE (Byte-Pair Encoding)

The most common tokenization algorithm used by modern LLMs (GPT, Claude, Llama). BPE iteratively merges the most frequent pairs of characters or sub-words into single tokens. This means that common words like "the" are a single token, while rare words or technical terms may be split into multiple tokens. Understanding BPE helps predict token counts — short, common English text tokenizes efficiently (~0.75 tokens/word), while code, URLs, and non-English text can tokenize at 2–4× that rate.

### Budget Guardrail

An automated mechanism configured in the LLM gateway that monitors token consumption against predefined budgets and takes action when thresholds are breached. Guardrails typically have two levels: a **soft alert** (e.g., at 80% of budget) that sends a notification but allows requests to continue, and a **hard limit** (e.g., at 100%) that blocks or throttles requests to prevent overspend. Guardrails are essential at TokenOps maturity Level 3 and above.

---

## C

### Cache Hit Rate

The percentage of LLM requests that are served from a cache rather than being sent to the LLM provider. Calculated as `(cached_responses / total_requests) × 100`. A higher cache hit rate directly reduces cost and latency. For conversational workloads with repetitive queries (FAQ bots, customer support), a cache hit rate of 25–40% is achievable. For highly variable workloads (creative writing, code generation), cache hit rates are typically 5–15%.

### Chargeback

A financial practice where LLM costs are allocated to the specific teams, products, or business units that incur them, with actual budget impact. Unlike showback (which is informational only), chargeback means the cost appears in the team's financial reports and affects their P&L. Chargeback is more powerful than showback for driving cost optimization behavior because it creates direct financial accountability. It requires accurate per-request cost attribution (tagging + telemetry) to be credible.

### Context Trimming

The practice of reducing the number of tokens in the context window (conversation history, retrieved documents, system prompts) before sending a request to the LLM. Techniques include summarizing older conversation turns, removing redundant retrieved passages, truncating to the most relevant context, and limiting conversation history to the most recent N turns. Context trimming directly reduces input tokens and cost, especially in multi-turn conversational applications.

### Context Window

The maximum number of tokens (input + output combined) that an LLM can process in a single request. Context windows range from 4K tokens (older models) to 1M+ tokens (Gemini 2.5). Larger context windows enable longer conversations and more RAG content, but more tokens consumed means higher cost. A common TokenOps optimization is to use the context window efficiently — include only what's necessary rather than filling the entire window.

### Cost per Outcome

A unit economics metric that measures the LLM cost to achieve one meaningful business outcome (e.g., cost per support ticket resolved, cost per document processed, cost per lead generated). Cost per outcome is more actionable than raw token cost because it connects LLM spend to business value. It enables apples-to-apples comparison across different implementation approaches and helps justify AI investments to business stakeholders.

---

## D

### Distillation

The process of training a smaller, cheaper model to reproduce the outputs of a larger, more expensive model. In TokenOps, distillation is an advanced optimization technique: you use a frontier model (e.g., GPT-4o, Claude Sonnet) to generate labeled training data, then fine-tune a smaller model (e.g., GPT-4o-mini, an open-source model) to achieve similar quality at significantly lower cost. Effective distillation can reduce per-request cost by 80–95%.

---

## E

### Embedding

A fixed-length numerical vector representation of text, produced by an embedding model. Embeddings capture semantic meaning, allowing you to measure similarity between texts. In TokenOps, embeddings are used for semantic caching (finding similar past queries), RAG retrieval (finding relevant documents), and classification. Embedding models are significantly cheaper than generation models — typically $0.02–$0.13 per million tokens — making them cost-effective for preprocessing and routing.

### Error Budget

Borrowed from SRE practices, an error budget in TokenOps defines the acceptable amount of cost overrun, quality degradation, or latency increase that a service can tolerate. For example, a service might have an error budget of "5% cost overrun per month" or "2% quality degradation during model migration." Error budgets provide a controlled framework for making optimization trade-offs without requiring perfection.

---

## F

### Few-Shot Prompting

A prompting technique where you include a small number of examples (typically 2–10) in the prompt to guide the model's output format and behavior. Few-shot prompting improves output quality but increases input token count. Each example adds tokens to every request, so the cost impact scales with request volume. A key TokenOps optimization is evaluating whether few-shot examples are necessary — many tasks achieve similar quality with zero-shot prompting and clear instructions, saving 30–60% of input tokens.

### Fine-tuning

The process of further training a pre-trained LLM on a domain-specific dataset to improve its performance on a particular task. Fine-tuning has upfront training costs but can dramatically reduce inference costs by enabling the use of smaller models, reducing the need for lengthy system prompts, and eliminating few-shot examples. In TokenOps, fine-tuning is an advanced optimization for high-volume, well-defined tasks where the upfront investment is justified by ongoing per-request savings.

### FinOps

The practice of bringing financial accountability to cloud and technology spending through collaboration between engineering, finance, and business teams. TokenOps is the application of FinOps principles specifically to LLM token consumption. Core FinOps principles — visibility, allocation, optimization, and governance — translate directly into TokenOps capabilities: tagging, chargeback, model routing, and budget guardrails.

### Function Calling (Tool Use)

An LLM capability where the model can generate structured function calls (with arguments) that your application executes. Function calling typically generates both reasoning tokens and structured output tokens. From a TokenOps perspective, function calling can increase output token counts but may reduce overall cost by eliminating the need for multi-turn conversations or complex output parsing. The key is to count both the function call tokens and any re-invocation tokens in your cost model.

---

## G

### Guardrail

See [Budget Guardrail](#budget-guardrail). In broader usage, guardrails may also refer to content safety filters, quality checks, or rate limits. In the TokenOps context, "guardrail" specifically refers to automated cost and usage controls.

---

## I

### Inference

The process of generating an output from a trained LLM in response to an input prompt. Every LLM API call is an inference request. Inference cost is the primary focus of TokenOps — it's the ongoing, variable cost that scales with usage. Inference cost is determined by: (1) the model selected, (2) the number of input tokens, (3) the number of output tokens, and (4) any provider-specific pricing (batch discounts, cached input discounts, etc.).

### Input Tokens

The tokens consumed by the content you send to the LLM — including the system prompt, user message, conversation history, retrieved context (RAG), few-shot examples, and function definitions. Input tokens are typically 2–10× cheaper than output tokens per token, but they usually constitute 60–90% of total tokens per request (especially in RAG and conversational workloads). Reducing input tokens through prompt compression, context trimming, and caching is one of the highest-leverage TokenOps optimizations.

---

## L

### Latency (TTFT / TPS)

**TTFT (Time to First Token):** The time between sending a request and receiving the first token of the response. Critical for user-perceived responsiveness. **TPS (Tokens per Second):** The rate at which output tokens are generated after the first token. Also called "throughput" in some contexts. In TokenOps, latency metrics are tracked alongside cost metrics because cost optimization (e.g., switching to a cheaper model) may affect latency. Quality gates for model selection should include latency thresholds.

### LoRA (Low-Rank Adaptation)

A parameter-efficient fine-tuning technique that trains a small number of additional parameters (adapters) rather than modifying the full model weights. LoRA enables fine-tuning at a fraction of the compute cost and allows multiple LoRA adapters to share a single base model. In TokenOps, LoRA is relevant for organizations that fine-tune models — it reduces training costs and enables rapid iteration on domain-specific models.

---

## M

### Max Tokens

An API parameter that limits the maximum number of output tokens the model will generate for a single request. Setting `max_tokens` is a critical TokenOps control — it prevents runaway generation costs from verbose models or edge cases. Best practice: set `max_tokens` to the expected output length plus a 20–50% buffer for every production API call. Never leave `max_tokens` unset in production.

### Model Routing

The practice of automatically directing each LLM request to the optimal model based on task type, quality requirements, cost, and latency constraints. A model routing layer evaluates incoming requests (using metadata tags like `use_case` and `priority`) and selects the cheapest model that meets the quality threshold for that task type. Model routing is a core TokenOps optimization that typically reduces costs by 40–70% compared to using a single expensive model for all tasks.

### Model Tiering

The organizational practice of categorizing LLM models into tiers based on capability and cost, and assigning each tier to appropriate workload types. A typical tiering structure: **Tier 1 (Economy)** — GPT-4o-mini, Gemini Flash, Haiku — for classification, extraction, simple generation; **Tier 2 (Standard)** — GPT-4o, Claude Sonnet, Gemini Pro — for complex generation, summarization; **Tier 3 (Premium)** — Claude Opus, o3 — for complex reasoning, research synthesis. Model tiering is the strategic framework; model routing is the technical implementation.

---

## O

### Output Tokens

The tokens generated by the LLM in its response. Output tokens are significantly more expensive than input tokens (typically 3–5× per token) because they require sequential generation (autoregressive decoding). Controlling output tokens through `max_tokens` limits, concise prompting instructions ("Be brief"), and structured output formats is a high-impact TokenOps optimization. Output-heavy workloads (long-form generation, code generation) benefit most from output token optimization.

---

## P

### Prompt Caching

A provider-side feature (offered by Anthropic, OpenAI, and others) that caches the processed representation of static prompt prefixes (system prompts, few-shot examples, tool definitions) across requests. When subsequent requests share the same prefix, cached input tokens are charged at a discount (typically 75–90% off). Prompt caching is distinct from application-level caching — it's managed by the provider and applies to the static portions of your prompts. It's most effective when you have long, stable system prompts.

### Prompt Compression

The practice of reducing the token count of prompts while preserving their effectiveness. Techniques include: removing verbose instructions, consolidating redundant examples, using shorter variable names in templates, eliminating unnecessary whitespace and formatting, using abbreviations the model understands, and replacing natural language descriptions with structured formats (JSON, YAML). A well-executed prompt compression effort typically reduces input tokens by 20–40% with no measurable quality impact.

---

## Q

### Quantization

A technique that reduces model size and inference cost by representing model weights with lower-precision numbers (e.g., INT8 instead of FP32, or INT4 instead of FP16). Quantization is primarily relevant for self-hosted models — it reduces GPU memory requirements and increases throughput, effectively lowering the cost per token. For API-hosted models, quantization is managed by the provider and reflected in the pricing tier. Common quantization levels: FP16, INT8 (minimal quality loss), INT4 (moderate quality loss, significant cost reduction).

---

## R

### RAG (Retrieval-Augmented Generation)

An architecture pattern where relevant documents or data are retrieved from a knowledge base (typically a vector database) and included in the LLM prompt as context. RAG improves accuracy and reduces hallucinations but significantly increases input token count. TokenOps considerations for RAG include: limiting the number of retrieved chunks, scoring chunk relevance and dropping low-relevance results, summarizing long documents before inclusion, and monitoring the cost-per-query across the retrieval + generation pipeline.

### Rate Limit

A provider-imposed constraint on the number of requests, tokens, or both that you can consume per minute or per day. Rate limits exist at multiple levels: requests per minute (RPM), tokens per minute (TPM), and requests per day (RPD). In TokenOps, rate limits affect capacity planning and may necessitate request queuing, model fallback routing, or multi-provider strategies. Hitting rate limits also causes request failures that waste engineering time.

### Reasoning Tokens

Tokens generated by "thinking" or "reasoning" models (e.g., OpenAI o3, Claude with extended thinking) as part of their internal chain-of-thought process. Reasoning tokens are charged as output tokens but are not included in the visible response — they represent the model "thinking through" the problem. Reasoning token consumption can be significant (10–100× the visible output) and must be accounted for in cost models. Some providers allow configuring a "thinking budget" to limit reasoning token spend.

---

## S

### Semantic Caching

An application-level caching strategy that uses embedding similarity to identify and serve cached responses for queries that are semantically similar (but not identical) to previous queries. Unlike exact-match caching, semantic caching can match "What's the return policy?" to "How do I return an item?" Semantic caching requires an embedding model and a vector database, adding complexity and a small per-query cost, but can dramatically reduce LLM API costs for workloads with high query similarity. Typical cache hit rate improvement: 15–25% over exact-match alone.

### Showback

A financial practice where LLM costs are attributed to specific teams and made visible in reports, but without direct budget impact. Showback is informational — teams see how much they're spending but their budgets are not directly affected. Showback is recommended as a first step before chargeback because it builds awareness and data quality without the organizational friction of direct financial impact. Most organizations start with showback and transition to chargeback after 1–2 quarters.

### SLO (Service Level Objective)

A target for a measurable attribute of a service, such as latency, availability, or error rate. In TokenOps, SLOs are extended to include cost-related attributes: cost per request, cost per outcome, budget adherence, and cache hit rate. Cost SLOs provide a clear, measurable target for optimization efforts and serve as the quality gate for model selection decisions (e.g., "Cost per conversation must remain below $0.15").

### Stop Sequence

One or more strings that, when generated by the model, cause it to stop producing further output. Stop sequences are a simple but effective TokenOps control — they prevent the model from generating unnecessary trailing content. Common examples: `\n\n` for single-paragraph responses, `</answer>` for structured output, or a custom delimiter. Well-chosen stop sequences can reduce output tokens by 10–30% for generation-heavy workloads.

### Structured Output

A prompting and API technique where the LLM's output is constrained to follow a specific format (JSON schema, XML, or a predefined structure). Structured output reduces wasted output tokens by eliminating verbose prose, explanations, and filler text. Many providers now support guaranteed structured output via JSON mode or schema enforcement. From a TokenOps perspective, structured output reduces output tokens (the most expensive token type) and eliminates parsing failures that cause costly retries.

### System Prompt

The initial instruction set provided to the LLM that defines its persona, behavior rules, output format, and task context. System prompts are included in every request as input tokens, so their size directly impacts per-request cost. In high-volume applications, a system prompt that is 500 tokens longer than necessary can cost thousands of dollars per month. TokenOps best practice: audit system prompts quarterly, remove redundant instructions, and leverage prompt caching for the static portions.

---

## T

### Temperature

An API parameter (typically 0.0–2.0) that controls the randomness of the model's output. Lower temperature (0.0–0.3) produces more deterministic, focused outputs; higher temperature (0.7–1.5) produces more creative, varied outputs. Temperature doesn't directly affect token cost, but it affects TokenOps in two ways: (1) lower temperature makes exact-match caching more effective (identical inputs → identical outputs), and (2) higher temperature may require more retries for quality, increasing effective cost.

### Throughput

The rate at which a system processes LLM requests, typically measured in requests per second (RPS) or tokens per second (TPS). In TokenOps, throughput is a capacity planning metric — you need to ensure your token budget supports the required throughput. It's also a trade-off dimension: batch APIs offer lower cost but lower throughput; real-time APIs offer higher throughput at higher cost. Throughput requirements should be documented in Architecture Decision Records alongside cost estimates.

### Token

The fundamental unit of text processing for LLMs. A token is a sub-word unit that the model uses for input and output — it can be a whole word, a word fragment, a punctuation mark, or a whitespace character. In English, 1 token ≈ 0.75 words (or equivalently, 1 word ≈ 1.33 tokens). Tokens are the billing unit for LLM APIs — you are charged per input token consumed and per output token generated. Understanding token economics is the foundation of TokenOps.

### Token Budget

The maximum number of tokens (or equivalent dollar cost) allocated to a service, team, or feature for a given period (typically monthly). Token budgets are enforced through budget guardrails configured in the LLM gateway. Setting token budgets requires historical baseline data, growth projections, and alignment with financial targets. Best practice: set budgets with a 20% buffer above baseline, with a soft alert at 80% and a hard limit at 100%.

### Token Velocity

The rate of token consumption over time, typically measured as tokens per hour, per day, or per month. Token velocity is a key operational metric for capacity planning, cost forecasting, and anomaly detection. A sudden spike in token velocity may indicate a runaway loop, a traffic surge, or a misconfigured prompt. Monitoring token velocity with automated alerts is a core capability of TokenOps Level 3 (Instrumented).

### Token Yield Rate

The ratio of useful, business-relevant output tokens to total tokens consumed (input + output). A low yield rate indicates inefficiency — the model is consuming many tokens to produce relatively little useful output. Common causes of low yield: verbose system prompts, excessive few-shot examples, long conversation histories, and unparseable or retried outputs. Target yield rate varies by use case, but tracking it over time reveals optimization opportunities.

### Tokenizer

The software component that converts raw text into tokens (and vice versa). Different model families use different tokenizers (e.g., OpenAI uses `tiktoken`, Anthropic uses their own tokenizer), so the same text may tokenize to different counts depending on the model. In TokenOps, the tokenizer is important for accurate cost estimation — pre-computing token counts client-side (using the appropriate tokenizer) enables cost prediction before sending requests to the API.

### Top-P (Nucleus Sampling)

An API parameter that controls output diversity by limiting token selection to the smallest set of tokens whose cumulative probability exceeds P. Like temperature, Top-P doesn't directly affect token cost, but it influences caching effectiveness and retry rates. For deterministic, cost-efficient workloads, use `top_p=1.0` with `temperature=0.0`. For creative tasks, use moderate values (0.9–0.95) and account for potential quality variance in your cost model.

---

## U

### Unit Economics

The per-unit cost and revenue metrics for an AI-powered product or feature. In TokenOps, unit economics connect LLM token costs to business outcomes: cost per support ticket resolved, cost per document processed, cost per code review, cost per user per month. Unit economics are essential for pricing AI features, justifying AI investments, and identifying optimization opportunities. A healthy unit economics analysis shows that the LLM cost is a sustainable fraction (typically 10–30%) of the revenue or value generated per unit.

---

## V

### Vector Database

A specialized database optimized for storing, indexing, and querying high-dimensional embedding vectors. Vector databases power semantic search, RAG retrieval, and semantic caching. In a TokenOps context, vector databases are infrastructure components that affect cost in two ways: (1) they have their own hosting and query costs, and (2) the quality of retrieval directly impacts LLM input token counts (better retrieval = fewer irrelevant chunks = fewer input tokens). Examples: Pinecone, Weaviate, Qdrant, pgvector, Chroma.

---

## Appendix: Acronyms Quick Reference

| Acronym | Full Term                                     |
| ------- | --------------------------------------------- |
| ADR     | Architecture Decision Record                  |
| BPE     | Byte-Pair Encoding                            |
| CTO     | Chief Technology Officer                      |
| ETL     | Extract, Transform, Load                      |
| FAQ     | Frequently Asked Questions                    |
| FP&A    | Financial Planning & Analysis                 |
| KPI     | Key Performance Indicator                     |
| LLM     | Large Language Model                          |
| LoRA    | Low-Rank Adaptation                           |
| MTD     | Month-to-Date                                 |
| MoM     | Month-over-Month                              |
| OKR     | Objectives and Key Results                    |
| P&L     | Profit and Loss                               |
| PII     | Personally Identifiable Information           |
| QBR     | Quarterly Business Review                     |
| RACI    | Responsible, Accountable, Consulted, Informed |
| RAG     | Retrieval-Augmented Generation                |
| RPD     | Requests per Day                              |
| RPM     | Requests per Minute                           |
| RPS     | Requests per Second                           |
| SLA     | Service Level Agreement                       |
| SLO     | Service Level Objective                       |
| SRE     | Site Reliability Engineering                  |
| TTFT    | Time to First Token                           |
| TPS     | Tokens per Second                             |
| TPM     | Tokens per Minute                             |

---

_Glossary version 1.0 — 60+ terms. Maintained by the TokenOps team._
