# TokenOps Case Studies

> **Purpose:** Learn from detailed, real-world TokenOps optimization scenarios with specific numbers, step-by-step solutions, and measurable results.  
> **Audience:** Engineering leaders, platform teams, and FinOps practitioners evaluating or implementing TokenOps.  
> **Note:** These case studies represent composite scenarios based on common industry patterns. Company names are fictional, but the numbers, architectures, and outcomes reflect real-world results.

---

## Case Study 1: SaaS Customer Support Chatbot

### Company: HelpFlow (B2B SaaS, 200 engineers)

**Optimization Result: $85K/month → $28K/month (67% reduction)**

---

### Background

HelpFlow provides a customer support platform used by 400+ B2B clients. In 2025, they launched an AI-powered support chatbot that handles Tier 1 customer inquiries — answering FAQs, looking up order status, troubleshooting common issues, and escalating complex cases to human agents. The chatbot uses a RAG architecture: it retrieves relevant help articles from a knowledge base, includes them in the context, and generates conversational responses.

**Architecture:**
```
User Message → Embedding Model (query vectorization)
            → Vector DB (retrieve top-10 help articles)
            → LLM (generate response with retrieved context)
            → Response to user
```

**Scale:**
- 180,000 conversations/month across all tenants
- Average 6 turns per conversation (1.08M LLM calls/month)
- Available 24/7 across 12 time zones

### Challenge

After 6 months in production, LLM costs had grown to $85,000/month and were trending upward at 15% month-over-month. The specific problems:

1. **Single expensive model for all tasks** — Every request (FAQ lookup, order status, troubleshooting, escalation decisions) used GPT-4o, regardless of complexity
2. **Bloated context** — The system retrieved 10 help articles per query (averaging 3,200 input tokens of context) even when 2–3 were sufficient
3. **No caching** — Identical FAQ questions ("What's your return policy?") hit the LLM every time, despite 35% of queries being common FAQs
4. **Verbose system prompt** — The system prompt was 1,800 tokens, having accumulated instructions over months of feature additions
5. **No conversation trimming** — Full conversation history was sent with every turn, causing later turns to consume 4,000+ input tokens

**Monthly Cost Breakdown (Before):**

| Component | Volume | Avg Tokens/Request | Model | Monthly Cost |
|-----------|--------|-------------------|-------|-------------|
| FAQ responses | 378,000 calls | 4,200 in / 350 out | GPT-4o | $5,040 |
| Order lookups | 270,000 calls | 3,800 in / 200 out | GPT-4o | $2,970 |
| Troubleshooting | 216,000 calls | 5,100 in / 600 out | GPT-4o | $4,050 |
| Complex escalation | 162,000 calls | 5,500 in / 800 out | GPT-4o | $3,375 |
| Embedding (queries) | 1,080,000 calls | 50 tokens each | text-embedding-3-small | $1.08 |
| **Total** | **1,080,000** | | | **~$85,000** |

> *Note: Costs include multi-turn conversation overhead. The numbers above represent blended averages across all turns per conversation.*

### Solution

The HelpFlow platform team executed a 6-week optimization sprint using the TokenOps Implementation Playbook.

#### Step 1: Instrument and Tag (Week 1)

- Deployed LiteLLM Proxy as the centralized LLM gateway
- Implemented the request tagging schema: `team=cx-platform`, `service=chatbot`, `use_case={faq|order_lookup|troubleshooting|escalation}`, `tenant_id`, `conversation_id`
- Built a cost dashboard in Grafana showing real-time spend by use case, tenant, and model

**Key insight from instrumentation:** FAQ responses (35% of calls) and order lookups (25% of calls) accounted for 60% of call volume but were simple tasks that didn't need GPT-4o.

#### Step 2: Model Tiering (Weeks 2–3)

Evaluated GPT-4o-mini for FAQ and order lookup tasks:

- Built a test set of 500 FAQ queries and 300 order lookups with ground-truth responses
- Ran offline evaluation: GPT-4o-mini achieved 96.2% accuracy on FAQ (vs. 97.8% for GPT-4o) and 98.1% on order lookups (vs. 98.5%)
- Both results exceeded the 95% quality threshold
- Deployed in shadow mode for 1 week, then A/B tested at 10% → 25% → 50% → 100%
- Kept GPT-4o for troubleshooting and escalation decisions (quality threshold not met with GPT-4o-mini)

