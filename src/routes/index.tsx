import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Library as LibraryIcon,
  BookOpen,
  ClipboardCheck,
  Map,
  BookMarked,
  Wrench,
  Sparkles,
  Layers,
  ClipboardList,
} from "lucide-react";
import { operatingPillars, playbook } from "@/tokenops/data";
import content from "@/tokenops/content.json";
import type { TokenOpsContent } from "@/tokenops/data";
import heroIllustration from "@/assets/hero-tokenops.png";

const data = content as TokenOpsContent;
const libCount = data.library.length;
const byCat = (c: string) => data.library.filter((i) => i.category === c).length;

const LIB_HIGHLIGHTS = [
  {
    icon: BookOpen,
    label: "Guides",
    count: byCat("Guide"),
    desc: "Glossary, FAQ, RACI, maturity model, case studies.",
  },
  {
    icon: Map,
    label: "Playbooks",
    count: byCat("Playbook"),
    desc: "Multi-week programs: migration, RAG, billing, exec briefing.",
  },
  {
    icon: ClipboardCheck,
    label: "Checklists",
    count: byCat("Checklist"),
    desc: "Audit, launch, model swap, vendor negotiation.",
  },
  {
    icon: BookMarked,
    label: "References",
    count: byCat("Reference"),
    desc: "Metrics, KPIs, provider matrix, tool landscape.",
  },
  {
    icon: Wrench,
    label: "Operating",
    count: byCat("Operating"),
    desc: "Runbooks, QBR, ROI, SLA/SLO, vendor scorecard.",
  },
  {
    icon: LibraryIcon,
    label: "Advanced",
    count: byCat("Advanced"),
    desc: "Gateways, routing, anomaly detection, prompt versioning.",
  },
];

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "TokenOps Atlas — FinOps for LLM Tokens" },
      { name: "description", content: "Run LLM spend like a professional operating discipline." },
    ],
  }),
});

