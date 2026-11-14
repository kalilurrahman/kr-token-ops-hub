import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { calculateDecisionEconomics, calculateWikiEconomics } from "@/lib/advanced-economics";
import { hostedModelOptions } from "@/tokenops/data";

const dollars = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

function NumberField({
  label,
  value,
  onChange,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
}) {
  return (
    <label>
      {label}
      <input
        type="number"
        min={0}
        max={max}
        step="any"
        value={value}
        onChange={(event) =>
          onChange(Math.min(max ?? Infinity, Math.max(0, Number(event.target.value))))
        }
      />
    </label>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function AdvancedCalculators() {
  return (
    <>
      <DecisionCalculator />
      <WikiCalculator />
    </>
  );
}

function DecisionCalculator() {
  const [requests, setRequests] = useState(1_000_000);
  const [tokens, setTokens] = useState(1000);
  const [resolved, setResolved] = useState(80);
  const [fallback, setFallback] = useState(0.01);
  const [overhead, setOverhead] = useState(100);
  const jev = hostedModelOptions.find((model) => model.id === "typesafe/jev-1.14.0");
  if (!jev) return null;
  const result = calculateDecisionEconomics({
    requests,
    decisionTokens: tokens,
    decisionPrice: jev.inputPrice,
    resolvedPercent: resolved,
    fallbackCost: fallback,
    monthlyOverhead: overhead,
  });
  return (
    <article className="calc-card" id="decision-economics">
      <h2>Decision-model routing economics</h2>
      <p>
        Jev 1.14: ${jev.inputPrice}/M input tokens, no output-token charge. Every request pays for
        classification; unresolved decisions still pay for the full fallback. Verified{" "}
        {jev.verifiedDate}.
      </p>
      <div className="calc-grid">
        <form onSubmit={(event) => event.preventDefault()}>
          <NumberField label="Decision requests / month" value={requests} onChange={setRequests} />
          <NumberField
            label="State and question tokens / request"
            value={tokens}
            onChange={setTokens}
          />
          <NumberField
            label="Resolved without an LLM (%)"
            value={resolved}
            onChange={setResolved}
            max={100}
          />
          <NumberField
            label="Fallback LLM cost / request ($)"
            value={fallback}
            onChange={setFallback}
          />
          <NumberField
            label="Monthly routing and evaluation overhead ($)"
            value={overhead}
            onChange={setOverhead}
          />
        </form>
        <div className="calc-results">
          <Result label="LLM-only baseline" value={dollars(result.baseline)} />
          <Result label="Decision-model spend" value={dollars(result.decisionCost)} />
          <Result label="Fallback spend" value={dollars(result.fallbackCost)} />
          <Result label="Proposed monthly total" value={dollars(result.optimized)} />
          <Result label="Estimated monthly difference" value={dollars(result.savings)} />
          <p>
            Hypothetical estimates, not observed savings. Validate calibration, false decisions, p95
            latency, and accepted-task quality. Generative workloads still need an LLM.
          </p>
          {tokens > 32000 && (
            <p role="status">
              Above Jev’s default 32K per-question limit; review state size and experimental
              long-context requirements.
            </p>
          )}
          <Link
            to="/read/$"
            params={{ _splat: "models/jev-system-one-decision-economics.md" }}
            className="download-btn"
          >
            Read Jev briefing
          </Link>
        </div>
      </div>
    </article>
  );
}

function WikiCalculator() {
  const [queries, setQueries] = useState(10000);
  const [raw, setRaw] = useState(10000);
  const [wiki, setWiki] = useState(2000);
  const [modelId, setModelId] = useState("google/gemini-4-hydrogen");
  const [maintenance, setMaintenance] = useState(100);
  const model = hostedModelOptions.find((entry) => entry.id === modelId) ?? hostedModelOptions[0];
  if (!model) return null;
  const result = calculateWikiEconomics({
    queries,
    rawTokens: raw,
    wikiTokens: wiki,
    inputPrice: model.inputPrice,
    maintenanceCost: maintenance,
  });
  return (
    <article className="calc-card" id="wiki-economics">
      <h2>LLM Wiki knowledge economics</h2>
      <p>
        Compare repeated raw-context input with maintained wiki pages. Include ingestion, updates,
        linting, storage, and human review in the monthly maintenance amount.
      </p>
      <div className="calc-grid">
        <form onSubmit={(event) => event.preventDefault()}>
          <label>
            Knowledge query model
            <select value={modelId} onChange={(event) => setModelId(event.target.value)}>
              {hostedModelOptions
                .filter((entry) => entry.outputPrice > 0)
                .map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.provider} · {entry.name}
                  </option>
                ))}
            </select>
          </label>
          <NumberField label="Knowledge queries / month" value={queries} onChange={setQueries} />
          <NumberField label="Raw context tokens / query" value={raw} onChange={setRaw} />
          <NumberField label="Wiki context tokens / query" value={wiki} onChange={setWiki} />
          <NumberField
            label="Amortized monthly maintenance ($)"
            value={maintenance}
            onChange={setMaintenance}
          />
        </form>
        <div className="calc-results">
          <Result label="Raw-context input spend" value={dollars(result.baseline)} />
          <Result label="Wiki input plus maintenance" value={dollars(result.optimized)} />
          <Result label="Estimated monthly difference" value={dollars(result.savings)} />
          <Result
            label="Break-even queries / month"
            value={result.breakEvenQueries?.toLocaleString() ?? "No break-even"}
          />
          <p>
            Input-context comparison only: equal output costs cancel. Retrieval, tools, changed
            answer lengths, cache discounts, and quality regressions require separate measurement.
          </p>
          <Link
            to="/read/$"
            params={{ _splat: "techniques/llm-wiki-maintained-knowledge.md" }}
            className="download-btn"
          >
            Read LLM Wiki briefing
          </Link>
        </div>
      </div>
    </article>
  );
}
