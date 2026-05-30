import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import {
  providerPresets,
  exportScenarioCSV,
  calcRAGCost,
  calcRoutingSavings,
  calcBudgetBurnRate,
  calcCachingROI,
  calcTCO,
} from "@/tokenops/data";

export const Route = createFileRoute("/calculator")({
  component: CalculatorPage,
  head: () => ({
    meta: [
      { title: "Savings Calculator — TokenOps Atlas" },
      {
        name: "description",
        content:
          "Estimate the impact of caching, model routing, batching, and implementation cost.",
      },
    ],
  }),
});

function CalculatorPage() {
  const [provider, setProvider] = useState("openai");
  const [requestsPerMonth, setRequestsPerMonth] = useState(3_000_000);
  const [inputTokens, setInputTokens] = useState(1800);
  const [outputTokens, setOutputTokens] = useState(450);
  const [cacheHitRate, setCacheHitRate] = useState(35);
  const [batchShare, setBatchShare] = useState(30);
  const [cheapModelShare, setCheapModelShare] = useState(60);
  const [implementationCost, setImplementationCost] = useState(25_000);
  const pricing = providerPresets[provider];

  const summary = useMemo(() => {
    const basePerRequest =
      (inputTokens * pricing.premiumInput + outputTokens * pricing.premiumOutput) / 1_000_000;
    const baselineMonthly = basePerRequest * requestsPerMonth;
    const effectiveInput = inputTokens * (1 - cacheHitRate / 100);
    const cheapShare = cheapModelShare / 100;
    const premiumShare = 1 - cheapShare;
    const premiumCost =
      (effectiveInput * pricing.premiumInput + outputTokens * pricing.premiumOutput) / 1_000_000;
    const cheapCost =
      (effectiveInput * pricing.cheapInput + outputTokens * pricing.cheapOutput) / 1_000_000;
    const batchDiscount = 1 - (batchShare / 100) * 0.5;
    const optimizedMonthly =
      (premiumShare * premiumCost + cheapShare * cheapCost) * requestsPerMonth * batchDiscount;
    const savings = baselineMonthly - optimizedMonthly;
    return {
      baselineMonthly,
      optimizedMonthly,
      savings,
      savingsPct: baselineMonthly ? (savings / baselineMonthly) * 100 : 0,
      paybackMonths: savings > 0 ? implementationCost / savings : 0,
    };
  }, [
    requestsPerMonth,
    inputTokens,
    outputTokens,
    cacheHitRate,
    batchShare,
    cheapModelShare,
    implementationCost,
    pricing,
  ]);

  const exportCSV = () => {
    exportScenarioCSV([
      ["Provider", providerPresets[provider].label],
      ["Requests/Month", requestsPerMonth],
      ["Input Tokens", inputTokens],
      ["Output Tokens", outputTokens],
      ["Cache Hit Rate", `${cacheHitRate}%`],
      ["Batch Share", `${batchShare}%`],
      ["Lower-cost Model Share", `${cheapModelShare}%`],
      ["Baseline Monthly USD", summary.baselineMonthly.toFixed(2)],
      ["Optimized Monthly USD", summary.optimizedMonthly.toFixed(2)],
      ["Monthly Savings USD", summary.savings.toFixed(2)],
      ["Savings Percent", `${summary.savingsPct.toFixed(1)}%`],
      ["Payback Months", summary.paybackMonths.toFixed(1)],
    ]);
  };

  return (
    <section className="stack">
      <div className="page-heading">
        <p className="eyebrow">Calculators</p>
        <h1>TokenOps Savings Calculator</h1>
        <p>
          Six intelligent calculators: blended savings, RAG cost, model routing, budget burn rate,
          prompt caching ROI, and total cost of ownership.
        </p>
      </div>
      <div className="calculator-layout">
        <form className="control-surface" onSubmit={(e) => e.preventDefault()}>
          <label>
            Pricing preset
            <select value={provider} onChange={(e) => setProvider(e.target.value)}>
              {Object.entries(providerPresets).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Requests / month
            <input
              type="number"
              value={requestsPerMonth}
              onChange={(e) => setRequestsPerMonth(Number(e.target.value))}
            />
          </label>
          <label>
            Input tokens / request
            <input
              type="number"
              value={inputTokens}
              onChange={(e) => setInputTokens(Number(e.target.value))}
            />
          </label>
          <label>
            Output tokens / request
            <input
              type="number"
              value={outputTokens}
              onChange={(e) => setOutputTokens(Number(e.target.value))}
            />
          </label>
          <label>
            Cache hit rate (%)
            <input
              type="number"
              value={cacheHitRate}
              onChange={(e) => setCacheHitRate(Number(e.target.value))}
            />
          </label>
          <label>
            Batch share (%)
            <input
              type="number"
              value={batchShare}
              onChange={(e) => setBatchShare(Number(e.target.value))}
            />
          </label>
          <label>
            Lower-cost model share (%)
            <input
              type="number"
              value={cheapModelShare}
              onChange={(e) => setCheapModelShare(Number(e.target.value))}
            />
          </label>
          <label>
            Implementation cost ($)
            <input
              type="number"
              value={implementationCost}
              onChange={(e) => setImplementationCost(Number(e.target.value))}
            />
          </label>
        </form>
        <div className="result-surface">
          <div className="metric-row">
            <span>Baseline monthly</span>
            <strong>
              ${summary.baselineMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </strong>
          </div>
          <div className="metric-row">
            <span>Optimized monthly</span>
            <strong>
              ${summary.optimizedMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </strong>
          </div>
          <div className="metric-row accent">
            <span>Monthly savings</span>
            <strong>
              ${summary.savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </strong>
          </div>
          <div className="metric-row">
            <span>Savings rate</span>
            <strong>{summary.savingsPct.toFixed(1)}%</strong>
          </div>
          <div className="metric-row">
            <span>Payback</span>
            <strong>{summary.paybackMonths.toFixed(1)} months</strong>
          </div>
          <div className="executive-note">
            At {requestsPerMonth.toLocaleString()} monthly requests, this scenario lowers run-rate
            by {summary.savingsPct.toFixed(1)}% while preserving a clear optimization audit trail.
          </div>
          <button className="primary-action button-action" type="button" onClick={exportCSV}>
            <Download size={17} /> Download CSV
          </button>
        </div>
      </div>

      <div className="calc-stack">
        <RAGCalculator />
        <RoutingCalculator />
        <BudgetCalculator />
        <CachingCalculator />
        <TCOCalculator />
      </div>
    </section>
  );
}

const fmt = (n: number, d = 0) =>
  Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: d }) : "—";
const usd = (n: number, d = 0) => "$" + fmt(n, d);

function NumField({
  label,
  value,
  set,
  step,
}: {
  label: string;
  value: number;
  set: (n: number) => void;
  step?: number;
}) {
  return (
    <label>
      {label}
      <input
        type="number"
        value={value}
        step={step ?? 1}
        onChange={(e) => set(Number(e.target.value))}
      />
    </label>
  );
}

function RAGCalculator() {
  const [docs, setDocs] = useState(5);
  const [chunk, setChunk] = useState(350);
  const [qpd, setQpd] = useState(12000);
  const [sys, setSys] = useState(1200);
  const [out, setOut] = useState(400);
  const [pIn, setPIn] = useState(3);
  const [pOut, setPOut] = useState(15);
  const [hit, setHit] = useState(0.5);
  const [disc, setDisc] = useState(0.9);
  const r = useMemo(
    () =>
      calcRAGCost({
        docsPerQuery: docs,
        avgChunkTokens: chunk,
        queriesPerDay: qpd,
        systemPromptTokens: sys,
        avgOutputTokens: out,
        modelInputPrice: pIn,
        modelOutputPrice: pOut,
        cacheHitRate: hit,
        cachePriceDiscount: disc,
      }),
    [docs, chunk, qpd, sys, out, pIn, pOut, hit, disc],
  );
  return (
    <div className="calc-card">
      <h2>RAG Pipeline Cost Estimator</h2>
      <p>
        Model the true cost of retrieval-augmented generation including chunk context, system
        prompts, and cache hit rates.
      </p>
      <div className="calc-grid">
        <form onSubmit={(e) => e.preventDefault()}>
          <NumField label="Chunks retrieved per query" value={docs} set={setDocs} />
          <NumField label="Avg tokens per chunk" value={chunk} set={setChunk} />
          <NumField label="Queries per day" value={qpd} set={setQpd} />
          <NumField label="System prompt tokens" value={sys} set={setSys} />
          <NumField label="Avg output tokens" value={out} set={setOut} />
          <NumField label="Input $ / 1M" value={pIn} set={setPIn} step={0.01} />
          <NumField label="Output $ / 1M" value={pOut} set={setPOut} step={0.01} />
          <NumField label="Cache hit rate (0–1)" value={hit} set={setHit} step={0.05} />
          <NumField label="Cache discount (0–1)" value={disc} set={setDisc} step={0.05} />
        </form>
        <div className="calc-results">
          <div className="row">
            <span>Input tokens / query</span>
            <strong>{fmt(r.inputTokensPerQuery)}</strong>
          </div>
          <div className="row">
            <span>Cost per query</span>
            <strong>{usd(r.costPerQuery, 4)}</strong>
          </div>
          <div className="row">
            <span>Daily cost</span>
            <strong>{usd(r.dailyCost)}</strong>
          </div>
          <div className="row">
            <span>Monthly (no cache)</span>
            <strong>{usd(r.monthlyCost)}</strong>
          </div>
          <div className="row accent">
            <span>Monthly (with cache)</span>
            <strong>{usd(r.monthlyCostWithCache)}</strong>
          </div>
          <div className="row">
            <span>Cache savings</span>
            <strong>{usd(r.cacheSavings)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoutingCalculator() {
  const [calls, setCalls] = useState(3_000_000);
  const [premF, setPremF] = useState(0.3);
  const [cheapF, setCheapF] = useState(0.7);
  const [inT, setInT] = useState(1500);
  const [outT, setOutT] = useState(400);
  const [pI, setPI] = useState(3);
  const [pO, setPO] = useState(15);
  const [cI, setCI] = useState(0.15);
  const [cO, setCO] = useState(0.6);
  const r = useMemo(
    () =>
      calcRoutingSavings({
        totalCallsPerMonth: calls,
        premiumFraction: premF,
        cheapFraction: cheapF,
        avgInputTokens: inT,
        avgOutputTokens: outT,
        premiumInputPrice: pI,
        premiumOutputPrice: pO,
        cheapInputPrice: cI,
        cheapOutputPrice: cO,
      }),
    [calls, premF, cheapF, inT, outT, pI, pO, cI, cO],
  );
  const status = r.savingsPercent > 50 ? "ok" : r.savingsPercent > 20 ? "warn" : "bad";
  return (
    <div className="calc-card">
      <h2>Model Routing Savings</h2>
      <p>
        Calculate monthly and annual savings from routing a fraction of traffic to cheaper models.
      </p>
      <div className="calc-grid">
        <form onSubmit={(e) => e.preventDefault()}>
          <NumField label="Total calls / month" value={calls} set={setCalls} />
          <NumField label="Premium share (0–1)" value={premF} set={setPremF} step={0.05} />
          <NumField label="Cheap share (0–1)" value={cheapF} set={setCheapF} step={0.05} />
          <NumField label="Avg input tokens" value={inT} set={setInT} />
          <NumField label="Avg output tokens" value={outT} set={setOutT} />
          <NumField label="Premium in $/1M" value={pI} set={setPI} step={0.01} />
          <NumField label="Premium out $/1M" value={pO} set={setPO} step={0.01} />
          <NumField label="Cheap in $/1M" value={cI} set={setCI} step={0.01} />
          <NumField label="Cheap out $/1M" value={cO} set={setCO} step={0.01} />
        </form>
        <div className="calc-results">
          <div className="row">
            <span>Baseline / month</span>
            <strong>{usd(r.baselineMonthlyCost)}</strong>
          </div>
          <div className="row">
            <span>Optimised / month</span>
            <strong>{usd(r.optimisedMonthlyCost)}</strong>
          </div>
          <div className="row accent">
            <span>Monthly savings</span>
            <strong>{usd(r.monthlySavings)}</strong>
          </div>
          <div className="row">
            <span>Annual savings</span>
            <strong>{usd(r.annualSavings)}</strong>
          </div>
          <div className="row">
            <span>Savings rate</span>
            <strong>{r.savingsPercent.toFixed(1)}%</strong>
          </div>
          <span className={`calc-status ${status}`}>
            {status === "ok" ? "Excellent" : status === "warn" ? "Good" : "Marginal"}
          </span>
        </div>
      </div>
    </div>
  );
}

function BudgetCalculator() {
  const [budget, setBudget] = useState(50_000);
  const [day, setDay] = useState(15);
  const [spend, setSpend] = useState(28_000);
  const r = useMemo(
    () =>
      calcBudgetBurnRate({
        monthlyBudgetUSD: budget,
        currentDayOfMonth: day,
        spendToDate: spend,
        projectedGrowthRate: 0,
      }),
    [budget, day, spend],
  );
  const status = r.status === "on-track" ? "ok" : r.status === "warning" ? "warn" : "bad";
  return (
    <div className="calc-card">
      <h2>Budget Burn Rate Monitor</h2>
      <p>
        Project end-of-month spend from current burn, flag warnings, and compute daily budget
        targets.
      </p>
      <div className="calc-grid">
        <form onSubmit={(e) => e.preventDefault()}>
          <NumField label="Monthly budget ($)" value={budget} set={setBudget} />
          <NumField label="Day of month (1–31)" value={day} set={setDay} />
          <NumField label="Spend to date ($)" value={spend} set={setSpend} />
        </form>
        <div className="calc-results">
          <div className="row">
            <span>Daily burn</span>
            <strong>{usd(r.dailyBurnRate)}</strong>
          </div>
          <div className="row">
            <span>Recommended daily</span>
            <strong>{usd(r.recommendedDailyBudget)}</strong>
          </div>
          <div className="row">
            <span>Projected month-end</span>
            <strong>{usd(r.projectedMonthEnd)}</strong>
          </div>
          <div className="row accent">
            <span>Budget utilisation</span>
            <strong>{r.budgetUtilization.toFixed(1)}%</strong>
          </div>
          <div className="row">
            <span>Days until budget hit</span>
            <strong>{r.daysUntilBudgetHit ?? "—"}</strong>
          </div>
          <span className={`calc-status ${status}`}>{r.status}</span>
        </div>
      </div>
    </div>
  );
}

function CachingCalculator() {
  const [sys, setSys] = useState(2500);
  const [calls, setCalls] = useState(20_000);
  const [pIn, setPIn] = useState(3);
  const [wPrice, setWPrice] = useState(3.75);
  const [rPrice, setRPrice] = useState(0.3);
  const [hit, setHit] = useState(0.7);
  const r = useMemo(
    () =>
      calcCachingROI({
        systemPromptTokens: sys,
        callsPerDay: calls,
        modelInputPrice: pIn,
        cacheWritePrice: wPrice,
        cacheReadPrice: rPrice,
        cacheHitRate: hit,
      }),
    [sys, calls, pIn, wPrice, rPrice, hit],
  );
  return (
    <div className="calc-card">
      <h2>Prompt Caching ROI</h2>
      <p>
        Quantify savings from Anthropic or OpenAI prompt caching given hit rate, write cost, and
        call volume.
      </p>
      <div className="calc-grid">
        <form onSubmit={(e) => e.preventDefault()}>
          <NumField label="System prompt tokens" value={sys} set={setSys} />
          <NumField label="Calls / day" value={calls} set={setCalls} />
          <NumField label="Input $/1M" value={pIn} set={setPIn} step={0.01} />
          <NumField label="Cache write $/1M" value={wPrice} set={setWPrice} step={0.01} />
          <NumField label="Cache read $/1M" value={rPrice} set={setRPrice} step={0.01} />
          <NumField label="Cache hit rate (0–1)" value={hit} set={setHit} step={0.05} />
        </form>
        <div className="calc-results">
          <div className="row">
            <span>Baseline daily</span>
            <strong>{usd(r.baselineDailyCost, 2)}</strong>
          </div>
          <div className="row">
            <span>Cached daily</span>
            <strong>{usd(r.cachedDailyCost, 2)}</strong>
          </div>
          <div className="row accent">
            <span>Daily savings</span>
            <strong>{usd(r.dailySavings, 2)}</strong>
          </div>
          <div className="row">
            <span>Monthly savings</span>
            <strong>{usd(r.monthlySavings)}</strong>
          </div>
          <div className="row">
            <span>Break-even calls</span>
            <strong>{Number.isFinite(r.breakEvenCalls) ? fmt(r.breakEvenCalls) : "—"}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function TCOCalculator() {
  const [tok, setTok] = useState(45_000);
  const [infra, setInfra] = useState(8_000);
  const [engH, setEngH] = useState(120);
  const [engR, setEngR] = useState(150);
  const [opsH, setOpsH] = useState(40);
  const [opsR, setOpsR] = useState(95);
  const [rev, setRev] = useState(180_000);
  const [churn, setChurn] = useState(35_000);
  const r = useMemo(
    () =>
      calcTCO({
        monthlyTokenCostUSD: tok,
        monthlyInfraUSD: infra,
        monthlyEngineeringHours: engH,
        engineerHourlyRate: engR,
        monthlyOperationsHours: opsH,
        opsHourlyRate: opsR,
        monthlyRevenueLift: rev,
        monthlyChurnReduction: churn,
      }),
    [tok, infra, engH, engR, opsH, opsR, rev, churn],
  );
  const status = r.roi > 100 ? "ok" : r.roi > 0 ? "warn" : "bad";
  return (
    <div className="calc-card">
      <h2>LLM Feature TCO &amp; ROI</h2>
      <p>
        Go beyond token cost — include infra, engineering, and ops to compute true ROI and payback
        period.
      </p>
      <div className="calc-grid">
        <form onSubmit={(e) => e.preventDefault()}>
          <NumField label="Monthly token cost ($)" value={tok} set={setTok} />
          <NumField label="Monthly infra ($)" value={infra} set={setInfra} />
          <NumField label="Engineering hours / mo" value={engH} set={setEngH} />
          <NumField label="Engineer rate ($/hr)" value={engR} set={setEngR} />
          <NumField label="Ops hours / mo" value={opsH} set={setOpsH} />
          <NumField label="Ops rate ($/hr)" value={opsR} set={setOpsR} />
          <NumField label="Monthly revenue lift ($)" value={rev} set={setRev} />
          <NumField label="Monthly churn reduction ($)" value={churn} set={setChurn} />
        </form>
        <div className="calc-results">
          <div className="row">
            <span>Total monthly cost</span>
            <strong>{usd(r.totalMonthlyCost)}</strong>
          </div>
          <div className="row">
            <span>Total monthly benefit</span>
            <strong>{usd(r.totalMonthlyBenefit)}</strong>
          </div>
          <div className="row accent">
            <span>Net cashflow / mo</span>
            <strong>{usd(r.netMonthlyCashflow)}</strong>
          </div>
          <div className="row">
            <span>ROI</span>
            <strong>{r.roi.toFixed(1)}%</strong>
          </div>
          <div className="row">
            <span>Token cost share</span>
            <strong>{r.tokenCostFraction.toFixed(1)}%</strong>
          </div>
          <div className="row">
            <span>Payback</span>
            <strong>{r.paybackMonths ? `${r.paybackMonths} mo` : "—"}</strong>
          </div>
          <span className={`calc-status ${status}`}>
            {status === "ok" ? "Strong ROI" : status === "warn" ? "Positive" : "Underwater"}
          </span>
        </div>
      </div>
    </div>
  );
}
