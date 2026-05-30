# Optimization Patterns — Detailed Implementation Guide

> **Purpose:** Ten battle-tested patterns for reducing LLM token costs without sacrificing quality. Each pattern includes the problem statement, solution, implementation steps, code examples, expected savings, quality risks, and monitoring guidance.

---

## Pattern 1 · Prompt Compression

### Problem

Prompts grow organically — extra instructions, verbose examples, duplicated context — and each unnecessary token costs money at scale. A prompt that is 30% longer than it needs to be costs 30% more on input tokens across every invocation.

### Solution

Systematically compress prompts by removing redundancy, tightening language, replacing verbose examples with concise ones, and using shorthand conventions the model already understands.

### Implementation Steps

1. **Audit current prompts:** Count tokens and identify the top 5 costliest prompts by monthly input token volume.
2. **Identify compression targets:**
   - Redundant instructions (repeated in system + user message)
   - Verbose examples (full paragraphs where a single line suffices)
   - Unnecessary formatting instructions (the model often infers format from examples)
   - Boilerplate preambles ("You are an AI assistant that...")
3. **Apply compression techniques:**
   - Replace natural language instructions with structured format (YAML/JSON)
   - Use few-shot examples instead of lengthy instructions
   - Use abbreviations and symbols the model understands
   - Remove "don't" instructions (models follow positive instructions better)
4. **Validate quality:** Run compressed prompt against the same test suite as the original.
5. **Deploy with A/B test:** Run compressed version on 10% traffic; compare quality + cost.

### Code Example

```python
# BEFORE: 487 tokens
SYSTEM_PROMPT_BEFORE = """
You are an expert customer support agent for TechCorp. Your job is to
classify incoming support tickets into the correct category. You must
read the ticket carefully and determine which of the following categories
it belongs to: Billing, Technical, Account, Feature Request, Bug Report,
or General Inquiry.

Please provide your classification in JSON format with the following
fields: category (the category name), confidence (a number between 0
and 1 indicating how confident you are), and reasoning (a brief
explanation of why you chose this category).

Here is an example of the expected output format:
{
  "category": "Billing",
  "confidence": 0.95,
  "reasoning": "The customer mentions charges and invoice, indicating
    a billing-related issue."
}

Important rules:
- Always respond in valid JSON
- Do not include any text outside the JSON
- If you are unsure, choose the most likely category and set confidence
  below 0.5
- Do not ask the customer for more information
"""

# AFTER: 142 tokens (71% reduction)
SYSTEM_PROMPT_AFTER = """Classify support tickets.

Categories: Billing | Technical | Account | Feature Request | Bug Report | General Inquiry

Output JSON:
{"category": "...", "confidence": 0.0-1.0, "reasoning": "..."}

Example: {"category": "Billing", "confidence": 0.95, "reasoning": "Mentions charges/invoice"}

Rules: JSON only. Best guess if unsure (confidence<0.5). No follow-up questions."""
```

### Expected Savings

| Scenario                                     | Before  | After   | Savings       |
| -------------------------------------------- | ------- | ------- | ------------- |
| Input tokens per call                        | 487     | 142     | -71%          |
| Monthly calls                                | 180,000 | 180,000 | —             |
| Monthly input cost (GPT-4.1-mini @ $0.40/1M) | $35.06  | $10.22  | $24.84/mo     |
| Annual savings                               | —       | —       | **$298/year** |

### Quality Risk

**Low.** Well-compressed prompts typically maintain or improve quality because they reduce ambiguity. Risk increases if compression removes critical constraints or examples.

### Monitoring

- Track `avg_input_tokens` per prompt version (should drop by 20–70%)
- Track `test_pass_rate` (should not drop by more than 1%)
- Monitor `avg_output_tokens` — if they increase, the model may be "filling in" missing context

---

## Pattern 2 · Context Window Management (Sliding Window + Summarization)

### Problem

Multi-turn conversations append every message to the context, causing input tokens to grow linearly with conversation length. A 20-turn conversation can consume 10,000+ input tokens per turn, with most of that being redundant history.

### Solution

Use a sliding window of recent messages plus a compressed summary of older messages. This caps input token growth while preserving essential context.

### Implementation Steps

1. **Define the window:** Keep the last N messages (e.g., 6–10 turns) in full.
2. **Summarize the rest:** When messages exceed the window, summarize the oldest messages into a compact "conversation summary" block.
3. **Use a cheap model for summarization:** The summary itself can be generated by an economy model (e.g., GPT-4.1-nano).
4. **Inject the summary as a system message:** Place it before the recent messages.
5. **Set a hard cap:** If even the summary + window exceeds a threshold, truncate the summary.

### Code Example

