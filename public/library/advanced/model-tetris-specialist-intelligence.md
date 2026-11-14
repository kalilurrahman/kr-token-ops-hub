# Model Tetris: specialist intelligence and advanced controls

Reviewed 14/11/2026. The new frontier is selecting different kinds of computation, not merely selecting a smaller language model.

## Match the shape of computation

| Work | Candidate building block | Measure |
|---|---|---|
| Exact arithmetic, rules and lookups | Deterministic code or data query | Correctness, query cost and permissions |
| Bounded choice or score | Jev or another typed decision model | Calibration, abstention, decision consequence |
| Prose, code and synthesis | Generative LLM | Accepted-task quality and total token/tool cost |
| Stable cross-document knowledge | Maintained wiki plus retrieval | Freshness, source support and amortization |
| Edge perception and representation | Specialist encoder or JEPA-style research model | Task-specific accuracy and device energy |
| Local multimodal inference | Suitable compact downloadable model | Hardware fit, licence and measured throughput |

Jev is not JEPA. JEPA is a joint-embedding predictive architecture that learns latent representations; it is not a chat API and has no universal input/output token tariff.

## Recent specialist-model signals

Liquid AI's official model index lists LFM3 (27/10/2026) and d1-ultra (15/10/2026). These are candidates for specialist evaluation, not proof of universal superiority. No current licence, context limit or hosted token rate was independently confirmed in this update, so they are not given fabricated calculator prices. Downloadable weights do not by themselves establish an open-source licence.

## Six advanced optimization controls

### 1. Confidence-aware cascades

Route deterministic work first, bounded decisions second, generative work third. Calibrate abstention on held-out data. Include every classifier invocation and fallback in the cost model. Never use an unvalidated probability as authority for an irreversible action.

### 2. Ingestion-time synthesis

Move repeated source reading into maintained wiki pages where knowledge changes slowly and questions recur. Cap ingestion fan-out and include review cost. Keep RAG for fresh and exact evidence. Compare total accepted-answer cost, not merely shorter prompts.

### 3. Budgeted reasoning and long decode

Set per-task reasoning, output, tool and wall-clock ceilings. Unified context windows require input and output to share the budget. Early stopping should preserve valid structured outputs and explicitly report incomplete work rather than silently truncate evidence.

### 4. Cache identity and privacy boundaries

Key exact or semantic caches by tenant, model version, prompt version, source revision and relevant permissions. Measure rejected false matches as well as hit rate. Invalidate on source updates; never let a shared cached answer bypass access checks.

### 5. Promotion-aware procurement

Maintain service-date rates and a recurring-rate forecast separately. Introductory prices can make a route look cheaper than it will be next month. Compare billing tiers, modality, region, tools, committed spend and subscription credit rules without translating credits into tokens unless the provider defines the conversion.

### 6. Outcome-normalized observability

Track cost per accepted task, not price per token alone. Include classification, generation, tools, retrieval, retries, human review and platform overhead. Pair savings candidates with accuracy, latency and consequence metrics. A provider benchmark is not your workload result.

## Two-week evaluation plan

Days 1–3: instrument a representative task set and retain a safe baseline. Days 4–7: shadow typed decisions and wiki retrieval without side effects. Days 8–10: measure coverage, quality, latency, review time and total cost. Days 11–14: canary only passing routes with finite budgets, monitoring and rollback. Stop a trial if safety or quality falls below the agreed gate.

## Sources

- [CIO: Jev and model Tetris](https://www.cio.com/article/4247450/jev-and-the-era-of-model-tetris.html)
- [Liquid AI official model index](https://www.liquid.ai/blog)
- [TypeSafe model reference](https://docs.typesafe.ai/models)
- [Google official pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [LLM Wiki architecture explainer](https://crowllmwiki.com/llm-wiki/)
