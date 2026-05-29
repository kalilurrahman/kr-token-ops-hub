import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/hub")({
  head: () => ({
    meta: [
      { title: "TokenOps Professional Hub — Calculators, Glossary, Maturity" },
      {
        name: "description",
        content:
          "Interactive TokenOps calculators (savings, unit economics, model comparison), glossary, maturity self-check, and key concepts.",
      },
    ],
  }),
  component: HubPage,
});

const PRESETS = {
  openai: { inp: 5, out: 15, name: "OpenAI GPT-4o" },
  anthropic: { inp: 3, out: 15, name: "Anthropic Claude" },
  google: { inp: 0.075, out: 0.3, name: "Google Gemini Flash" },
  mixed: { inp: 3, out: 10, name: "Mixed fleet" },
} as const;
type PresetKey = keyof typeof PRESETS;

const MODELS = [
  { provider: "OpenAI", model: "GPT-4o", inp: 5, out: 15, ctx: "128K", tier: "Frontier" },
  { provider: "OpenAI", model: "GPT-4o Mini", inp: 0.15, out: 0.6, ctx: "128K", tier: "Mid" },
  { provider: "Anthropic", model: "Claude Sonnet", inp: 3, out: 15, ctx: "200K", tier: "Frontier" },
  { provider: "Anthropic", model: "Claude Haiku", inp: 0.8, out: 4, ctx: "200K", tier: "Mid" },
  { provider: "Google", model: "Gemini 2.0 Flash", inp: 0.075, out: 0.3, ctx: "1M", tier: "Cheap" },
  { provider: "Meta", model: "Llama 3.1 70B", inp: 0.4, out: 0.6, ctx: "128K", tier: "Cheap" },
] as const;

const GLOSSARY = [
  { t: "Token", d: "The fundamental unit of LLM computation. Roughly 4 characters of English text. Every API call is priced on tokens consumed." },
  { t: "Input tokens", d: "All text sent to the model in a single API call: system prompt, retrieved context, conversation history, user query, and format instructions." },
  { t: "Output tokens", d: "The model's generated response. Priced at 2–10× the input rate on most APIs, making output length a primary cost lever." },
  { t: "Token yield rate", d: "The core TokenOps metric: (valuable output tokens) ÷ (total consumed tokens) × 100%. Target 80%+. Low yield signals waste from retries, irrelevant context, or discarded outputs." },
  { t: "Semantic caching", d: "Storing LLM responses indexed by query embedding, and serving cached responses for semantically similar subsequent queries. Can reduce token consumption 40–80% on repetitive workloads." },
  { t: "Model tiering", d: "Routing each request to the cheapest model that meets its quality requirements. Classification → Llama, extraction → mid-tier, complex reasoning → frontier. Typically reduces blended cost 30–70%." },
  { t: "Context window", d: "The maximum number of tokens a model can process in a single call (input + output combined). Ranges from 128K (GPT-4o) to 1M (Gemini 2.0 Flash)." },
  { t: "RAG (retrieval-augmented generation)", d: "Architecture where relevant documents are retrieved from a vector store and injected into the prompt. A major source of input token inflation when retrieval is imprecise or over-broad." },
  { t: "Prompt compression", d: "Reducing the token length of system prompts without degrading output quality. Techniques include removing redundant instructions, compressing examples, and using templating." },
  { t: "Batch API", d: "Provider API variant that queues non-urgent requests for processing during off-peak hours. Universally priced at 50% of real-time rates. Ideal for nightly enrichment, bulk analysis, and scheduled jobs." },
  { t: "Sliding window", d: "Context management technique that keeps only the last N conversation turns, discarding older turns, to prevent input token cost from growing linearly with conversation length." },
  { t: "Chargeback", d: "Token cost allocation model where teams pay for their own consumption from their own budget. Creates strong optimization incentives but requires mature measurement infrastructure." },
  { t: "Showback", d: "Informational-only token cost allocation: costs are reported to teams but not charged. Lower political friction; recommended as a starting point before transitioning to chargeback." },
  { t: "LLM gateway", d: "Centralized middleware that intercepts all LLM API calls, adds metadata tags, enforces rate limits and budgets, and logs usage data. LiteLLM, LangChain proxy, and custom solutions are common." },
  { t: "Blended cost per token", d: "Total spend ÷ total tokens consumed. Tracks efficiency of the overall model mix over time. Target: 20–30% YoY reduction through optimization and model tiering." },
  { t: "Token velocity", d: "Tokens consumed per day or per hour. The key leading indicator for cost forecasting. Flat or declining velocity alongside feature growth signals successful optimization." },
  { t: "System prompt", d: "The foundational instruction included in every API call to an endpoint. At 100K calls/day, a 1,200-token system prompt costs $10,800/month before any user query." },
  { t: "Context trimming", d: "Reducing the volume of retrieved or accumulated context passed to the model, by relevance filtering, summarization, or sliding windows. Can achieve 30–60% input token reduction." },
  { t: "Output constraints", d: "Prompt techniques or API parameters that limit or structure the model's output. E.g., requesting JSON with 5 bullet points instead of free-form prose. Reduces output tokens 20–40%." },
  { t: "Retry overhead", d: "Extra tokens consumed when API calls fail and must be retried. A request requiring 2 retries can consume 4× its intended token budget." },
  { t: "Cost per outcome", d: "Total token cost ÷ number of successful outcomes (decisions, deflections, conversions). Connects token spend to business value." },
  { t: "Token budget", d: "An explicit monthly limit on token consumption for a service or feature, enforced at the API gateway. Includes soft alerts (80%) and hard limits (100%) with required approval to increase." },
  { t: "FinOps", d: "The operational discipline of bringing financial accountability to cloud infrastructure. TokenOps mirrors FinOps one layer up the stack, applying the same visibility-optimize-govern cycle to LLM token spend." },
  { t: "Prompt versioning", d: "Tracking system prompt changes with version control, enabling rollback when quality or cost metrics degrade and audit trails for compliance." },
  { t: "Inference cost", d: "The compute cost of running an LLM API call. Distinct from training cost. Priced per token by all major providers." },
].sort((a, b) => a.t.localeCompare(b.t));