```python
class ContextWindowManager:
    def __init__(
        self,
        max_context_tokens: int = 4000,
        recent_window: int = 8,        # Keep last 8 messages
        summary_model: str = "gpt-4.1-nano",
        primary_model: str = "gpt-4.1-mini"
    ):
        self.max_context_tokens = max_context_tokens
        self.recent_window = recent_window
        self.summary_model = summary_model
        self.primary_model = primary_model
        self.conversation_summary = ""

    def prepare_messages(
        self,
        full_history: list[dict],
        system_prompt: str
    ) -> list[dict]:
        """Prepare messages with sliding window + summary."""

        # Always include system prompt + recent window
        recent = full_history[-self.recent_window:]

        if len(full_history) > self.recent_window:
            # Summarize older messages
            older = full_history[:-self.recent_window]
            self.conversation_summary = self.summarize(older)

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "system", "content":
                    f"[Conversation summary: {self.conversation_summary}]"},
                *recent
            ]
        else:
            messages = [
                {"role": "system", "content": system_prompt},
                *recent
            ]

        # Safety check: truncate if still too long
        while (count_tokens(messages, self.primary_model)
               > self.max_context_tokens
               and len(messages) > 2):
            messages.pop(1)  # Remove oldest non-system message

        return messages

    def summarize(self, messages: list[dict]) -> str:
        """Summarize older conversation using a cheap model."""
        summary_prompt = (
            "Summarize this conversation in 2-3 sentences, "
            "preserving key facts, decisions, and user preferences:\n\n"
            + "\n".join(
                f"{m['role']}: {m['content']}" for m in messages
            )
        )
        response = llm_call(
            model=self.summary_model,
            messages=[{"role": "user", "content": summary_prompt}],
            max_tokens=150
        )
        return response.content
```

### Expected Savings

| Conversation Length | Without Management | With Management | Savings |
| ------------------- | ------------------ | --------------- | ------- |
| 5 turns             | 2,500 tokens       | 2,500 tokens    | 0%      |
| 10 turns            | 5,000 tokens       | 3,200 tokens    | 36%     |
| 20 turns            | 10,000 tokens      | 3,800 tokens    | 62%     |
| 50 turns            | 25,000 tokens      | 4,200 tokens    | 83%     |

### Quality Risk

**Medium.** Summarization loses nuance. Mitigate by preserving the last 8–10 messages in full and ensuring the summary retains key facts. Run quality tests on long conversations specifically.

### Monitoring

- Track `avg_input_tokens` by conversation length bucket
- Track summary quality (spot-check summaries weekly)
- Track quality metrics for conversations > 10 turns vs. shorter ones

---

## Pattern 3 · Model Tiering & Routing

### Problem

Teams default to the most capable (and expensive) model for all tasks, even when 80% of requests are simple enough for a model that costs 5–20× less.

### Solution

Classify each request by task type and complexity, then route to the cheapest model that meets the quality threshold for that class.

### Implementation Steps

1. **Categorize your workloads:** Map every LLM call to a task type (classification, extraction, summarization, reasoning, code generation, creative writing).
2. **Evaluate models per task:** Run your test suite against 3–5 models; record quality and cost.
3. **Define quality thresholds:** Set minimum acceptable quality per task type.
4. **Configure routing rules:** Use the `multi-provider-routing-config.yaml` to define routing.
5. **Monitor and adjust:** Track quality by model+task monthly; adjust routing as models improve.

### Code Example

```python
# Simplified model tiering router
MODEL_TIERS = {
    "economy":  ["gpt-4.1-nano", "gemini-2.5-flash", "llama-4-scout"],
    "balanced": ["gpt-4.1-mini", "llama-4-maverick", "claude-haiku-3.5"],
    "frontier": ["gpt-4.1", "claude-sonnet-4", "gemini-2.5-pro"],
}

TASK_TO_TIER = {
    "classification": "economy",
    "extraction":     "balanced",
    "summarization":  "balanced",
    "reasoning":      "frontier",
    "code_generation": "frontier",
    "creative_writing": "frontier",
}

def select_model(task_type: str, complexity: str) -> str:
    tier = TASK_TO_TIER.get(task_type, "balanced")

    # Override for high complexity regardless of task
    if complexity == "complex" and tier == "economy":
        tier = "balanced"

    candidates = MODEL_TIERS[tier]

    # Select first available candidate (respecting circuit breakers)
    for model in candidates:
        if circuit_breaker.is_closed(model):
            return model

    # Fallback: try next tier up
    if tier == "economy":
        return select_model(task_type, "balanced")
    elif tier == "balanced":
        return MODEL_TIERS["frontier"][0]

    raise NoModelAvailableError()
```

### Expected Savings

