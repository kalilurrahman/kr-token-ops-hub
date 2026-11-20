import { useState } from "react";
import { NumberField, Result, dollars } from "@/components/advanced-calculators";
import { calculateBatchCost } from "@/lib/optimization-economics";
import { GENERATIVE_MODELS, ModelSelect } from "@/components/optimization-calculators";

export function BatchCalculator() {
  const [modelId, setModelId] = useState(GENERATIVE_MODELS[0]?.id ?? "");
  const [requests, setRequests] = useState(100000);
  const [inputTokens, setInputTokens] = useState(2000);
  const [outputTokens, setOutputTokens] = useState(500);
  const [eligiblePercent, setEligiblePercent] = useState(60);
  const [discountPercent, setDiscountPercent] = useState(50);
  const [overhead, setOverhead] = useState(50);
  const model = GENERATIVE_MODELS.find((entry) => entry.id === modelId);
  if (!model) return null;
  const result = calculateBatchCost({
    requests,
    inputTokens,
    outputTokens,
    eligiblePercent,
    discountPercent,
    overhead,
    inputPrice: model.inputPrice,
    outputPrice: model.outputPrice,
  });
  return (
    <article className="calc-card scroll-mt-24" id="batch-cost">
      <h2>Batch-processing break-even</h2>
      <p>
        Estimate the net benefit of moving delay-tolerant work to discounted asynchronous
        processing.
      </p>
      <div className="calc-grid">
        <form onSubmit={(event) => event.preventDefault()}>
          <ModelSelect value={modelId} onChange={setModelId} />
          <NumberField label="Requests / month" value={requests} onChange={setRequests} />
          <NumberField
            label="Input tokens / request"
            value={inputTokens}
            onChange={setInputTokens}
          />
          <NumberField
            label="Output tokens / request"
            value={outputTokens}
            onChange={setOutputTokens}
          />
          <NumberField
            label="Delay-tolerant requests (%)"
            value={eligiblePercent}
            onChange={setEligiblePercent}
            max={100}
          />
          <NumberField
            label="Assumed batch discount (%)"
            value={discountPercent}
            onChange={setDiscountPercent}
            max={100}
          />
          <NumberField
            label="Monthly queue and operations overhead ($)"
            value={overhead}
            onChange={setOverhead}
          />
        </form>
        <div className="calc-results" aria-live="polite">
          <Result label="Synchronous baseline" value={dollars(result.baseline)} />
          <Result label="Requests moved to batch" value={result.batchedRequests.toLocaleString()} />
          <Result label="Gross token-cost reduction" value={dollars(result.grossSavings)} />
          <Result label="Batch mix plus overhead" value={dollars(result.optimized)} />
          <Result label="Estimated monthly difference" value={dollars(result.savings)} />
          <Result label="Break-even overhead / month" value={dollars(result.grossSavings)} />
          <p>
            The 50% discount is a hypothetical input, not a guarantee for the selected model. Verify
            batch eligibility, provider rates, deadlines and quotas. Includes no caching discount;
            failed jobs, resubmissions and storage need separate budgeting. Negative differences
            mean overhead exceeds savings.
          </p>
        </div>
      </div>
    </article>
  );
}
