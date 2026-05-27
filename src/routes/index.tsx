import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Library as LibraryIcon, BookOpen, ClipboardCheck, Map, BookMarked, Wrench } from "lucide-react";
import { operatingPillars, playbook } from "@/tokenops/data";
import content from "@/tokenops/content.json";
import type { TokenOpsContent } from "@/tokenops/data";

const data = content as TokenOpsContent;
const libCount = data.library.length;
const byCat = (c: string) => data.library.filter((i) => i.category === c).length;

const LIB_HIGHLIGHTS = [
  { icon: BookOpen,       label: "Guides",     count: byCat("Guide"),     desc: "Glossary, FAQ, RACI, maturity model, case studies." },
  { icon: Map,            label: "Playbooks",  count: byCat("Playbook"),  desc: "Multi-week programs: migration, RAG, billing, exec briefing." },
  { icon: ClipboardCheck, label: "Checklists", count: byCat("Checklist"), desc: "Audit, launch, model swap, vendor negotiation." },
  { icon: BookMarked,     label: "References", count: byCat("Reference"), desc: "Metrics, KPIs, provider matrix, tool landscape." },
  { icon: Wrench,         label: "Operating",  count: byCat("Operating"), desc: "Runbooks, QBR, ROI, SLA/SLO, vendor scorecard." },
  { icon: LibraryIcon,    label: "Advanced",   count: byCat("Advanced"),  desc: "Gateways, routing, anomaly detection, prompt versioning." },
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
        <div className="command-panel">
          <div className="panel-row"><span>Monthly AI spend</span><strong>$126,000</strong></div>
          <div className="panel-row"><span>Optimized run-rate</span><strong>$71,000</strong></div>
          <div className="panel-row"><span>Token yield target</span><strong>80%+</strong></div>
          <div className="progress-track"><span style={{ width: "84%" }} /></div>
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
          <p className="eyebrow" style={{ marginBottom: 8 }}>Content library</p>
          <h3 style={{ fontSize: "1.6rem", marginBottom: 10 }}>
            <LibraryIcon size={22} style={{ verticalAlign: "middle", marginRight: 10 }} />
            {libCount} long-form artifacts, ready to use
          </h3>
          <p>
            Guides, playbooks, checklists, references, and operating templates covering everything from
            anomaly detection and gateway architecture to QBRs, RACI matrices, and vendor scorecards.
          </p>
          <div className="starter-kit-items">
            {LIB_HIGHLIGHTS.map(({ icon: Icon, label, count }) => (
              <span key={label}><Icon size={12} /> {count} {label}</span>
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
            <h3>{label} <span style={{ color: "var(--gold)", fontSize: "0.9rem" }}>· {count}</span></h3>
            <p>{desc}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
