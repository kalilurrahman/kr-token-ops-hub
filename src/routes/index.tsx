import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { operatingPillars, playbook } from "@/tokenops/data";

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
    </div>
  );
}