| Before (100% GPT-4.1)                 | After (tiered routing) | Savings              |
| ------------------------------------- | ---------------------- | -------------------- | ---------------- |
| Classification: 40% volume × $2.00/1M | 40% × $0.10/1M         | -95% on this segment |
| Extraction: 25% volume × $2.00/1M     | 25% × $0.40/1M         | -80% on this segment |
| Reasoning: 15% volume × $2.00/1M      | 15% × $2.00/1M         | 0% (still frontier)  |
| **Blended rate**                      | **$2.00/1M**           | **~$0.58/1M**        | **-71% overall** |

### Quality Risk

**Low to Medium.** The key is setting quality thresholds per task type and validating with your specific data. Simple tasks routed to economy models typically maintain quality.

### Monitoring

- Track quality scores by model + task type (weekly)
- Track `model_distribution` (% traffic per model) to ensure routing works as expected
- Alert on quality drops > 2% for any task type

---

## Pattern 4 · Semantic Caching

### Problem

Many LLM requests are identical or near-identical (e.g., same customer question asked by different users, repeated extraction on similar documents). Each duplicate request costs full price.

### Solution

Cache LLM responses keyed by input similarity. Serve cached responses for matching requests without calling the provider.

### Implementation Steps

1. **Identify cacheable requests:** Requests with `temperature=0` and deterministic outputs are ideal. Avoid caching creative or personalized responses.
2. **Implement exact match cache:** Hash the input messages + model + parameters; store response in Redis.
3. **Implement semantic cache:** Embed the user message; find nearest neighbors in a vector store. If similarity > 0.95, serve the cached response.
4. **Set TTL based on content volatility:** Static knowledge → long TTL (24h+); dynamic data → short TTL (1h).
5. **Invalidate on prompt version change:** When the prompt changes, all cached responses for that prompt are stale.

### Code Example

```python
import hashlib
import numpy as np

class SemanticCache:
    def __init__(self, redis, vector_store, embedder, ttl_hours=24):
        self.redis = redis
        self.vector_store = vector_store
        self.embedder = embedder
        self.ttl = ttl_hours * 3600
        self.similarity_threshold = 0.95

    def cache_key(self, messages, model, params) -> str:
        """Deterministic hash for exact match."""
        content = f"{model}:{params}:{json.dumps(messages, sort_keys=True)}"
        return hashlib.sha256(content.encode()).hexdigest()

    def get(self, messages, model, params) -> Optional[str]:
        # Try exact match first (fast, O(1))
        key = self.cache_key(messages, model, params)
        exact = self.redis.get(f"llm_cache:{key}")
        if exact:
            return json.loads(exact), "exact"

        # Try semantic match (slower, embedding + ANN search)
        user_msg = self._extract_user_content(messages)
        embedding = self.embedder.encode(user_msg)
        results = self.vector_store.query(
            vector=embedding,
            top_k=1,
            filter={"model": model}
        )

        if results and results[0].score >= self.similarity_threshold:
            return json.loads(results[0].metadata["response"]), "semantic"

        return None, "miss"

    def put(self, messages, model, params, response):
        key = self.cache_key(messages, model, params)

        # Store exact match
        self.redis.setex(
            f"llm_cache:{key}",
            self.ttl,
            json.dumps(response)
        )

        # Store semantic embedding
        user_msg = self._extract_user_content(messages)
        embedding = self.embedder.encode(user_msg)
        self.vector_store.upsert(
            id=key,
            vector=embedding,
            metadata={"model": model, "response": json.dumps(response)}
        )
```

### Expected Savings

| Workload Type            | Cache Hit Rate | Cost Reduction |
| ------------------------ | -------------- | -------------- |
| FAQ / Support chatbot    | 30–50%         | 30–50%         |
| Document classification  | 20–40%         | 20–40%         |
| Content moderation       | 40–60%         | 40–60%         |
| Code generation (unique) | 5–10%          | 5–10%          |
| Creative writing         | 2–5%           | 2–5%           |

### Quality Risk

**Low for deterministic tasks.** Semantic caching introduces risk of serving slightly mismatched responses. Mitigate with a high similarity threshold (≥ 0.95) and per-task TTLs.

### Monitoring

- Track `cache_hit_rate` by service and cache type (exact vs. semantic)
- Track `cache_miss_reason` (new query, TTL expired, below threshold)
- Spot-check semantic cache matches weekly for relevance
- Alert if hit rate drops > 20% from baseline (possible cache invalidation issue)

---

## Pattern 5 · Batch Processing Migration

### Problem

Real-time API calls are priced at full rate. Many workloads (document processing, classification pipelines, content generation queues) don't require real-time responses and could use cheaper batch APIs or off-peak pricing.

### Solution

Migrate non-real-time workloads to batch processing using provider batch APIs (e.g., OpenAI Batch API at 50% discount) or self-managed batching with rate optimization.

### Implementation Steps

