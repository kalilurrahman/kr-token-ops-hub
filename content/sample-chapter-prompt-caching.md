# Chapter 8 — Prompt Caching Economics

_From_ The TokenOps Handbook, 2026 Edition. _This is a complete chapter, published free as a sample. Prices quoted here render from the maintained pricing dataset (`data/pricing.json`, reviewed 2026-07-26) — see the public changelog for every change since._

---

Prompt caching is the only optimization in this book that can cut your largest cost line by ~90% without changing a single word of your prompts, without touching model selection, and without any measurable quality risk. It is also the one most teams implement wrong — either by caching content that never gets reused and paying a write premium for nothing, or by unknowingly busting their own cache on every request and wondering why the discount never showed up on the invoice.

This chapter gives you the break-even math, the provider-specific mechanics, the six anti-patterns that silently destroy hit rates, and the instrumentation to prove it worked.

## 8.1 Why this is the first lever, not the fifth

Look at the shape of a typical production LLM request:

```
┌─────────────────────────────────────────┬──────────┬──────────┐
│ system prompt + policies + tool schemas │ user msg │  output  │
│              4,000 tokens               │   200    │   300    │
│               ← STABLE →                │ ← varies │  varies  │
└─────────────────────────────────────────┴──────────┴──────────┘
                    89%                       4%         7%
```

Eighty-nine percent of the input tokens on that request are **byte-identical to the previous request**. You are paying full price, every call, to have the model re-read instructions it read three seconds ago. Prompt caching is the provider charging you less for the thing they already computed.

The economics are unusual in three ways that make this lever unlike the others in Part III:

1. **The discount is provider-documented, not estimated.** You do not have to trust a savings range from a blog post. Anthropic publishes cached-read pricing at 10% of base input. OpenAI publishes a 90% cached-input discount on GPT-5. DeepSeek publishes $0.028/M against a $0.28/M base. These are rate-card facts you can verify before writing code.
2. **Quality risk is zero.** The model receives exactly the same tokens. Caching changes what you are billed, not what is computed. Compare this to routing (real quality tradeoff), compression (real information loss), or output constraints (real capability limits).
3. **Implementation is hours, not sprints.** On OpenAI and Gemini, structural: order your prompt correctly and the discount applies automatically. On Anthropic, four lines of `cache_control`.

That combination — large, documented, safe, cheap to implement — is why caching goes first in every optimization sequence in this book.

## 8.2 The two cache shapes

Providers implement caching in one of two economic shapes. Which one you're on determines your entire strategy.

### Shape A: automatic, no write premium

**OpenAI (GPT-5 family), Google Gemini (2.5+ implicit), DeepSeek.** The provider detects a repeated prefix and discounts it. The first call pays full price; subsequent calls within the TTL pay the cached rate. There is no surcharge for creating the cache.

The cost of N identical-prefix calls, in units of the base input price:

```
cost(N) = 1 + 0.10 × (N − 1)      [at a 90% cached-input discount]
```

Caching wins from the second call, always. There is no break-even to compute and no decision to make — the only question is whether your prefix is stable enough to hit.

| Calls (N) | Cost vs. no cache | Saving |
| --- | --- | --- |
| 2 | 1.10× vs 2× | 45.0% |
| 10 | 1.90× vs 10× | 81.0% |
| 100 | 10.90× vs 100× | 89.1% |

The asymptote is the discount itself: at high reuse you converge on paying 10% of the un-cached price for the cached portion.

### Shape B: explicit, with a write premium

**Anthropic.** You mark cache breakpoints with `cache_control`. Reads cost 10% of base input — but **writes cost more than base input**: 1.25× for a 5-minute TTL, 2.0× for a 1-hour TTL. You are buying the cache, then renting it cheaply.

```
cost(N) = write_multiplier + 0.10 × N
```

This creates a genuine break-even threshold, and it is the single most important number in this chapter:

| Reuses within TTL | 5-min cache (1.25× write) | 1-hour cache (2.0× write) |
| --- | --- | --- |
| 1 | 1.35× — **35% worse than no cache** | 2.10× — **110% worse** |
| 2 | 1.45× vs 2× → **saves 27.5%** | 2.20× vs 2× → **10% worse** |
| 3 | 1.55× vs 3× → saves 48.3% | 2.30× vs 3× → **saves 23.3%** |
| 10 | 2.25× vs 10× → saves 77.5% | 3.00× vs 10× → saves 70.0% |
| 100 | 11.25× vs 100× → saves 88.8% | 12.00× vs 100× → saves 88.0% |

**The rules that fall out of this table:**

