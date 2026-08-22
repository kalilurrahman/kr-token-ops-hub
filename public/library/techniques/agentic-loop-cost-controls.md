# Agentic Loop Cost Controls

Agents re-send their context on every step. A 20-step loop with a growing transcript can cost 30–100× a single call for the same task. These are the controls that keep agentic spend predictable.

## 1. The six hard controls

1. **Step budget.** Hard cap on iterations per task; fail loudly at the cap rather than looping.
2. **Token budget per run.** Track cumulative tokens in the orchestrator and abort on breach.
3. **Wall-clock budget.** Prevents stalled tool calls from burning retries.
4. **Cost ceiling per task and per tenant.** Enforced at the gateway, not in application code.
5. **Loop detection.** Hash (tool, arguments) tuples; abort after 2 identical repeats.
6. **Kill switch.** One flag that disables autonomous runs globally, tested quarterly.

Programs without controls 1 and 5 are the ones that produce five-figure runaway-agent incidents.

## 2. Context inheritance tax

Sub-agents that inherit the parent's full context multiply cost by the fan-out factor.

- Pass a **task brief**, not a transcript: goal, inputs, constraints, output schema.
- Return a **result object**, not a narration.
- Budget context per sub-agent explicitly (e.g. 4k tokens in, 1k out).
- Prefer a shared scratchpad in your own store over re-injecting history.

## 3. Tool schema tax

Every tool definition ships on every step.

- Load tools **by phase**: research tools during research, write tools during editing.
- Trim descriptions to one line plus parameter names; long tool prose is pure recurring cost.
- Consolidate near-duplicate tools; 30 narrow tools cost more than 8 general ones and route worse.
- Keep the tool block in the cached prefix and never reorder it dynamically.

## 4. Planning-to-execution ratio

Healthy agent runs spend most tokens on execution, not deliberation. Track:

```
planning_ratio = planning_tokens / total_tokens
```

Above ~40% usually means the task is under-specified or the reasoning budget is too high for the step type. Use high reasoning for the *plan* step only, then drop to low for execution steps.

## 5. Memory and state

- Persist durable facts to a store; do not keep them in context.
- Summarise completed sub-tasks into 1–3 lines before continuing.
- Reset context at task boundaries — inheritance across unrelated tasks is the most common silent cost driver.

## 6. Estimation discipline

Naive estimates of agentic cost are commonly 5–30× low because they model one call, not the loop. Estimate as:

```
cost ≈ steps × (fixed_prefix × cache_factor + avg_growing_context + avg_output)
```

Validate the estimate against a 50-run pilot before committing a budget.

## 7. Observability requirements

Emit one span per step with: `run_id`, `step_index`, `tool`, `model`, cached/uncached input tokens, output tokens, reasoning tokens, and cumulative run cost. Without `run_id` roll-ups you can see expensive calls but never expensive *tasks* — and tasks are what the business pays for.