1. **Identify batch-eligible workloads:** Any workload where the consumer doesn't need a response within seconds. Examples: nightly document processing, weekly report generation, bulk classification.
2. **Separate real-time from batch paths:** Route batch workloads to a queue instead of the gateway.
3. **Use provider batch APIs:** OpenAI Batch API offers 50% off; submit JSONL files, retrieve results later.
4. **Optimize batch scheduling:** Run batches during off-peak hours to avoid rate limit contention.
5. **Handle failures gracefully:** Implement dead-letter queues for failed batch items.

### Code Example

```python
import json

class BatchProcessor:
    def __init__(self, client, batch_size=1000, model="gpt-4.1-mini"):
        self.client = client
        self.batch_size = batch_size
        self.model = model

    def prepare_batch_file(self, requests: list[dict]) -> str:
        """Create JSONL batch file for OpenAI Batch API."""
        lines = []
        for i, req in enumerate(requests):
            line = {
                "custom_id": f"req-{i}",
                "method": "POST",
                "url": "/v1/chat/completions",
                "body": {
                    "model": self.model,
                    "messages": req["messages"],
                    "max_tokens": req.get("max_tokens", 500),
                    "temperature": req.get("temperature", 0),
                }
            }
            lines.append(json.dumps(line))

        filepath = f"batch_{datetime.now().isoformat()}.jsonl"
        with open(filepath, "w") as f:
            f.write("\n".join(lines))
        return filepath

    async def submit_batch(self, filepath: str) -> str:
        """Submit batch to OpenAI Batch API (50% discount)."""
        # Upload file
        file = self.client.files.create(
            file=open(filepath, "rb"),
            purpose="batch"
        )

        # Create batch
        batch = self.client.batches.create(
            input_file_id=file.id,
            endpoint="/v1/chat/completions",
            completion_window="24h",    # 24-hour window for 50% discount
            metadata={"service": "data_pipeline", "type": "bulk_classify"}
        )

        return batch.id

    async def poll_results(self, batch_id: str) -> list[dict]:
        """Poll for batch completion and retrieve results."""
        while True:
            batch = self.client.batches.retrieve(batch_id)
            if batch.status == "completed":
                output = self.client.files.content(batch.output_file_id)
                return [json.loads(line) for line in output.text.split("\n") if line]
            elif batch.status == "failed":
                raise BatchFailedError(batch.errors)
            await asyncio.sleep(60)     # Check every minute
```

### Expected Savings

| Approach                             | Pricing                             | Savings vs. Real-Time            |
| ------------------------------------ | ----------------------------------- | -------------------------------- |
| OpenAI Batch API (24h window)        | 50% of standard rate                | **50%**                          |
| Self-managed batching (optimize RPM) | Standard rate                       | 0% direct (but reduces overhead) |
| Off-peak scheduling + batch API      | 50% + reduced rate limit contention | **50%+**                         |

### Quality Risk

**None.** Batch processing uses the same models and produces identical outputs. The only trade-off is latency (hours instead of seconds).

### Monitoring

- Track `batch_completion_time` (should be within SLA)
- Track `batch_failure_rate` (should be < 1%)
- Track `batch_cost_vs_realtime` (validate the expected discount is realized)
- Alert if batch jobs don't complete within their window

---

## Pattern 6 · Output Format Constraints

### Problem

Models generate verbose outputs by default — long explanations, unnecessary preambles, excessive formatting. Output tokens are typically 2–8× more expensive than input tokens, so verbose outputs directly inflate costs.

### Solution

Constrain the output format to minimize token waste: use JSON mode, set `max_tokens`, require concise formats, and use structured output schemas.

### Implementation Steps

1. **Use JSON mode or structured outputs:** Force the model to respond in JSON rather than prose.
2. **Set tight `max_tokens`:** Calculate the expected output size and set `max_tokens` to 1.5× that.
3. **Use response schemas:** Provide a strict schema so the model doesn't invent extra fields.
4. **Strip preambles:** Instruct the model to output only the data, no explanations.
5. **Post-process:** Truncate or validate outputs programmatically.

### Code Example

```python
# BEFORE: Unconstrained output — avg 250 output tokens
response = client.chat.completions.create(
    model="gpt-4.1-mini",
    messages=[
        {"role": "system", "content": "Classify this ticket"},
        {"role": "user", "content": ticket_text}
    ]
)
# Output: "Based on my analysis of the ticket, I would classify this as
#          a Billing issue because the customer mentions charges on their
#          account and is asking about a refund. The confidence is high
#          because the language clearly relates to financial matters.
#          Category: Billing, Confidence: 0.95"

# AFTER: Constrained output — avg 35 output tokens
response = client.chat.completions.create(
    model="gpt-4.1-mini",
    messages=[
        {"role": "system", "content":
            'Classify ticket. Output JSON only: '
            '{"category":"...","confidence":0.0,"reasoning":"..."}'
        },
        {"role": "user", "content": ticket_text}
    ],
    response_format={"type": "json_object"},
    max_tokens=100,    # Hard cap — typical response is ~35 tokens
)
# Output: {"category": "Billing", "confidence": 0.95,
#           "reasoning": "Mentions charges and refund"}
```