- **5-minute cache: break even at 2 reuses.** Cache anything you will reuse twice within five minutes.
- **1-hour cache: break even at 3 reuses.** The longer TTL costs more to write, so it needs more traffic to justify — but it survives gaps that would let a 5-minute cache expire.
- **A single-use cache write is a pure loss.** You pay 25–110% extra for nothing. This is the most common way teams lose money on caching: enabling it globally on a bursty, low-traffic endpoint.

The choice between TTLs is not "longer is better." It is a function of your inter-request gap distribution, which §8.5 shows you how to measure.

## 8.3 Provider mechanics

Current rates for the models most teams deploy in production (from the maintained dataset; per 1M tokens):

| Model | Input | Cached read | 5-min write | 1-hr write | Output |
| --- | --- | --- | --- | --- | --- |
| GPT-5 | $1.25 | $0.125 | — | — | $10.00 |
| GPT-5 Mini | $0.25 | $0.025 | — | — | $2.00 |
| GPT-5 Nano | $0.05 | $0.005 | — | — | $0.40 |
| Claude Opus 4.5 | $5.00 | $0.50 | $6.25 | $10.00 | $25.00 |
| Claude Sonnet 5 | $2.00 | $0.20 | $2.50 | $4.00 | $10.00 |
| Claude Haiku 4.5 | $1.00 | $0.10 | $1.25 | $2.00 | $5.00 |
| DeepSeek V3.2 | $0.28 | $0.028 | — | — | $0.42 |

_Claude Sonnet 5 rates above are introductory and revert per Anthropic's published schedule — the dataset changelog tracks the reversion. Always price against the dataset, not against this table._

**OpenAI.** Automatic on GPT-5-family models. Caching activates at a minimum prefix length (1,024 tokens on current models) and matches on exact prefix. TTL is a short sliding window — roughly 5–10 minutes, extended by hits. No code changes; the only work is prompt *ordering* (§8.4). The `usage` object reports `prompt_tokens_details.cached_tokens` — that field is your hit-rate instrument.

**Anthropic.** Explicit. You place up to four `cache_control` breakpoints; everything before a breakpoint is cacheable as a prefix.

```python
response = client.messages.create(
    model="claude-opus-4-5",
    system=[
        {"type": "text", "text": POLICIES_AND_INSTRUCTIONS},   # 3,000 tokens, stable
        {"type": "text", "text": TOOL_SCHEMAS,
         "cache_control": {"type": "ephemeral"}},              # ← breakpoint: 1,000 tokens
    ],
    messages=[{"role": "user", "content": user_message}],      # varies, uncached
)
# usage.cache_creation_input_tokens  → you paid the write premium
# usage.cache_read_input_tokens      → you got the 10% rate
# usage.input_tokens                 → full price
```

Those three `usage` fields are the entire measurement story on Anthropic. Log all three from day one; §8.5 explains what their ratios tell you.

**Google Gemini.** Two modes. *Implicit* caching is on by default for 2.5+ models — no storage cost, no configuration, discount applied automatically on prefix hits. *Explicit* (managed) caching guarantees the discount for a context you register and reference by handle, with a storage charge for the retention period. Rule: on Flash-tier models, implicit captures most of the upside for free. Reserve explicit for Pro-tier models holding one large context reused many times within an hour — a 200-page contract, a large codebase snapshot.

**DeepSeek.** Disk-based context caching, automatic, no write premium, hours-long retention. Economically the friendliest shape in the table: a 90% discount with no decision to make.

## 8.4 Prompt architecture: the part nobody tells you

Every cache implementation succeeds or fails on one property: **is the prefix byte-identical across calls?** Not semantically similar. Identical. One changed character in position 3 invalidates everything after it.

So the architecture rule is absolute:

> **Order your prompt from most stable to least stable. Never put anything dynamic before anything cacheable.**

```
✅ CORRECT                              ❌ BROKEN
─────────────────────────────────       ─────────────────────────────────
1. System role + policies (stable)      1. "Current time: 14:32:07"  ← busts everything
2. Tool / function schemas (stable)     2. System role + policies
3. Few-shot examples (stable)           3. Tool schemas
4. Retrieved documents (semi-stable)    4. Few-shot examples
5. Conversation history (grows)         5. User message
6. User message (varies)                6. "User ID: 88213"
7. Dynamic context (time, user ID)
```

The broken column is not a strawman. Injecting a timestamp "so the model knows the current date" at the top of a system prompt is the single most common cache-destroying bug in production, and it is invisible: the code looks correct, the responses look correct, and the invoice never drops. The fix is one line — move it below the breakpoint — and it recovers the entire discount.

**What to cache, in priority order:**

