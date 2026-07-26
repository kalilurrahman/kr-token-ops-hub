#!/usr/bin/env node
/**
 * Recomputes every worked example in src/tokenops/guide.md and fails if the
 * published numbers drift from the arithmetic. Run: node scripts/check-math.mjs
 *
 * Founding test cases are the three errors documented in the July 2026 content
 * audit (docs/premium-strategy/01-product-and-packaging.md §1): the blended-cost
 * unit mix-up, the Case Study 1 volume mismatch, and the miswritten forecast
 * formula. Add a check here for every new worked example before publishing it.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

let _pricingCache;
/** The pricing dataset — chapter figures assert against it so prose can't drift. */
function pricingRef() {
  _pricingCache ??= JSON.parse(readFileSync(join(ROOT, "data/pricing.json"), "utf8"));
  return _pricingCache;
}

let failures = 0;
function check(label, actual, expected, tolerance = 0.005) {
  const ok = Math.abs(actual - expected) <= Math.abs(expected) * tolerance;
  if (!ok) {
    failures++;
    console.error(`FAIL ${label}: computed ${actual}, guide says ${expected}`);
  } else {
    console.log(`ok   ${label}: ${expected}`);
  }
}

// Part 1 — pilot vs production cost creep ($3/M input + $15/M output)
const perCall = (2_000 * 3 + 500 * 15) / 1e6;
check("pilot cost/call", perCall, 0.0135);
check("pilot daily cost", 10_000 * perCall, 135);
check("production daily cost", 500_000 * perCall, 6_750);

// §3.1 — blended cost per million tokens
check("blended $/M ($15,000 / 10B tokens)", 15_000 / 10_000, 1.5);

// Part 2 — system prompt tax (100K calls/day × 1,200 tokens, $3.00/M input)
check("system prompt $/month", ((100_000 * 1_200 * 30) / 1e6) * 3.0, 10_800);

// §6.3 — ADR template (50K requests/day × 3,000 tokens at $1.50/M blended)
const adrDailyTokens = 50_000 * 3_000;
check("ADR daily cost", (adrDailyTokens / 1e6) * 1.5, 225);
check("ADR monthly cost", (adrDailyTokens / 1e6) * 1.5 * 30, 6_750);
check("ADR token cost/ticket", (3_000 / 1e6) * 1.5, 0.005, 0.11); // ~$0.005

// Case Study 1 — chatbot baseline (100K conversations/month × 5,000 tokens)
check("CS1 monthly tokens (M)", (100_000 * 5_000) / 1e6, 500);
check("CS1 monthly cost", ((100_000 * 5_000) / 1e6) * 1.5, 750);

// Case Study 2 — batch enrichment (100K records/night × 300 tokens × 30 nights)
const cs2MonthlyM = (100_000 * 300 * 30) / 1e6;
check("CS2 monthly tokens (M)", cs2MonthlyM, 900);
check("CS2 blended $/M (7:1 in:out of $3/$15)", (7 * 3 + 1 * 15) / 8, 4.5);
check("CS2 realtime $/month", cs2MonthlyM * 4.5, 4_050);
check("CS2 batch $/month", cs2MonthlyM * 2.25, 2_025);

// Forecast scenario — 5%/mo growth, 10%/yr linear price decline
const tokensB = (n) => 10 * 1.05 ** (n - 1);
const priceM = (n) => 1.5 * (1 - (0.1 * (n - 1)) / 12);
const monthCost = (n) => tokensB(n) * 1_000 * priceM(n);
check("forecast month 1", monthCost(1), 15_000);
check("forecast month 6", monthCost(6), 18_300, 0.01);
check("forecast month 12", monthCost(12), 23_300, 0.01);
let yearTotal = 0;
for (let n = 1; n <= 12; n++) yearTotal += monthCost(n);
check("forecast year total", yearTotal, 227_000, 0.01);
check("forecast optimized month 12", tokensB(12) * 0.65 * 1_000 * priceM(12), 15_100, 0.01);
let h2Savings = 0;
for (let n = 7; n <= 12; n++) h2Savings += monthCost(n) * 0.35;
check("forecast H2 savings @35%", h2Savings, 44_000, 0.02);