### Expected Savings

| Metric                                 | Before    | After     | Change         |
| -------------------------------------- | --------- | --------- | -------------- |
| Avg output tokens                      | 250       | 35        | -86%           |
| Output cost per request (GPT-4.1-mini) | $0.000400 | $0.000056 | -86%           |
| Monthly output cost (180K calls)       | $72.00    | $10.08    | **-$61.92/mo** |

### Quality Risk

**Low.** Structured output typically improves downstream reliability. Risk: overly tight `max_tokens` may truncate legitimate responses. Set `max_tokens` to at least 1.5× the expected output size.

### Monitoring

- Track `avg_output_tokens` per prompt (should drop significantly)
- Track `truncation_rate` (responses hitting `max_tokens` limit)
- If truncation rate > 5%, increase `max_tokens`

---

## Pattern 7 · Retry Reduction & Error Handling

### Problem

Naive retry logic retries every error with the same request, same model, same parameters. Retries on rate limits (429) waste tokens when they succeed, and retries on content errors (400) never succeed but still cost money.

### Solution

Implement smart retry logic that differentiates error types, uses exponential backoff, avoids retrying non-retryable errors, and falls back to alternative models when appropriate.

### Implementation Steps

1. **Classify errors:** Separate transient (429, 500, 503) from permanent (400, 401, 404).
2. **Never retry permanent errors:** 400 (bad request), 401 (auth), 404 (model not found) — fix the root cause.
3. **Exponential backoff for transient errors:** Start at 500ms, double each retry, cap at 30s.
4. **Fallback on repeated transient errors:** After 2 retries, switch to a different provider/model.
5. **Set a cost ceiling per request:** Max spend per request = base_cost × 3 (accounting for retries).
6. **Log all retries:** Track retry rate and cost for each service.

### Code Example

```python
class SmartRetryHandler:
    NON_RETRYABLE = {400, 401, 403, 404, 422}
    RETRYABLE = {429, 500, 502, 503, 529}

    def __init__(self, max_retries=3, base_delay_ms=500, max_delay_ms=30000):
        self.max_retries = max_retries
        self.base_delay_ms = base_delay_ms
        self.max_delay_ms = max_delay_ms

    async def call_with_retry(
        self,
        provider_adapter,
        request,
        fallback_models: list[str]
    ):
        last_error = None
        total_cost = 0

        for attempt in range(self.max_retries + 1):
            try:
                response = await provider_adapter.call(request)
                # Log successful attempt cost
                metrics.track_retry_cost(request, total_cost, attempt)
                return response

            except LLMError as e:
                last_error = e

                # Never retry non-retryable errors
                if e.status_code in self.NON_RETRYABLE:
                    metrics.track_non_retryable_error(request, e)
                    raise

                # Estimate wasted cost from this attempt
                total_cost += estimate_cost(request)

                # After 2 failed retries, try fallback model
                if attempt >= 2 and fallback_models:
                    fallback = fallback_models.pop(0)
                    request.model = fallback
                    metrics.track_fallback(request, fallback, e)
                    continue

                # Exponential backoff
                delay = min(
                    self.base_delay_ms * (2 ** attempt),
                    self.max_delay_ms
                )
                # Add jitter (±25%)
                delay *= 0.75 + random.random() * 0.5
                await asyncio.sleep(delay / 1000)

        raise MaxRetriesExceededError(last_error, total_cost)
```

### Expected Savings

| Metric                              | Before  | After  | Change |
| ----------------------------------- | ------- | ------ | ------ |
| Wasted cost on non-retryable errors | $45/mo  | $0/mo  | -100%  |
| Retries per 1000 requests           | 80      | 25     | -69%   |
| Cost of retries                     | $120/mo | $37/mo | -69%   |
| P99 latency (retry-induced)         | 12s     | 4s     | -67%   |

### Quality Risk

**None.** Better error handling improves reliability and user experience.

### Monitoring

- Track `retry_rate` by service and provider
- Track `retry_cost` (tokens spent on retries)
- Track `non_retryable_error_rate` (should not have retries)
- Track `fallback_rate` (how often fallback models are used)
- Alert if retry rate > 5% sustained for 30 minutes

---

## Pattern 8 · Embedding Optimization

### Problem

Embedding calls (for RAG, search, classification) can be a hidden cost center. Generating embeddings for every document chunk, every query, and every cache lookup adds up — especially when using high-dimensional models on large corpora.

