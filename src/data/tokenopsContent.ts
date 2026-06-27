/**
 * TokenOps Content Library — exhaustive token & credit optimization knowledge base.
 * Single source of truth consumed by the Optimize hub, Tool Guides, Techniques,
 * Caveman, Templates, Comparison, Checklists and Glossary pages.
 *
 * Framework-agnostic typed data. No runtime dependencies.
 * Last reviewed: June 2026.
 */

export type Effort = "Low" | "Medium" | "High";
export type Impact = "Low" | "Medium" | "High" | "Very High";

export interface Technique {
  id: string;
  name: string;
  category:
    | "Context Engineering"
    | "Caching"
    | "Model Strategy"
    | "Prompt Craft"
    | "Retrieval"
    | "Output Control"
    | "Agentic Workflow"
    | "FinOps & Governance";
  summary: string;
  how: string[];
  typicalSavings: string;
  effort: Effort;
  impact: Impact;
  appliesTo: string[]; // tool / surface tags
  pitfalls?: string;
}

export interface ToolGuide {
  id: string;
  name: string;
  tagline: string;
  unit: "tokens" | "credits" | "messages" | "characters" | "requests";
  bestFor: string;
  keyLevers: { title: string; detail: string }[];
  doThis: string[];
  avoidThis: string[];
  proTip: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  useWhen: string;
  body: string;
}

export interface ComparisonRow {
  provider: string;
  cachedReadDiscount: string;
  cacheWriteCost: string;
  cacheMinTokens: string;
  ttl: string;
  batchDiscount: string;
  notes: string;
}

