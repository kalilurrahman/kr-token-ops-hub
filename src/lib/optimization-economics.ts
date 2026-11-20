import type {
  BatchCostInput,
  PayloadCostInput,
  QualityCostInput,
} from "@/types/optimization-economics.types";

const nonnegative = (value: number) => (Number.isFinite(value) ? Math.max(0, value) : 0);
const fraction = (value: number) => Math.min(100, nonnegative(value)) / 100;
const requestCost = (input: QualityCostInput | BatchCostInput) =>
  (nonnegative(input.inputTokens) * nonnegative(input.inputPrice) +
    nonnegative(input.outputTokens) * nonnegative(input.outputPrice)) /
  1_000_000;

export function calculateQualityCost(input: QualityCostInput) {
  const success = fraction(input.successPercent);
  const attempts = Math.min(20, Math.max(1, Math.floor(nonnegative(input.maxAttempts))));
  // Stop retrying after the first accepted result; otherwise exhaust the attempt cap.
  let expectedAttempts = 0;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    expectedAttempts += (1 - success) ** attempt;
  }
  const completionRate = 1 - (1 - success) ** attempts;
  const acceptedTasks = nonnegative(input.tasks) * completionRate;
  const monthlyCost = nonnegative(input.tasks) * expectedAttempts * requestCost(input);
  return {
    expectedAttempts,
    completionRate,
    acceptedTasks,
    monthlyCost,
    costPerAcceptedTask: acceptedTasks > 0 ? monthlyCost / acceptedTasks : null,
  };
}

export function calculatePayloadCost(input: PayloadCostInput) {
  const tokens =
    nonnegative(input.runs) *
    nonnegative(input.toolCalls) *
    nonnegative(input.payloadTokens) *
    nonnegative(input.reuseCount);
  const baseline = (tokens * nonnegative(input.inputPrice)) / 1_000_000;
  const optimized = baseline * fraction(input.retainedPercent) + nonnegative(input.overhead);
  return {
    tokens,
    avoidedTokens: tokens * (1 - fraction(input.retainedPercent)),
    baseline,
    optimized,
    savings: baseline - optimized,
  };
}

export function calculateBatchCost(input: BatchCostInput) {
  const baseline = nonnegative(input.requests) * requestCost(input);
  const eligible = fraction(input.eligiblePercent);
  const grossSavings = baseline * eligible * fraction(input.discountPercent);
  const optimized = baseline - grossSavings + nonnegative(input.overhead);
  return {
    baseline,
    optimized,
    savings: baseline - optimized,
    batchedRequests: nonnegative(input.requests) * eligible,
    grossSavings,
  };
}