### Solution

Optimize embedding costs through dimensionality reduction, aggressive caching, batch generation, and model right-sizing.

### Implementation Steps

1. **Cache embeddings aggressively:** Once generated, store embeddings in your vector store. Never re-generate for the same content.
2. **Use the right model:** Use smaller embedding models for simple similarity tasks. Models like `text-embedding-3-small` cost 5× less than `text-embedding-3-large`.
3. **Reduce dimensions:** Use Matryoshka embeddings or PCA to reduce from 3072 to 512 dimensions with minimal quality loss.
4. **Batch embedding calls:** Generate embeddings in batches of 100–2000 instead of one at a time.
5. **Content-hash deduplication:** Hash document chunks before embedding; skip chunks that already have embeddings.

### Code Example

```python
class EmbeddingOptimizer:
    def __init__(self, client, cache, model="text-embedding-3-small"):
        self.client = client
        self.cache = cache       # Redis or persistent store
        self.model = model
        self.dimensions = 512    # Reduced from 1536 default

    def get_embeddings(
        self, texts: list[str], batch_size: int = 100
    ) -> list[list[float]]:
        results = [None] * len(texts)
        to_embed = []
        to_embed_indices = []

        # 1. Check cache first
        for i, text in enumerate(texts):
            content_hash = hashlib.sha256(text.encode()).hexdigest()
            cached = self.cache.get(f"emb:{content_hash}")
            if cached:
                results[i] = json.loads(cached)
            else:
                to_embed.append(text)
                to_embed_indices.append(i)

        cache_hit_rate = (len(texts) - len(to_embed)) / len(texts)
        metrics.track_embedding_cache_hit_rate(cache_hit_rate)

        # 2. Batch embed uncached texts
        for batch_start in range(0, len(to_embed), batch_size):
            batch = to_embed[batch_start:batch_start + batch_size]

            response = self.client.embeddings.create(
                model=self.model,
                input=batch,
                dimensions=self.dimensions,   # Matryoshka reduction
            )

            for j, embedding_data in enumerate(response.data):
                idx = to_embed_indices[batch_start + j]
                embedding = embedding_data.embedding
                results[idx] = embedding

                # 3. Cache the new embedding
                content_hash = hashlib.sha256(
                    to_embed[batch_start + j].encode()
                ).hexdigest()
                self.cache.setex(
                    f"emb:{content_hash}",
                    86400 * 30,  # 30-day TTL
                    json.dumps(embedding)
                )

        return results
```

### Expected Savings

| Optimization                     | Cost Reduction                           |
| -------------------------------- | ---------------------------------------- |
| Model downsizing (large → small) | 60–80%                                   |
| Dimension reduction (1536 → 512) | 0% direct (saves storage, faster search) |
| Embedding caching (70% hit rate) | 70% on repeated content                  |
| Batch vs. single calls           | 0% direct (but higher throughput)        |
| **Combined**                     | **75–90%**                               |

### Quality Risk

**Low for most use cases.** Dimension reduction from 1536 to 512 typically loses < 2% retrieval accuracy. Test on your specific retrieval benchmark.

### Monitoring

- Track `embedding_cache_hit_rate` (target: > 60%)
- Track `embedding_cost_per_1k_chunks`
- Track retrieval quality (MRR, recall@k) after optimization
- Compare search quality weekly between dimension-reduced and full-dimension

---

## Pattern 9 · Fine-Tuning for Cost Reduction (Model Distillation)

### Problem

You're paying frontier model prices for a task where a fine-tuned smaller model could achieve equivalent quality. A fine-tuned GPT-4.1-mini that matches GPT-4.1 quality on your specific task costs 5× less per token.

### Solution

Distill a frontier model's knowledge into a smaller model by fine-tuning it on the frontier model's outputs for your specific task.

### Implementation Steps

1. **Collect training data:** Run your frontier model on 5,000–50,000 representative inputs. Store input + output pairs.
2. **Clean and validate data:** Remove errors, edge cases, and low-confidence outputs.
3. **Fine-tune a smaller model:** Use OpenAI fine-tuning, Anthropic fine-tuning, or open-source model + LoRA.
4. **Evaluate rigorously:** Compare fine-tuned model vs. frontier on a held-out test set of 500+ examples.
5. **Deploy gradually:** Start with 10% traffic on the fine-tuned model; scale up as confidence grows.
6. **Retrain periodically:** As your task evolves, retrain quarterly with fresh data.

### Code Example

