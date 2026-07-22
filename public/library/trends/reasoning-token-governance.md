# Reasoning Token Governance

Reasoning models (OpenAI o3/o4, GPT-5 reasoning, Claude Extended/Adaptive Thinking, Gemini Deep Think) introduce a new cost dimension that is *invisible* on standard dashboards: **thinking tokens are billed as output tokens**, often at 5–10× input rates.

A 20K-token internal reasoning trace on Claude Opus 4.5 costs **$0.50** — before the model has emitted a single word of visible answer.

## The overspend anecdote

A team enabled Claude Extended Thinking on a support-assistant workload. Latency went from **4 seconds to 47 seconds** per request. Quality improved marginally. The monthly bill roughly doubled. Root cause: reasoning was enabled *uniformly* rather than per-task-difficulty.

## The three overspend patterns

1. **Static high budgets.** `budget_tokens: 32000` set once at prototype time and never revisited as task mix changes.
2. **SDK-default reasoning.** Agent frameworks that enable reasoning by default apply it to trivial classification and complex analysis alike.
3. **Forgetting the output-token rate.** Teams model "thinking cost" as if it were input; it's not. Multiply by the *output* per-M rate.

## The 2026 governance pattern

Move from "budget in tokens" to "effort as an enum" — with per-task routing:

| Task class | Effort | Budget |
|---|---|---|
| Classify, extract, route | `off` | 0 |
| Draft, summarise, translate | `low` | 2–4K |
| Multi-step planning, code | `medium` | 8–16K |
| Research, hard math, ambiguous | `high` / adaptive | 32K+ |

**Anthropic Adaptive Thinking** (Opus 4.6+, Sonnet 5): Claude decides how much to think, replacing hard-coded budgets. This is the direction all vendors are converging on.

**OpenAI `reasoning_effort`** (o3/o4, GPT-5 reasoning): low / medium / high — the same tiered enum pattern.

## Required dashboards

Split your token dashboards by three columns, not one:
- Input (cached)
- Input (uncached)
- Output *including reasoning*

If your dashboard doesn't separate reasoning tokens from visible output tokens, you cannot see the reasoning overspend line item — and you will not manage it.

## Kill-switch heuristics

- Alert when **reasoning tokens / output tokens > 5×** on a given surface (usually means a wrong task class is being routed to a reasoning tier).
- Alert when **P95 latency per request > 30s** and reasoning is enabled (a proxy for adaptive-thinking over-provisioning).
- Enforce a **hard per-request reasoning budget ceiling** at the gateway, independent of caller-provided budgets.
