# Playbook: RAG Pipeline Cost Optimization

**Duration:** 6 weeks | **Team:** 1 platform engineer, 1 ML engineer  
**Expected Outcome:** 40–70% reduction in RAG pipeline token costs

---

## RAG Cost Anatomy

Every RAG query incurs costs across four layers:

```
User Query ──► [1. Embedding] ──► [2. Retrieval] ──► [3. Context Packing] ──► [4. Generation]
                 $0.001/query      $0.0001/query       (design choice)         $0.01–0.10/query
```

### Cost Breakdown (Typical Unoptimized RAG)

| Layer | Component | Monthly Volume | Unit Cost | Monthly Cost | % of Total |
|-------|-----------|---------------|-----------|-------------|------------|
| Embedding | Query embedding | 500K queries | $0.02/1M tokens | $50 | 1% |
| Embedding | Document embedding (one-time amortized) | 10M chunks | $0.02/1M tokens | $100/mo | 2% |
| Retrieval | Vector DB queries | 500K queries | $0.0001/query | $50 | 1% |
| Generation | Input tokens (system + context + query) | 500K × 4,200 avg | $5/1M tokens | $10,500 | 72% |
| Generation | Output tokens | 500K × 500 avg | $15/1M tokens | $3,750 | 26% |
| **Total** | | | | **$14,450** | **100%** |

**Key insight:** Generation input tokens (context) drive 72% of total cost. Optimizing retrieval quality (fewer, better chunks) has the highest cost impact.

---

## Phase 1: Baseline Audit (Week 1)

### Step 1: Instrument the RAG Pipeline

Tag every query with:
```yaml
metadata:
  service: rag-pipeline
  query_id: uuid
  retrieval_top_k: 10
  chunks_retrieved: 10
  chunks_used_by_model: 3  # estimate via attribution
  total_input_tokens: 4200
  context_tokens: 3200
  query_tokens: 200
  system_prompt_tokens: 800
  output_tokens: 500
```

### Step 2: Calculate Context Utilization Ratio

```
Context Utilization = (Chunks Actually Used by Model) / (Chunks Retrieved)
```

**Target:** ≥ 60%. Most unoptimized RAG pipelines score 20–30% (retrieving 10 chunks, model uses 2–3).

### Step 3: Identify Cost Hotspots

```sql
SELECT
  AVG(context_tokens) AS avg_context_tokens,
  AVG(chunks_retrieved) AS avg_chunks,
  AVG(output_tokens) AS avg_output,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY context_tokens) AS p95_context,
  SUM(cost_usd) AS monthly_cost
FROM rag_query_logs
WHERE date >= CURRENT_DATE - 30;
```

---

## Phase 2: Retrieval Optimization (Weeks 2–3)

### Strategy 1: Reduce top-k (10 → 3–5)

Most RAG pipelines default to `top_k=10`. Testing shows diminishing returns beyond 3–5 chunks.

| top_k | Avg Context Tokens | Answer Quality (F1) | Monthly Context Cost |
|-------|--------------------|--------------------|--------------------|
| 10 | 3,200 | 0.89 | $10,500 |
| 7 | 2,240 | 0.88 | $7,350 |
| 5 | 1,600 | 0.87 | $5,250 |
| 3 | 960 | 0.85 | $3,150 |

**Recommendation:** Start with `top_k=5` and validate quality. Drop to 3 if quality holds.

### Strategy 2: Relevance Threshold Filtering

Don't include low-relevance chunks even if they're in the top-k:

```python
def filter_by_relevance(chunks, threshold=0.78):
    """Only include chunks above similarity threshold."""
    return [c for c in chunks if c.score >= threshold]

# Before: Always send top-k chunks regardless of relevance
# After: Only send chunks that actually match the query
```

**Impact:** Removes 20–40% of irrelevant context.

### Strategy 3: Chunk Size Optimization

| Chunk Size | Pros | Cons | Best For |
|------------|------|------|----------|
| 128 tokens | Precise retrieval | May split context | FAQ, definitions |
| 256 tokens | Good balance | Standard choice | General knowledge |
| 512 tokens | Rich context | May include noise | Technical docs |
| 1024 tokens | Full paragraphs | Expensive, noisy | Legal, academic |

**Test different sizes** on your specific corpus. Smaller chunks = more precise retrieval but may need more chunks to cover context.

### Strategy 4: Hybrid Search (Sparse + Dense)

```python
def hybrid_search(query, alpha=0.7):
    """Combine dense (semantic) + sparse (keyword) search."""
    dense_results = vector_db.search(embed(query), top_k=10)
    sparse_results = bm25_index.search(query, top_k=10)
    
    # Reciprocal rank fusion
    combined = reciprocal_rank_fusion(
        dense_results, sparse_results, alpha=alpha
    )
    return combined[:5]  # Return top 5 after fusion
```

**Why:** Hybrid search improves retrieval precision by 10–20%, meaning fewer chunks needed for the same quality.

