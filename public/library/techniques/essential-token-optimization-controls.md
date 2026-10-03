# 15 Essential Token Optimization Controls

Token optimization is a system design discipline, not a single prompt trick. The strongest programs apply controls in order: **avoid unnecessary model work, reduce what enters context, choose the least-cost valid execution path, constrain generation, and measure the result**.

## The control stack

| #   | Control                     | Primary decision                                         | Measure                                         |
| --- | --------------------------- | -------------------------------------------------------- | ----------------------------------------------- |
| 1   | Small-model-first execution | Can a smaller model clear the quality threshold?         | Cost per accepted outcome by model tier         |
| 2   | Multi-model routing         | Which tier should handle this complexity?                | Route share, escalation rate, quality by route  |
| 3   | Context trimming            | Which tokens can be removed without changing the answer? | Input tokens by context layer                   |
| 4   | Conversation summarization  | Which history must remain verbatim?                      | History tokens, summary refresh rate            |
| 5   | Output token limits         | What is the shortest useful result?                      | Output p50/p95, truncation rate                 |
| 6   | Focused RAG                 | Which evidence is necessary for this question?           | Retrieved versus sent tokens, grounded accuracy |
| 7   | Exact response caching      | Has this validated request already been answered?        | Hit rate, stale rate, avoided calls             |
| 8   | Prompt caching              | Which stable prefix repeats within the cache window?     | Cached-read share, write-to-read ratio          |
| 9   | Semantic caching            | Is a meaning-equivalent answer safe to reuse?            | Similarity threshold, false-hit rate            |
| 10  | Structured outputs          | What fields does the next step actually consume?         | Schema-valid rate, retry rate                   |
| 11  | Batch processing            | Can the result arrive asynchronously?                    | Batch share, completion SLA, discount realized  |
| 12  | Agent guardrails            | How much autonomy can one task consume?                  | Steps, tool calls, tokens, timeout rate         |
| 13  | Tool-first architecture     | Can deterministic software answer without an LLM?        | Model-call avoidance rate                       |
| 14  | Query classification        | Which execution path fits this request?                  | Route accuracy, fallback rate                   |
| 15  | Cost monitoring dashboards  | Is spend improving per successful outcome?               | Cost per user, request, feature, and outcome    |

## 1. Use smaller models first

Routine classification, extraction, tagging, and FAQ workloads rarely need a flagship model. Establish an evaluation set, define the minimum acceptable quality, and start on the smallest model that passes. Escalate only failed validation, low-confidence results, or complex tasks.

Do not optimize on token price alone. A cheap model that triggers repeated retries can have a higher **cost per accepted outcome** than a stronger model.

## 2. Route across model tiers

Separate task intent from task difficulty. A routing policy might send extraction to a compact model, structured generation to a mid-tier model, and novel planning or hard coding to a frontier model. Keep a fallback path and review route quality continuously.

## 3. Trim context before every call

Keep the task, constraints, current state, and relevant evidence. Remove duplicated instructions, stale tool output, irrelevant history, and repeated retrieval overlap. Track tokens by layer—system instructions, tools, retrieval, history, and user input—so growth is attributable.

## 4. Summarize long conversations

Use a compact state summary for older turns and retain a short verbatim tail. Preserve decisions, identifiers, preferences, unresolved questions, and current work. Refresh the summary at stable checkpoints rather than on every message.

## 5. Bound output

Set a realistic output ceiling from observed completion lengths. Ask for the artifact rather than an essay: a label, patch, table row, or bounded list. Monitor truncation so an overly tight limit does not create repair calls.

## 6. Retrieve only necessary evidence

Retrieve broadly enough to preserve recall, rerank candidates, then send only the smallest grounded evidence set. Deduplicate overlapping chunks and avoid inserting an entire manual when four passages answer the question.

## 7. Cache exact responses

For identical, repeatable requests, key the cache with normalized input, prompt version, model settings, and tenant boundary. Store only validated responses. Expire or invalidate entries when their source data or instructions change.

## 8. Cache stable prompt prefixes

Place stable policy, tool schemas, and reusable examples before dynamic user content. Keep serialization and ordering deterministic. Measure writes and reads separately because some providers charge a write premium; a cache with no reuse can increase cost.

## 9. Add semantic caching selectively

Semantic caching can reuse an answer for paraphrased requests, but it needs stricter governance than exact matching. Use it for bounded, low-volatility domains such as FAQs. Tune similarity thresholds on real queries, isolate tenants, and track false hits.

## 10. Prefer structured outputs

Return only fields the next system consumes. A small schema, enum, or typed object reduces commentary and usually prevents parse-and-retry loops. Validate locally and repair trivial formatting defects without another model call.

## 11. Move eligible work to batch

Classification sweeps, enrichment, evaluation, backfills, and summaries often tolerate delayed completion. Batch these requests when the provider discount and completion window fit the service objective. Use idempotency keys and bounded retries.

## 12. Put hard limits around agents

Every agent needs maximum steps, tool calls, tokens, elapsed time, and retries. Add early exit on success and require explicit justification before escalating models. Measure each agent step, not only the final response.

## 13. Use deterministic tools before models

Time, arithmetic, conversion, database lookup, validation, and known business rules belong in conventional software. Use a model for ambiguity, synthesis, or reasoning—not as an expensive calculator or database proxy. Allow-list and authenticate tools, and send only the result needed for synthesis.

## 14. Classify before execution

A small rules engine or compact classifier can route requests to an exact cache, semantic cache, search, RAG, deterministic tool, small model, or agent. Keep labels few and observable. Sample routed traffic to detect confident misclassification.

## 15. Monitor unit economics

Track cost per user, request, feature, and successful outcome alongside tokens per request, model mix, cache hit rate, retries, and agent steps. Dashboard totals are not enough: every metric needs an owner, threshold, and response playbook.

## Recommended implementation order

1. **Instrument:** tag every request and establish cost per accepted outcome.
2. **Avoid:** add exact caching, deterministic tools, and preflight classification.
3. **Reduce:** trim context, summarize history, focus retrieval, and cap outputs.
4. **Right-size:** benchmark smaller models, then introduce routing and escalation.
5. **Scale safely:** add semantic caching, batch work, and agent guardrails.
6. **Govern:** review route quality, cache correctness, unit costs, and drift on a regular cadence.

Never claim savings from a configuration change alone. Compare equivalent successful outcomes over a stated measurement window, and keep quality, latency, and failure rate beside cost.
