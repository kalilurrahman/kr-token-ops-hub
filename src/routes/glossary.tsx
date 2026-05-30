import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

export const Route = createFileRoute("/glossary")({
  component: GlossaryPage,
  head: () => ({
    meta: [
      { title: "TokenOps Glossary — 30 essential terms" },
      { name: "description", content: "Searchable glossary of every TokenOps term: tokens, caching, routing, RAG, gateways, governance, and unit economics." },
    ],
  }),
});

type Entry = { term: string; def: string };

const GLOSSARY: Entry[] = [
  { term: "Batch API", def: "Asynchronous API mode (OpenAI, Anthropic) processing jobs at ~50% reduced cost with 24-hour SLA. Ideal for enrichment pipelines and evaluation runs." },
  { term: "Cache Hit Rate", def: "Fraction of API calls where a cached prompt prefix was reused instead of reprocessed. Target >80% for workloads with stable system prompts." },
  { term: "Chargeback", def: "Internal billing practice that charges teams for their actual LLM token consumption. Creates cost accountability at the team level." },
  { term: "Chunking", def: "Splitting source documents into smaller segments for embedding and RAG retrieval. Optimal range: 200–512 tokens per chunk." },
  { term: "Context Window", def: "Maximum tokens (input + output) a model processes in one call. GPT-4o: 128K; Claude 3.5 Sonnet: 200K; Gemini 1.5 Pro: 1M." },
  { term: "Cost per Outcome", def: "Token cost divided by a meaningful business unit (resolved ticket, converted lead, accurate classification). The ultimate TokenOps KPI." },
  { term: "Embeddings Token Cost", def: "Cost of text-to-vector conversion for search indexes. Typically 100× cheaper than generation but accumulates at ingestion scale." },
  { term: "FinOps for AI", def: "Application of FinOps disciplines (visibility → optimisation → governance) to AI/LLM workloads. TokenOps is the token-specific sub-discipline." },
  { term: "Hard Limit", def: "Budget threshold that actively blocks API calls once reached. Protects against runaway spend; requires fallback logic in application code." },
  { term: "Input Token", def: "Tokens in the request sent to the model: system prompt + history + context + user query. Priced per 1M tokens." },
  { term: "LLM Gateway", def: "Centralised proxy between application code and LLM APIs. Enforces tagging, routing, rate limits, caching, and cost attribution." },
  { term: "Model Routing", def: "Directing calls to the cheapest model meeting quality and latency thresholds for the task type. Most impactful single optimisation." },
  { term: "Model Tier", def: "Classification by cost and capability: Frontier (GPT-4o, Claude Sonnet), Mid-tier (Llama 70B, Mistral), Nano (GPT-4o Mini, Gemini Flash)." },
  { term: "Output Token", def: "Tokens in the model's generated response. Priced 3–10× higher than input tokens across most providers." },
  { term: "Prompt Caching", def: "Re-using a previously computed KV-cache for a stable prefix. OpenAI: automatic at 1,024-token boundaries (50% discount). Anthropic: explicit cache control (90% read discount)." },
  { term: "Prompt Compression", def: "Removing redundancy, fluff words, and verbose phrasing from prompts without changing task intent. Typical saving: 15–30% of input tokens." },
  { term: "RAG (Retrieval-Augmented Generation)", def: "Architecture injecting retrieved document chunks into the prompt. Primary TokenOps risk: context bloat from over-retrieval." },
  { term: "Reranking", def: "Secondary scoring of retrieved chunks before injection. Allows 3–5 high-quality chunks instead of 10–20 lower-quality ones." },
  { term: "Retry Rate", def: "Fraction of LLM calls retried due to errors or rejected output. >5% indicates prompt instability and inflates cost proportionally." },
  { term: "Showback", def: "Reporting token costs to teams without billing them. A governance stepping stone before full chargeback." },
  { term: "Soft Limit", def: "Budget threshold triggering an alert without blocking calls. Typically set at 80% of monthly budget." },
  { term: "Structured Output", def: "Constraining model response to JSON schema or function call format. Reduces output verbosity and parsing errors." },
  { term: "System Prompt", def: "Persistent instructions prepended to every call. A 3K-token system prompt at 1M calls/month = 3B tokens = $15,000 at $5/1M. Prime caching target." },
  { term: "Token", def: "Atomic billing unit for LLM APIs. ~0.75 English words or ~4 characters. Exact count depends on the model's tokenizer." },
  { term: "Token Drift", def: "Gradual unnoticed growth in token consumption over time — caused by accumulating history, growing data payloads, or verbose prompts." },
  { term: "Token Yield", def: "Fraction of generated tokens delivering value. Low yield (retries, ignored output) inflates cost without business benefit. Target: >80%." },
  { term: "TokenOps", def: "The operational discipline of governing, allocating, optimising, and forecasting LLM token spend. Analogous to FinOps for cloud compute." },
  { term: "Tokenizer", def: "Algorithm converting text to token IDs. Different tokenizers produce different counts. Always benchmark with the target model's tokenizer." },
  { term: "TPM (Tokens Per Minute)", def: "Provider-enforced rate limit. Exceeding TPM causes HTTP 429 throttling. Relevant for burst workloads and batch job sizing." },
  { term: "Unit Economics", def: "Token cost as a ratio to business metrics: cost per 1K users, cost per $1 ARR, cost per transaction. Makes LLM spend comparable to other COGS." },
  { term: "Waste Tokens", def: "Input tokens not contributing to answer quality: stale history, irrelevant context, repeated boilerplate, excessive formatting instructions." },
];

function GlossaryPage() {
  const [q, setQ] = useState("");

  const grouped = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = needle
      ? GLOSSARY.filter((e) => e.term.toLowerCase().includes(needle) || e.def.toLowerCase().includes(needle))
      : GLOSSARY;
    const map = new Map<string, Entry[]>();
    filtered
      .slice()
      .sort((a, b) => a.term.localeCompare(b.term))
      .forEach((e) => {
        const letter = e.term[0].toUpperCase();
        if (!map.has(letter)) map.set(letter, []);
        map.get(letter)!.push(e);
      });
    return Array.from(map.entries());
  }, [q]);

  return (
    <section className="stack">
      <div className="page-heading">
        <p className="eyebrow">Reference</p>
        <h1>TokenOps Glossary</h1>
        <p>{GLOSSARY.length} essential terms used across TokenOps practices, dashboards, and vendor contracts.</p>
      </div>

      <div style={{ position: "relative" }}>
        <Search size={16} style={{ position: "absolute", left: 14, top: 16, color: "var(--muted)" }} />
        <input
          className="glossary-search"
          style={{ paddingLeft: 40 }}
          placeholder="Search 30 terms (e.g. caching, RAG, gateway, chargeback)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {grouped.length === 0 && (
        <p style={{ color: "var(--muted)" }}>No terms match "{q}".</p>
      )}

      {grouped.map(([letter, items]) => (
        <div key={letter}>
          <div className="glossary-letter">{letter}</div>
          <div className="glossary-grid">
            {items.map((e) => (
              <article key={e.term} className="glossary-item">
                <h3>{e.term}</h3>
                <p>{e.def}</p>
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}