const CHECKLISTS = [
  { t: "Inventory all LLM API calls across services", l: 1 },
  { t: "Calculate baseline cost per request", l: 1 },
  { t: "Identify top 3 cost drivers", l: 1 },
  { t: "Define tagging schema (team, service, feature, env)", l: 1 },
  { t: "Deploy LLM gateway for centralised logging", l: 2 },
  { t: "Build cost allocation dashboard", l: 2 },
  { t: "Set up daily cost anomaly alerts", l: 2 },
  { t: "Establish token yield rate baseline", l: 2 },
  { t: "Compress highest-volume system prompts", l: 3 },
  { t: "Implement semantic caching for FAQ workloads", l: 3 },
  { t: "Route batch jobs to 50%-cheaper batch API", l: 3 },
  { t: "A/B test model tiering on classification tasks", l: 3 },
  { t: "Assign monthly token budgets to all services", l: 4 },
  { t: "Run monthly cross-team cost review", l: 4 },
  { t: "Include token cost in architecture review process", l: 4 },
  { t: "Transition from showback to chargeback model", l: 4 },
];

const MATURITY = [
  { name: "Ad hoc", desc: "No instrumentation. Token costs are a surprise line on the invoice. No tagging, no allocation, no optimization strategy.", checks: ["No tagging schema", "No cost allocation", "No token budgets", "Single model for all tasks"] },
  { name: "Instrumented", desc: "All API calls are tagged and logged. Costs are allocated by team and service. A dashboard exists. Anomaly alerts are configured.", checks: ["Tagging schema deployed", "Cost dashboard live", "Anomaly alerts set", "Baseline metrics established"] },
  { name: "Optimized", desc: "Active optimization roadmap. Semantic caching deployed. Model tiering in use. Batch API routes for non-real-time workloads. Token yield tracked.", checks: ["Caching deployed", "Model tiering active", "Batch API in use", "Prompt compression done"] },
  { name: "Governed", desc: "Token budgets enforced at gateway. Monthly reviews. Chargeback model active. Architecture reviews include cost estimates. Teams self-optimize.", checks: ["Token budgets enforced", "Monthly reviews running", "Chargeback model active", "Cost-aware culture established"] },
];

