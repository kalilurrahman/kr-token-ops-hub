# Structured Output & JSON Mode: Cost, Quality, Failure Modes (2026)

*Structured output is now table-stakes. It is also a subtle cost multiplier that most teams do not measure.*

## The three approaches

| Approach | Provider support | Cost impact | Reliability |
|---|---|---|---|
| **Free-form + parse** | All | Baseline | 85–95% (fragile) |
| **JSON mode** | OpenAI, Groq, Together | +0–5% output tokens | 98–99% (valid JSON, schema not guaranteed) |
| **Structured outputs (JSON Schema)** | OpenAI, Anthropic tool-use, Gemini | +5–15% output tokens | 100% schema-conformant |
| **Grammar-constrained** (outlines, xgrammar) | Self-hosted only | +0–3% | 100% |

## Why constrained output can *increase* cost

Provider-managed structured outputs prepend schema compilation. For high-QPS workloads:
- First call with a new schema: 200–500ms compilation.
- Steady-state: ~5% latency overhead, ~5–15% output token overhead.
- Cache eviction (schemas unused for ~1hr): re-compilation on next call.

**Pattern:** for stable schemas at steady QPS, keep them warm with a heartbeat every 30 minutes. For long-tail schemas, use JSON mode + Zod validation instead.

## The retry-loop trap

Free-form output + parse + retry-on-failure is the *most expensive* pattern. Real-world overhead is 1.5–3× at 25% failure rate because retries typically include the failed response as context. Switching to strict structured output pays back within days on any workload with >5% parse failure.

## The schema-size trap

A JSON Schema with 50 fields and descriptions adds ~2000 input tokens per call. At 1M calls/month × $2.50/M input, that is **$5,000/month in schema tokens** — for a schema that could have been compressed to 20 fields.

**Rules:**
- Field names: short but readable.
- Descriptions: only where genuinely needed.
- Enums: use them instead of freeform + validation.
- Nested optionality: flatten where possible.

## When to skip structured output

- Single-field extractions.
- Long narrative output with embedded facts (return prose; extract with a second cheap call).
- User-facing chat.

## The 2026 default

1. Use provider-managed structured outputs.
2. Validate with Zod / Pydantic anyway.
3. Log schema version alongside the request.
4. Alert on schema-drift.

## Observability gap

Standard LLM dashboards do not show `structured_output_overhead_tokens` as a separate line. Add it to your metering pipeline — otherwise it hides as an unexplained 10% output-token growth after a schema migration.
