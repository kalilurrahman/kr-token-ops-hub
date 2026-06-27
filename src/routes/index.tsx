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
    </div>
  );
}
