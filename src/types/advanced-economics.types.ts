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
