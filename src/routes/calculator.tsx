import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { providerPresets, exportScenarioCSV } from "@/tokenops/data";

export const Route = createFileRoute("/calculator")({
  component: CalculatorPage,
  head: () => ({
    meta: [
      { title: "Savings Calculator — TokenOps Atlas" },
      { name: "description", content: "Estimate the impact of caching, model routing, batching, and implementation cost." },
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
    const basePerRequest = (inputTokens * pricing.premiumInput + outputTokens * pricing.premiumOutput) / 1_000_000;
    const baselineMonthly = basePerRequest * requestsPerMonth;
    const effectiveInput = inputTokens * (1 - cacheHitRate / 100);
    const cheapShare = cheapModelShare / 100;
    const premiumShare = 1 - cheapShare;
    const premiumCost = (effectiveInput * pricing.premiumInput + outputTokens * pricing.premiumOutput) / 1_000_000;
    const cheapCost = (effectiveInput * pricing.cheapInput + outputTokens * pricing.cheapOutput) / 1_000_000;
    const batchDiscount = 1 - (batchShare / 100) * 0.5;
    const optimizedMonthly = (premiumShare * premiumCost + cheapShare * cheapCost) * requestsPerMonth * batchDiscount;
    const savings = baselineMonthly - optimizedMonthly;
    return {
      baselineMonthly,
      optimizedMonthly,
      savings,
      savingsPct: baselineMonthly ? (savings / baselineMonthly) * 100 : 0,
      paybackMonths: savings > 0 ? implementationCost / savings : 0,
    };
  }, [requestsPerMonth, inputTokens, outputTokens, cacheHitRate, batchShare, cheapModelShare, implementationCost, pricing]);

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
        <h1>TokenOps Savings Calculator</h1>
        <p>Estimate the impact of caching, model routing, batching, and implementation cost.</p>
      </div>
      <div className="calculator-layout">
        <form className="control-surface" onSubmit={(e) => e.preventDefault()}>
          <label>Pricing preset
            <select value={provider} onChange={(e) => setProvider(e.target.value)}>
              {Object.entries(providerPresets).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </label>
          <label>Requests / month<input type="number" value={requestsPerMonth} onChange={(e) => setRequestsPerMonth(Number(e.target.value))} /></label>
          <label>Input tokens / request<input type="number" value={inputTokens} onChange={(e) => setInputTokens(Number(e.target.value))} /></label>
          <label>Output tokens / request<input type="number" value={outputTokens} onChange={(e) => setOutputTokens(Number(e.target.value))} /></label>
          <label>Cache hit rate (%)<input type="number" value={cacheHitRate} onChange={(e) => setCacheHitRate(Number(e.target.value))} /></label>
          <label>Batch share (%)<input type="number" value={batchShare} onChange={(e) => setBatchShare(Number(e.target.value))} /></label>
          <label>Lower-cost model share (%)<input type="number" value={cheapModelShare} onChange={(e) => setCheapModelShare(Number(e.target.value))} /></label>
          <label>Implementation cost ($)<input type="number" value={implementationCost} onChange={(e) => setImplementationCost(Number(e.target.value))} /></label>
        </form>
        <div className="result-surface">
          <div className="metric-row"><span>Baseline monthly</span><strong>${summary.baselineMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></div>
          <div className="metric-row"><span>Optimized monthly</span><strong>${summary.optimizedMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></div>
          <div className="metric-row accent"><span>Monthly savings</span><strong>${summary.savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></div>
          <div className="metric-row"><span>Savings rate</span><strong>{summary.savingsPct.toFixed(1)}%</strong></div>
          <div className="metric-row"><span>Payback</span><strong>{summary.paybackMonths.toFixed(1)} months</strong></div>
          <div className="executive-note">
            At {requestsPerMonth.toLocaleString()} monthly requests, this scenario lowers run-rate by {summary.savingsPct.toFixed(1)}% while preserving a clear optimization audit trail.
          </div>
          <button className="primary-action button-action" type="button" onClick={exportCSV}>
            <Download size={17} /> Download CSV
          </button>
        </div>
      </div>
    </section>
  );
}