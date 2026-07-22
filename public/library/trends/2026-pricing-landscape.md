# The 2026 LLM Pricing Landscape

*Last updated: July 2026 — pricing changes weekly; treat this as a snapshot, not gospel.*

Frontier model prices have fallen roughly **10× in 18 months** while raw capability keeps climbing. This is the "cost-of-intelligence curve" — and it changes TokenOps math every quarter.

## Per-1M-token pricing snapshot

| Model | Input | Cached Input | Output | Notes |
|---|---|---|---|---|
| **GPT-5** | $1.25 | $0.125 (90% off) | $10 | 400K context; ~55% cheaper than GPT-4o at launch |
| **GPT-5 Mini** | $0.25 | proportional | $2.00 | Default for routine tasks |
| **GPT-5 Nano** | $0.05 | proportional | $0.40 | Classification, extraction, routing |
| **Claude Opus 4.5** | $5 | $0.50 hit / $6.25 5-min write / $10 1-hr write | $25 | **67% price cut vs Opus 4.1** |
| **Claude Sonnet 5** (intro) | $2 | $0.20 hit | $10 | Reverts to $3/$15 after Aug 31 2026 |
| **Claude Haiku 4.5** | $1 | $0.10 hit | $5 | Cheapest current-gen Claude |
| **Gemini 3 Pro** | $2–3.50 (context-tiered) | implicit, automatic | $12–14 | 1M context; implicit caching on 2.5+ |
| **DeepSeek V3.2** | $0.28 | $0.028 (90% off) | $0.42 | Open-weights; aggressive cache pricing |
| **Llama 4** (hosted) | $0.10–0.40 | host-dependent | $0.40–1.20 | Together / Groq / Fireworks / Bedrock |

## The tokenizer inflation trap

Anthropic's newer tokenizer (Opus 4.7+, Sonnet 5, Fable 5) produces **~30% more tokens for the same text**. A headline price cut of 40% shrinks to ~15% real savings once tokenizer inflation is applied.

**Rule:** benchmark cost per *task*, not cost per token. A "cheaper" model that emits 40% more output tokens on your workload isn't cheaper.

## What the price war means for architecture

1. **Assume prices halve every 6–12 months.** Do not lock multi-year budgets to today's per-token rate; lock to *value per useful output*.
2. **Nano/mini tiers are now serious infrastructure.** GPT-5 Nano at $0.05/M input makes previously uneconomic ideas (classify every log line, embed every event) viable.
3. **Cached input is the new base rate.** With 90% cache discounts on GPT-5 and DeepSeek, un-cached prompts are the anomaly to justify — not the default.
4. **Reasoning tiers are the new premium SKU.** Frontier non-reasoning pricing is commoditising; reasoning/thinking modes are where vendors preserve margin.

## Sources

- OpenAI GPT-5 pricing announcements
- Anthropic Claude Opus 4.5 launch (InfoWorld coverage, Nov 2025)
- Google Gemini 3 Pro documentation
- DeepSeek V3.2 launch (VentureBeat, Sept 2025)
- llm-stats.com pricing tracker
