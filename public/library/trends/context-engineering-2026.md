# Context Engineering: The Discipline (2026)

*Prompt engineering was 2023's craft. **Context engineering** is 2026's — and it is an engineering discipline, not a writing skill.*

## The definition

Context engineering is the systematic design of what tokens enter a model's context window, in what order, at what freshness, and at what cost — across the entire request lifecycle.

It replaces prompt engineering because in a 2026 agentic system, the user's message is <5% of what reaches the model. The other 95% — system prompt, tool schemas, retrieved chunks, memory, prior turns, sub-agent outputs — is the engineered surface.

## The seven layers

1. Stable system prefix (cached)
2. Persona / examples / policies
3. Tool schemas (scoped per turn)
4. Retrieved evidence (RAG chunks)
5. Turn history (pruned / summarised)
6. Reasoning budget
7. Output shaping (schemas, length)

Each layer has its own cost model, cache behaviour, and update cadence. Optimising each in isolation misses interactions — hence the "engineering" label.

## The token budget

| Layer | Typical budget | Cache-friendly? |
|---|---|---|
| System prefix | 2–4K | Yes (always cache) |
| Persona / policies | 1–2K | Yes |
| Tool schemas | 3–10K | Yes if scoped |
| RAG chunks | 2–8K | No |
| Turn history | 1–4K | Partial |
| Reasoning | 0–16K | No (output-priced) |
| Output | 0.5–2K | No |

A feature exceeding its budget is a defect, not a request for a bigger budget. The fix is compression, not expansion.

## The five techniques

1. **Compression.** LLMLingua-2, prompt-token-reduction (up to 20× on long documents with <2% quality loss).
2. **Scoping.** Load only the tool schemas relevant to the current turn (MCP scoping).
3. **Summarisation checkpoints.** After N turns, summarise history to 500 tokens.
4. **Late binding.** Inject dynamic content *after* the cached prefix, never before.
5. **Reference over inclusion.** Pass document IDs; let a tool fetch on demand.

## The measurement

Add to every request span:
- `context_tokens_by_layer` (dict)
- `context_utilization`
- `layer_cache_hit_ratio`
- `context_headroom`

## The 2026 stack

- **LLMLingua-2** (Microsoft) — task-agnostic compression.
- **dspy / TextGrad** — automated prompt/example selection under a token budget.
- **Anthropic contextual retrieval** — chunk-level context prepending; +30–50% RAG accuracy.
- **OpenAI Prompt Optimizer** (2026 feature) — recompresses stable prefixes.

## The role

2026 org charts increasingly include a **Context Engineer** — owning the prompt-and-schema registry, compression pipelines, cache-hit KPIs, and per-feature token budgets. Where this role does not exist, context grows unboundedly until a cost incident forces cleanup.
