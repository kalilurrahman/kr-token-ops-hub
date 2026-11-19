export interface DecisionEconomicsInput {
  requests: number;
  decisionTokens: number;
  decisionPrice: number;
  resolvedPercent: number;
  fallbackCost: number;
  monthlyOverhead: number;
}

export interface WikiEconomicsInput {
  queries: number;
  rawTokens: number;
  wikiTokens: number;
  inputPrice: number;
  maintenanceCost: number;
}

export interface AgentLoopInput {
  turns: number;
  initialContextTokens: number;
  addedTokensPerTurn: number;
  outputTokensPerTurn: number;
  inputPrice: number;
  outputPrice: number;
  cachedInputPrice: number;
  cacheHitPercent: number;
  compactEveryTurns: number;
}