1. **System prompts.** Always. Stable by definition, long, and present on every single call.
2. **Tool and function schemas.** For agents this is the sleeper cost: 40 tool definitions at 500 tokens each is 20,000 input tokens re-sent on *every turn of every loop*, whether or not any tool gets called. Caching these is often a bigger win than caching the system prompt.
3. **Few-shot examples.** Stable, expensive per token, and usually the longest stable block after tool schemas.
4. **High-hit-rate retrieved chunks.** In FAQ-style RAG where the top-K rarely changes, the retrieved block is effectively stable. Order chunks deterministically (by document ID, not by score) so identical retrieval sets produce identical prefixes — score-ordering makes byte-identical sets look different to the cache.
5. **Long documents in multi-turn chat.** The canonical win: a 100K-token document cached once and referenced across ten turns.

**What not to cache:**

- Prefixes containing per-user personalization *before* stable content. Restructure so the shared content comes first.
- Prompts below the provider's minimum cacheable length.
- One-shot batch jobs. No reuse means no benefit, and on Anthropic it means a write-premium loss. Batch API discounts are the right lever there (Chapter 10).
- Anything you are about to edit. A prompt under active iteration will invalidate on every deploy; wait until it stabilizes.

## 8.5 Instrumentation: proving it worked

Caching is the easiest optimization to *believe* you have and not have. Three metrics, logged per request, settle it.

**1. Cache hit rate.**

```
hit_rate = cached_read_tokens / (cached_read_tokens + cache_write_tokens + uncached_input_tokens)
```

Target >80% for a workload with a stable system prompt and steady traffic. Below 50% with a nominally stable prefix means something is busting it — go straight to §8.4's broken column.

**2. Write-to-read ratio** (Anthropic and other Shape-B providers).

```
churn = cache_write_tokens / cache_read_tokens
```

Healthy is well under 0.1. A churn ratio approaching or exceeding the break-even inverse means you are paying the write premium repeatedly without accumulating reuse — either your traffic is too sparse for the TTL you chose, or your prefix is unstable. Rising churn with flat hit rate is the signature of a prompt being edited in production.

**3. Effective input rate.**

```
effective_$/M = total_input_spend / total_input_tokens_millions
```

This is the number to put on the dashboard, because it collapses everything into one honest figure and it is directly comparable to the rate card. If Claude Opus 4.5's base input is $5.00/M and your effective rate is $0.94/M, caching is working and you can prove it to finance without explaining what a KV-cache is.

Track all three from the first day of implementation, not after. The pre-caching baseline is the only thing that makes the improvement provable, and you cannot reconstruct it later.

## 8.6 Worked example: a support agent

An illustrative scenario, computed end to end. Every figure below is arithmetic on the dataset rates — reproduce it with your own numbers before committing to anything.

**The workload.** A customer-support agent on Claude Opus 4.5: 3,000-token system prompt with policies, 1,000 tokens of tool schemas, 200-token average user message, 300-token average response, 50,000 calls/day.

**Without caching:**

```
input:  50,000 × 4,200 tokens = 210M  × $5.00/M  = $1,050.00/day
output: 50,000 ×   300 tokens =  15M  × $25.00/M =   $375.00/day
                                                    ─────────────
                                                    $1,425.00/day   ($42,750/month)
```

**With a 5-minute cache on the 4,000-token stable prefix.** At 50,000 calls/day the traffic is roughly 35 calls/minute — continuous enough that one cache write per 5-minute window keeps it warm: 288 writes/day, and the remaining 49,712 calls read.

```
cache writes: 288    × 4,000 =   1.15M × $6.25/M =     $7.20/day
cache reads:  49,712 × 4,000 = 198.85M × $0.50/M =    $99.42/day
user message: 50,000 ×   200 =  10.00M × $5.00/M =    $50.00/day
output:       50,000 ×   300 =  15.00M × $25.00/M =  $375.00/day
                                                     ─────────────
                                                      $531.62/day   ($15,949/month)
```

**The result:**

| Layer | Before | After | Reduction |
| --- | --- | --- | --- |
| Stable prefix (the cached layer) | $1,000.00/day | $106.62/day | **89.3%** |
| Total request cost | $1,425.00/day | $531.62/day | **62.7%** |

**Monthly saving: ~$26,800.** Implementation: four lines of `cache_control` and a prompt reorder.

Note which number is which. The **89.3%** is the caching discount doing exactly what the rate card promises on the layer it applies to. The **62.7%** is what lands on your invoice, because output tokens and the user message are untouched. Report the second number to finance and the first to engineering — conflating them is how optimization programs lose credibility.