**Monthly savings from model tiering: $39,200**

#### Step 3: Semantic Caching (Week 3–4)

- Deployed a semantic cache using embedding similarity (threshold: 0.95) for FAQ queries
- Pre-warmed the cache with responses to the top-200 most common FAQ questions
- Set cache TTL to 7 days (help articles change infrequently)
- Monitored cache hit rate: achieved 42% hit rate on FAQ queries within 2 weeks

**Monthly savings from caching: $7,800**

#### Step 4: Context Trimming (Week 4–5)

- Reduced retrieved articles from 10 to 5 (top-5 by relevance score)
- Added a relevance threshold: exclude articles with similarity score < 0.82
- Implemented conversation summarization: after turn 4, summarize earlier turns into a 200-token summary instead of including full history
- Net input token reduction: 38% across all use cases

**Monthly savings from context trimming: $6,400**

#### Step 5: Prompt Compression (Week 5–6)

- Audited the 1,800-token system prompt using the Prompt Optimization Checklist
- Removed redundant instructions (accumulated over 6 months of feature additions)
- Consolidated formatting rules from prose into a structured YAML block
- Compressed system prompt from 1,800 tokens to 680 tokens (62% reduction)
- A/B tested: no measurable quality difference (human preference tied at 51/49)

**Monthly savings from prompt compression: $3,600**

### Results

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Monthly LLM cost | $85,000 | $28,000 | −67% (−$57,000) |
| Cost per conversation | $0.47 | $0.16 | −66% |
| Avg. input tokens/request | 4,650 | 2,100 | −55% |
| FAQ cache hit rate | 0% | 42% | +42pp |
| System prompt tokens | 1,800 | 680 | −62% |
| Retrieved articles per query | 10 | 5 (avg 3.2 after filtering) | −68% |
| Quality score (human eval) | 4.3/5.0 | 4.2/5.0 | −2.3% (within tolerance) |
| P99 latency (TTFT) | 1.2s | 0.8s | −33% (faster due to fewer input tokens) |
| Time to detect cost anomaly | ~3 days | < 15 minutes | −99% |

**Annualized savings: $684,000**

### Lessons Learned

1. **Model tiering delivered the largest single saving** — Switching FAQ and order lookup to GPT-4o-mini saved $39K/month alone. Always check if simpler tasks are running on unnecessarily expensive models.
2. **Context trimming was higher-impact than expected** — Reducing from 10 to 5 retrieved articles (with relevance filtering) actually *improved* response quality because it removed noisy, irrelevant context.
3. **Semantic caching requires careful threshold tuning** — Initial threshold of 0.90 caused 3% of responses to be semantically incorrect. Raising to 0.95 eliminated mismatches while still achieving a 42% hit rate.
4. **System prompt bloat is invisible and expensive** — Nobody noticed the system prompt had grown to 1,800 tokens. At 1.08M requests/month, every unnecessary token in the system prompt costs $2.70/month.
5. **Instrumentation must come first** — The dashboard built in Week 1 revealed that FAQ and order lookup were the obvious targets. Without use-case-level tagging, the team would have optimized blindly.

---

## Case Study 2: Data Enrichment Pipeline

### Company: DataMesh (Data Platform, 80 engineers)

**Optimization Result: 65% cost reduction on a pipeline processing 2M records/day**

---

### Background

DataMesh operates a data enrichment platform that processes raw business records (company profiles, job listings, product catalogs) and enriches them with standardized fields: industry classification, technology stack detection, company size estimation, and entity extraction. The platform processes data for 50+ enterprise clients.

**Architecture:**
```
Raw Records (S3) → Queue (SQS) → Worker Fleet → LLM API → Enriched Records (S3/Warehouse)
```

**Scale:**
- 2,000,000 records/day across all clients
- Each record requires 1 LLM call for enrichment
- Pipeline runs 24/7 with batch processing windows

### Challenge

The enrichment pipeline was the company's largest cost center at $124,000/month in LLM API costs. The problems:

