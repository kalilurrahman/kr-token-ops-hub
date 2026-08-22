# Batch & Async Arbitrage

Every major provider sells the same model at roughly half price if you can wait. Most organisations run 20–50% of their token volume on latency-insensitive work and pay interactive rates for all of it.

## 1. Qualify the workload

A job belongs in batch if **all** of these hold:

- No human is waiting on the result.
- The output tolerates a delivery window of minutes to 24 hours.
- Inputs are known in advance (or can be queued).
- Partial-failure retry is acceptable.

Typical qualifying workloads: nightly enrichment, backfills, evaluation suites, embeddings, classification sweeps, summarisation of logs/tickets, synthetic data generation, content pre-generation.

## 2. Expected economics

| Lever | Typical discount |
|---|---|
| Batch/async tier | ~50% |
| Batch + cached prefix | 50% plus prefix discount on the cached portion |
| Batch + smaller model for the same task | Multiplicative — often 8–15× total |
| Off-peak scheduling on self-hosted capacity | Utilisation-dependent |

Batch stacks with routing and caching; treat it as a multiplier, not an alternative.

## 3. Implementation pattern

1. **Queue, don't call.** Application code enqueues a job with a deadline, never calls the model directly.
2. **Shard.** Split large jobs into chunks of a few thousand requests; one oversized submission that fails costs a full re-run.
3. **Idempotency keys.** Every request carries a stable id so partial results merge cleanly.
4. **Deadline fallback.** If the window expires, fall back to the interactive tier for the remainder and alert.
5. **Result store.** Persist raw responses before post-processing so a parser bug never forces regeneration.

## 4. Hidden traps

- **Silent truncation** on oversized batch files — validate line counts and byte sizes before submit.
- **Model version drift** between submit and completion; pin the exact model id.
- **Rate-limit interaction:** batch queues often share quota with interactive traffic; reserve headroom.
- **Cache TTL expiry** mid-batch — order the batch so cached-prefix jobs run close together.
- **Cost attribution loss:** batch responses often lack per-request tags unless you embed them in the custom id field.

## 5. Async-but-not-batch patterns

- **Pre-generation:** compute likely answers ahead of demand (daily digests, onboarding content) and serve from a store.
- **Deferred enrichment:** return a fast, cheap answer now; upgrade it in the background and notify.
- **Speculative pre-warm:** for predictable flows, warm caches rather than pre-generating full outputs.

## 6. Governance

Set a program target such as "≥30% of monthly token volume runs on a discounted tier" and report it monthly alongside cache hit rate and small-model share. These three ratios explain most of the variance between a Level 2 and a Level 4 TokenOps program.
