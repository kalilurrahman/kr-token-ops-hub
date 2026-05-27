# TokenOps Tool Landscape Guide

> A curated guide to the tooling ecosystem for managing LLM token costs, observability, and optimization.

---

## 1. LLM Gateways / Proxies

Central routing layer for all LLM API calls — the foundation of TokenOps.

| Tool | Type | Pricing | Best For |
|------|------|---------|----------|
| **LiteLLM** | Open-source proxy | Free (self-hosted) | Teams wanting full control with multi-provider routing |
| **Portkey** | Managed gateway | Free tier + paid | Production apps needing reliability, caching, and observability |
| **Helicone** | Managed proxy | Free tier + paid | Developer-friendly logging and analytics |
| **Kong / Envoy (+ plugins)** | API gateway + custom | Free (self-hosted) | Large orgs with existing API gateway infrastructure |
| **Custom middleware** | Build your own | Engineering time | Teams with unique routing/tagging requirements |

### LiteLLM
**Key Features:** 100+ LLM providers supported, unified OpenAI-compatible API, load balancing, fallbacks, cost tracking, budget limits, Prometheus metrics  
**Integration:** Drop-in proxy — point your OpenAI SDK to `http://litellm-proxy:4000`  
**When to use:** Best starting point for most teams. Free, flexible, actively maintained.

### Portkey
**Key Features:** AI gateway with automatic retries, caching, load balancing, guardrails, multi-provider routing, analytics dashboard  
**Integration:** SDK wrappers for Python/JS, or as a proxy  
**When to use:** Teams wanting a managed solution with built-in reliability features.

### Helicone
**Key Features:** One-line integration, request logging, cost tracking, user analytics, prompt management, caching  
**Integration:** Header-based proxy — add one header to existing API calls  
**When to use:** Fastest setup; ideal for getting visibility quickly.

---

## 2. Observability Platforms

Monitoring, tracing, and evaluating LLM applications.

| Tool | Type | Pricing | Best For |
|------|------|---------|----------|
| **Langfuse** | Open-source | Free (self-hosted) / Cloud plans | Teams wanting open-source observability with tracing |
| **LangSmith** | Managed | Free tier + paid | LangChain users needing integrated monitoring |
| **Arize Phoenix** | Open-source | Free (self-hosted) | ML teams wanting detailed trace analysis |
| **Braintrust** | Managed | Free tier + paid | Evaluation-first teams doing prompt engineering |
| **Weights & Biases** | Managed | Free tier + paid | ML teams already using W&B for experiment tracking |

### Langfuse
**Key Features:** Traces, scores, prompt management, dataset management, evaluations, cost tracking, usage analytics  
**Integration:** Python/JS SDKs, OpenAI wrapper, LangChain/LlamaIndex integrations  
**When to use:** Best open-source option. Self-host for data control or use cloud.

### LangSmith
**Key Features:** Tracing, evaluation, prompt hub, monitoring, dataset management  
**Integration:** Native LangChain integration, standalone SDK  
**When to use:** If you're already in the LangChain ecosystem.

---

## 3. Cost Management

Dedicated tools for tracking, allocating, and optimizing AI spend.

| Tool | Type | Pricing | Best For |
|------|------|---------|----------|
| **Custom dashboards (Grafana)** | Open-source | Free | Teams with existing Grafana/Prometheus stack |
| **Finout** | Managed FinOps | Paid | Enterprise FinOps teams managing cloud + AI costs |
| **CloudZero** | Managed | Paid | Connecting AI costs to business unit economics |
| **Provider dashboards** | Built-in | Free | Quick visibility with no setup |

### Custom Grafana Dashboards
**Key Features:** Full control, connect to any data source, custom panels, alerts  
**Integration:** Prometheus exporter from gateway, direct SQL from cost warehouse  
**When to use:** Most flexible option. Recommended if you have Grafana expertise.

### Provider Dashboards (OpenAI, Anthropic, Google)
**Key Features:** Usage, cost trends, API key breakdowns  
**Limitations:** Single provider view, limited tagging, no cross-provider comparison  
**When to use:** Quick start, but supplement with gateway-level tracking.

---

## 4. Prompt Management

Version control, testing, and deployment for prompts.

| Tool | Type | Pricing | Best For |
|------|------|---------|----------|
| **Langfuse Prompts** | Open-source | Free | Teams already using Langfuse for observability |
| **Humanloop** | Managed | Free tier + paid | Non-technical stakeholders collaborating on prompts |
| **Promptfoo** | Open-source | Free | CLI-first prompt evaluation and testing |
| **Git + YAML** | DIY | Free | Engineering teams wanting prompts-as-code |

### Promptfoo
**Key Features:** CLI-based prompt evaluation, comparison tables, multiple models, custom metrics, CI/CD integration  
**Integration:** npm/CLI, YAML config, GitHub Actions  
**When to use:** Best for systematic prompt testing in CI/CD pipelines.