1. **Premium model for a structured extraction task** — All enrichment used Claude Sonnet, even though the task was structured data extraction (not creative generation)
2. **Verbose prompts with excessive examples** — Each prompt included 8 few-shot examples, adding 2,400 tokens per request
3. **Real-time API pricing** — All 2M daily records were processed via the standard (real-time) API at full price
4. **No output token control** — The model sometimes generated verbose explanations alongside the structured output, wasting output tokens
5. **Retry waste** — 4% of requests failed due to rate limits, each retry consuming tokens for the failed attempt

**Monthly Cost Breakdown (Before):**

| Component | Daily Volume | Avg Tokens/Request | Model | Monthly Cost |
|-----------|-------------|-------------------|-------|-------------|
| Industry classification | 2M records | 3,200 in / 180 out | Claude Sonnet | $72,000 |
| Entity extraction | 2M records | 3,400 in / 250 out | Claude Sonnet | $52,000 |
| **Total** | **4M calls** | | | **$124,000** |

> *Note: Some records require both classification and extraction; total calls exceed record count.*

### Solution

#### Step 1: Instrument and Baseline (Week 1)

- Added request tagging: `service=enrichment`, `use_case={classification|extraction}`, `client_id`, `batch_id`
- Built a cost dashboard segmented by client, enrichment type, and record category
- Discovered that 15% of the monthly cost came from the 4% retry rate (retried requests = wasted tokens + full-cost retry)

#### Step 2: Model Downgrade (Weeks 2–3)

Evaluated GPT-4o-mini and Claude Haiku for the enrichment tasks:

- Created a benchmark dataset: 2,000 records with human-verified enrichment labels
- **Industry classification results:**
  - Claude Sonnet: 96.8% accuracy
  - GPT-4o-mini: 95.1% accuracy ✅ (threshold: 94%)
  - Claude Haiku: 94.3% accuracy ✅ (threshold: 94%)
- **Entity extraction results:**
  - Claude Sonnet: 94.2% field-level F1
  - GPT-4o-mini: 93.8% field-level F1 ✅ (threshold: 93%)
  - Claude Haiku: 92.1% field-level F1 ❌ (below threshold)
- Selected GPT-4o-mini for both tasks (best price-performance ratio above threshold)

**Monthly savings from model downgrade: $58,000**

#### Step 3: Prompt Compression (Week 3–4)

- Reduced few-shot examples from 8 to 3 (tested: 3 examples achieved same accuracy as 8)
- Converted the prompt from natural language instructions to a structured schema definition
- Added `max_tokens=300` to cap output length
- Enforced JSON-only output mode (eliminated verbose explanations)
- Net prompt reduction: 3,200 → 1,100 input tokens (66% reduction)

**Monthly savings from prompt compression: $12,000**

#### Step 4: Batch API Migration (Weeks 4–5)

- Migrated the entire pipeline from real-time API to OpenAI Batch API
- Restructured the pipeline to submit batches of 50,000 records every 30 minutes
- Results typically returned within 4–6 hours (well within the 24-hour SLA)
- Batch API pricing: 50% off standard pricing

**Monthly savings from batch API: $27,000 (50% of remaining cost)**

#### Step 5: Retry Optimization (Week 5)

- Implemented exponential backoff with jitter (base 2s, max 60s, 3 retries max)
- Added request deduplication: if a request fails, check if a duplicate succeeded before retrying
- Batch API eliminated most rate limit issues (provider manages throttling internally)
- Retry rate dropped from 4% to 0.3%

**Monthly savings from retry optimization: $4,600**

### Results

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Monthly LLM cost | $124,000 | $43,400 | −65% (−$80,600) |
| Cost per record | $0.0021 | $0.00072 | −66% |
| Model | Claude Sonnet | GPT-4o-mini (Batch) | — |
| Avg. input tokens/request | 3,300 | 1,100 | −67% |
| Few-shot examples | 8 | 3 | −63% |
| Retry rate | 4.0% | 0.3% | −92% |
| Classification accuracy | 96.8% | 95.1% | −1.7pp (within tolerance) |
| Extraction F1 | 94.2% | 93.8% | −0.4pp (within tolerance) |
| Processing latency | Real-time (~2s) | Batch (~4 hours) | Increased (acceptable for ETL) |

