# Cross-Provider Arbitrage Playbook (2026)

*Same-tier models from different providers price differently by 2–5×. Arbitrage is real money — if your architecture can capture it.*

## The current arbitrage matrix (July 2026)

Approximate ranges per 1M tokens for "frontier-adjacent" tiers:

| Tier | Cheapest | Priciest | Spread |
|---|---|---|---|
| **Frontier reasoning** | DeepSeek R2 ($0.55/$2.19) | Claude Opus 4.5 ($5/$25) | ~10× |
| **Frontier general** | DeepSeek V3.2 ($0.28/$0.42) | Claude Sonnet 5 ($3/$15) | ~35× on output |
| **Cheap general** | GPT-5 Nano ($0.05/$0.40) | Haiku 4.5 ($1/$5) | ~12× |
| **Coding-specialised** | Qwen 2.5 Coder 32B (~$0.20) | Claude Opus 4.5 | ~40× |

The output-token spread dominates the bill. Route generation-heavy tasks to the cheapest capable tier; route input-heavy tasks to whichever tier caches best.

## The four arbitrage patterns

1. **Provider-tier arbitrage** — route by task class, not preferred provider. 2026 stacks typically use 3–5 providers concurrently.
2. **Region arbitrage** — Bedrock and Vertex price the same model differently by region. Bedrock cross-region inference (2025+) explicitly enables this.
3. **Batch vs real-time arbitrage** — see the Batch API brief. Same model, 50% off, 24h SLA.
4. **Off-peak arbitrage** — DeepSeek and some regionals price off-peak 50–75% cheaper.

## The routing architecture

Request → cheap classifier SLM (~$0.05/M) → `task_class, size_tier, urgency` → versioned routing table → primary provider (health-checked) → fallback provider.

The classifier is the choke point. A misclassification that sends a hard task to a Nano model, or a trivial task to Opus, wipes the arbitrage gain.

## The negotiation floor

For enterprise-committed spend (>$500K/year), published rates are not final:

| Commit tier | Typical discount |
|---|---|
| $500K–$2M/year | 10–20% |
| $2M–$10M/year | 20–35% |
| $10M+/year | 35–50% + custom SLAs |
| Multi-year | +5–10% |

Always negotiate: floor price, price-parity clause, rate-limit lift, cache-hit accounting.

## The lock-in trap

Arbitrage requires optionality. Avoid:
- Provider-proprietary features on hot paths (Anthropic file API, OpenAI Assistants threads).
- Fine-tunes on non-portable base models.
- Prompt formats that only work on one provider's tokenizer.

**Golden rule:** every hot-path prompt must run against at least two providers in your CI eval.

## The 2026 gateway that makes arbitrage automatic

LiteLLM, Portkey, Cloudflare AI Gateway, and Kong now support **cost-aware fallback routing** — define a preference list per task class; the gateway picks the cheapest healthy provider. Programs that adopt this report an additional 15–25% cost reduction on top of existing routing gains.
