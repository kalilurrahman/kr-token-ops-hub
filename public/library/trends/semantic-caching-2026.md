# Semantic Caching in 2026: Beyond Exact-Match

*Prompt caching gives you a 90% discount on exact prefixes. **Semantic caching** gives you a 100% discount — but only when you get similarity right.*

## The two-cache stack

Mature 2026 stacks now run **two caches in series**, not one:

1. **Semantic cache** (in front): embed the user query, look up nearest-neighbor past answers, return cached response if cosine similarity ≥ threshold. Skips the LLM entirely on hit.
2. **Prompt cache** (at the provider): if semantic cache misses, the request still benefits from provider-side prefix caching on system prompt + tools.

Reported hit rates from published 2026 case studies:
- Customer-support FAQ workloads: **60–75%** semantic hit rate.
- Internal developer assistants: **25–40%**.
- Open-ended agentic tasks: **<10%** — semantic caching adds latency without payoff.

## Threshold tuning is the whole game

| Threshold | Hit rate | False-positive rate | Use for |
|---|---|---|---|
| 0.98 | Low | Near-zero | Regulated / medical / legal |
| 0.93–0.95 | Medium | Low | Enterprise support |
| 0.88–0.92 | High | Non-trivial | Marketing / brainstorming |
| <0.85 | Very high | Dangerous | Avoid — returns wrong answers |

**Rule:** run a 2-week shadow evaluation where the cache logs would-be hits but doesn't serve them; grade a sample manually before promoting the threshold to production.

## The invalidation problem

A cached answer that becomes wrong is worse than no cache. 2026 stacks handle staleness via:

- **Content-hash TTL** — invalidate when the underlying RAG source hash changes.
- **Time-window TTL** — hard-cap cache age (e.g., 24h for pricing, 30d for policy).
- **Feedback-driven eviction** — thumbs-down evicts the neighborhood, not just the exact entry.

## What to embed

Do NOT embed the raw user message. Embed a **normalized query key**: lowercased, PII-stripped, intent-tagged. This lifts hit rates 15–25 points on real support traffic where the same question is asked ten ways.

## Vendors and libraries

- **GPTCache** (open source) — the reference implementation; pluggable embedder + vector store.
- **Redis Semantic Cache** — production-grade with TTL and eviction primitives.
- **Portkey / Helicone / Langfuse** — gateway-level semantic caching with per-tenant policies.
- **LangChain `RedisSemanticCache`** — the easiest wiring for existing LangChain apps.

## Cost model

```
savings = hit_rate × (llm_cost_per_call − embedding_cost_per_call − vector_lookup_cost)
```

Embedding + lookup typically costs $0.00001–$0.00005 per query. If the LLM call it replaces costs $0.001+, break-even is at **~5% hit rate**. Below that, semantic caching adds cost — turn it off.