// ── Sample chapter: prompt caching economics ────────────────────────────────
// content/sample-chapter-prompt-caching.md — the free lead-magnet chapter.
// Every published figure in §8.2, §8.3 and §8.6 is asserted here.
{
  // Shape B (Anthropic): cost(N) = write_multiplier + 0.10 × N, in base-input units
  const shapeB = (n, wm) => wm + 0.1 * n;
  const saving = (n, cost) => (100 * (n - cost)) / n;
  check("cache 5-min N=1 (penalty)", saving(1, shapeB(1, 1.25)), -35.0, 0.001);
  check("cache 5-min N=2", saving(2, shapeB(2, 1.25)), 27.5, 0.001);
  check("cache 5-min N=3", saving(3, shapeB(3, 1.25)), 48.3, 0.002);
  check("cache 5-min N=10", saving(10, shapeB(10, 1.25)), 77.5, 0.001);
  check("cache 5-min N=100", saving(100, shapeB(100, 1.25)), 88.8, 0.002);
  check("cache 1-hr N=2 (still penalty)", saving(2, shapeB(2, 2.0)), -10.0, 0.001);
  check("cache 1-hr N=3", saving(3, shapeB(3, 2.0)), 23.3, 0.002);
  check("cache 1-hr N=10", saving(10, shapeB(10, 2.0)), 70.0, 0.001);
  check("cache 1-hr N=100", saving(100, shapeB(100, 2.0)), 88.0, 0.001);
  // Break-even thresholds quoted as rules in §8.2
  const breakEven = (wm) => {
    let n = 1;
    while (shapeB(n, wm) >= n) n++;
    return n;
  };
  check("break-even 5-min = 2 reuses", breakEven(1.25), 2, 0);
  check("break-even 1-hr = 3 reuses", breakEven(2.0), 3, 0);

  // Shape A (auto-cache, no write premium): cost(N) = 1 + 0.10 × (N−1)
  const shapeA = (n) => 1 + 0.1 * (n - 1);
  check("auto-cache N=2", saving(2, shapeA(2)), 45.0, 0.001);
  check("auto-cache N=10", saving(10, shapeA(10)), 81.0, 0.001);
  check("auto-cache N=100", saving(100, shapeA(100)), 89.1, 0.001);

  // §8.6 worked example — Claude Opus 4.5 support agent.
  // Rates pulled from the dataset so the chapter can never drift from pricing.json.
  const opus = pricingRef().providers.anthropic.models["claude-opus-4-5"];
  const CALLS = 50_000,
    PREFIX = 4_000,
    USER = 200,
    OUT = 300,
    WRITES = 288;
  const perM = (tokens, rate) => (tokens / 1e6) * rate;
  const baseInput = perM(CALLS * (PREFIX + USER), opus.input_per_mtok);
  const baseOutput = perM(CALLS * OUT, opus.output_per_mtok);
  check("§8.6 uncached input/day", baseInput, 1050, 0.001);
  check("§8.6 output/day", baseOutput, 375, 0.001);
  check("§8.6 uncached total/day", baseInput + baseOutput, 1425, 0.001);
  check("§8.6 uncached total/month", (baseInput + baseOutput) * 30, 42_750, 0.001);

  const writeCost = perM(WRITES * PREFIX, opus.cache_write_5min_per_mtok);
  const readCost = perM((CALLS - WRITES) * PREFIX, opus.cached_input_per_mtok);
  const userCost = perM(CALLS * USER, opus.input_per_mtok);
  const cachedTotal = writeCost + readCost + userCost + baseOutput;
  check("§8.6 cache writes/day", writeCost, 7.2, 0.01);
  check("§8.6 cache reads/day", readCost, 99.42, 0.001);
  check("§8.6 cached total/day", cachedTotal, 531.62, 0.001);
  check("§8.6 cached total/month", cachedTotal * 30, 15_949, 0.001);

  const prefixBase = perM(CALLS * PREFIX, opus.input_per_mtok);
  check(
    "§8.6 prefix-layer reduction %",
    (100 * (prefixBase - (writeCost + readCost))) / prefixBase,
    89.3,
    0.001,
  );
  check(
    "§8.6 total reduction %",
    (100 * (baseInput + baseOutput - cachedTotal)) / (baseInput + baseOutput),
    62.7,
    0.001,
  );
  check("§8.6 monthly saving", (baseInput + baseOutput - cachedTotal) * 30, 26_800, 0.005);
  check("§8.6 output share of remainder %", (100 * baseOutput) / cachedTotal, 71, 0.01);
  // §8.1 prompt-anatomy percentages
  check("§8.1 stable-prefix share of input %", (100 * PREFIX) / (PREFIX + USER + OUT), 89, 0.01);
}

// ── Pricing dataset shape check ─────────────────────────────────────────────
// Every model row in data/pricing.json must carry input/output/context plus a
// verified_url and verified_date. This guards against silent staleness — the
// exact failure the audit found in the pre-refactor site.
const pricing = JSON.parse(readFileSync(join(ROOT, "data/pricing.json"), "utf8"));
const requiredMetaKeys = ["version", "reviewed_date", "sla", "unit"];
for (const k of requiredMetaKeys) {
  if (!pricing.meta[k]) {
    failures++;
    console.error(`FAIL data/pricing.json meta missing: ${k}`);
  }
}
for (const [pk, provider] of Object.entries(pricing.providers)) {
  if (!provider.pricing_url) {
    failures++;
    console.error(`FAIL ${pk}: missing pricing_url`);
  }
  for (const [mk, m] of Object.entries(provider.models)) {
    for (const field of [
      "display_name",
      "input_per_mtok",
      "output_per_mtok",
      "context_tokens",
      "tier",
      "verified_url",
      "verified_date",
    ]) {
      if (m[field] === undefined || m[field] === null) {
        failures++;
        console.error(`FAIL ${pk}/${mk}: missing ${field}`);
      }
    }
    if (m.verified_date && !/^\d{4}-\d{2}-\d{2}$/.test(m.verified_date)) {
      failures++;
      console.error(`FAIL ${pk}/${mk}: verified_date not YYYY-MM-DD (${m.verified_date})`);
    }
  }
}
for (const [pk, preset] of Object.entries(pricing.presets)) {
  for (const which of ["premium_model", "cheap_model"]) {
    const [providerKey, modelKey] = preset[which].split("/");
    if (!pricing.providers[providerKey]?.models[modelKey]) {
      failures++;
      console.error(`FAIL preset ${pk}.${which} references missing model ${preset[which]}`);
    }
  }
}
if (!failures)
  console.log(
    `ok   data/pricing.json shape (v${pricing.meta.version}, reviewed ${pricing.meta.reviewed_date})`,
  );

if (failures > 0) {
  console.error(`\n${failures} check(s) failed — fix guide.md or the check before publishing.`);
  process.exit(1);
}
console.log("\nAll worked examples in guide.md verify.");
