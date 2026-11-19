import { test } from "node:test";
import { strict as assert } from "node:assert";
import {
  calculateAgentLoopCost,
  calculateDecisionEconomics,
  calculateWikiEconomics,
} from "./advanced-economics";
import pricing from "../../data/pricing.json";

test("Jev input-only billing uses $0.042/M and no output charge", () => {
  const model = pricing.providers.typesafe.models["jev-1.14.0"];
  assert.equal(model.input_per_mtok, 0.042);
  assert.equal(model.output_per_mtok, 0);
  const result = calculateDecisionEconomics({
    requests: 1_000_000,
    decisionTokens: 1000,
    decisionPrice: model.input_per_mtok,
    resolvedPercent: 80,
    fallbackCost: 0.01,
    monthlyOverhead: 100,
  });
  assert.equal(result.decisionCost, 42);
  assert.ok(Math.abs(result.optimized - 2142) < 1e-8);
  assert.ok(Math.abs(result.savings - 7858) < 1e-8);
});

test("LLM Wiki includes recurring maintenance and amortizes it over queries", () => {
  const result = calculateWikiEconomics({
    queries: 10000,
    rawTokens: 10000,
    wikiTokens: 2000,
    inputPrice: 2,
    maintenanceCost: 100,
  });
  assert.equal(result.baseline, 200);
  assert.equal(result.optimized, 140);
  assert.equal(result.breakEvenQueries, 6250);
});

test("a wiki with no context reduction has no break-even point", () => {
  assert.equal(
    calculateWikiEconomics({
      queries: 100,
      rawTokens: 1000,
      wikiTokens: 2000,
      inputPrice: 2,
      maintenanceCost: 10,
    }).breakEvenQueries,
    null,
  );
});

test("routing retains every fallback when no decisions are resolved", () => {
  assert.ok(
    Math.abs(
      calculateDecisionEconomics({
        requests: 100,
        decisionTokens: 1000,
        decisionPrice: 0.042,
        resolvedPercent: 0,
        fallbackCost: 1,
        monthlyOverhead: 0,
      }).optimized - 100.0042,
    ) < 1e-8,
  );
});

test("agent loop input grows with resent transcript", () => {
  const r = calculateAgentLoopCost({
    turns: 4,
    initialContextTokens: 1000,
    addedTokensPerTurn: 400,
    outputTokensPerTurn: 100,
    inputPrice: 2,
    outputPrice: 10,
    cachedInputPrice: 0.2,
    cacheHitPercent: 0,
    compactEveryTurns: 0,
  });
  assert.equal(r.inputTokens, 1000 + 1500 + 2000 + 2500);
  assert.equal(r.outputTokens, 400);
  assert.ok(Math.abs(r.naive - (7000 * 2 + 400 * 10) / 1e6) < 1e-12);
  assert.equal(r.cachedCompacted, r.naive);
});

test("agent loop compaction resets transcript and cache discounts input", () => {
  const r = calculateAgentLoopCost({
    turns: 4,
    initialContextTokens: 1000,
    addedTokensPerTurn: 400,
    outputTokensPerTurn: 100,
    inputPrice: 2,
    outputPrice: 10,
    cachedInputPrice: 0.2,
    cacheHitPercent: 50,
    compactEveryTurns: 2,
  });
  assert.equal(r.compactedInputTokens, 1000 + 1500 + 1000 + 1500);
  assert.ok(Math.abs(r.cached - (7000 * 0.5 * 2 + 7000 * 0.5 * 0.2 + 4000) / 1e6) < 1e-12);
});