Note also what sets the ceiling: after caching, **output is 71% of the remaining spend** ($375 of $531.62). Caching has done its job and the next lever is a different one — output constraints (Chapter 10) or routing the easy 80% of tickets to Haiku 4.5 (Chapter 9). This is the sequencing logic of Part III in miniature: each lever exposes the next.

## 8.7 The six anti-patterns

Each of these has cost a real team real money. Five of the six are invisible without §8.5's instrumentation.

**1. Dynamic content before the cacheable prefix.** A timestamp, request ID, or user name at the top of the system prompt. Invalidates 100% of the cache while looking completely correct. **Fix:** move it after the last breakpoint.

**2. Score-ordered retrieval sets.** RAG chunks sorted by relevance score produce different byte sequences for the same set of documents, because scores jitter between runs. **Fix:** sort retrieved chunks by a stable key (document ID) before assembling the prompt.

**3. Caching a prompt under active development.** Every edit is a full invalidation plus a fresh write premium. During prompt iteration you pay the tax and get none of the benefit. **Fix:** ship caching after the prompt stabilizes; treat prompts as versioned immutable artifacts (Chapter 16).

**4. Wrong TTL for the traffic shape.** A 1-hour cache on an endpoint that gets three requests an hour never reaches its 3-reuse break-even. A 5-minute cache on an endpoint with 20-minute gaps expires before every call — paying the write premium on 100% of requests, which is *worse* than not caching. **Fix:** measure your inter-request gap distribution, then pick the TTL that captures the bulk of it.

**5. Untracked write premiums in cost reporting.** Dashboards that sum "input tokens" hide that some of those tokens were billed at 1.25× and others at 0.10×. A cache can be losing money while the token count looks flat. **Fix:** the three separate `usage` counters, always logged separately.

**6. Caching in a workload with no reuse at all.** Nightly batch enrichment, one-shot classification runs, per-document extraction with no shared prefix. On Shape-B providers this is a guaranteed 25–110% overpay on the cached portion. **Fix:** batch API (Chapter 10) is the right lever for offline work; caching is for repeated prefixes.

## 8.8 Implementation checklist

Ship in this order. Steps 1–2 are measurement, and doing them first is what makes the rest provable.

- [ ] **Log the three cache counters** on every request (`cached_read`, `cache_write`, `uncached_input`) plus output tokens. Establish a pre-caching baseline of effective $/M.
- [ ] **Measure your inter-request gap distribution** per endpoint. This picks your TTL; do not guess it.
- [ ] **Audit prompt ordering.** Grep for timestamps, UUIDs, user identifiers, and session data appearing before stable content. This audit alone frequently recovers the entire discount on an endpoint that "already had caching enabled."
- [ ] **Make retrieval deterministic** — stable sort key on chunks before assembly.
- [ ] **Verify prefix length** clears the provider minimum (1,024 tokens on current OpenAI models).
- [ ] **Place breakpoints** (Anthropic/Gemini explicit) after the last stable block, ordered longest-stable-first.
- [ ] **Confirm break-even per endpoint** before enabling on Shape-B providers: ≥2 reuses within a 5-min TTL, ≥3 within 1-hour. Endpoints that fail this get caching *off*.
- [ ] **Watch hit rate and churn for one week** post-deploy. Hit rate climbing toward 80%+ and churn under 0.1 means it landed.
- [ ] **Publish the effective $/M** before-and-after on the team dashboard. This is the artifact that funds the next optimization.
- [ ] **Add a regression alarm:** hit rate dropping >20 points week-over-week means someone edited a prompt or reintroduced dynamic content. Caching decays silently; alarm on it.

## 8.9 What this chapter earns you

For a workload with a stable prefix and steady traffic, prompt caching reduces the cached input layer by ~90% at the published rates — the largest single documented discount available in LLM pricing, at the lowest implementation cost and zero quality risk.

Two caveats to carry forward. First, the discount applies to the *cached layer only* — as §8.6 shows, a 89.3% cut on the prefix became a 62.7% cut on the bill, and output tokens then dominated what remained. Second, on write-premium providers the lever has a *negative* range: below break-even you pay more than not caching at all. Both facts argue for the same discipline — measure per endpoint, then decide per endpoint.

Chapter 9 takes the workload you have now re-priced and asks the next question: of the traffic that remains, how much of it needs a frontier model at all?

---

_This chapter is one of 21 in_ The TokenOps Handbook, 2026 Edition. _All pricing renders from the maintained dataset with a public changelog; the arithmetic in §8.2, §8.3, and §8.6 is verified by an automated check on every commit._

_Savings figures describe results achievable with these techniques under the stated assumptions; they are illustrative, not a promise. Your results depend on your workload, providers, and implementation. Worked examples labeled "illustrative scenario" are constructed for teaching, not measured from a named production system._
