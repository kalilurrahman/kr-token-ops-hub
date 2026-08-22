# Output Token Control (2026)

Output tokens are the expensive half of the bill — typically 4–8× input rates, and 100% of reasoning tokens are billed at output rates. Controlling generation length is usually the single highest-ROI optimisation after caching.

## 1. Set a real max_tokens

Most teams leave the provider default. Instead:

- Instrument the p99 completion length per endpoint.
- Set `max_tokens` to p99 × 1.2, not to the model maximum.
- Alert when truncation rate exceeds 0.5% — that means the cap is too tight, not that the cap is wrong in principle.

## 2. Ask for the artifact, not the essay

| Instead of | Ask for | Output reduction |
|---|---|---|
| "Explain your reasoning and then answer" | "Answer only. JSON: {answer, confidence}" | 50–80% |
| Full rewritten document | A diff or patch of changed lines | 60–90% |
| Prose classification with justification | Enum label + optional 10-word reason | 70–90% |
| Regenerated table | Only the changed rows, keyed by id | 50–85% |

## 3. Reasoning budget governance

2026 models expose thinking/reasoning effort controls. Treat them as a per-endpoint config, not a global default.

- **Low/none:** extraction, classification, formatting, routing, summarisation.
- **Medium:** multi-step analysis, code review, planning with known structure.
- **High:** novel maths, hard debugging, adversarial planning — a small minority of traffic.

Log reasoning tokens separately from visible output tokens. Programs that don't split these metrics routinely misattribute 30–60% of their spend.

## 4. Structured output economics

Strict schemas add input tokens (the schema) but usually pay for themselves by:

- eliminating preamble ("Sure! Here's the JSON you asked for...") — 20–60 tokens per call,
- removing markdown fences and commentary,
- collapsing the retry loop caused by malformed output.

Rule of thumb: use strict schemas when the schema is under ~40 fields and the endpoint runs more than a few thousand calls/month. Below that, a one-line "respond with JSON only" plus a validator is cheaper.

## 5. Stop sequences and early termination

- Use stop sequences for delimited formats — cheaper and more reliable than trusting the model to stop.
- For streaming UIs, cancel the stream server-side when the client disconnects; abandoned streams are still billed.
- For ranked lists, request top-k explicitly; "list all relevant" is an unbounded bill.

## 6. Retry discipline

A retry doubles the cost of a request and often triples it (longer repair prompt).

- Validate locally before retrying; repair deterministically where possible (trim fences, coerce types).
- Cap retries at 1 for interactive paths, 2 for batch.
- Route the retry to the *same* model with a repair instruction before escalating to a bigger model.
- Track `retry_rate` as a first-class KPI; a healthy production endpoint sits under 2%.

## 7. Verification metrics

Track per endpoint: output tokens p50/p95, reasoning-token share, truncation rate, retry rate, cost per successful outcome (not per call). Cost per successful outcome is the only number that survives a compression-versus-quality argument.
