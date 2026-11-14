import type { DecisionEconomicsInput, WikiEconomicsInput } from "@/types/advanced-economics.types";

const nonnegative = (value: number) => (Number.isFinite(value) ? Math.max(0, value) : 0);

export function calculateDecisionEconomics(input: DecisionEconomicsInput) {
  const requests = nonnegative(input.requests);
  const resolved = Math.min(100, nonnegative(input.resolvedPercent)) / 100;
  const baseline = requests * nonnegative(input.fallbackCost);
  const decisionCost =
    (requests * nonnegative(input.decisionTokens) * nonnegative(input.decisionPrice)) / 1_000_000;
  const fallbackCost = baseline * (1 - resolved);
  const optimized = decisionCost + fallbackCost + nonnegative(input.monthlyOverhead);
  return { baseline, decisionCost, fallbackCost, optimized, savings: baseline - optimized };
}

export function calculateWikiEconomics(input: WikiEconomicsInput) {
  const rawPerQuery = (nonnegative(input.rawTokens) * nonnegative(input.inputPrice)) / 1_000_000;
  const wikiPerQuery = (nonnegative(input.wikiTokens) * nonnegative(input.inputPrice)) / 1_000_000;
  const baseline = nonnegative(input.queries) * rawPerQuery;
  const maintenance = nonnegative(input.maintenanceCost);
  const optimized = nonnegative(input.queries) * wikiPerQuery + maintenance;
  const avoidedPerQuery = rawPerQuery - wikiPerQuery;
  return {
    baseline,
    optimized,
    savings: baseline - optimized,
    breakEvenQueries: avoidedPerQuery > 0 ? Math.ceil(maintenance / avoidedPerQuery) : null,
  };
}
