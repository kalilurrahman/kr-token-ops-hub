# Prompt Compression Techniques (2026)

Compression is the cheapest lever in TokenOps: it touches every request, needs no vendor negotiation, and compounds with caching and routing.

## 1. The compression ladder

Apply in order. Stop when quality regresses on your eval set.

| Rung | Technique | Typical input reduction | Effort |
|---|---|---|---|
| 1 | Strip boilerplate politeness, restated instructions, duplicated schemas | 8–15% | Hours |
| 2 | Convert prose instructions to terse bullet directives | 10–25% | Hours |
| 3 | Replace verbose JSON examples with a single schema + one exemplar | 15–30% | Days |
| 4 | Move stable instructions to a cached prefix (see caching) | 0% tokens, 60–90% cost on prefix | Days |
| 5 | Automatic context compression (LLMLingua-style token pruning) | 20–50% on retrieved context | Weeks |
| 6 | Learned summarisation of conversation history | 40–70% on long chats | Weeks |

## 2. Instruction hygiene rules

- **One statement of a rule, once.** Repeating "be concise" in system, developer, and user turns triples its cost and does not triple compliance.
- **Delete negative examples** unless failures are frequent; they cost as much as positive ones and generalise worse.
- **Prefer schemas to prose.** A JSON Schema or TypeScript type is a denser specification than a paragraph describing the same fields.
- **Kill the persona paragraph.** "You are a world-class senior expert..." rarely moves measured quality on 2026-class models; measure before keeping it.
- **Move few-shot examples into retrieval.** Fetch the 1–2 nearest exemplars per request instead of shipping 8 static ones.

## 3. Context compression for RAG

1. **Rerank before you truncate.** A cross-encoder reranker over 20 candidates that keeps 4 beats naive top-10 on both cost and recall.
2. **Sentence-level pruning.** Score sentences within a chunk against the query; drop the bottom 40%. Typical loss: <1 point on answer accuracy.
3. **Structured extraction over raw dumps.** Convert tables and logs to compact key-value form before injecting them.
4. **Deduplicate across chunks.** Overlapping chunk windows re-send the same sentences; hash and drop repeats.

## 4. Conversation history compression

- **Rolling summary + verbatim tail:** summarise turns older than N, keep the last 3–5 verbatim.
- **Fact store instead of transcript:** extract durable facts (user preferences, IDs, decisions) into a small state object; drop the chat.
- **Reset on task boundary.** Most agent threads should start a fresh context per task, not inherit the whole session.

## 5. Measuring compression safely

Never ship compression without a gate:

- Golden set of 100–300 real requests with graded outputs.
- Track: task accuracy, format validity, retry rate, p95 latency, tokens in/out.
- Ship only if accuracy delta is within noise and retry rate does not rise — a retry cancels the savings of a 30% compression.

## 6. Anti-patterns

- Compressing the prompt while leaving output uncapped (output tokens usually cost 4–8× input).
- Compressing the cached prefix — you save little and invalidate the cache.
- Aggressive abbreviation that hurts tokenizer efficiency (rare words split into more tokens than the phrase they replaced).
