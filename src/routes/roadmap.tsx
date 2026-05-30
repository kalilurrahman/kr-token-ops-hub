import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Compass, Ruler, ShieldCheck, Sparkles, Repeat, Flag } from "lucide-react";

export const Route = createFileRoute("/roadmap")({
  component: RoadmapPage,
  head: () => ({
    meta: [
      { title: "TokenOps Implementation Roadmap — Discover, Measure, Govern, Optimize, Scale" },
      {
        name: "description",
        content:
          "A phased 90-day TokenOps roadmap: establish visibility, standardize measurement, set governance, optimize usage, and operationalize continuous improvement.",
      },
    ],
  }),
});

const PHASES = [
  {
    icon: Flag,
    phase: "0. Align",
    goal: "Secure sponsor and scope",
    outputs: "Charter, objectives, success metrics",
    detail:
      "Frame TokenOps as a FinOps-style operating model for LLM token spend — not a reporting project. Name an executive sponsor, define in-scope products and teams, and agree on the success metrics you will track for the first 90 days.",
  },
  {
    icon: Compass,
    phase: "1. Discover & baseline",
    goal: "Build visibility",
    outputs: "Workload inventory, baseline dashboard",
    detail:
      "Inventory every model, app, team, prompt, and token-producing workflow. Capture baseline metrics: input/output tokens, cost per request, cost per workflow, cache hit rate, and spend by team or product.",
  },
  {
    icon: Ruler,
    phase: "2. Measure",
    goal: "Standardize cost data",
    outputs: "Token taxonomy, unit-cost model",
    detail:
      "Define one token taxonomy and one cost model across vendors so OpenAI, Anthropic, Google, and others are comparable. Include cached input, output, tool use, retries, and model-switching effects in the same measurement layer.",
  },
  {
    icon: ShieldCheck,
    phase: "3. Govern",
    goal: "Set controls",
    outputs: "Owners, budgets, alerts, policy rules",
    detail:
      "Assign ownership for each workload, team, or product line and decide how shared costs split. Add guardrails for budgets, approvals, alerting, and exceptions so spend is controlled before optimization starts.",
  },
  {
    icon: Sparkles,
    phase: "4. Optimize",
    goal: "Reduce spend",
    outputs: "Caching, routing, prompt tuning, model mix",
    detail:
      "Target the biggest cost drivers first: prompt compression, prompt caching, model right-sizing, routing to cheaper models, truncation control, and retry reduction. Use provider pricing mechanics as levers — token cost is not fixed.",
  },
  {
    icon: Repeat,
    phase: "5. Scale",
    goal: "Embed operating rhythm",
    outputs: "Playbooks, monthly reviews, continuous improvement",
    detail:
      "Move TokenOps into a recurring cadence: monthly reviews, anomaly detection, named action owners, dashboards, runbooks, and decision thresholds so the discipline survives after the initial rollout.",
  },
];

const TIMELINE = [
  {
    window: "Days 1–30",
    title: "Discover & baseline",
    body: "Inventory workloads, instrument tagging, stand up the baseline dashboard. Outcome: a single source of truth for who is spending what, on which models.",
  },
  {
    window: "Days 31–60",
    title: "Measure & govern",
    body: "Lock in the cross-vendor token taxonomy and unit-cost model. Publish budgets, owners, alert thresholds, and approval rules for new workloads.",
  },
  {
    window: "Days 61–90",
    title: "Optimize & operationalize",
    body: "Launch optimization pilots on the top spending workflows (caching, routing, prompt tuning) and lock in the monthly review cadence with named owners.",
  },
];

const ANTIPATTERNS = [
  "Starting with dashboards alone — visibility without ownership rarely changes behavior.",
  "Trying to optimize every model at once — prioritize the top few workflows by spend or growth rate.",
  "Treating token cost as fixed — provider pricing mechanics (cached input, batch, tiered models) are real levers.",
  "Skipping the taxonomy step — without one cost model across vendors, comparisons stay anecdotal.",
];

function RoadmapPage() {
  return (
    <div className="stack">
      <section className="hero-band">
        <div>
          <p className="eyebrow">Implementation roadmap</p>
          <h1>TokenOps roadmap: discover, measure, govern, optimize, scale.</h1>
          <p className="hero-copy">
            Build TokenOps in phases. Establish visibility first, then define allocation and
            governance, then optimize usage, then operationalize continuous improvement. A
            FinOps-style operating model — not a one-off reporting project.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" to="/calculator">
              Model your savings <ArrowRight size={17} />
            </Link>
            <Link className="secondary-action" to="/dashboard">
              View dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="exec-summary">
        <div>
          <p className="eyebrow">Phased plan</p>
          <h2 style={{ marginBottom: 6 }}>Six phases from charter to continuous improvement</h2>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            Each phase has a clear goal and a concrete output. Run them in order — skipping ahead to
            optimization without ownership and measurement is the most common reason TokenOps
            programs stall.
          </p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Phase</th>
              <th>Goal</th>
              <th>Typical outputs</th>
            </tr>
          </thead>
          <tbody>
            {PHASES.map((p) => (
              <tr key={p.phase}>
                <td>
                  <strong>{p.phase}</strong>
                </td>
                <td>{p.goal}</td>
                <td>{p.outputs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="section-grid three">
        {PHASES.map(({ icon: Icon, phase, detail }) => (
          <article className="tile" key={phase}>
            <Icon size={22} />
            <h3>{phase}</h3>
            <p>{detail}</p>
          </article>
        ))}
      </section>

      <section className="split-section">
        <div>
          <p className="eyebrow">Suggested timeline</p>
          <h2>A 90-day first implementation.</h2>
          <p>
            This sequence matches the way FinOps practices mature: first visibility, then control,
            then optimization. Use it as a default cadence, then tune to your organization's
            appetite.
          </p>
        </div>
        <div className="timeline">
          {TIMELINE.map((item, index) => (
            <div className="timeline-item" key={item.window}>
              <span>{index + 1}</span>
              <div>
                <h3>
                  {item.window} — {item.title}
                </h3>
                <p>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="exec-summary">
        <div>
          <p className="eyebrow">What to avoid</p>
          <h2 style={{ marginBottom: 6 }}>Common anti-patterns</h2>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            Most failed TokenOps rollouts share the same handful of mistakes. Watch for these early.
          </p>
        </div>
        <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.7 }}>
          {ANTIPATTERNS.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