### Git + YAML (Prompts as Code)
**Key Features:** Full version history, PR reviews, branch testing, CI integration  
**Integration:** Any CI/CD system  
**When to use:** Engineering-led teams who want prompts treated as production code.

---

## 5. Caching Solutions

Reduce redundant LLM calls with response caching.

| Tool | Type | Pricing | Best For |
|------|------|---------|----------|
| **Provider prompt caching** | Built-in | Discounted tokens | Repeated long system prompts or context |
| **Redis + custom layer** | Open-source | Free | Exact-match caching with full control |
| **GPTCache** | Open-source | Free | Semantic caching with vector similarity |
| **Portkey cache** | Managed | Included | Easy semantic caching without infrastructure |

### Provider Prompt Caching (OpenAI, Anthropic, Google)
**How it works:** Provider caches the prefix of your prompt. Subsequent calls with the same prefix get discounted input tokens (up to 90% off).  
**When to use:** Always enable for workloads with consistent system prompts.

### Redis + Custom Logic
**How it works:** Hash the request (model + messages + params) → check Redis → serve cached response or call API  
**When to use:** High-volume deterministic tasks (classification, extraction).

---

## 6. Vector Databases (for RAG)

Store and retrieve embeddings for retrieval-augmented generation.

| Tool | Type | Pricing | Best For |
|------|------|---------|----------|
| **Pinecone** | Managed | Free tier + paid | Serverless, zero-ops vector search |
| **Weaviate** | Open-source / Cloud | Free (self-hosted) | Teams wanting hybrid search (dense + sparse) |
| **Qdrant** | Open-source / Cloud | Free (self-hosted) | High-performance, Rust-based, quantization support |
| **pgvector** | PostgreSQL extension | Free | Teams already on PostgreSQL wanting to avoid new infra |
| **Chroma** | Open-source | Free | Prototyping and small-scale applications |

### pgvector
**Key Features:** PostgreSQL extension, HNSW/IVFFlat indexes, no new infrastructure  
**When to use:** If you're already on PostgreSQL and vector data fits in memory. Best for < 10M vectors.

### Pinecone
**Key Features:** Serverless, zero-ops, metadata filtering, namespaces, hybrid search  
**When to use:** Teams wanting managed infrastructure with scale-to-zero pricing.

---

## 7. Evaluation Frameworks

Automated quality testing for LLM outputs.

| Tool | Type | Pricing | Best For |
|------|------|---------|----------|
| **RAGAS** | Open-source | Free | RAG-specific evaluation (faithfulness, relevance, recall) |
| **DeepEval** | Open-source | Free | General LLM evaluation with built-in metrics |
| **Promptfoo** | Open-source | Free | Comparative prompt evaluation across models |
| **Custom (pytest + LLM-as-judge)** | DIY | Free | Teams with specific quality criteria |

### RAGAS
**Key Features:** Faithfulness, answer relevance, context precision, context recall metrics  
**When to use:** Primary evaluation tool for RAG pipelines.

### DeepEval
**Key Features:** 14+ built-in metrics, LLM-as-judge, Pytest integration, CI/CD ready  
**When to use:** Comprehensive evaluation beyond RAG.

---

## Tool Selection Matrix

### By Team Size

| Team Size | Gateway | Observability | Caching | Evaluation |
|-----------|---------|--------------|---------|------------|
| 1–5 engineers | Helicone (easy setup) | Langfuse Cloud | Provider caching | Promptfoo |
| 5–20 engineers | LiteLLM (self-hosted) | Langfuse (self-hosted) | Redis + custom | RAGAS + Promptfoo |
| 20+ engineers | LiteLLM + custom plugins | Langfuse + Grafana | Redis + semantic | Full evaluation pipeline |

### By Budget

| Budget | Recommended Stack |
|--------|------------------|
| $0 (all free) | LiteLLM + Langfuse + Grafana + pgvector + Promptfoo |
| < $500/month | Helicone + Langfuse Cloud + Pinecone free + Promptfoo |
| $500–$5K/month | Portkey + Langfuse Cloud + Pinecone + DeepEval |
| Enterprise | Custom gateway + full observability + dedicated vector DB |

### By Maturity Level

| Maturity | Focus Area | Key Tools |
|----------|-----------|-----------|
| Level 1 (Ad Hoc) | Get visibility | Helicone or provider dashboards |
| Level 2 (Aware) | Add tagging | LiteLLM + Grafana |
| Level 3 (Instrumented) | Full observability | LiteLLM + Langfuse + custom dashboards |
| Level 4 (Optimized) | Caching + routing | + Redis cache + Promptfoo + evaluation pipeline |
| Level 5 (Governed) | Automation | + Custom policy engine + automated guardrails |

---

*Reference from the TokenOps Atlas — [tokenops-atlas](https://github.com/kalilurrahman/tokenops-atlas)*