---

## Phase 3: Context Packing Optimization (Week 3–4)

### Strategy 1: Deduplicate Retrieved Chunks

```python
def deduplicate_chunks(chunks, similarity_threshold=0.90):
    """Remove near-duplicate chunks."""
    unique = [chunks[0]]
    for chunk in chunks[1:]:
        is_duplicate = any(
            cosine_similarity(chunk.embedding, u.embedding) > similarity_threshold
            for u in unique
        )
        if not is_duplicate:
            unique.append(chunk)
    return unique
```

### Strategy 2: Compress Context Before Injection

```python
CONTEXT_TEMPLATE = """Relevant information:
{compressed_context}

---
Question: {query}
Answer based only on the above information."""

def compress_context(chunks):
    """Merge and compress retrieved chunks."""
    # Remove headers, footers, metadata from each chunk
    cleaned = [strip_metadata(c.text) for c in chunks]
    # Join with minimal separators
    return "\n---\n".join(cleaned)
```

### Strategy 3: Query-Aware Context Pruning

Use a cheap model to select which retrieved chunks are actually relevant:

```python
async def prune_context(query, chunks, pruning_model="gpt-4.1-nano"):
    """Use cheap model to filter chunks by relevance to query."""
    prompt = f"""Given this question: "{query}"

Rate each chunk's relevance (1-5):
{format_chunks(chunks)}

Return JSON: [{{"chunk_id": 0, "relevance": 5}}, ...]"""
    
    ratings = await call_model(pruning_model, prompt)
    return [c for c, r in zip(chunks, ratings) if r["relevance"] >= 3]
```

**Cost of pruning:** ~$0.0002/query with nano model  
**Savings from pruning:** ~$0.005/query from removing 30% of context  
**Net savings:** $0.0048/query (24× return on pruning investment)

---

## Phase 4: Generation Optimization (Weeks 4–5)

### Strategy 1: Model Tiering for RAG

| Query Complexity | Detection Signal | Model | Cost/Query |
|-----------------|-----------------|-------|-----------|
| Simple lookup | Short query, high-confidence top chunk (>0.92) | GPT-4.1-nano | $0.001 |
| Standard Q&A | Medium query, good retrieval (>0.82) | GPT-4.1-mini | $0.008 |
| Complex reasoning | Long query, low retrieval confidence (<0.82) | GPT-4.1 | $0.050 |

### Strategy 2: Output Constraints

```python
# Before: Open-ended generation
messages = [{"role": "user", "content": f"Answer: {query}\nContext: {context}"}]

# After: Constrained output
messages = [{
    "role": "system", 
    "content": "Answer in 2-3 sentences. Cite source. JSON: {answer, source, confidence}"
}, {
    "role": "user", 
    "content": f"Context: {context}\nQuestion: {query}"
}]
response = client.chat.completions.create(
    messages=messages, max_tokens=200, response_format={"type": "json_object"}
)
```

### Strategy 3: Caching RAG Responses

```python
class RAGCache:
    def get(self, query):
        # Exact match on normalized query
        key = normalize(query)
        cached = redis.get(f"rag:{hash(key)}")
        if cached:
            return cached
        
        # Semantic match
        embedding = embed(query)
        match = vector_cache.search(embedding, threshold=0.95)
        if match:
            return match.response
        
        return None  # Cache miss
```

---

## Phase 5: Embedding Optimization (Week 5–6)

### Cost Reduction Strategies

| Strategy | Savings | Implementation |
|----------|---------|---------------|
| Use smaller embedding model (large → small) | 60–80% | Change model parameter |
| Cache query embeddings | 30–50% | Redis with hash key |
| Batch document embeddings | 0% direct, faster | Process in batches of 100+ |
| Reduce dimensions (1536 → 512) | 0% direct, lower storage | Use Matryoshka embeddings |
| Deduplicate before embedding | 10–30% | Hash-based dedup |

---

## Results Template

### Before vs. After Comparison

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Monthly RAG cost | $14,450 | $_____ | −__% |
| Avg input tokens/query | 4,200 | _____ | −__% |
| Chunks retrieved (top_k) | 10 | _____ | −__% |
| Context utilization ratio | 25% | _____ | +__pp |
| Cache hit rate | 0% | _____ | +__% |
| Answer quality (F1) | 0.89 | _____ | ±__% |
| P95 latency | 3.2s | _____ | ±__% |

---

## Monitoring Checklist

- [ ] Context utilization ratio tracked per query
- [ ] Retrieval relevance scores logged
- [ ] Cache hit rate dashboard operational
- [ ] Cost per RAG query tracked by complexity tier
- [ ] Answer quality evaluated weekly (sample of 100 queries)
- [ ] Alert on context utilization dropping below 40%
- [ ] Alert on average input tokens increasing >20% from baseline

---

*Template from the TokenOps Atlas — [tokenops-atlas](https://github.com/kalilurrahman/tokenops-atlas)*