const TABS = [
  { id: "calc", label: "Savings calculator" },
  { id: "unit", label: "Unit economics" },
  { id: "models", label: "Model comparer" },
  { id: "maturity", label: "Maturity checker" },
  { id: "glossary", label: "Glossary" },
  { id: "summary", label: "Key concepts" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const fmt = (n: number) => {
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(0) + "K";
  return "$" + n.toFixed(0);
};
const fmtN = (n: number) => {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(0) + "K";
  return n.toFixed(0);
};

function HubPage() {
  const [tab, setTab] = useState<TabId>("calc");
  return (
    <div className="hub-page">
      <header className="hub-hero">
        <div className="hub-kicker">TokenOps · Professional Hub</div>
        <h1>Calculators, glossary, and the operating manual for LLM token spend</h1>
        <p>
          Six interactive tools to size the prize, compare models, score your maturity, and learn the
          vocabulary — all backed by the same playbook used across the rest of the{" "}
          <Link to="/guide" className="hub-link">TokenOps Atlas</Link>.
        </p>
      </header>

      <nav className="hub-tabs" role="tablist" aria-label="Hub sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`hub-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "calc" && <SavingsCalc />}
      {tab === "unit" && <UnitEconomics />}
      {tab === "models" && <ModelComparer />}
      {tab === "maturity" && <MaturityChecker />}
      {tab === "glossary" && <Glossary />}
      {tab === "summary" && <KeyConcepts />}
    </div>
  );
}

function SavingsCalc() {
  const [preset, setPreset] = useState<PresetKey>("openai");
  const [reqs, setReqs] = useState(3_000_000);
  const [inp, setInp] = useState(2000);
  const [out, setOut] = useState(500);
  const [cache, setCache] = useState(40);
  const [batch, setBatch] = useState(25);
  const [compress, setCompress] = useState(30);
  const [tier, setTier] = useState(50);
  const [outopt, setOutopt] = useState(25);

  const calc = useMemo(() => {
    const p = PRESETS[preset];
    const inpRate = p.inp / 1e6;
    const outRate = p.out / 1e6;
    const baseline = reqs * (inp * inpRate + out * outRate);
    const cacheSave = (cache / 100) * baseline;
    const remain = baseline - cacheSave;
    const compressSave = (compress / 100) * 0.2 * remain;
    const batchSave = (batch / 100) * 0.5 * remain;
    const tierSave = (tier / 100) * 0.5 * remain * (1 - cache / 100);
    const outSave = (outopt / 100) * 0.35 * remain;
    const totalSave = Math.min(cacheSave + compressSave + batchSave + tierSave + outSave, baseline * 0.92);
    const optimized = baseline - totalSave;
    const savePct = baseline ? totalSave / baseline : 0;
    const payback = 15000 / Math.max(totalSave / 12, 1);
    const levers = [
      { name: "Semantic caching", save: cacheSave, color: "var(--green)" },
      { name: "Model tiering", save: tierSave, color: "var(--gold)" },
      { name: "Batch API routing", save: batchSave, color: "var(--blue)" },
      { name: "Prompt compression", save: compressSave, color: "var(--gold-dim)" },
      { name: "Output constraints", save: outSave, color: "#d85a30" },
    ].sort((a, b) => b.save - a.save);
    return { baseline, optimized, totalSave, savePct, payback, levers, preset: p };
  }, [preset, reqs, inp, out, cache, batch, compress, tier, outopt]);

  return (
    <section className="hub-pane">
      <div className="hub-card">
        <div className="hub-sec-title">Optimization savings calculator</div>
        <div className="hub-row">
          <label>Provider preset</label>
          <select value={preset} onChange={(e) => setPreset(e.target.value as PresetKey)}>
            <option value="openai">OpenAI (GPT-4o mix)</option>
            <option value="anthropic">Anthropic (Claude mix)</option>
            <option value="google">Google (Gemini mix)</option>
            <option value="mixed">Mixed provider fleet</option>
          </select>
        </div>
        <Slider label="Requests per month" v={reqs} set={setReqs} min={100_000} max={10_000_000} step={100_000} fmt={fmtN} />
        <Slider label="Avg input tokens / request" v={inp} set={setInp} min={500} max={8000} step={100} fmt={(n) => n.toLocaleString()} />
        <Slider label="Avg output tokens / request" v={out} set={setOut} min={100} max={2000} step={50} fmt={(n) => n.toLocaleString()} />
        <Slider label="Cache hit rate (%)" v={cache} set={setCache} min={0} max={90} step={1} fmt={(n) => n + "%"} />
        <Slider label="Batch processing share (%)" v={batch} set={setBatch} min={0} max={80} step={1} fmt={(n) => n + "%"} />
        <Slider label="Prompt compression (%)" v={compress} set={setCompress} min={0} max={60} step={1} fmt={(n) => n + "%"} />
        <Slider label="Model tiering share (%)" v={tier} set={setTier} min={0} max={80} step={1} fmt={(n) => n + "%"} />
        <Slider label="Output constraint savings (%)" v={outopt} set={setOutopt} min={0} max={40} step={1} fmt={(n) => n + "%"} />
      </div>

      <div className="hub-metrics">
        <Metric label="Baseline monthly" val={fmt(calc.baseline)} />
        <Metric label="Optimized monthly" val={fmt(calc.optimized)} tone="green" />
        <Metric label="Monthly savings" val={fmt(calc.totalSave)} tone="green" />
        <Metric label="Savings rate" val={(calc.savePct * 100).toFixed(1) + "%"} tone="blue" />
        <Metric label="Payback (months)" val={calc.payback.toFixed(1)} />
        <Metric label="Annual savings" val={fmt(calc.totalSave * 12)} tone="green" />
      </div>

      <div className="hub-card">
        <div className="hub-sec-title">Savings breakdown by lever</div>
        {calc.levers.map((l) => {
          const pct = calc.totalSave ? Math.round((l.save / calc.totalSave) * 100) : 0;
          return (
            <div key={l.name} className="hub-bar-row">
              <span className="hub-bar-lbl">{l.name}</span>
              <div className="hub-bar-wrap">
                <div className="hub-bar-fill" style={{ width: Math.min(pct, 100) + "%", background: l.color }} />
              </div>
              <span className="hub-bar-pct">{pct}%</span>
            </div>
          );
        })}
        <table className="hub-table">
          <thead><tr><th>Lever</th><th>Monthly saving</th><th>% of total</th><th>Complexity</th></tr></thead>
          <tbody>
            {calc.levers.map((l) => {
              const pct = calc.totalSave ? Math.round((l.save / calc.totalSave) * 100) : 0;
              const tone = l.save > calc.totalSave * 0.35 ? "green" : l.save > calc.totalSave * 0.15 ? "amber" : "blue";
              const label = l.save > calc.totalSave * 0.35 ? "High ROI" : l.save > calc.totalSave * 0.15 ? "Medium" : "Lower ROI";
              return (
                <tr key={l.name}>
                  <td>{l.name}</td><td>{fmt(l.save)}</td><td>{pct}%</td>
                  <td><span className={`hub-pill ${tone}`}>{label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="hub-insight">
        <b>Summary:</b> At {fmtN(reqs)} monthly requests on {calc.preset.name}, baseline is{" "}
        <b>{fmt(calc.baseline)}/month</b>. Applying all levers reduces this to {fmt(calc.optimized)} — a{" "}
        <b>{(calc.savePct * 100).toFixed(0)}% reduction</b> saving {fmt(calc.totalSave * 12)} annually. Biggest lever:{" "}
        <b>{calc.levers[0].name}</b>.
      </div>
    </section>
  );
}

function UnitEconomics() {
  const [cost, setCost] = useState(50_000);
  const [users, setUsers] = useState(10_000);
  const [reqs, setReqs] = useState(1_000_000);
  const [rev, setRev] = useState(200_000);
  const [outcomes, setOutcomes] = useState(50_000);
  const [manual, setManual] = useState(15);

  const cpUser = cost / users;
  const cpReq = cost / reqs;
  const cpOutcome = cost / outcomes;
  const manualTotal = outcomes * manual;
  const roi = ((manualTotal - cost) / cost) * 100;
  const tokenPct = rev > 0 ? (cost / rev) * 100 : null;
  const margin = rev > 0 ? rev - cost : null;
  const health = tokenPct === null ? "n/a (no revenue set)" : tokenPct < 10 ? "healthy (under 10%)" : tokenPct < 25 ? "watch — above 10%" : "concerning — above 25%";

  return (
    <section className="hub-pane">
      <div className="hub-card">
        <div className="hub-sec-title">Unit economics calculator</div>
        <Slider label="Monthly total token cost ($)" v={cost} set={setCost} min={1000} max={500_000} step={1000} fmt={(n) => "$" + n.toLocaleString()} />
        <Slider label="Monthly active users" v={users} set={setUsers} min={100} max={500_000} step={100} fmt={(n) => n.toLocaleString()} />
        <Slider label="Monthly requests" v={reqs} set={setReqs} min={10_000} max={10_000_000} step={10_000} fmt={fmtN} />
        <Slider label="Monthly feature revenue ($)" v={rev} set={setRev} min={0} max={1_000_000} step={1000} fmt={(n) => "$" + n.toLocaleString()} />
        <Slider label="Successful outcomes / month" v={outcomes} set={setOutcomes} min={100} max={1_000_000} step={100} fmt={(n) => n.toLocaleString()} />
        <Slider label="Manual cost per outcome ($)" v={manual} set={setManual} min={0} max={100} step={1} fmt={(n) => "$" + n} />
      </div>

      <div className="hub-metrics">
        <Metric label="Cost per user" val={cpUser < 1 ? "$" + cpUser.toFixed(3) : "$" + cpUser.toFixed(2)} />
        <Metric label="Cost per request" val={cpReq < 0.01 ? "$" + cpReq.toFixed(4) : "$" + cpReq.toFixed(3)} />
        <Metric label="Cost per outcome" val={cpOutcome < 1 ? "$" + cpOutcome.toFixed(3) : "$" + cpOutcome.toFixed(2)} />
        <Metric label="ROI vs manual" val={roi.toFixed(0) + "%"} tone={roi > 0 ? "green" : "red"} />
        {tokenPct !== null && (
          <Metric label="Token cost % revenue" val={tokenPct.toFixed(1) + "%"} tone={tokenPct < 10 ? "green" : tokenPct < 25 ? "amber" : "red"} />
        )}
        {margin !== null && <Metric label="Feature margin" val={fmt(margin)} tone={margin > 0 ? "green" : "red"} />}
      </div>

      <div className="hub-insight">
        <b>Unit economics:</b> Each request costs <b>${cpReq.toFixed(4)}</b> in tokens. Automating{" "}
        {outcomes.toLocaleString()} outcomes saves <b>{fmt(manualTotal - cost)}/month</b> vs. manual at ${manual}/outcome
        — <b>{roi.toFixed(0)}% ROI</b>. Token cost as % of revenue:{" "}
        <b>{tokenPct !== null ? tokenPct.toFixed(1) + "% — " + health : "set feature revenue above"}</b>.
      </div>
    </section>
  );
}

function ModelComparer() {
  const [inp, setInp] = useState(2000);
  const [out, setOut] = useState(500);
  const [reqs, setReqs] = useState(500_000);
  const costs = MODELS.map((m) => ({ ...m, monthly: reqs * ((inp * m.inp) / 1e6 + (out * m.out) / 1e6) }));
  const minCost = Math.min(...costs.map((c) => c.monthly));
  const maxCost = Math.max(...costs.map((c) => c.monthly));
  const best = costs.find((c) => c.monthly === minCost)!;
  const worst = costs.find((c) => c.monthly === maxCost)!;

  return (
    <section className="hub-pane">
      <div className="hub-card">
        <div className="hub-sec-title">Live cost estimator by model</div>
        <Slider label="Input tokens / request" v={inp} set={setInp} min={500} max={10_000} step={100} fmt={(n) => n.toLocaleString()} />
        <Slider label="Output tokens / request" v={out} set={setOut} min={100} max={3000} step={50} fmt={(n) => n.toLocaleString()} />
        <Slider label="Requests per month" v={reqs} set={setReqs} min={10_000} max={5_000_000} step={10_000} fmt={fmtN} />
      </div>

      <div className="hub-compare-grid">
        {costs.map((m) => {
          const cls = m.monthly === minCost ? "best" : m.monthly === maxCost ? "worst" : "";
          const tone = m.tier === "Frontier" ? "amber" : m.tier === "Mid" ? "blue" : "green";
          return (
            <div key={m.model} className={`hub-compare-card ${cls}`}>
              <div className="provider">{m.provider}</div>
              <div className="model">{m.model}</div>
              <div className="price">{fmt(m.monthly)}<span className="suffix">/mo</span></div>
              <div className="price2">${m.inp}/1M in · ${m.out}/1M out</div>
              <div className="meta">
                <span className={`hub-pill ${tone}`}>{m.tier}</span>
                <span className="hub-tag">{m.ctx}</span>
              </div>
              <div className="note">
                {m.monthly === minCost ? "✓ Cheapest option" : m.monthly === maxCost ? "Most expensive" : fmt(m.monthly - minCost) + " vs cheapest"}
              </div>
            </div>
          );
        })}
      </div>

      <div className="hub-insight">
        <b>At these parameters:</b> {best.provider} {best.model} costs <b>{fmt(best.monthly)}/month</b> —{" "}
        <b>{Math.round(worst.monthly / Math.max(best.monthly, 1))}×</b> cheaper than {worst.model} at {fmt(worst.monthly)}.
        For tasks where {best.model} meets quality bars, the savings are immediate.
      </div>
    </section>
  );
}

function MaturityChecker() {
  const [level, setLevel] = useState(0);
  const [done, setDone] = useState<boolean[]>(() => new Array(CHECKLISTS.length).fill(false));
  const m = MATURITY[level];
  const doneCount = done.filter(Boolean).length;

  return (
    <section className="hub-pane">
      <div className="hub-card">
        <div className="hub-sec-title">TokenOps maturity level</div>
        <div className="hub-maturity-row">
          {MATURITY.map((mm, i) => (
            <button key={mm.name} className={`hub-maturity-card ${i === level ? "active" : ""}`} onClick={() => setLevel(i)}>
              <div className="lvl">{i + 1}</div>
              <div className="name">{mm.name}</div>
            </button>
          ))}
        </div>
        <p className="hub-maturity-desc">{m.desc}</p>
        <div className="hub-tag-row">
          {m.checks.map((c) => (<span key={c} className="hub-tag">{c}</span>))}
        </div>
      </div>

      <div className="hub-card">
        <div className="hub-sec-title">Implementation checklist</div>
        <div className="hub-progress-outer"><div className="hub-progress-inner" style={{ width: (doneCount / CHECKLISTS.length) * 100 + "%" }} /></div>
        <div className="hub-progress-label">{doneCount} of {CHECKLISTS.length} complete</div>
        {CHECKLISTS.map((item, i) => (
          <label key={item.t} className="hub-check-item">
            <input
              type="checkbox"
              checked={done[i]}
              onChange={() => setDone((prev) => prev.map((v, j) => (i === j ? !v : v)))}
            />
            <div>
              <div className={done[i] ? "done" : ""}>{item.t}</div>
              <div className="sub">Level {item.l} — {["Ad hoc", "Instrumented", "Optimized", "Governed"][item.l - 1]}</div>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}

function Glossary() {
  const [q, setQ] = useState("");
  const filtered = GLOSSARY.filter((g) => g.t.toLowerCase().includes(q.toLowerCase()) || g.d.toLowerCase().includes(q.toLowerCase()));
  return (
    <section className="hub-pane">
      <div className="hub-search">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search 25+ TokenOps terms…" />
      </div>
      <div className="hub-glossary-grid">
        {filtered.map((g) => (
          <div key={g.t} className="hub-card hub-gloss-card">
            <div className="gterm">{g.t}</div>
            <div className="gdef">{g.d}</div>
          </div>
        ))}
        {filtered.length === 0 && <div className="hub-empty">No terms match "{q}".</div>}
      </div>
    </section>
  );
}

function KeyConcepts() {
  return (
    <section className="hub-pane">
      <div className="hub-card">
        <KCSection title="What is TokenOps?">
          <p>
            TokenOps is the operational discipline of applying FinOps principles — visibility, allocation, optimization,
            and governance — to LLM token consumption. As AI workloads scale from pilot to production, token costs
            compound invisibly: a single feature at $4K/month can grow to $200K/month across teams without any single
            decision triggering the increase. TokenOps prevents that.
          </p>
        </KCSection>
        <KCSection title="The five cost layers">
          <ul>
            <li><b>System prompt overhead (10–30%):</b> Every API call includes the full system prompt. At 100K daily calls with a 1,200-token prompt, that's 120M tokens/day before a single user query.</li>
            <li><b>Context &amp; memory (20–50%):</b> RAG retrieves top-10 chunks but the model often needs 2–3. Conversation history grows linearly per turn, creating 5× cost inflation by turn 10.</li>
            <li><b>Model selection:</b> Frontier models cost 50× more than open-source alternatives. Using GPT-4 for simple classification is common and expensive.</li>
            <li><b>Output length (15–35%):</b> Output tokens cost 3–5× more than input. Unconstrained prompts generate 3,000 tokens where structured JSON would take 300.</li>
            <li><b>Retry &amp; error overhead (5–20%):</b> A malformed JSON output triggering two retries consumes 4× the tokens intended for that request.</li>
          </ul>
        </KCSection>
        <KCSection title="Core optimization levers">
          <ul>
            <li><b>Prompt compression:</b> 20–50% reduction — remove redundant instructions, compress examples, use templates.</li>
            <li><b>Context trimming:</b> 30–60% reduction — sliding windows, conversation summarization, relevance-filtered RAG.</li>
            <li><b>Model tiering:</b> 30–70% reduction — route classification to Llama, extraction to mid-tier, reasoning to frontier.</li>
            <li><b>Semantic caching:</b> 40–80% reduction on high-repetition workloads — serve cached responses for semantically similar queries.</li>
            <li><b>Batch processing:</b> 50% reduction — all providers offer half-price batch APIs for non-latency-sensitive work.</li>
            <li><b>Output constraints:</b> 20–40% reduction — structured JSON output instead of free-form prose eliminates output variance.</li>
          </ul>
        </KCSection>
        <KCSection title="Key metrics to track">
          <ul>
            <li><b>Token yield rate:</b> Valuable output tokens ÷ total consumed tokens × 100. Target: 80%+</li>
            <li><b>Cost per request:</b> Monitor daily — spikes indicate prompt growth or retry storms.</li>
            <li><b>Blended cost per token:</b> Total cost ÷ total tokens. Track month-over-month.</li>
            <li><b>Cache hit rate:</b> For FAQ workloads target 60–80%; for unique queries expect 10–20%.</li>
            <li><b>Token velocity:</b> Tokens/day. Should flatten or decline as optimization compounds.</li>
          </ul>
        </KCSection>
        <KCSection title="Governance essentials">
          <ul>
            <li>Assign every production LLM workload a monthly token budget with 80% soft alerts and 100% hard limits.</li>
            <li>Tag all API calls with team, service, feature, environment, and cost center — at the gateway, not per-service.</li>
            <li>Run monthly cost reviews: actual vs. plan, optimization progress, next-priority targets.</li>
            <li>Include token cost estimates in architecture reviews before launching any AI feature.</li>
            <li>Start with showback (informational) for 90 days, then transition to chargeback once teams understand the system.</li>
          </ul>
        </KCSection>
        <div>
          <div className="hub-sec-title" style={{ marginTop: 8 }}>Relevant disciplines</div>
          <div className="hub-tag-row">
            {["FinOps","MLOps","LLMOps","Prompt engineering","RAG optimization","Model routing","API gateway","Semantic caching","Unit economics","Cost allocation","Token budgets","Observability"].map((t) => (
              <span key={t} className="hub-tag">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function KCSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="hub-kc-section">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function Slider({
  label, v, set, min, max, step, fmt,
}: { label: string; v: number; set: (n: number) => void; min: number; max: number; step: number; fmt: (n: number) => string }) {
  return (
    <div className="hub-row">
      <label>{label}</label>
      <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => set(+e.target.value)} />
      <span className="hub-val">{fmt(v)}</span>
    </div>
  );
}

function Metric({ label, val, tone }: { label: string; val: string; tone?: "green" | "blue" | "amber" | "red" }) {
  return (
    <div className="hub-metric">
      <div className="hub-metric-label">{label}</div>
      <div className={`hub-metric-val ${tone ?? ""}`}>{val}</div>
    </div>
  );
}
