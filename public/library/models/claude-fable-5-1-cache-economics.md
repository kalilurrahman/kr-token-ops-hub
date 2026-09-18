# Claude Fable 5.1: cache economics for long-running agents

> **Reviewed:** 18/09/2026 · **Status:** Current public platform information · **Audience:** Agent platform owners, architects, FinOps and governance

Claude Fable 5.1 is positioned for demanding coding and knowledge work. Its headline token rate is $10 per million input tokens and $50 per million output tokens, but its distinctive TokenOps lever is a $0.25 per million cache-read rate—75% below the preceding Fable 5 cache-read price according to Anthropic.

## Published price components

| Meter | Price / 1M tokens |
|---|---:|
| Base input | $10.00 |
| 5-minute cache write | $12.50 |
| 1-hour cache write | $20.00 |
| Cache hit / refresh | $0.25 |
| Output | $50.00 |

The cache-write premium means caching is not automatically cheaper. It becomes valuable only when a stable prefix is reused enough times before expiry.

## Break-even analysis

Let `I` be the stable input tokens. Compare uncached input with a cache write followed by reads.

For the 5-minute cache:

```text
uncached N calls = N × I × $10/M
cached N calls   = I × $12.50/M + (N-1) × I × $0.25/M
```

Break-even occurs before the second call:

```text
12.50 + (N-1) × 0.25 < 10N
N > 1.256
```

So two uses within the valid window already win on input cost. For the 1-hour write:

```text
20 + (N-1) × 0.25 < 10N
N > 2.026
```

Three uses within the hour are needed.

For a 200K-token stable prefix reused ten times:

| Strategy | Input cost |
|---|---:|
| No cache | $20.00 |
| 5-minute write + nine reads | $2.95 |
| 1-hour write + nine reads | $4.45 |

This excludes output and any non-cacheable input. The 5-minute option saves 85.3% in this example if the reuse timing is real.

## Design an agent for cache locality

Put stable material before dynamic material:

1. system policy and role;
2. tool schemas in deterministic order;
3. repository map or reference corpus;
4. reusable examples;
5. conversation or task-specific state;
6. the latest user instruction.

Avoid timestamps, random IDs, reordered JSON keys and request-specific metadata inside the stable prefix. A single early difference can reduce reuse.

## Compaction as a second lever

Anthropic's September 2026 API notes describe on-demand conversation compaction in beta. Compaction replaces older messages with a signed summary block while preserving selected recent turns. Treat it as a controlled state transition:

- compact before the context becomes expensive, not only at the hard limit;
- preserve unresolved requirements, decisions, constraints and evidence;
- compare post-compaction task success against a non-compacted control;
- log tokens before and after, compaction frequency and rework rate;
- never assume a shorter context is cheaper if it increases tool calls or retries.

## Agent budget envelope

Each run needs four independent ceilings:

```text
run budget = input + cache writes + cache reads + output + tool fees
```

Also cap:

- maximum turns;
- maximum tool calls by tool type;
- maximum output per turn;
- maximum wall-clock duration;
- maximum failed-action repetitions.

Stop conditions should be deterministic. “Continue until complete” is not a budget policy.

## When Fable 5.1 is economically justified

Use it where the accepted outcome benefits from frontier capability and repeated context:

- long-running coding agents with stable repository guidance;
- research workflows reusing a substantial evidence pack;
- professional analysis where error cost exceeds inference cost;
- high-value agents whose repeated tool schemas and policy blocks cache well.

Route short, routine extraction or tagging elsewhere unless evaluations prove a material quality advantage.

## Operational dashboard

Track these by workflow and prompt version:

| Metric | Why it matters |
|---|---|
| Cache hit ratio | Confirms reuse actually occurs |
| Cache write amortization | Shows reads per write |
| Cost per accepted outcome | Includes retries and quality |
| Output/input cost ratio | Exposes verbose generation |
| Tool calls per outcome | Detects agent loops |
| Compaction savings | Measures tokens removed |
| Post-compaction failure rate | Protects quality |

## Sources

- [Anthropic Claude Fable 5.1 product page](https://www.anthropic.com/claude/fable)
- [Anthropic model pricing](https://docs.anthropic.com/en/docs/about-claude/pricing)
- [Anthropic platform release notes](https://docs.anthropic.com/en/release-notes/api)
- [Claude Fable 5.1 and Mythos 5.1 announcement](https://www.anthropic.com/claude-fable-and-mythos-5-1)

> Validate cache TTLs, eligibility and current prices against the provider documentation before rollout.
