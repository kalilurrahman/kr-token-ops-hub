import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { calculateAgentLoopCost } from "@/lib/advanced-economics";
import { hostedModelOptions } from "@/tokenops/data";
import { NumberField, Result, dollars } from "@/components/advanced-calculators";

export function AgentLoopCalculator() {
  const priced = hostedModelOptions.filter((entry) => entry.outputPrice > 0);
  const [modelId, setModelId] = useState(priced[0]?.id ?? "");
  const [runs, setRuns] = useState(10000);
  const [turns, setTurns] = useState(20);
  const [initial, setInitial] = useState(8000);
  const [added, setAdded] = useState(1500);
  const [output, setOutput] = useState(400);
  const [hit, setHit] = useState(70);
  const [compact, setCompact] = useState(8);
  const model = priced.find((entry) => entry.id === modelId) ?? priced[0];
  if (!model) return null;
  const cachedPrice = model.cachedInputPrice ?? model.inputPrice;
  const r = calculateAgentLoopCost({
    turns,
    initialContextTokens: initial,
    addedTokensPerTurn: added,
    outputTokensPerTurn: output,
    inputPrice: model.inputPrice,
    outputPrice: model.outputPrice,
    cachedInputPrice: cachedPrice,
    cacheHitPercent: hit,
    compactEveryTurns: compact,
  });
  return (
    <article className="calc-card" id="agent-loop-economics">
      <h2>Agent loop cost: resent context, caching and compaction</h2>
      <p>
        Each agent turn resends the whole transcript, so input tokens grow roughly with the square
        of the turn count. Compare no controls, prompt caching, and caching plus periodic
        compaction.
      </p>
      <div className="calc-grid">
        <form onSubmit={(event) => event.preventDefault()}>
          <label>
            Agent model
            <select value={model.id} onChange={(event) => setModelId(event.target.value)}>
              {priced.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.provider} · {entry.name}
                </option>
              ))}
            </select>
          </label>
          <NumberField label="Agent runs / month" value={runs} onChange={setRuns} />
          <NumberField label="Turns per run" value={turns} onChange={setTurns} max={500} />
          <NumberField
            label="System, tools and task tokens"
            value={initial}
            onChange={setInitial}
          />
          <NumberField label="Tool-result tokens added / turn" value={added} onChange={setAdded} />
          <NumberField label="Output tokens / turn" value={output} onChange={setOutput} />
          <NumberField
            label="Cache hit on resent input (%)"
            value={hit}
            onChange={setHit}
            max={100}
          />
          <NumberField
            label="Compact every N turns (0 = never)"
            value={compact}
            onChange={setCompact}
          />
        </form>
        <div className="calc-results">
          <Result label="Input tokens / run" value={r.inputTokens.toLocaleString("en-US")} />
          <Result label="No controls / month" value={dollars(r.naive * runs)} />
          <Result label="With prompt caching" value={dollars(r.cached * runs)} />
          <Result label="Caching plus compaction" value={dollars(r.cachedCompacted * runs)} />
          <Result
            label="Estimated monthly difference"
            value={dollars((r.naive - r.cachedCompacted) * runs)}
          />
          <p>
            Hypothetical estimate using {model.name} list prices
            {model.cachedInputPrice === null
              ? " (no cached-input price listed, so caching is not discounted)"
              : ""}
            . Compaction summaries cost tokens and can drop facts; cache writes may carry a premium.
            Measure task success before and after.
          </p>
          <Link
            to="/read/$"
            params={{ _splat: "techniques/agent-loop-economics.md" }}
            className="download-btn"
          >
            Read agent loop briefing
          </Link>
        </div>
      </div>
    </article>
  );
}
