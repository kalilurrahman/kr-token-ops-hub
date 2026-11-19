# Agent loop economics: why long agent runs get expensive

Agents are now the largest single driver of token spend in most AI teams. The reason is structural, not a pricing quirk: **every turn resends the whole transcript**.

## The quadratic shape

If a run starts with `C` tokens of system prompt, tool definitions and task, and each turn adds `A` tokens (tool results plus the model's own output), turn `t` sends `C + A × t` input tokens. Over `T` turns:

```
total input ≈ C × T + A × T × (T − 1) / 2
```

Doubling the number of turns roughly quadruples the transcript part of the bill. A 40-turn run is not twice a 20-turn run — it is closer to four times.

| Turns | Input tokens (C = 8,000, A = 1,900) |
|---|---|
| 10 | 165,500 |
| 20 | 521,000 |
| 40 | 1,802,000 |

## The four controls that matter, in order

1. **Turn budgets.** Cap turns and tool calls per run, and stop on repeated identical tool calls. This bounds `T`, the term that is squared.
2. **Prompt caching.** Keep the stable prefix (system prompt, tool schemas, earlier turns) byte-identical so the provider can bill it at the cached-input rate. Put changing content at the end.
3. **Tool-result trimming.** Return only the fields the agent needs. A 20,000-token log or HTML page added once is resent on every following turn. This shrinks `A`.
4. **Compaction.** Every N turns, replace the transcript with a short summary of state, decisions and open items. This resets the growing term back towards `C`.

## Trade-offs to measure

- Compaction summaries cost tokens and can lose facts the agent later needs; check task success, not only spend.
- Cache writes can carry a premium and caches expire; low-traffic agents may see few hits.
- Turn caps that are too tight raise failure and retry rates, which can cost more than they save.
- Smaller models for sub-steps (search, classification) often beat caching on large runs — route before you optimise.

## How to measure

Track per run: turns, input tokens, cached input tokens, output tokens, tool calls, and outcome (success, failure, escalated). Report **cost per successful task**, not cost per call. Compare a week before and after each control.

Use the **Agent loop cost** calculator on the Calculators page to model your own runs.

*Estimates are illustrative. Verify current provider prices and caching rules before planning budgets.*
