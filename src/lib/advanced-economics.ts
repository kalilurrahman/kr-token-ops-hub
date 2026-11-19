import type {
  AgentLoopInput,
  DecisionEconomicsInput,
  WikiEconomicsInput,
} from "@/types/advanced-economics.types";

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

/**
 * Agent loops resend the growing transcript every turn, so input grows roughly
 * quadratically. Compaction resets the transcript to the initial context.
 */
export function calculateAgentLoopCost(input: AgentLoopInput) {
  const turns = Math.floor(nonnegative(input.turns));
  const base = nonnegative(input.initialContextTokens);
  const added = nonnegative(input.addedTokensPerTurn) + nonnegative(input.outputTokensPerTurn);
  const compactEvery = Math.floor(nonnegative(input.compactEveryTurns));
  const hit = Math.min(100, nonnegative(input.cacheHitPercent)) / 100;
  let inputTokens = 0;
  let compactedInputTokens = 0;
  for (let turn = 0; turn < turns; turn += 1) {
    inputTokens += base + added * turn;
    const sinceReset = compactEvery > 0 ? turn % compactEvery : turn;
    compactedInputTokens += base + added * sinceReset;
  }
  const outputTokens = turns * nonnegative(input.outputTokensPerTurn);
  const outputCost = (outputTokens * nonnegative(input.outputPrice)) / 1_000_000;
  const priceInput = (tokens: number) =>
    (tokens * (1 - hit) * nonnegative(input.inputPrice) +
      tokens * hit * nonnegative(input.cachedInputPrice)) /
    1_000_000;
  const naive = (inputTokens * nonnegative(input.inputPrice)) / 1_000_000 + outputCost;
  const cached = priceInput(inputTokens) + outputCost;
  const cachedCompacted = priceInput(compactedInputTokens) + outputCost;
  return { inputTokens, compactedInputTokens, outputTokens, naive, cached, cachedCompacted };
}
