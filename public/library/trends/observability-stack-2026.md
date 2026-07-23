# The TokenOps Observability Stack (2026)

*You cannot govern what you cannot see. In 2026 there are five categories of observability tooling — you need at least three.*

## The five categories

| Layer | What it tells you | 2026 leaders |
|---|---|---|
| **LLM tracing** | Prompt/response/tokens per request | Langfuse, Arize Phoenix, LangSmith, Helicone |
| **Gateway metering** | Cost, latency, routing, caching | Portkey, LiteLLM, Kong AI Gateway, Cloudflare AI Gateway |
| **Eval / quality** | Regression scores over time | Braintrust, Promptfoo, Ragas, DeepEval |
| **Cost / FinOps** | Spend attribution, budgets, forecasts | Vantage (AI), Finout, CloudZero AnyCost, native cloud FOCUS |
| **Prod monitoring** | SLA/SLO, incidents, kill-switch | Datadog LLM Obs, New Relic AI, Grafana + Prometheus |

## The must-have span

Every LLM call must emit: `trace_id, request_id, tenant_id, feature_id, model, model_version, provider, input_tokens, cached_input_tokens, output_tokens, reasoning_tokens, cost_usd, latency_ms, ttft_ms, cache_hit, cache_key_hash, tool_calls[], retry_count, prompt_version, schema_version, outcome`.

If your current logging is missing any of these, that is the highest-leverage engineering task in your backlog.

## The build-vs-buy line

| Build | Buy |
|---|---|
| The span-emission wrapper | The tracing UI |
| Tenant/feature attribution rules | The eval framework |
| Kill-switch policy engine | The gateway |
| Cost-per-outcome mapping to KPIs | The dashboard |

## The Langfuse + LiteLLM reference stack

The most-copied 2026 OSS stack: App → LiteLLM proxy → provider, with async spans to Langfuse (Postgres + ClickHouse) and Grafana dashboards. Runs on a $200/month VPS at 10M requests/month.

## The gateway question

If you have >1 model provider OR >1 tenant OR >1 environment, you need a gateway. It gives you cost metering, kill-switches, fallback routing, caching that survives app changes, and consistent auth.

Leaders: **LiteLLM** (OSS, broadest coverage), **Portkey** (best hosted DX), **Cloudflare AI Gateway** (edge apps), **Kong AI Gateway** (if you already run Kong).

## Alerts that actually matter

Stop alerting on absolute cost. Alert on rate-of-change:
- Cost per successful request up >20% week-over-week → routing regression.
- Cache hit rate down >10 points day-over-day → prompt churn.
- Reasoning tokens / output tokens > 5× on any feature → misrouting.
- P95 latency > 30s on any tenant → runaway agent or provider incident.
- Any tenant crossing 90% of monthly budget with >7 days left → burn-rate alert.

These five catch ~80% of production TokenOps incidents.

## The one metric for the CEO dashboard

**Cost per successful outcome** — not cost per token, per call, or per user. Define "successful outcome" per feature. Everything else is engineering noise.
