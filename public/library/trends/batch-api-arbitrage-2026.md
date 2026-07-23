# Batch API Arbitrage: The 50% Discount You're Not Using

*Every major provider offers a batch tier at ~50% off. Most teams never touch it because their pipelines are built async-by-default. That's a mistake worth thousands per month.*

## The discounts

| Provider | Discount vs real-time | SLA | Max window |
|---|---|---|---|
| **OpenAI Batch API** | 50% | 24 hours | 24h |
| **Anthropic Message Batches** | 50% | 24 hours | 24h |
| **Gemini Batch Predictions** | 50% | 24 hours | 24h |
| **DeepSeek off-peak** | 50–75% | ~4 hours | Off-peak window |
| **Bedrock Batch** | 50% | 24 hours | 24h |

## What belongs in batch

- Nightly analytics summarization
- Bulk translation / localization
- Content moderation of yesterday's uploads
- Backfill embeddings for historical data
- Weekly report generation
- Fine-tune data augmentation
- Test-set eval runs
- Marketing content pre-generation
- SEO metadata generation
- Log classification for anomaly detection

**Rule:** if the output does not need to be visible to a user within 5 minutes, it belongs in batch.

## The hidden traps

1. **Rate-limit budgets are separate.** Batch has its own token/request quota — usually higher than real-time. Check both.
2. **Batch results are files, not streams.** Downstream systems must handle JSONL retrieval, not webhook events.
3. **Errors are per-row, not per-batch.** A 10,000-row batch with 12 failures still succeeds. You must parse row-level status.
4. **No caching benefit.** Prompt caching does not apply to batch on OpenAI. Model the trade-off vs a cached real-time path.

## The migration pattern

- Day 1: Log all real-time calls with an "is_urgent" boolean.
- Week 1: Audit — what fraction is genuinely urgent?
- Week 2: Build a batch queue for non-urgent calls with 24h SLA.
- Week 3: Cut over one workload, measure cost delta and error rate.
- Week 4: Expand.

Typical result: **20–35% of total token spend** moves to batch, yielding **10–17% overall cost reduction** with no user-visible change.

## The scheduling detail nobody documents

OpenAI and Anthropic batch queues prioritise smaller batches. A 1M-row batch may sit for 20+ hours. A 50K-row batch typically completes in 2–4 hours. If latency matters, **shard**: submit 10 batches of 100K instead of one batch of 1M. Same discount, ~5× faster turnaround.

## Batch + fine-tuned SLM = the cheapest tier

Combining batch API (50% off) with an SLM ($0.05/M) produces per-token costs ~2000× cheaper than frontier real-time. For high-volume, low-urgency, well-scoped tasks (log tagging, bulk classification, embedding backfills), this is the correct default in 2026.
