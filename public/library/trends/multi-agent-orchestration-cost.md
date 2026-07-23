# Multi-Agent Orchestration: The 2026 Cost Reality

*Multi-agent systems are 5–15× more expensive per user request than single-agent equivalents. They're worth it — sometimes.*

## The context-inheritance tax

When a supervisor agent spawns three sub-agents, each sub-agent typically inherits:
- The system prompt (2–8K tokens)
- The tool schemas (5–20K tokens)
- The conversation history so far (variable)
- The supervisor's plan / task assignment (0.5–2K tokens)

That prefix is paid **once per sub-agent, per tool call**. A 3-agent system doing 5 tool calls each = **15× the prefix cost** of the same work done sequentially.

## The parallel-vs-serial trade

| Architecture | Latency | Cost | When to use |
|---|---|---|---|
| **Single agent, serial** | High | 1× (baseline) | Simple pipelines; cost-sensitive |
| **Single agent, parallel tools** | Medium | 1.2–1.5× | Independent sub-tasks; same context |
| **Multi-agent, shared context** | Medium | 3–5× | Specialisation matters; context reuse |
| **Multi-agent, isolated context** | Low | 8–15× | True independence; latency-critical |

## Anthropic's published guidance

Anthropic's 2025 multi-agent research report notes that their internal Claude research agent uses **~15× the tokens of a single-agent equivalent** — and they recommend multi-agent only when:
1. The task has genuine parallelism (research, breadth-first search).
2. Sub-tasks are independent enough that context isolation is a feature, not a bug.
3. The user-facing value (latency, quality) justifies the token multiplier.

## The four cost controls

1. **Compress before delegation.** The supervisor should hand each sub-agent a distilled task brief (200–500 tokens), not the full conversation.
2. **Scope tools per sub-agent.** A "search" sub-agent gets search tools only. A "write" sub-agent gets file tools only. Never expose the full toolbox to every agent.
3. **Summarise before aggregation.** Sub-agent outputs get summarised to 500–1000 tokens before the supervisor synthesises. Raw outputs stay in a separate store.
4. **Cap fan-out.** Hard limit on concurrent sub-agents (typically 3–5). Fan-out of 20 sub-agents almost always indicates a design smell.

## When multi-agent is a mistake

- **Sequential workflows dressed as agents.** If step B needs step A's output, it's a pipeline, not a multi-agent system. Use LangGraph nodes, not autonomous agents.
- **Coordination-heavy tasks.** If sub-agents need to negotiate, you're paying inter-agent chatter tokens for no capability gain.
- **Small-context problems.** If the whole task fits in 8K tokens, one agent will do it faster and cheaper.

## The observability minimum

Every span must record: `agent_id`, `parent_agent_id`, `depth`, `tokens_input`, `tokens_output`, `tools_available_count`. Without these five fields you cannot debug why a multi-agent run cost 40× what you expected — the answer is almost always "tool schemas × depth × fan-out".

## Vendor direction

2026 frameworks (LangGraph 0.4+, CrewAI 2.0, Autogen 0.5) now expose **hierarchical context management** as a first-class concept: the parent's context is not automatically inherited; sub-agents receive an explicit `context_view` object the developer defines. This is the correct default. Frameworks that still inherit-by-default are becoming a liability.