# Cache-Aware Prompt Architecture

Prompt caching gives 50–90% discounts on repeated prefixes, but only if your prompts are *built* for it. Most teams lose the discount to avoidable prefix churn.

## 1. The layered prompt layout

Order every prompt from most stable to most volatile. Caches match on exact prefix, so any early volatility destroys the hit.

```
[1] System policy / role            ← changes monthly
[2] Tool + schema definitions       ← changes per release
[3] Static few-shot exemplars       ← changes per release
[4] Retrieved knowledge (stable)    ← changes per tenant/doc set
[5] Conversation history            ← changes per turn
[6] Current user message            ← changes every call
```

Violations that silently kill cache hits:

- a timestamp, request id, or "today is ..." line placed in layer 1,
- per-user personalisation injected above tool definitions,
- randomly ordered tool lists or JSON key ordering from a non-deterministic serializer,
- A/B experiment flags interpolated into the system prompt.

## 2. Break-even model

Cache writes usually cost a premium (typically 1.0–1.25× standard input); reads are heavily discounted.

```
break_even_reads = write_premium / (1 - read_discount)
```

With a 1.25× write and 0.1× read: break-even ≈ 1.4 reads. In practice, cache any prefix that is reused **twice or more within the TTL**.

## 3. TTL strategy

- Short TTLs (5 minutes) fit interactive chat bursts.
- Extended TTLs (1 hour+) fit agent runs, batch sweeps, and document Q&A sessions.
- Warm the cache deliberately before a known burst (nightly job, campaign send, demo) with one cheap priming call.

## 4. Minimum cacheable size

Providers enforce a floor (commonly ~1,024 tokens). If your stable prefix sits under it:

- consolidate exemplars and schemas into the prefix rather than trimming them,
- or accept no caching and optimise for raw compression instead.

This is the one place where making a prompt *longer* can be cheaper.

## 5. Multi-tenant caching

- Namespace prefixes per tenant when tenant data enters the prefix; never share a cache across trust boundaries.
- Put tenant-invariant policy above tenant data so at least the top layers stay shared.
- Measure hit rate per tenant — a single high-volume tenant usually carries the whole program's cache economics.

## 6. Semantic caching as a second tier

Exact-prefix caching handles repetition; semantic caching handles paraphrase.

- Threshold discipline matters more than the vector store: cosine 0.92–0.95 is a common safe band for FAQ-style traffic.
- Always cache the *validated* response, never a response that failed a schema check.
- Invalidate on source-document change, not on a timer alone.
- Semantic caching only pays off above roughly a 5% hit rate; below that, embedding cost exceeds savings.

## 7. Instrumentation

Log per request: `cached_input_tokens`, `uncached_input_tokens`, `cache_write_tokens`, `prefix_hash`. Without `prefix_hash` you cannot diagnose which deployment broke the cache. A weekly report of "top 10 prefix hashes by miss count" finds most regressions in minutes.
