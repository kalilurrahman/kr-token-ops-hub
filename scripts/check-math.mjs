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

if (failures > 0) {
  console.error(`\n${failures} check(s) failed — fix guide.md or the check before publishing.`);
  process.exit(1);
}
console.log("\nAll worked examples in guide.md verify.");