**Annualized savings: $967,200**

### Lessons Learned

1. **Batch API is the single easiest win for pipeline workloads** — If your workload can tolerate a 24-hour turnaround, you get 50% savings with zero quality impact. Always ask: "Does this really need to be real-time?"
2. **Few-shot examples have diminishing returns** — Going from 0 to 3 examples dramatically improved accuracy, but going from 3 to 8 added less than 1% accuracy at 2× the input token cost. Test the minimum number of examples needed.
3. **Structured output mode saves more than you'd expect** — Eliminating the model's tendency to add "explanations" and "reasoning" to extraction output saved 40% of output tokens (the most expensive token type).
4. **Retry waste is a hidden cost** — A 4% retry rate doesn't sound like much, but at 4M calls/month it's 160,000 wasted calls. Fix the root cause (rate limits) rather than just retrying harder.
5. **The model downgrade delivered 60% of total savings** — Claude Sonnet → GPT-4o-mini for structured extraction was a near-identical quality swap at 95% cost reduction on a per-token basis. Structured extraction tasks are the lowest-hanging fruit for model tiering.

---

## Case Study 3: Enterprise Content Platform

### Company: ContentForge (Enterprise SaaS, 500 engineers)

**Optimization Result: 40% org-wide savings through chargeback and cultural change**

---

### Background

ContentForge is an enterprise content management platform with AI capabilities across six product teams: Marketing (email campaigns, ad copy), Documentation (tech docs, knowledge base), Legal (contract analysis, compliance), Customer Success (onboarding guides, health reports), Analytics (report generation, data narratives), and Internal Tools (code review, Slack bots). Each team independently integrated LLM capabilities into their features over 18 months.

**Scale:**
- 6 product teams, each with their own LLM integrations
- 14 distinct LLM-powered features across the organization
- Combined monthly LLM spend: $210,000/month
- Growing at 25% quarter-over-quarter

### Challenge

LLM costs were the fastest-growing line item in ContentForge's infrastructure budget, and leadership had no visibility into where the money was going. Specific problems:

1. **No cost attribution** — The $210K/month bill was paid from a central infrastructure budget; individual teams had no visibility into their share and no incentive to optimize
2. **Duplicate infrastructure** — 4 of 6 teams had built their own LLM client wrappers; 3 teams had independent prompt management systems
3. **Inconsistent model selection** — The Marketing team used GPT-4o for email subject line generation (a task suitable for GPT-4o-mini); the Legal team used Claude Haiku for contract analysis (a task requiring a more capable model)
4. **No optimization incentive** — Since costs were centralized, no team felt ownership; optimization suggestions were deprioritized against feature work
5. **Shadow LLM usage** — Two teams were using personal API keys for prototyping, with costs expensed as "development tools" outside the central budget