```python
class DistillationPipeline:
    def __init__(
        self,
        teacher_model: str = "gpt-4.1",
        student_model: str = "gpt-4.1-mini",
        task: str = "ticket-classifier"
    ):
        self.teacher = teacher_model
        self.student = student_model
        self.task = task

    def generate_training_data(
        self,
        inputs: list[str],
        system_prompt: str
    ) -> list[dict]:
        """Generate training data by running teacher model."""
        training_data = []

        for input_text in inputs:
            # Get teacher's output
            response = llm_call(
                model=self.teacher,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": input_text}
                ],
                temperature=0
            )

            # Validate output format
            try:
                output = json.loads(response.content)
                if self.validate_output(output):
                    training_data.append({
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": input_text},
                            {"role": "assistant", "content": response.content}
                        ]
                    })
            except (json.JSONDecodeError, ValidationError):
                continue  # Skip invalid outputs

        return training_data

    def fine_tune(self, training_data: list[dict]) -> str:
        """Submit fine-tuning job."""
        # Write training file
        filepath = f"ft_data_{self.task}.jsonl"
        with open(filepath, "w") as f:
            for item in training_data:
                f.write(json.dumps(item) + "\n")

        # Upload and start fine-tuning
        file = client.files.create(file=open(filepath, "rb"), purpose="fine-tune")
        job = client.fine_tuning.jobs.create(
            training_file=file.id,
            model=self.student,
            hyperparameters={"n_epochs": 3}
        )
        return job.id

    def evaluate(
        self,
        fine_tuned_model: str,
        test_inputs: list[str],
        ground_truth: list[dict]
    ) -> dict:
        """Evaluate fine-tuned model vs. teacher."""
        teacher_scores = []
        student_scores = []

        for input_text, truth in zip(test_inputs, ground_truth):
            # Teacher prediction
            t_resp = llm_call(model=self.teacher, ...)
            teacher_scores.append(self.score(t_resp, truth))

            # Student prediction
            s_resp = llm_call(model=fine_tuned_model, ...)
            student_scores.append(self.score(s_resp, truth))

        return {
            "teacher_accuracy": sum(teacher_scores) / len(teacher_scores),
            "student_accuracy": sum(student_scores) / len(student_scores),
            "quality_retained": (sum(student_scores) / sum(teacher_scores)) * 100,
            "cost_reduction": self.calculate_cost_reduction(
                self.teacher, fine_tuned_model
            )
        }
```

### Expected Savings

| Metric                    | Frontier Model | Fine-Tuned Mini | Change       |
| ------------------------- | -------------- | --------------- | ------------ |
| Input cost / 1M tokens    | $2.00          | $0.40           | -80%         |
| Output cost / 1M tokens   | $8.00          | $1.60           | -80%         |
| Quality (task-specific)   | 97.2%          | 96.5%           | -0.7pp       |
| Monthly cost (180K calls) | $396           | $79             | **-$317/mo** |

### Quality Risk

**Medium.** Fine-tuned models may underperform on edge cases not represented in training data. Mitigate by including diverse training examples and maintaining a frontier model fallback for low-confidence predictions.

### Monitoring

