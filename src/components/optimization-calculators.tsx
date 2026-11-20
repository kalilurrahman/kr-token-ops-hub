import { BatchCalculator } from "@/components/batch-calculator";
import { useState } from "react";
import { NumberField, Result, dollars } from "@/components/advanced-calculators";
import { calculatePayloadCost, calculateQualityCost } from "@/lib/optimization-economics";
import { hostedModelOptions } from "@/tokenops/data";

export const GENERATIVE_MODELS = hostedModelOptions.filter((model) => model.outputPrice > 0);

export function ModelSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      Priced hosted model
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {GENERATIVE_MODELS.map((model) => (
          <option key={model.id} value={model.id}>
            {model.provider} · {model.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function OptimizationCalculators() {
  return (
    <>
      <QualityCalculator />
      <PayloadCalculator />
      <BatchCalculator />
    </>
  );
}

function QualityCalculator() {
  const [modelId, setModelId] = useState(GENERATIVE_MODELS[0]?.id ?? "");
  const [tasks, setTasks] = useState(100000);
  const [inputTokens, setInputTokens] = useState(2000);
  const [outputTokens, setOutputTokens] = useState(500);
  const [successPercent, setSuccessPercent] = useState(80);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const model = GENERATIVE_MODELS.find((entry) => entry.id === modelId);
  if (!model) return null;
  const result = calculateQualityCost({
    tasks,
    inputTokens,
    outputTokens,
    successPercent,
    maxAttempts,
    inputPrice: model.inputPrice,
    outputPrice: model.outputPrice,
  });
  return (
    <article className="calc-card scroll-mt-24" id="quality-cost">
      <h2>Quality-adjusted cost and retry budget</h2>
      <p>
        Price successful tasks rather than calls. Rejected results trigger another attempt, up to
        the limit.
      </p>
      <div className="calc-grid">
        <form onSubmit={(event) => event.preventDefault()}>
          <ModelSelect value={modelId} onChange={setModelId} />
          <NumberField label="Tasks / month" value={tasks} onChange={setTasks} />
          <NumberField
            label="Input tokens / attempt"
            value={inputTokens}
            onChange={setInputTokens}
          />
          <NumberField
            label="Output tokens / attempt"
            value={outputTokens}
            onChange={setOutputTokens}
          />
          <NumberField
            label="Accepted results per attempt (%)"
            value={successPercent}
            onChange={setSuccessPercent}
            max={100}
          />
          <NumberField
            label="Maximum attempts (1–20)"
            value={maxAttempts}
            onChange={(value) => setMaxAttempts(Math.max(1, Math.floor(value)))}
            max={20}
          />
        </form>
        <div className="calc-results" aria-live="polite">
          <Result label="Expected attempts / task" value={result.expectedAttempts.toFixed(2)} />
          <Result
            label="Estimated accepted tasks"
            value={result.acceptedTasks.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          />
          <Result
            label="Task completion rate"
            value={`${(result.completionRate * 100).toFixed(1)}%`}
          />
          <Result label="Estimated monthly spend" value={dollars(result.monthlyCost)} />
          <Result
            label="Cost / accepted task (USD)"
            value={
              result.costPerAcceptedTask === null
                ? "No accepted tasks"
                : result.costPerAcceptedTask.toFixed(6)
            }
          />
          <p>
            Assumes independent attempts with equal token cost and success probability. Repeated
            failures may be correlated; retries can enlarge context. Validation, tools and human
            review are excluded. Use measured acceptance rates, not model claims.
          </p>
        </div>
      </div>
    </article>
  );
}

function PayloadCalculator() {
  const [modelId, setModelId] = useState(GENERATIVE_MODELS[0]?.id ?? "");
  const [runs, setRuns] = useState(10000);
  const [toolCalls, setToolCalls] = useState(8);
  const [payloadTokens, setPayloadTokens] = useState(3000);
  const [retainedPercent, setRetainedPercent] = useState(25);
  const [reuseCount, setReuseCount] = useState(4);
  const [overhead, setOverhead] = useState(100);
  const model = GENERATIVE_MODELS.find((entry) => entry.id === modelId);
  if (!model) return null;
  const result = calculatePayloadCost({
    runs,
    toolCalls,
    payloadTokens,
    retainedPercent,
    reuseCount,
    overhead,
    inputPrice: model.inputPrice,
  });
  return (
    <article className="calc-card scroll-mt-24" id="tool-payload-cost">
      <h2>Tool-result trimming economics</h2>
      <p>
        Compare full tool responses with selected fields, deduplicated results or bounded excerpts,
        including later context resends.
      </p>
      <div className="calc-grid">
        <form onSubmit={(event) => event.preventDefault()}>
          <ModelSelect value={modelId} onChange={setModelId} />
          <NumberField label="Agent runs / month" value={runs} onChange={setRuns} />
          <NumberField label="Tool results / run" value={toolCalls} onChange={setToolCalls} />
          <NumberField
            label="Full payload tokens / result"
            value={payloadTokens}
            onChange={setPayloadTokens}
          />
          <NumberField
            label="Payload retained (%)"
            value={retainedPercent}
            onChange={setRetainedPercent}
            max={100}
          />
          <NumberField
            label="Times each payload is sent to the model"
            value={reuseCount}
            onChange={setReuseCount}
          />
          <NumberField
            label="Monthly filtering and review overhead ($)"
            value={overhead}
            onChange={setOverhead}
          />
        </form>
        <div className="calc-results" aria-live="polite">
          <Result label="Baseline payload input tokens" value={result.tokens.toLocaleString()} />
          <Result label="Avoided input tokens" value={result.avoidedTokens.toLocaleString()} />
          <Result label="Baseline payload spend" value={dollars(result.baseline)} />
          <Result label="Trimmed payload plus overhead" value={dollars(result.optimized)} />
          <Result label="Estimated monthly difference" value={dollars(result.savings)} />
          <p>
            Payload input only, at uncached list prices. Other context and outputs are unchanged.
            Count initial delivery and later resends together; do not add this saving to an
            overlapping compaction estimate. Preserve evidence, error details and task-critical
            fields.
          </p>
        </div>
      </div>
    </article>
  );
}