**Monthly Cost by Team (Before — estimated, since attribution didn't exist):**

| Team | Features | Estimated Monthly Cost | Model(s) Used |
|------|----------|----------------------|---------------|
| Marketing | Email campaigns, ad copy, A/B variants | $52,000 | GPT-4o |
| Documentation | Tech docs, KB articles, changelog | $38,000 | Claude Sonnet |
| Legal | Contract analysis, compliance review | $41,000 | Claude Haiku / GPT-4o |
| Customer Success | Onboarding guides, health reports | $28,000 | GPT-4o |
| Analytics | Report narratives, data summaries | $34,000 | GPT-4o |
| Internal Tools | Code review bot, Slack assistant | $17,000 | Claude Sonnet |
| **Total** | **14 features** | **$210,000** | |

### Solution

The Platform Engineering team, with executive sponsorship from the VP Engineering, executed a 12-week TokenOps program.

#### Step 1: Centralized Gateway and Tagging (Weeks 1–3)

- Deployed a centralized LiteLLM Proxy gateway
- Migrated all 14 features from direct API calls to the gateway (3 weeks, 1 engineer per team)
- Implemented standardized tagging: `team`, `service`, `feature`, `use_case`, `cost_center`, `environment`
- Retired 4 independent client wrappers and 3 prompt management systems
- Discovered 2 shadow API keys ($3,200/month combined) and migrated them to the gateway

**Outcome:** 100% of LLM calls routed through the gateway with standardized tags within 3 weeks.

#### Step 2: Cost Dashboards and Showback (Weeks 3–5)

- Built team-level cost dashboards in Grafana (connected to the gateway telemetry)
- Established automated weekly showback reports emailed to each team lead: their features, spend by model, cost trends, and top-cost features
- Held a company-wide "LLM Cost Awareness" presentation: showed each team their costs for the first time

**Key reactions from teams upon seeing their costs:**
- Marketing: "We're spending $52K/month on *email subject lines*?!" (they didn't realize GPT-4o was overkill)
- Legal: "Why are we using Haiku for contract analysis? That's a high-stakes task." (they upgraded to Sonnet for quality)
- Internal Tools: "Our Slack bot costs $17K/month for 200 users. That's $85/user/month." (they immediately started optimizing)

#### Step 3: Showback → Chargeback Transition (Weeks 5–8)

- Quarter 1: showback only (visibility without budget impact)
- Quarter 2: chargeback activated — each team's LLM costs deducted from their engineering budget
- Finance partner aligned cost center mapping with the tagging schema
- Budget exception process defined: teams can request budget increases through the monthly cost review

**Impact of chargeback:** Within 4 weeks of chargeback activation, 5 of 6 teams independently initiated optimization projects. The Marketing team, now seeing $52K/month hitting their budget, immediately prioritized a model downgrade sprint.

#### Step 4: Team-Driven Optimization (Weeks 6–12)

With chargeback driving accountability, each team optimized their own features:

**Marketing Team ($52K → $18K):**
- Downgraded email subject line generation from GPT-4o to GPT-4o-mini (A/B test showed no click-rate difference)
- Added semantic caching for ad copy templates (38% hit rate)
- Compressed prompts by removing redundant brand guidelines from every request (moved to fine-tuning)

**Documentation Team ($38K → $24K):**
- Implemented incremental doc updates (only re-generate changed sections, not entire articles)
- Moved changelog generation to batch API (overnight processing)
- Reduced few-shot examples from 6 to 2

**Legal Team ($41K → $32K):**
- Upgraded contract analysis from Claude Haiku to Claude Sonnet (quality improvement justified the cost increase for this high-stakes task)
- Downgraded compliance checklist generation from GPT-4o to GPT-4o-mini (simple extraction task)
- Net: quality improved on the critical path while cost decreased on routine tasks

**Customer Success Team ($28K → $19K):**
- Implemented template caching for onboarding guides (70% of guides follow standard templates)
- Added `max_tokens` limits to health report generation
- Moved weekly batch reports to batch API

**Analytics Team ($34K → $20K):**
- Switched report narratives from GPT-4o to GPT-4o-mini (human reviewers couldn't distinguish the outputs)
- Implemented exact-match caching for repeated dashboard queries
- Reduced context window usage by summarizing input datasets before generation

**Internal Tools Team ($17K → $12K):**
- Implemented aggressive caching for Slack bot (many questions are repeated)
- Set token limits on code review output (was generating 2,000+ token reviews for 10-line changes)
- Added a "complexity router" — simple questions to GPT-4o-mini, complex to Claude Sonnet

### Results

| Team | Before | After | Savings | % Reduction |
|------|--------|-------|---------|-------------|
| Marketing | $52,000 | $18,000 | $34,000 | 65% |
| Documentation | $38,000 | $24,000 | $14,000 | 37% |
| Legal | $41,000 | $32,000 | $9,000 | 22% |
| Customer Success | $28,000 | $19,000 | $9,000 | 32% |
| Analytics | $34,000 | $20,000 | $14,000 | 41% |
| Internal Tools | $17,000 | $12,000 | $5,000 | 29% |
| **Organization Total** | **$210,000** | **$125,000** | **$85,000** | **40%** |

| Org-Wide Metric | Before | After | Change |
|-----------------|--------|-------|--------|
| Monthly LLM cost | $210,000 | $125,000 | −40% |
| Cost attribution coverage | 0% | 100% | +100pp |
| Teams with cost dashboards | 0 | 6 | +6 |
| Features with budget guardrails | 0 | 14 | +14 |
| Avg. cost per request (org-wide) | $0.038 | $0.021 | −45% |
| Shadow API keys | 2 | 0 | −100% |
| Independent client wrappers | 4 | 0 (centralized) | Consolidated |
| Time to detect cost anomaly | ~1 week | < 30 minutes | −99% |

**Annualized savings: $1,020,000**

### Lessons Learned

1. **Chargeback is the most powerful optimization lever** — When costs were centralized, no team had incentive to optimize. Within 4 weeks of chargeback, 5 of 6 teams independently started optimization projects. Financial accountability drives behavior far more effectively than mandates.
2. **Start with showback before chargeback** — The 1-quarter showback period was critical: it let teams see their costs, validate data accuracy, and start forming optimization plans before the costs hit their budgets. Jumping straight to chargeback creates backlash.
3. **Teams optimize differently (and that's okay)** — Marketing focused on model downgrading, Documentation focused on batching, Legal focused on quality improvement. Giving teams autonomy over *how* they optimize (within the governance framework) produces better results than top-down mandates.
4. **Centralizing the gateway consolidates hidden costs** — Retiring 4 independent client wrappers and discovering shadow API keys saved engineering time and eliminated $3,200/month in untracked costs.
5. **Some cost increases are justified** — The Legal team's upgrade from Claude Haiku to Claude Sonnet *increased* their cost for contract analysis, but it was the right decision for a high-stakes use case. TokenOps is about optimizing value per dollar, not minimizing cost at all costs.
6. **The "aha moment" matters** — When the Marketing team saw that they were spending $52K/month on email subject lines generated by GPT-4o, the optimization case made itself. Visibility creates urgency.

---

## Case Study 4: AI-Powered Code Review Tool

### Company: CodeLens (Developer Tools, 120 engineers)

**Optimization Result: Predictable costs with budget guardrails + model routing**

---

### Background

CodeLens builds an AI-powered code review tool that integrates with GitHub and GitLab. When a developer opens a pull request, CodeLens analyzes the diff, identifies potential bugs, security vulnerabilities, performance issues, and style violations, and posts review comments directly on the PR. The tool serves 15,000 developers across 800 organizations.

**Architecture:**
```
GitHub/GitLab Webhook → Queue → Code Analysis Service → LLM API → PR Comments
```

**Scale:**
- 45,000 pull requests/day across all tenants
- Each PR generates 1–15 LLM calls depending on diff size and complexity
- Average: 4.2 LLM calls per PR
- Monthly LLM calls: ~5.7M

### Challenge

CodeLens faced a unique cost management challenge: wildly unpredictable costs driven by the variable nature of code reviews.

1. **Extreme cost variance** — A single-file PR with a 10-line change cost $0.02 in tokens, while a large refactoring PR with 50 changed files could cost $8.00+. The 99th percentile PR cost was 400× the median.
2. **Large PRs driving cost spikes** — 2% of PRs accounted for 35% of total LLM cost. These were typically large refactoring PRs, dependency updates, or auto-generated code.
3. **No per-customer cost visibility** — Some enterprise customers submitted 10× more PRs than their plan tier assumed, creating margin-negative accounts
4. **Single model for all review types** — Claude Sonnet was used for everything from simple style checks to complex security analysis
5. **No cost ceiling** — A single large PR could trigger 15 LLM calls at $0.50+ each, and there was no mechanism to limit this

**Monthly Cost Characteristics (Before):**

| Metric | Value |
|--------|-------|
| Total monthly LLM cost | $95,000 (±$25,000 variance) |
| Average cost per PR | $0.50 |
| Median cost per PR | $0.12 |
| P99 cost per PR | $8.20 |
| Cost of top 2% PRs | $33,250 (35% of total) |
| Revenue per customer/month | $15–$200 (tiered) |
| Margin-negative customers | 12% of customer base |

### Solution

#### Step 1: Instrument and Analyze (Weeks 1–2)

- Deployed request tagging: `customer_id`, `repo`, `pr_size={small|medium|large|xlarge}`, `review_type={style|logic|security|performance|architecture}`, `file_count`, `diff_lines`
- Built a cost-per-customer dashboard and a cost distribution analysis
- Discovered the cost distribution was extremely long-tailed:

**PR Cost Distribution:**

| PR Size | % of PRs | Avg Cost/PR | % of Total Cost |
|---------|----------|-------------|-----------------|
| Small (1–50 lines) | 45% | $0.06 | 8% |
| Medium (51–300 lines) | 35% | $0.28 | 28% |
| Large (301–1000 lines) | 15% | $1.20 | 29% |
| X-Large (1000+ lines) | 5% | $4.80 | 35% |

#### Step 2: Model Routing by Review Type (Weeks 2–4)

Implemented a review-type classifier that routes each analysis to the appropriate model:

| Review Type | Model (Before) | Model (After) | Quality Impact | Cost Impact |
|-------------|---------------|---------------|----------------|-------------|
| **Style checks** (formatting, naming, conventions) | Claude Sonnet | GPT-4o-mini | No measurable difference | −92% |
| **Logic review** (bugs, edge cases, error handling) | Claude Sonnet | GPT-4o-mini | −1.2% detection rate (acceptable) | −92% |
| **Security analysis** (vulnerabilities, injection, auth) | Claude Sonnet | Claude Sonnet | No change (kept premium model) | 0% |
| **Performance review** (complexity, memory, efficiency) | Claude Sonnet | GPT-4o | −0.5% detection rate (acceptable) | −17% |
| **Architecture review** (design patterns, abstractions) | Claude Sonnet | Claude Sonnet | No change (kept premium model) | 0% |

**Implementation:** Added a lightweight classifier (rule-based, not LLM) that categorizes each analysis chunk by type based on the code patterns present, then routes to the appropriate model.

**Monthly savings from model routing: $31,000**

#### Step 3: Budget Guardrails per PR (Weeks 3–4)

Implemented per-PR cost limits to cap the extreme tail:

```yaml
budget_guardrails:
  per_pr:
    soft_limit: $2.00    # Alert to the customer
    hard_limit: $5.00    # Stop analysis, summarize what's done so far
    strategy: "progressive_degradation"
    # When approaching limit:
    # 1. Switch remaining files to cheapest model
    # 2. Reduce analysis depth (skip style checks)
    # 3. Summarize remaining files instead of analyzing individually
    # 4. At hard limit, post partial review with explanation
```

**Progressive degradation strategy:** When a large PR approaches the budget limit, the system progressively reduces analysis depth rather than abruptly stopping. This ensures every PR gets a useful review, even if large PRs don't get the full treatment.

**Impact:** P99 cost per PR dropped from $8.20 to $4.50, and P99.9 (previously $15+) was hard-capped at $5.00.

**Monthly savings from guardrails: $12,000**

#### Step 4: Smart Diff Chunking (Week 4–5)

Redesigned how large diffs are processed:

- **Before:** Each changed file was sent as a separate LLM call with the full file context
- **After:** 
  - Group related file changes (same module/package) into a single LLM call
  - For large files: only send the changed hunks ± 20 lines of context (not the entire file)
  - For auto-generated files (detected by path patterns and heuristics): skip LLM analysis entirely, post a standard "auto-generated, skipped" comment
  - For dependency update PRs: summarize the change list and do a single high-level security check instead of analyzing each file

**Monthly savings from smart chunking: $14,000**

#### Step 5: Per-Customer Cost Controls (Weeks 5–6)

Implemented customer-level cost management:

- Set per-customer monthly cost caps based on their plan tier:
  - Free tier: $5/month (10 PRs)
  - Team tier: $50/month
  - Enterprise tier: custom, negotiated
- Built a customer profitability dashboard: revenue vs. LLM cost per customer
- Identified 12% of customers that were margin-negative and adjusted their plan pricing or usage limits
- Implemented usage-based overage billing for enterprise customers exceeding their allocation

### Results

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Monthly LLM cost | $95,000 (±$25K) | $38,000 (±$5K) | −60%, 80% less variance |
| Average cost per PR | $0.50 | $0.20 | −60% |
| Median cost per PR | $0.12 | $0.05 | −58% |
| P99 cost per PR | $8.20 | $4.50 | −45% |
| P99.9 cost per PR | $15.00+ | $5.00 (hard cap) | −67% |
| Cost of top 2% PRs | 35% of total | 18% of total | −49% |
| Margin-negative customers | 12% | 2% | −83% |
| Monthly cost variance | ±26% | ±13% | 50% more predictable |
| Security analysis quality | Baseline | No change | 0% (premium model retained) |
| Overall detection rate | Baseline | −1.8% | Acceptable trade-off |

**Annualized savings: $684,000**

### Lessons Learned

1. **Cost variance is as important as total cost** — CodeLens's core problem wasn't just the $95K/month total; it was the ±$25K unpredictability that made budgeting impossible. Guardrails and progressive degradation reduced variance by 50%, making costs plannable.
2. **Progressive degradation > hard cutoff** — Simply stopping analysis at a budget limit would have degraded user experience for the most important PRs (large refactoring). The progressive strategy ensures every PR gets a useful review while keeping costs bounded.
3. **Not all analysis types need the same model** — Style checks and logic reviews work well with GPT-4o-mini, but security analysis and architecture review genuinely benefit from Claude Sonnet's capabilities. The routing layer lets you invest in quality where it matters most.
4. **Auto-generated code detection saves surprising amounts** — 8% of files in large PRs were auto-generated (protobuf outputs, schema migrations, lock files). Detecting and skipping these files saved $6K/month alone.
5. **Per-customer cost visibility enables pricing fixes** — Without per-customer cost data, CodeLens didn't know 12% of customers were margin-negative. This data enabled pricing adjustments that improved unit economics across the customer base.
6. **Large PRs are a cost design problem, not just an optimization problem** — The solution wasn't just "make large PRs cheaper" but "design a review experience that degrades gracefully under cost constraints." This is a product design decision as much as a cost optimization.

---

## Cross-Case-Study Themes

| Theme | CS 1: HelpFlow | CS 2: DataMesh | CS 3: ContentForge | CS 4: CodeLens |
|-------|----------------|----------------|---------------------|----------------|
| **Largest single optimization lever** | Model tiering (46% of savings) | Model downgrade (53% of savings) | Chargeback (cultural driver) | Model routing (37% of savings) |
| **Time to first savings** | Week 2 | Week 2 | Week 5 (after showback) | Week 3 |
| **Quality impact** | −2.3% (within tolerance) | −1.7pp accuracy | Varies by team | −1.8% detection rate |
| **Implementation effort** | 6 weeks, 2 engineers | 5 weeks, 1.5 engineers | 12 weeks, 1 platform engineer + 6 team leads | 6 weeks, 2 engineers |
| **Annualized savings** | $684K | $967K | $1,020K | $684K |

### Universal Takeaways

1. **Start with visibility** — In every case, the first step was instrumenting and tagging to understand the current state. You cannot optimize what you cannot measure.
2. **Model tiering/routing is always the top lever** — Across all four cases, switching workloads to cheaper models delivered 35–55% of total savings. Always ask: "Does this task really need a premium model?"
3. **Quality gates are non-negotiable** — Every optimization was validated with measurable quality metrics before deployment. Optimizing without quality gates leads to user-facing regressions and eroded trust.
4. **Organizational incentives matter as much as technical solutions** — ContentForge's 40% savings came primarily from chargeback (accountability), not technical optimization. The best tools are useless if teams have no incentive to use them.
5. **Batch everything you can** — DataMesh's 50% savings from batch API migration required zero quality trade-off. If a workload doesn't need real-time response, batch it.
6. **Cost variance is underappreciated** — CodeLens showed that cost *predictability* is as important as cost *reduction*. Budget guardrails and progressive degradation make costs plannable.

---

## Related Resources

- [Implementation Playbook](../../public/templates/implementation-playbook.md) — The 12-week plan followed in these case studies
- [Model Selection Matrix](../../public/templates/model-selection-matrix.md) — The framework used for model tiering decisions
- [Budget Guardrails Config](../../public/templates/budget-guardrails.yaml) — Configuration for the guardrails deployed in Case Study 4
- [Prompt Optimization Checklist](../../public/templates/prompt-optimization-checklist.md) — Used for prompt compression in Case Studies 1 and 2
- [TokenOps Maturity Model](./tokenops-maturity-model.md) — Assess your maturity level and plan your path forward

---

*Case studies version 1.0 — Maintained by the TokenOps team.*