- Track quality metrics (accuracy, F1) of fine-tuned vs. frontier on weekly eval sets
- Track confidence scores — route low-confidence predictions to frontier model
- Monitor for distribution drift in inputs (new categories the fine-tuned model hasn't seen)
- Retrain quarterly or when quality drops > 2%

---

## Pattern 10 · Agent/Chain Optimization

### Problem

Agentic workflows (tool-calling loops, multi-step chains, ReAct patterns) make multiple LLM calls per user request. Each tool call adds an LLM turn, and poorly designed agents can make 10–50+ calls for a single task, multiplying costs.

### Solution

Optimize the agent architecture to reduce tool calls, parallelize independent operations, implement early termination, and use cheaper models for intermediate reasoning.

### Implementation Steps

1. **Audit agent call patterns:** Log the number of LLM calls and tool calls per user request. Identify the median and P95.
2. **Reduce tool calls:** Combine related tools into fewer, richer tools. Provide tool results in batch.
3. **Parallelize independent calls:** If the agent needs to call 3 independent tools, call them in parallel instead of sequentially.
4. **Implement early termination:** If the agent has enough information to answer, stop the loop.
5. **Use tiered models:** Use a cheap model for planning/routing and a frontier model only for final synthesis.
6. **Set hard limits:** Max tool calls per request, max tokens per agent session, max cost per session.

### Code Example

```python
class OptimizedAgent:
    def __init__(
        self,
        planner_model: str = "gpt-4.1-nano",      # Cheap for planning
        executor_model: str = "gpt-4.1-mini",       # Mid-tier for execution
        synthesizer_model: str = "gpt-4.1",          # Frontier for final answer
        max_iterations: int = 8,
        max_session_cost: float = 1.00
    ):
        self.planner = planner_model
        self.executor = executor_model
        self.synthesizer = synthesizer_model
        self.max_iterations = max_iterations
        self.max_session_cost = max_session_cost

    async def run(self, user_query: str) -> str:
        session_cost = 0.0
        iteration = 0
        context = {"query": user_query, "tool_results": []}

        while iteration < self.max_iterations:
            iteration += 1

            # Step 1: Plan next actions (cheap model)
            plan = await self.plan(context)
            session_cost += plan.cost

            # Early termination: planner says we have enough info
            if plan.action == "SYNTHESIZE":
                break

            # Cost guard
            if session_cost > self.max_session_cost * 0.8:
                break  # Reserve 20% budget for synthesis

            # Step 2: Execute tool calls IN PARALLEL
            if plan.tool_calls:
                results = await asyncio.gather(*[
                    self.execute_tool(call)
                    for call in plan.tool_calls
                ])
                context["tool_results"].extend(results)
                session_cost += sum(r.cost for r in results)

        # Step 3: Synthesize final answer (frontier model, once)
        answer = await self.synthesize(context)
        session_cost += answer.cost

        # Log session metrics
        metrics.track_agent_session(
            iterations=iteration,
            total_cost=session_cost,
            tool_calls=len(context["tool_results"])
        )

        return answer.content

    async def plan(self, context: dict):
        """Use cheap model to decide next action."""
        return await llm_call(
            model=self.planner,
            messages=[
                {"role": "system", "content": PLANNER_PROMPT},
                {"role": "user", "content": json.dumps(context)}
            ],
            response_format={"type": "json_object"},
            max_tokens=200
        )

    async def synthesize(self, context: dict):
        """Use frontier model for final answer only."""
        return await llm_call(
            model=self.synthesizer,
            messages=[
                {"role": "system", "content": SYNTHESIZER_PROMPT},
                {"role": "user", "content": json.dumps(context)}
            ],
            max_tokens=1000
        )
```

### Expected Savings

| Metric                     | Unoptimized Agent | Optimized Agent | Change |
| -------------------------- | ----------------- | --------------- | ------ |
| Avg LLM calls per request  | 12                | 5               | -58%   |
| Avg tool calls per request | 8                 | 4               | -50%   |
| Avg cost per request       | $0.45             | $0.12           | -73%   |
| P95 cost per request       | $2.10             | $0.35           | -83%   |
| Avg latency                | 18s               | 6s              | -67%   |

### Quality Risk

**Medium.** Reducing iterations may cause the agent to miss information. Mitigate by improving the planner's ability to decide when it has enough context, and by providing rich tool outputs that reduce the need for follow-up calls.

### Monitoring

- Track `iterations_per_request` distribution (P50, P95, P99)
- Track `cost_per_agent_session` distribution
- Track `early_termination_rate` (should be 30–60% of requests)
- Track `quality_score` per number of iterations used (quality shouldn't drop for shorter sessions)
- Alert if any session exceeds `max_session_cost`
- Alert if `avg_iterations` trends upward (may indicate harder queries or planner regression)

---

## Summary Matrix

| #   | Pattern                    | Effort | Expected Savings             | Quality Risk | Best For                   |
| --- | -------------------------- | ------ | ---------------------------- | ------------ | -------------------------- |
| 1   | Prompt Compression         | Low    | 20–70% input cost            | Low          | All workloads              |
| 2   | Context Window Management  | Medium | 30–80% per long conversation | Medium       | Chatbots, multi-turn       |
| 3   | Model Tiering & Routing    | Medium | 50–80% blended cost          | Low–Medium   | Mixed workloads            |
| 4   | Semantic Caching           | Medium | 20–60% total cost            | Low          | Repetitive queries         |
| 5   | Batch Processing           | Low    | 50% API cost                 | None         | Background processing      |
| 6   | Output Format Constraints  | Low    | 50–85% output cost           | Low          | Classification, extraction |
| 7   | Retry Reduction            | Low    | 5–15% total cost             | None         | High-volume services       |
| 8   | Embedding Optimization     | Medium | 75–90% embedding cost        | Low          | RAG, search                |
| 9   | Fine-Tuning (Distillation) | High   | 60–90% inference cost        | Medium       | High-volume, stable tasks  |
| 10  | Agent/Chain Optimization   | High   | 50–80% per agent call        | Medium       | Agentic workflows          |

### Recommended Implementation Order

1. **Quick wins (Week 1–2):** Prompt Compression (#1), Output Format Constraints (#6), Retry Reduction (#7)
2. **Medium effort (Week 3–6):** Model Tiering (#3), Semantic Caching (#4), Batch Processing (#5)
3. **Strategic investments (Month 2–3):** Context Window Management (#2), Embedding Optimization (#8)
4. **Long-term (Quarter 2+):** Fine-Tuning (#9), Agent/Chain Optimization (#10)

---

_Template version 1.0 — Maintained by the TokenOps team._
