import { test } from "node:test";
import { strict as assert } from "node:assert";
import { calculateDecisionEconomics, calculateWikiEconomics } from "./advanced-economics";
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
