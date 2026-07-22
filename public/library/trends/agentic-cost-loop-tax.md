# The Loop Tax: Agentic Workflow Cost Patterns

*The fastest-growing cost risk in enterprise AI in 2026 — eclipsing raw model pricing.*

## The core insight

In a 2026 analysis metering **210,840 governed tool calls**, cost was not driven by frontier model prices. It was driven by a structural feature of agent loops: **each tool call re-sends accumulated context**. Cost scales as:

```
cost ≈ loop_count × context_accumulation × per_token_price
```

Cutting the underlying model's per-token price does *not* fix agent budgets if `loop_count × context_accumulation` grows unchecked.

## The 5×–30× estimation error

Teams building multi-turn tool-use agents routinely underestimate cost by **5× to 30×** versus naive math (`calls × per-call cost`). Context re-transmission and retry compounding blow the model up. This is cited as a leading cause behind reports that **~40% of agentic AI pilots are cancelled** before reaching production.

## The $47,000 incident

A production multi-agent LangChain system entered an undetected retry loop and ran for **11 days**. Total unbudgeted spend: **$47,000**, discovered only via the monthly invoice.

Root cause: no per-agent spend limit, no wall-clock timeout, no loop-count ceiling, no kill switch.

## MCP servers: the silent tax

Every Model Context Protocol (MCP) tool exposed to an agent adds its schema/description to every request's input context. A toolbox of 40 MCP tools with 500-token schemas each is **20,000 input tokens on every single turn**, whether those tools get called or not.

**2026 practice:** dynamically scope MCP tools per-request (load only tools relevant to the current task) rather than exposing the full toolbox by default. Gateway vendors are productising this as "MCP tool scoping."

## Required controls (2026 consensus)

These are now infrastructure, not nice-to-haves:

1. **Per-agent / per-session hard spend cap** enforced at the gateway.
2. **Wall-clock timeout** on every agent run (e.g., 5 minutes, extended only with explicit approval).
3. **Loop-count ceiling** (e.g., max 20 tool calls per user request).
4. **Context pruning between tool calls** — summarise or truncate tool results before re-injection.
5. **Real-time kill switch** — a human or automated system must be able to terminate a runaway agent within seconds, not hours.
6. **Cost estimation preview** — surface predicted cost to the user before starting long-running agentic work.

## The Harness Effect

Academic and industry research increasingly formalises that **orchestration architecture, not model choice, sets the token economics of enterprise agentic AI**:

- How the context window is pruned between turns.
- How sub-agents are spawned and their context inherited.
- How tool results are summarised before re-injection.
- Whether the harness supports mid-run cost feedback.

These architectural decisions dominate. The choice between GPT-5 and Claude Opus 4.5 is a rounding error next to a well- versus poorly-designed harness.
