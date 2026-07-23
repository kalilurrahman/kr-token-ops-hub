# Embedding & Vector DB Cost Tuning (2026)

*The RAG bill is 80% context tokens, 15% vector DB, 5% embeddings — and the 5% is where most teams over-optimize while ignoring the 80%.*

## The 2026 embedding-price snapshot

| Model | $ / M tokens | Dim | Notes |
|---|---|---|---|
| **text-embedding-3-small** | $0.02 | 1536 | OpenAI default; Matryoshka-truncatable to 512 |
| **text-embedding-3-large** | $0.13 | 3072 | Truncate to 1024 for 95% recall at 33% cost |
| **Cohere Embed v4** | $0.10 | 1024 | Best multilingual |
| **Voyage-3** | $0.06 | 1024 | Strongest domain-specific fine-tunes |
| **Gemini Embed Text-004** | $0.025 | 768 | Cheapest hosted frontier |
| **BGE-M3 (self-hosted)** | ~$0.001 | 1024 | Best OSS; batch on a T4 for pennies |

## Dimension truncation is free money

Matryoshka-trained embeddings (OpenAI v3, Nomic, BGE-M3) can be truncated at inference:

| Full dim | Truncated | Recall retention | Vector DB cost |
|---|---|---|---|
| 3072 | 3072 | 100% | 1× |
| 3072 | 1024 | ~98% | 0.33× |
| 3072 | 512 | ~95% | 0.17× |
| 3072 | 256 | ~88% | 0.08× |

**Action:** benchmark your top-K recall at 1024 dims before defaulting to 3072.

## Vector DB cost patterns

| Store | Cost driver | Break-even scale |
|---|---|---|
| **Pinecone Serverless** | Reads + writes + stored vectors | <10M vectors, bursty |
| **Pinecone Pod** | Fixed $/hour | >10M vectors, steady |
| **Weaviate Cloud** | Node hours | >50M vectors |
| **Qdrant Cloud** | Node hours + storage | Any scale; best price/perf |
| **pgvector (Supabase / RDS)** | Existing Postgres | <5M vectors |
| **Turbopuffer / LanceDB** | Object-storage-backed | Cold data; occasional queries |

**2026 shift:** object-storage-backed vector DBs are 10–100× cheaper for cold/archival vectors. Hot vs cold vector routing is now a real architecture pattern.

## The chunking cost lever

| Strategy | Chunks / doc | Retrieval tokens / query | Recall |
|---|---|---|---|
| Fixed 200 tokens | 50 | Low | 65% |
| Fixed 500 tokens | 20 | Medium | 78% |
| Fixed 1000 tokens | 10 | High | 82% |
| Semantic (recursive) | 15 | Medium | 85% |
| Late chunking (2024+) | 15 | Medium | **90%+** |

Late chunking is the 2026 quality/cost frontier. Supported natively by Jina v3, Voyage-3-lite, and Nomic Embed v2.

## Reranking: the underused lever

Retrieve 50 candidates cheap → rerank to top 5 with a cross-encoder → send only 5 chunks to the LLM.

- Reranker cost: Cohere Rerank v3 = $2 / 1K searches, ~50ms.
- Context savings: 90% fewer input tokens to the expensive generation step.

A production RAG pipeline without a reranker in 2026 is leaving 30–60% of cost on the table.

## The chunk-cache pattern

Cache retrieved chunks keyed by `(query_embedding_hash, top_k)`. On repeat queries (very common in support/FAQ), skip both retrieval and reranking. Reported hit rates: 20–45%.

## What NOT to spend engineering time on

- Swapping small → large embeddings without dimension truncation math.
- Migrating from pgvector to Pinecone before hitting 5M vectors.
- Re-embedding an entire corpus for a 2-point MTEB improvement.