function Index() {
  return (
    <div className="stack">
      <section className="hero-band">
        <div>
          <p className="eyebrow">FinOps for tokens</p>
          <h1>Run LLM spend like a professional operating discipline.</h1>
          <p className="hero-copy">
            TokenOps applies visibility, allocation, optimization, and governance to LLM token
            consumption so AI products can scale without invoice surprises.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" to="/calculator">
              Open calculator <ArrowRight size={17} />
            </Link>
            <Link className="secondary-action" to="/dashboard">
              View dashboard
            </Link>
          </div>
        </div>
        <div className="hero-illustration">
          <img
            src={heroIllustration}
            alt="TokenOps illustration: glowing gold token coin with a rising cost chart"
            width={1024}
            height={1024}
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-4">
        <Link
          to="/optimize"
          className="group flex flex-col gap-3 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent p-6 transition hover:border-emerald-500/70 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" /> New
            </div>
            <h2 className="mt-1 text-2xl font-semibold">Token Optimization Playbook</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Techniques, tool-specific guides, the Caveman method, and copy-paste templates — spend the fewest tokens for the best result.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 self-start rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300 sm:self-auto">
            Open Optimize <ArrowRight className="h-4 w-4 transition-all group-hover:translate-x-0.5" />
          </span>
        </Link>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: "/techniques", icon: Layers, title: "Techniques", desc: "Caching, routing, compression, RAG." },
            { to: "/tool-guides", icon: Wrench, title: "Tool Guides", desc: "Claude, Lovable, GPT, Gemini, Cursor." },
            { to: "/caveman", icon: Sparkles, title: "Caveman", desc: "Telegram-style prompts: 14–45% savings." },
            { to: "/prompt-templates", icon: ClipboardList, title: "Templates", desc: "Copy-paste prompts & checklists." },
          ].map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="rounded-xl border border-border bg-card p-4 transition hover:border-emerald-500/50"
            >
              <t.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <div className="mt-2 font-semibold">{t.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{t.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="exec-summary">
        <div>
          <p className="eyebrow">Executive summary</p>
          <h2 style={{ marginBottom: 6 }}>
            TokenOps: operational intelligence for LLM token spend
          </h2>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            Every LLM API call has a measurable cost. TokenOps makes that cost visible, predictable,
            and optimisable — applying FinOps-style discipline to four domains: visibility,
            allocation, optimisation, and governance.
          </p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Pillar</th>
              <th>What it means</th>
              <th>Key metric</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Visibility</strong>
              </td>
              <td>Tag every API call; join with billing</td>
              <td>Tagging coverage %</td>
            </tr>
            <tr>
              <td>
                <strong>Optimisation</strong>
              </td>
              <td>Compress prompts, route to cheap models, cache prefixes</td>
              <td>Cost per 1K calls</td>
            </tr>
            <tr>
              <td>
                <strong>Governance</strong>
              </td>
              <td>Budget guardrails, team chargebacks, monthly reviews</td>
              <td>Budget utilisation %</td>
            </tr>
          </tbody>
        </table>
        <div>
          <h3 style={{ marginBottom: 8 }}>Typical savings profile</h3>
          <table>
            <thead>
              <tr>
                <th>Technique</th>
                <th>Typical saving</th>
                <th>Effort</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Model routing (premium → nano for simple tasks)</td>
                <td>40–80%</td>
                <td>Medium</td>
              </tr>
              <tr>
                <td>Prompt caching (stable system prompts)</td>
                <td>50–90% on cached tokens</td>
                <td>Low</td>
              </tr>
              <tr>
                <td>Prompt compression (remove fluff &amp; redundancy)</td>
                <td>15–30%</td>
                <td>Low</td>
              </tr>
              <tr>
                <td>RAG chunk reduction (reranking, fewer docs)</td>
                <td>20–50%</td>
                <td>Medium</td>
              </tr>
              <tr>
                <td>Batch API for async workloads</td>
                <td>~50%</td>
                <td>Low</td>
              </tr>
              <tr>
                <td>Output constraints (structured JSON vs prose)</td>
                <td>10–40%</td>
                <td>Low</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-grid three">
        {operatingPillars.map(({ icon: Icon, title, body }) => (
          <article className="tile" key={title}>
            <Icon size={22} />
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </section>

      <section className="split-section">
        <div>
          <p className="eyebrow">From the guide</p>
          <h2>Token spend becomes urgent when it scales invisibly.</h2>
          <p>
            The guide frames the core problem clearly: token volume can grow exponentially while
            per-token prices decline only incrementally. Without deliberate tagging, logging, and
            allocation, token economics becomes a black box.
          </p>
        </div>
        <div className="timeline">
          {playbook.map((item, index) => (
            <div className="timeline-item" key={item.title}>
              <span>{index + 1}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="starter-kit-banner">
        <div>
          <p className="eyebrow" style={{ marginBottom: 8 }}>
            Content library
          </p>
          <h3 style={{ fontSize: "1.6rem", marginBottom: 10 }}>
            <LibraryIcon size={22} style={{ verticalAlign: "middle", marginRight: 10 }} />
            {libCount} long-form artifacts, ready to use
          </h3>
          <p>
            Guides, playbooks, checklists, references, and operating templates covering everything
            from anomaly detection and gateway architecture to QBRs, RACI matrices, and vendor
            scorecards.
          </p>
          <div className="starter-kit-items">
            {LIB_HIGHLIGHTS.map(({ icon: Icon, label, count }) => (
              <span key={label}>
                <Icon size={12} /> {count} {label}
              </span>
            ))}
          </div>
        </div>
        <Link className="download-btn" to="/library" style={{ textDecoration: "none" }}>
          Browse library <ArrowRight size={16} />
        </Link>
      </section>

      <section className="section-grid three">
        {LIB_HIGHLIGHTS.map(({ icon: Icon, label, count, desc }) => (
          <article className="tile" key={label}>
            <Icon size={22} />
            <h3>
              {label} <span style={{ color: "var(--gold)", fontSize: "0.9rem" }}>· {count}</span>
            </h3>
            <p>{desc}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <p className="eyebrow" style={{ marginBottom: 4 }}>What's new</p>
            <h2 style={{ margin: 0 }}>2026 TokenOps trends</h2>
          </div>
          <Link to="/library" className="secondary-action">Browse all →</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { file: "trends/2026-pricing-landscape.md", title: "2026 Pricing Landscape", desc: "GPT-5, Claude Opus 4.5, Gemini 3, DeepSeek V3.2 — and the tokenizer inflation trap." },
            { file: "trends/prompt-caching-2026.md", title: "Prompt Caching: The 90% Discount", desc: "Discount rates, TTLs, write premiums, and the break-even model across providers." },
            { file: "trends/reasoning-token-governance.md", title: "Reasoning Token Governance", desc: "Right-size thinking budgets across o3/o4, GPT-5, Claude Adaptive Thinking, Deep Think." },
            { file: "trends/agentic-cost-loop-tax.md", title: "The Loop Tax", desc: "The $47K runaway agent, the 5–30× estimation error, and the six required agent controls." },
            { file: "trends/greenops-focus-2026.md", title: "GreenOps & FOCUS", desc: "FOCUS 1.4/1.5 for AI and the dual-reporting playbook for dollars and carbon." },
            { file: "trends/enterprise-case-studies-2026.md", title: "Enterprise Case Studies", desc: "AT&T 90% cut, fintech 73% saved, SaaS $48K→$19K — and the stack behind each." },
            { file: "trends/semantic-caching-2026.md", title: "Semantic Caching Beyond Exact-Match", desc: "The two-cache stack, similarity thresholds, invalidation strategy, and when it adds cost." },
            { file: "trends/slm-production-2026.md", title: "Small Language Models in Production", desc: "The 2026 SLM shortlist, hosting break-evens, and the routing pattern behind 60–90% traffic shifts." },
            { file: "trends/multi-agent-orchestration-cost.md", title: "Multi-Agent Cost Reality", desc: "Why multi-agent costs 5–15× single-agent, the context-inheritance tax, and four cost controls." },
            { file: "trends/batch-api-arbitrage-2026.md", title: "Batch API Arbitrage", desc: "The 50% discount every provider ships — migration pattern, hidden traps, and the sharding trick." },
            { file: "trends/embedding-and-vector-db-costs-2026.md", title: "Embedding & Vector DB Tuning", desc: "Matryoshka truncation, chunking recall vs cost, and the object-storage vector-DB shift." },
            { file: "trends/structured-output-json-mode-2026.md", title: "Structured Output Economics", desc: "Why strict schemas add tokens, when JSON mode wins, and the retry-loop trap." },
            { file: "trends/observability-stack-2026.md", title: "The Observability Stack", desc: "Five categories, must-have span fields, and the five alerts that catch 80% of incidents." },
            { file: "trends/context-engineering-2026.md", title: "Context Engineering: The Discipline", desc: "Seven layers, per-layer token budgets, five compression techniques, and a new engineering role." },
            { file: "trends/fine-tuning-economics-2026.md", title: "Fine-Tuning vs Prompting Economics", desc: "When to distil, when to prompt-cache, when to stay stateless — with break-even math." },
            { file: "trends/tokenops-kpis-benchmarks-2026.md", title: "KPI Benchmarks 2026", desc: "Four tiers of KPIs with benchmark numbers and the six questions Level 4 programs answer on demand." },
            { file: "trends/model-arbitrage-playbook-2026.md", title: "Cross-Provider Arbitrage Playbook", desc: "The arbitrage matrix, four patterns, negotiation floor discounts, cost-aware gateway routing." },
          ].map((t) => (
            <Link
              key={t.file}
              to="/read/$"
              params={{ _splat: `library/${t.file}` }}
              className="rounded-xl border border-border bg-card p-4 transition hover:border-emerald-500/50"
            >
              <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <div className="mt-2 font-semibold">{t.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{t.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
