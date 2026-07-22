# Prompt Caching in 2026: The 90% Discount

Prompt caching is the single highest-ROI, lowest-effort optimisation in the TokenOps toolkit. In 2026 it is no longer optional.

## Discount by provider

| Provider | Mechanism | Discount | TTL | Write premium |
|---|---|---|---|---|
| **OpenAI** (GPT-4o+, GPT-5) | Fully automatic, no code changes | 50% (GPT-4o) → **90%** (GPT-5) | ~5–10 min sliding | None |
| **Anthropic** | `cache_control` breakpoints | **90%** on hits | 5 min or 1 hr | 1.25× (5-min) or 2× (1-hr) |
| **Gemini** | Implicit (auto) + explicit (managed) | ~75% | Minutes to hours | None (implicit); small (explicit) |
| **DeepSeek** | Disk-based context cache | **90%** ($0.028 vs $0.28/M) | Hours | None |

## The break-even model

Anthropic's write premium means caching only pays off above a reuse threshold. For a 5-minute cache with a 1.25× write premium and 90% read discount:

- **1 write, 1 read:** costs 1.25 + 0.10 = 1.35× base → *worse than no cache*.
- **1 write, 2 reads:** 1.25 + 0.20 = 1.45× vs 2.0× base → **28% saving**.
- **1 write, 10 reads:** 1.25 + 1.00 = 2.25× vs 10× base → **77% saving**.

**Rule of thumb:** cache only prefixes that will be reused **at least twice within the TTL window**. Bursty, spaced-out traffic (>1hr gaps) gets zero benefit from Anthropic caching and pays the write tax for nothing.

## What to cache (in priority order)

1. **System prompts** — always. They're stable, long, and hit on every turn.
2. **Tool/function schemas** — for agents, these are re-sent every turn and often exceed the user message length.
3. **Few-shot examples** — stable across calls, expensive per token.
4. **RAG chunks with high hit-rate** — for FAQ-style retrieval where the top-K rarely changes.
5. **Long documents in multi-turn chat** — a 100K-token PDF cached once, referenced 10 times, is the canonical win.

## What NOT to cache

- Prefixes that vary per user (personalisation strings before stable content).
- Short prompts (<1024 tokens for OpenAI, below minimum breakpoints for Anthropic).
- One-shot batch jobs with no reuse.

## Anti-patterns

- **Cache invalidation via prompt edits.** Adding a comma at the start of a system prompt invalidates the whole cache. Version prompts and treat them as immutable artifacts.
- **Cache-busting timestamps.** Injecting `now()` into the system prompt for "freshness" destroys hit rate. Put dynamic content *after* the cached prefix.
- **Ignoring the write premium in cost dashboards.** Track cached vs uncached input tokens separately; a rising write-token ratio with flat hit ratio means your cache is churning.