export interface ChecklistGroup {
  id: string;
  title: string;
  items: string[];
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

/* ------------------------------------------------------------------ */
/* 1. CORE TECHNIQUES CATALOG                                          */
/* ------------------------------------------------------------------ */

export const techniques: Technique[] = [
  {
    id: "prompt-caching",
    name: "Prompt caching (stable prefixes)",
    category: "Caching",
    summary:
      "Reuse an unchanged prompt prefix instead of re-paying to process it. The single highest-leverage lever for repeated or multi-turn workloads.",
    how: [
      "Put the most stable content FIRST: system prompt, role, policies, tool definitions, large reference docs.",
      "Put the volatile, per-request content (the user's actual question) LAST.",
      "Keep the prefix byte-identical across calls — even a date or whitespace change busts the cache.",
      "On Claude, mind the 5-minute TTL (early-2026 change): fire a lightweight keepalive every ~4 min for high-value caches, or pay for the 1-hour TTL when the workload warrants it.",
    ],
    typicalSavings: "Cached reads cost ~90% less (Claude & Gemini); 50–90% less (OpenAI).",
    effort: "Low",
    impact: "Very High",
    appliesTo: ["Claude API", "OpenAI API", "Gemini API", "Bedrock", "Vertex AI"],
    pitfalls:
      "Cache writes cost MORE than base input (Claude: +25% for 5-min, +100% for 1-hour). Caching only pays off when the prefix is reused enough times within the TTL.",
  },
  {
    id: "caveman-compression",
    name: "Caveman / semantic compression",
    category: "Prompt Craft",
    summary:
      "Strip grammatical scaffolding (articles, auxiliary verbs, pronouns, intensifiers) while preserving the load-bearing words (nouns, verbs, numbers, names, technical terms).",
    how: [
      "Apply to system messages, few-shot examples, chat logs, and reference docs you re-feed each session.",
      "Keep: nouns, main verbs, meaningful adjectives, numbers, uncertainty qualifiers, critical prepositions, time/frequency markers, names, technical terms.",
      "Drop: articles (a/the), auxiliary verbs, redundant prepositions, pronouns, pure intensifiers.",
      "Pair with prompt caching — compress the doc once, cache the compressed version, reuse cheaply.",
    ],
    typicalSavings: "14–21% on real coding tasks; up to 39–45% vs a plain 'be terse' instruction.",
    effort: "Low",
    impact: "Medium",
    appliesTo: ["Any chat", "Agent pipelines", "RAG context"],
    pitfalls:
      "Avoid on nuanced reasoning, legal/medical precision, or creative writing where grammar carries meaning. Best for directive tasks: code gen, data transforms, classification.",
  },
  {
    id: "model-routing",
    name: "Model routing & tiering",
    category: "Model Strategy",
    summary:
      "Match model power to task difficulty. Use budget models for classification, extraction and drafting; reserve flagships for hard reasoning.",
    how: [
      "Classify each request's complexity (cheaply, with a small model or rules) before choosing a model.",
      "Default to the cheapest tier that passes your quality bar; escalate only on failure or low confidence.",
      "In agent stacks, route subagent/tool work to cheap models — agent teams burn ~7x more tokens than single sessions.",
      "Examples: Claude Haiku → Sonnet → Opus; Gemini Flash → Pro; GPT-5.x Nano/Mini → full.",
    ],
    typicalSavings: "Budget tiers cost 15–50x less than flagships; blended spend often drops 40–60%.",
    effort: "Medium",
    impact: "Very High",
    appliesTo: ["All providers", "Agent frameworks", "Cursor", "Copilot"],
  },
  {
    id: "context-editing",
    name: "Context editing / pruning",
    category: "Context Engineering",
    summary:
      "Remove stale tool results and thinking blocks once they are no longer relevant, instead of carrying them forward every turn.",
    how: [
      "Prune old tool outputs, logs, and intermediate reasoning that no longer affect the next step.",
      "On Claude, use built-in context editing thresholds; in your own apps, trim the message array before each call.",
      "Keep structural anchors (task, constraints, current state) — drop the exhaust.",
    ],
    typicalSavings: "Cuts carried context 30–70% in long agent loops.",
    effort: "Medium",
    impact: "High",
    appliesTo: ["Claude", "Custom agents", "LangGraph-style loops"],
  },
  {
    id: "compaction",
    name: "Compaction / history summarization",
    category: "Context Engineering",
    summary:
      "Condense earlier conversation into a short summary so the thread can continue without re-sending the full transcript.",
    how: [
      "Summarize at a threshold (e.g. 60–70% of window) into a compact state object.",
      "Claude Code: run /compact at natural breakpoints; /clear between unrelated tasks.",
      "Persist a 'handoff' summary (decisions, open questions, current files) and drop raw history.",
    ],
    typicalSavings: "Keeps long sessions inside a small window; avoids quadratic context growth.",
    effort: "Low",
    impact: "High",
    appliesTo: ["Claude Code", "ChatGPT", "Custom chat apps"],
  },
  {
    id: "rag-not-stuffing",
    name: "Retrieve, don't stuff",
    category: "Retrieval",
    summary:
      "Feed only the relevant chunks via RAG instead of pasting whole documents or codebases into the prompt.",
    how: [
      "Index your corpus; retrieve top-k relevant chunks per query.",
      "Tune k and chunk size — more is not better; it adds tokens and dilutes attention.",
      "Let a small model reason over retrieved context instead of fine-tuning or prompting a giant model on everything.",
    ],
    typicalSavings: "30–50% lower per-request cost vs context stuffing.",
    effort: "High",
    impact: "Very High",
    appliesTo: ["Production apps", "Knowledge assistants", "Support bots"],
  },
  {
    id: "prompt-compression",
    name: "Prompt compression (LLMLingua-style)",
    category: "Prompt Craft",
    summary:
      "Use a compressor model to drop low-information tokens from long prompts/retrieved chunks while preserving answerability.",
    how: [
      "Run retrieved RAG chunks through a compressor before sending to the expensive model.",
      "Compress few-shot example banks aggressively; they are mostly redundant.",
      "Validate answer quality on a held-out set before raising compression ratio.",
    ],
    typicalSavings: "2–20x prompt reduction on RAG-heavy pipelines.",
    effort: "High",
    impact: "High",
    appliesTo: ["RAG pipelines", "API products"],
  },
  {
    id: "semantic-cache",
    name: "Semantic caching (app-level)",
    category: "Caching",
    summary:
      "Match semantically similar queries to a cached answer and skip the model call entirely.",
    how: [
      "Embed incoming queries; if cosine similarity to a prior query exceeds a threshold, return the cached answer.",
      "Great for FAQ-shaped traffic, repeated support questions, and common classifications.",
      "Set TTL and invalidation rules so answers don't go stale.",
    ],
    typicalSavings: "Eliminates 100% of cost on cache hits; hit rates of 20–60% common in FAQ traffic.",
    effort: "Medium",
    impact: "High",
    appliesTo: ["Production apps", "Redis/vector cache"],
  },
  {
    id: "batch-api",
    name: "Batch / async processing",
    category: "Model Strategy",
    summary:
      "Send non-urgent work through batch endpoints for a flat discount.",
    how: [
      "Queue offline jobs (evals, enrichment, backfills, summaries) to the Batch API.",
      "OpenAI & Anthropic batch ≈ 50% off; stacks with prompt caching.",
      "Accept up-to-24h turnaround (most finish in 1–6h).",
    ],
    typicalSavings: "50% off input+output; up to ~75% when stacked with caching.",
    effort: "Low",
    impact: "High",
    appliesTo: ["OpenAI Batch", "Anthropic Batch", "Vertex batch"],
  },
  {
    id: "output-control",
    name: "Output control",
    category: "Output Control",
    summary:
      "Output tokens are usually the priciest. Cap and shape them.",
    how: [
      "Set max_tokens / max_output_tokens to a real ceiling.",
      "Ask for terse answers and a specific format; forbid preamble and restated questions.",
      "Use structured output / JSON schema and stop sequences to end generation early.",
      "Disable verbose chain-of-thought when the task doesn't need it; enable extended thinking only when it pays.",
    ],
    typicalSavings: "20–60% on output spend.",
    effort: "Low",
    impact: "High",
    appliesTo: ["All providers"],
  },
  {
    id: "instruction-files",
    name: "Persistent instruction files",
    category: "Context Engineering",
    summary:
      "Encode conventions once in a project memory file instead of repeating them in every prompt.",
    how: [
      "Claude Code: CLAUDE.md. Cursor: .cursor/rules (.cursorrules). Copilot: .github/copilot-instructions.md. Agents: AGENTS.md.",
      "Keep them lean — they ride in context on every call.",
      "Store stable architecture, naming, and 'do/don't' rules; not volatile task detail.",
    ],
    typicalSavings: "Removes repeated boilerplate from every prompt; improves first-pass accuracy.",
    effort: "Low",
    impact: "Medium",
    appliesTo: ["Claude Code", "Cursor", "Copilot", "Coding agents"],
  },
  {
    id: "few-shot-diet",
    name: "Few-shot diet",
    category: "Prompt Craft",
    summary:
      "Use the fewest, shortest examples that hit your quality bar — and cache them.",
    how: [
      "Trim example count; test where quality plateaus.",
      "Move the example bank into a cached system prefix so you pay for it once per TTL.",
      "Prefer one excellent example over five mediocre ones.",
    ],
    typicalSavings: "Often halves prompt size on classification/extraction tasks.",
    effort: "Low",
    impact: "Medium",
    appliesTo: ["Classification", "Extraction", "Structured tasks"],
  },
  {
    id: "diff-not-whole",
    name: "Send diffs, not whole files",
    category: "Context Engineering",
    summary:
      "Reference or diff instead of re-pasting entire files/datasets each turn.",
    how: [
      "Share only the changed lines or a pointer/path the agent can read on demand.",
      "Strip comments, minify JSON, and dedupe boilerplate where safe.",
      "Use tool-based file reads so the model pulls only what it needs.",
    ],
    typicalSavings: "Large in coding loops where files are otherwise re-sent every turn.",
    effort: "Low",
    impact: "Medium",
    appliesTo: ["Cursor", "Claude Code", "Copilot", "Custom agents"],
  },
  {
    id: "agent-budgets",
    name: "Agent token budgets & guardrails",
    category: "Agentic Workflow",
    summary:
      "Cap loops, steps, and tool calls so a runaway agent can't silently burn a fortune.",
    how: [
      "Set max-steps, max-tool-calls, and a hard token budget per task.",
      "Add early-exit on success and confidence checks before escalation.",
      "Log per-task token spend and alert on outliers.",
    ],
    typicalSavings: "Prevents tail-risk blowouts; agent runs use ~7x tokens unguarded.",
    effort: "Medium",
    impact: "High",
    appliesTo: ["Agent frameworks", "Multi-agent systems"],
  },
  {
    id: "distillation",
    name: "Distillation & small fine-tunes",
    category: "Model Strategy",
    summary:
      "Train a small model on your repetitive task using flagship outputs, then serve the cheap model.",
    how: [
      "Collect high-quality flagship outputs for a narrow, high-volume task.",
      "Fine-tune a lightweight model (or distill) and route that traffic to it.",
      "Keep the flagship as a fallback for low-confidence cases.",
    ],
    typicalSavings: "10–50x on the distilled slice of traffic.",
    effort: "High",
    impact: "High",
    appliesTo: ["High-volume narrow tasks", "Self-host / managed fine-tune"],
  },
  {
    id: "finops-metering",
    name: "Metering, tagging & dashboards",
    category: "FinOps & Governance",
    summary:
      "You can't optimize what you can't see. Tag every call by feature/team/use-case and watch unit economics.",
    how: [
      "Attach metadata (feature, team, customer, env) to every request.",
      "Track cost per 1K calls, tagging coverage %, and budget utilization %.",
      "Set budgets and anomaly alerts; review in regular FinOps cadences.",
    ],
    typicalSavings: "Indirect but compounding — surfaces the waste the other levers fix.",
    effort: "Medium",
    impact: "High",
    appliesTo: ["Org-wide", "Platform teams"],
  },
];

/* ------------------------------------------------------------------ */
/* 2. PER-TOOL GUIDES                                                  */
/* ------------------------------------------------------------------ */

export const toolGuides: ToolGuide[] = [
  {
    id: "claude",
    name: "Claude & Claude Code",
    tagline: "Cache hard, prune often, tier your models.",
    unit: "tokens",
    bestFor: "Long-context reasoning, agentic coding, tool use.",
    keyLevers: [
      { title: "Prompt caching", detail: "Cached reads ~90% cheaper. Writes cost +25% (5-min TTL) or +100% (1-hour TTL). Mind the 5-min default since early 2026." },
      { title: "Keepalive ping", detail: "For high-value caches, send a tiny request every ~4 min to keep the 5-min cache warm." },
      { title: "Context editing", detail: "Auto-prune stale tool results & thinking blocks at configurable thresholds." },
      { title: "Compaction", detail: "Use /compact at breakpoints and /clear between unrelated tasks in Claude Code." },
      { title: "Model tiers", detail: "Plan/triage with Haiku, build with Sonnet, escalate hard reasoning to Opus." },
      { title: "Batch API", detail: "~50% off for offline jobs; stacks with caching." },
    ],
    doThis: [
      "Front-load stable system prompt, policies, and tool defs so they cache.",
      "Keep a tight CLAUDE.md with architecture & conventions; avoid bloating it.",
      "Use subagents for parallel work but route them to cheaper models.",
      "Turn extended thinking on only for genuinely hard steps.",
    ],
    avoidThis: [
      "Editing the cached prefix (dates, whitespace) — it busts the cache.",
      "Carrying every tool output forward for the whole session.",
      "Running Opus for boilerplate edits.",
    ],
    proTip: "Stability is the whole game for caching: same instructions, same attached context, same thread. Caching rewards sameness.",
  },
  {
    id: "lovable",
    name: "Lovable",
    tagline: "Plan outside, build in batches, edit visually for free.",
    unit: "credits",
    bestFor: "Full-stack app building with no/low code.",
    keyLevers: [
      { title: "Chat mode", detail: "Talk through and plan changes (inspect files, logs, DB) before spending build credits." },
      { title: "Visual / Manual edits", detail: "Text, colors, spacing and styling tweaks are free — don't spend a generation on them." },
      { title: "Batch edits", detail: "One precise prompt instead of ten follow-ups about the same button." },
      { title: "External drafting", detail: "Architect and write detailed prompts in Claude/ChatGPT first, then paste the finalized prompt in." },
    ],
    doThis: [
      "Write one comprehensive, specific prompt per feature with acceptance criteria.",
      "Use Chat mode to plan; commit credits only when the plan is clear.",
      "Keep a project knowledge/PRD so the AI stops re-deriving context.",
      "Revert to a known-good checkpoint instead of prompting your way out of a broken state.",
    ],
    avoidThis: [
      "Dripping many tiny prompts — each is a separate credit-burning cycle.",
      "Asking for vague 'make it nicer' changes that trigger broad regenerations.",
      "Using build credits for styling you could do in Visual Edits.",
    ],
    proTip: "The cheapest Lovable credit is the one you never spend: every minute of planning in a free chat saves an iteration loop.",
  },
  {
    id: "openai",
    name: "ChatGPT & OpenAI API",
    tagline: "Right model, cached prefix, batch the rest.",
    unit: "tokens",
    bestFor: "General assistants, structured extraction, high-volume API workloads.",
    keyLevers: [
      { title: "Auto prompt caching", detail: "Repeated prefixes discounted ~50–90% automatically — structure prompts to maximize hits." },
      { title: "Batch API", detail: "Flat 50% off input+output for <24h jobs; stacks with caching for ~75%." },
      { title: "Model picker", detail: "Use Instant/Mini/Nano tiers for routine work; reserve reasoning (o-series) for hard problems." },
      { title: "Memory & custom instructions", detail: "Store durable preferences once instead of re-stating them each chat." },
      { title: "Projects", detail: "Keep shared context in a Project so it isn't re-pasted per conversation." },
    ],
    doThis: [
      "Put system + reference content first; keep it identical across calls.",
      "Use structured outputs + max_tokens + stop sequences to cap output.",
      "Move evals/enrichment/backfills to Batch.",
    ],
    avoidThis: [
      "Defaulting every call to the flagship reasoning model.",
      "Re-pasting the same standing instructions in every message instead of using memory/custom instructions.",
    ],
    proTip: "Output tokens dominate cost on chatty tasks — a 'be concise, no preamble, answer only' instruction is free money.",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    tagline: "Lean on implicit caching; go explicit for high-reuse big contexts.",
    unit: "tokens",
    bestFor: "Very long context (up to 1M+), document-heavy workloads.",
    keyLevers: [
      { title: "Implicit caching", detail: "On by default for 2.5+ models, ~90% off cached tokens, no storage cost. Put large/common content at the start; send similar-prefix requests close in time." },
      { title: "Explicit caching", detail: "Guaranteed 90% (2.5+) / 75% (2.0) discount on referenced context; has storage cost; min ~2,048 tokens." },
      { title: "Flash vs Pro", detail: "Draft/route on Flash; reserve Pro for genuinely hard or long-reasoning tasks." },
    ],
    doThis: [
      "Lead prompts with the big shared document, then the per-request question.",
      "Use explicit caching when one big context is reused many times within ~an hour (especially on Pro).",
      "Batch similar requests together to land implicit cache hits.",
    ],
    avoidThis: [
      "Paying to store an explicit cache you only hit a couple of times — implicit usually wins on Flash.",
      "Shuffling the order of your context between calls (breaks prefix hits).",
    ],
    proTip: "On Flash, implicit caching captures most of the upside for free; reserve explicit caching for Pro-tier, high-reuse contexts.",
  },
  {
    id: "cursor",
    name: "Cursor",
    tagline: "Precise @-context beats whole-codebase context.",
    unit: "requests",
    bestFor: "Repo-aware AI coding inside the editor.",
    keyLevers: [
      { title: "@ mentions", detail: "Reference exactly what's needed: @file, @folder, @docs, @web — instead of broad @codebase." },
      { title: "Rules (.cursor/rules)", detail: "Encode conventions once; they persist across sessions and cut repeated instruction tokens." },
      { title: "Model selection", detail: "Pick cheaper models for routine edits; save premium models for hard changes." },
      { title: "Context window indicator", detail: "Watch it; start a fresh chat when context bloats." },
    ],
    doThis: [
      "Scope context tightly with @file/@folder for the task at hand.",
      "Keep rules lean and specific (frameworks, naming, patterns).",
      "Open a new chat for a new task instead of dragging stale context.",
    ],
    avoidThis: [
      "Reaching for @codebase when two files would do.",
      "Letting one mega-thread accumulate the whole day's context.",
    ],
    proTip: "Encode project guidance once in rules rather than repeating it in every prompt — it's the .cursorrules tax break.",
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    tagline: "Ambient repo context + instruction files + budgeted premium requests.",
    unit: "requests",
    bestFor: "In-IDE completions and chat tied to the GitHub ecosystem.",
    keyLevers: [
      { title: "Custom instructions", detail: ".github/copilot-instructions.md gives persistent project guidance." },
      { title: "Ambient context", detail: "Copilot pulls PRs, issues, and Actions context — lean on it instead of pasting." },
      { title: "Premium request budget", detail: "Track premium-request usage; route routine asks to included models." },
    ],
    doThis: [
      "Maintain a clear instructions file so completions follow your patterns.",
      "Let issue/PR context do the explaining instead of re-describing the codebase.",
    ],
    avoidThis: [
      "Spending premium requests on trivial completions.",
    ],
    proTip: "Copilot's edge is ambient context — reference the PR/issue rather than re-pasting why the code exists.",
  },
  {
    id: "media-tools",
    name: "Beyond coding: video, audio, text & productivity",
    tagline: "Credit economics mirror token economics.",
    unit: "credits",
    bestFor: "Generative media (Runway/Sora/Pika/Kling), voice (ElevenLabs), research (Perplexity), and productivity AI (Notion, Zapier/Make).",
    keyLevers: [
      { title: "Draft cheap, finish expensive", detail: "Generate drafts at low resolution / short duration / cheap models; only spend full quality on the keeper." },
      { title: "Lock the seed", detail: "Reuse seeds/prompts so you iterate on one variable instead of re-rolling the whole generation." },
      { title: "Chunk & batch", detail: "Voice/transcription bill by characters/minutes — chunk long inputs, batch jobs, and cache reusable clips." },
      { title: "Smallest sufficient model", detail: "Perplexity/Notion/agents: pick the concise/standard model unless the task truly needs the heavy one." },
    ],
    doThis: [
      "Plan the shot/script before generating; storyboard in text (free) first.",
      "Keep a library of approved outputs to reuse instead of regenerating.",
      "Lower iterations/quality during exploration; raise only for final renders.",
    ],
    avoidThis: [
      "Re-rendering full-quality video to tweak one detail.",
      "Re-synthesizing entire narrations to fix one line — regenerate only the changed segment.",
    ],
    proTip: "Whatever the unit — tokens, credits, characters, render-minutes — the same four moves win: plan first, pick the smallest sufficient model, reuse outputs, and batch.",
  },
];

/* ------------------------------------------------------------------ */
/* 3. CAVEMAN DEEP DIVE                                                */
/* ------------------------------------------------------------------ */

export const caveman = {
  what:
    "Caveman is a rule-based semantic compression style: write to the model in terse, telegram-like language that drops grammatical filler while keeping every load-bearing word. Think 'cave drawing,' not 'essay.'",
  keepList: [
    "Nouns & main verbs",
    "Numbers & units",
    "Names & technical terms",
    "Meaningful adjectives",
    "Uncertainty qualifiers (maybe, likely, ~)",
    "Time/frequency markers (daily, by Friday)",
    "Critical prepositions that change meaning",
  ],
  dropList: [
    "Articles (a, an, the)",
    "Auxiliary verbs (is, are, will, have)",
    "Pronouns (it, they, this)",
    "Redundant prepositions",
    "Pure intensifiers (very, really, quite)",
    "Politeness padding & restated context",
  ],
  savings:
    "Realistic: 14–21% on real coding tasks across Claude Sonnet/Opus. Up to 39–45% fewer output tokens versus a plain 'be terse' instruction. Some directive tasks report ~60%.",
  whenToUse: [
    "Interactive chat where prompt caching makes the economics favorable.",
    "Agent pipelines where verbose intermediate output compounds across steps.",
    "Directive tasks with clear inputs/outputs: code gen, data transforms, classification.",
  ],
  whenNotToUse: [
    "Nuanced reasoning or persuasion where grammar carries the argument.",
    "Legal, medical, or financial precision where ambiguity is dangerous.",
    "Creative writing where voice and rhythm matter.",
  ],
  example: {
    before:
      "Could you please take a look at this function and let me know if there are any bugs in it, and if so, could you also explain what is causing them and how I might be able to fix them?",
    after: "Review function. List bugs + root cause + fix.",
  },
  skillSnippet: `# Caveman compression — paste as a system/style instruction
Compress my prompts and your reasoning to "caveman" style.
KEEP: nouns, verbs, numbers, names, technical terms, uncertainty, time markers.
DROP: articles, auxiliaries, pronouns, redundant prepositions, intensifiers, padding.
Preserve all facts and constraints. Stay unambiguous. Do not compress final user-facing prose unless asked.`,
};

/* ------------------------------------------------------------------ */
/* 4. COPY-PASTE PROMPT TEMPLATES                                      */
/* ------------------------------------------------------------------ */

export const templates: PromptTemplate[] = [
  {
    id: "cache-scaffold",
    title: "Cache-friendly system scaffold",
    useWhen: "Any repeated or multi-turn API workload.",
    body: `[STABLE — cache this prefix, keep byte-identical]
Role: <assistant role>
Policies: <rules, tone, refusals>
Tools: <tool/function definitions>
Reference: <large doc / schema / examples>

[VOLATILE — changes per request, place last]
User request: {{input}}`,
  },
  {
    id: "router",
    title: "Model-routing decision",
    useWhen: "Choosing the cheapest model that will still pass.",
    body: `Classify this task's difficulty as SIMPLE | MODERATE | HARD.
SIMPLE = extraction/classification/format → cheapest tier.
MODERATE = standard coding/writing → mid tier.
HARD = multi-step reasoning/novel design → flagship.
Return only the label and the chosen model.
Task: {{task}}`,
  },
  {
    id: "output-control",
    title: "Output control snippet",
    useWhen: "Chatty tasks where output tokens dominate.",
    body: `Answer only. No preamble, no restating the question, no summary.
Format: {{format e.g. JSON matching schema X}}.
Max length: {{n}} tokens. Stop when complete.`,
  },
  {
    id: "lovable-plan",
    title: "Plan-before-build (draft in Claude/ChatGPT, paste to Lovable)",
    useWhen: "Before spending Lovable credits on a feature.",
    body: `You are my app architect. Produce a single Lovable build prompt for:
<feature description>.
Include: data model, components, states/edge cases, acceptance criteria,
and explicit 'do NOT touch' areas. Keep it specific enough to build in one pass.`,
  },
  {
    id: "compaction",
    title: "Compaction / handoff summary",
    useWhen: "A long session is approaching the context limit.",
    body: `Summarize this session into a compact handoff:
- Goal & constraints
- Decisions made (with rationale)
- Current state (files/data touched)
- Open questions / next step
Drop raw logs and resolved detours. Be terse.`,
  },
  {
    id: "rag-trim",
    title: "RAG context-trim instruction",
    useWhen: "Long retrieved chunks inflating the prompt.",
    body: `From the context below, keep only sentences needed to answer the question.
Discard background, repetition, and unrelated detail. Then answer.
Question: {{q}}
Context: {{chunks}}`,
  },
  {
    id: "claude-md",
    title: "CLAUDE.md / AGENTS.md starter",
    useWhen: "Setting up a coding-agent project memory.",
    body: `# Project conventions
Stack: <framework, language, key libs>
Structure: <where things live>
Naming: <conventions>
Do: <patterns to follow>
Don't: <anti-patterns, files to avoid>
Testing: <how to run/verify>
Keep this file lean — it rides in context on every call.`,
  },
  {
    id: "cursorrules",
    title: ".cursor/rules starter",
    useWhen: "Standing guidance for Cursor.",
    body: `- Framework: <X>. Prefer <patterns>.
- Naming: <conventions>.
- Always: <e.g. typed props, error handling>.
- Never: <e.g. inline styles, any-types>.
- Scope context with @file/@folder; avoid @codebase unless necessary.`,
  },
];

/* ------------------------------------------------------------------ */
/* 5. PROVIDER COMPARISON                                              */
/* ------------------------------------------------------------------ */

export const comparison: ComparisonRow[] = [
  {
    provider: "Claude (Anthropic)",
    cachedReadDiscount: "~90% cheaper reads",
    cacheWriteCost: "+25% (5-min) / +100% (1-hr)",
    cacheMinTokens: "Model-dependent",
    ttl: "5 min default (since early 2026) / 1 hr option",
    batchDiscount: "~50%",
    notes: "Workspace-level cache isolation. Keepalive pings keep 5-min caches warm.",
  },
  {
    provider: "OpenAI",
    cachedReadDiscount: "~50–90% on cached input",
    cacheWriteCost: "No surcharge (automatic)",
    cacheMinTokens: "~1,024 tokens",
    ttl: "Short, automatic",
    batchDiscount: "50% (input+output)",
    notes: "Caching is automatic for repeated prefixes; Batch stacks for ~75% total.",
  },
  {
    provider: "Gemini (Google)",
    cachedReadDiscount: "~90% (implicit & explicit on 2.5+)",
    cacheWriteCost: "Implicit: none. Explicit: storage cost",
    cacheMinTokens: "~2,048 tokens",
    ttl: "Implicit: short/auto. Explicit: you set it",
    batchDiscount: "~50% (batch mode)",
    notes: "Implicit on by default; explicit for guaranteed high-reuse savings.",
  },
];

/* ------------------------------------------------------------------ */
/* 6. CHECKLISTS                                                       */
/* ------------------------------------------------------------------ */

export const checklists: ChecklistGroup[] = [
  {
    id: "preflight",
    title: "Before a session",
    items: [
      "Pick the smallest model that can plausibly do the job.",
      "Draft and refine the prompt in a free chat before spending paid credits.",
      "Load standing rules via instruction file (CLAUDE.md / .cursorrules), not the prompt.",
      "Decide what context is actually needed — nothing more.",
    ],
  },
  {
    id: "per-prompt",
    title: "Every prompt",
    items: [
      "Stable content first, volatile content last (cache-friendly order).",
      "Ask for terse output, a fixed format, and no preamble.",
      "Cap output length / set max_tokens.",
      "Reference or diff instead of re-pasting whole files.",
    ],
  },
  {
    id: "production",
    title: "Production / API",
    items: [
      "Enable prompt caching and structure prompts to maximize hit rate.",
      "Route by task complexity; escalate only on low confidence.",
      "Move non-urgent jobs to Batch.",
      "Add a semantic cache for repetitive query shapes.",
      "Set agent step/tool/token budgets and early-exit on success.",
    ],
  },
  {
    id: "governance",
    title: "FinOps & governance",
    items: [
      "Tag every call by feature/team/use-case (target: high tagging coverage %).",
      "Track cost per 1K calls and budget utilization %.",
      "Set budgets and anomaly alerts.",
      "Review token economics in a regular cadence; fold it into architecture decisions.",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* 7. GLOSSARY                                                         */
/* ------------------------------------------------------------------ */

export const glossary: GlossaryTerm[] = [
  { term: "Token", definition: "The unit LLMs read and bill on — roughly ¾ of a word in English. Input and output tokens are usually priced differently (output costs more)." },
  { term: "Context window", definition: "The maximum tokens a model can consider at once (e.g. 200K for Claude, 272K input for GPT-5 family, 1M+ for Gemini)." },
  { term: "Prompt caching", definition: "Reusing the processed form of a stable prompt prefix so repeated calls skip re-computing it — typically ~90% cheaper on cached reads." },
  { term: "TTL", definition: "Time-to-live: how long a cache entry stays valid. Claude's default dropped to 5 minutes in early 2026 (1-hour option exists)." },
  { term: "Context editing", definition: "Pruning stale tool results and thinking blocks from the running context instead of carrying them forward." },
  { term: "Compaction", definition: "Summarizing earlier conversation into a compact state so the thread can continue without the full transcript." },
  { term: "RAG", definition: "Retrieval-Augmented Generation: fetch only relevant chunks and feed those, instead of stuffing whole documents into the prompt." },
  { term: "Semantic cache", definition: "App-level cache that matches semantically similar queries and returns a stored answer, skipping the model call." },
  { term: "Batch API", definition: "Async endpoint that processes non-urgent jobs within ~24h for ~50% off." },
  { term: "Model routing", definition: "Sending each request to the cheapest model that meets the quality bar; escalating only when needed." },
  { term: "Caveman compression", definition: "Telegram-style prompt compression that drops grammatical filler while keeping load-bearing words." },
  { term: "Distillation", definition: "Training a small model on a flagship model's outputs for a narrow task, then serving the cheap model." },
];

export const meta = {
  title: "TokenOps — Token & Credit Optimization Hub",
  reviewed: "June 2026",
  disclaimer:
    "Pricing, discounts, and TTLs change frequently. Always confirm current numbers in the provider's own docs before relying on them for budgeting.",
};
