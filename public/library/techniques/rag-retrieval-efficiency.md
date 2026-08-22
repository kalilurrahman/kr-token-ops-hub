# RAG & Retrieval Efficiency

Retrieval is where teams quietly buy tokens they never read. Most RAG stacks can cut input tokens 40–60% while holding or improving answer quality.

## 1. Chunking that pays

| Decision | Cheap default | When to deviate |
|---|---|---|
| Chunk size | 400–800 tokens | Larger for narrative docs, smaller for tables/specs |
| Overlap | 10–15% | Raise only if answers straddle boundaries |
| Boundaries | Semantic (headings, sections) | Fixed-size only as a fallback |
| Metadata | Title + section path in each chunk | Always — it improves recall per token |

Oversized overlap is the most common invisible cost: 50% overlap doubles the index and re-sends duplicate sentences into every prompt.

## 2. Retrieve wide, send narrow

The winning pattern in 2026:

1. Vector search top-30 (cheap, local).
2. Cross-encoder rerank to top-4.
3. Sentence-level prune inside the survivors.
4. Send 4 dense chunks instead of 10 loose ones.

Reranking costs milliseconds and cents; it routinely removes 50%+ of injected tokens with a recall gain, not a loss.

## 3. Embedding cost tuning

- **Matryoshka truncation:** many 2026 embedding models tolerate truncation to 512 or 256 dimensions with 1–2% recall loss and a 4–6× storage/query saving.
- **Batch embeddings** through the batch tier for backfills — typically 50% off.
- **Deduplicate before embedding.** Near-duplicate documents inflate both index cost and retrieval noise.
- **Cache embeddings by content hash**; re-embedding unchanged documents is pure waste.

## 4. Query-side savings

- Skip retrieval entirely for queries a router classifies as chit-chat or state lookup — commonly 15–30% of traffic.
- Cache retrieval results per normalised query; retrieval hit rates are usually far higher than generation hit rates.
- Avoid multi-query expansion by default; enable it only for low-recall query classes.

## 5. Grounding without bloat

- Send **extracts**, not whole documents; cite by id and let the UI fetch the full text.
- Compress tables to key-value or CSV before injection.
- Strip navigation, legal footers, and repeated headers at ingest, not at prompt time.

## 6. Metrics that matter

| Metric | Target band |
|---|---|
| Injected tokens per answer | Trending down quarter over quarter |
| Recall@k after rerank | ≥ pre-rerank recall@10 |
| Retrieval cache hit rate | 25–60% for FAQ-heavy traffic |
| Answer groundedness (sampled judge) | Stable while tokens fall |
| Cost per answered question | The headline number |

## 7. Anti-patterns

- Increasing `k` to fix a quality bug that is actually a chunking bug.
- Embedding and storing full documents *and* chunks with no dedupe.
- Reranking after truncation instead of before it.
- Measuring retrieval quality only offline, never on production traffic.
