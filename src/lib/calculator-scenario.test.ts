import { test } from "node:test";
import { strict as assert } from "node:assert";
import {
  DEFAULT_SCENARIO,
  scenarioFromSearch,
  scenarioShareUrl,
  scenarioToSearch,
  validateCalculatorSearch,
} from "./calculator-scenario";

const providers = ["openai", "anthropic", "google"];

test("a default scenario needs no query string", () => {
  assert.deepEqual(scenarioToSearch(DEFAULT_SCENARIO), {});
  assert.equal(scenarioShareUrl("https://x.test", DEFAULT_SCENARIO), "https://x.test/calculator");
});

test("only changed inputs are written, and they round-trip", () => {
  const scenario = { ...DEFAULT_SCENARIO, provider: "anthropic", requestsPerMonth: 5_000_000 };
  const search = scenarioToSearch({ ...scenario, cacheHitRate: 50 });
  assert.deepEqual(search, { p: "anthropic", r: 5_000_000, cache: 50 });
  const parsed = scenarioFromSearch(search, providers);
  assert.deepEqual(parsed, { ...scenario, cacheHitRate: 50 });
  assert.equal(
    scenarioShareUrl("https://x.test", { ...scenario, cacheHitRate: 50 }),
    "https://x.test/calculator?p=anthropic&r=5000000&cache=50",
  );
});

test("numbers or numeric strings are accepted and kept as numbers", () => {
  const search = validateCalculatorSearch({ r: 1200, in: "900.5" }, providers);
  assert.deepEqual(search, { r: 1200, in: 900.5 });
  assert.equal(scenarioFromSearch({ r: 1200, in: "900.5" }, providers).inputTokens, 900.5);
});

test("unknown providers, bad numbers, out-of-range values and extra keys are dropped", () => {
  const search = validateCalculatorSearch(
    {
      p: "evil",
      r: "-5",
      in: "abc",
      out: "",
      cache: "150",
      batch: "NaN",
      cheap: "Infinity",
      impl: "1e99",
      utm_source: "x",
    },
    providers,
  );
  assert.deepEqual(search, {});
});

test("the page re-validates: raw search merged in by the router can't reach the inputs", () => {
  const raw = { p: "evil", r: -5, cache: 150, in: "abc", utm_source: "x" };
  assert.deepEqual(scenarioFromSearch(raw, providers), DEFAULT_SCENARIO);
});

test("percent inputs accept 0 and 100", () => {
  const scenario = scenarioFromSearch({ cache: "0", batch: "100" }, providers);
  assert.equal(scenario.cacheHitRate, 0);
  assert.equal(scenario.batchShare, 100);
});
