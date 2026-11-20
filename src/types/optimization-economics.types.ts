export interface QualityCostInput {
  tasks: number;
  inputTokens: number;
  outputTokens: number;
  inputPrice: number;
  outputPrice: number;
  successPercent: number;
  maxAttempts: number;
}

export interface PayloadCostInput {
  runs: number;
  toolCalls: number;
  payloadTokens: number;
  retainedPercent: number;
  reuseCount: number;
  inputPrice: number;
  overhead: number;
}

export interface BatchCostInput {
  requests: number;
  inputTokens: number;
  outputTokens: number;
  inputPrice: number;
  outputPrice: number;
  eligiblePercent: number;
  discountPercent: number;
  overhead: number;
}
