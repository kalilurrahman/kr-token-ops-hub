import { test } from "node:test";
import { strict as assert } from "node:assert";
import { HUB_IMPLEMENTATION_COST, paybackMonths } from "./hub-payback";

test("payback is the one-off cost divided by the monthly savings", () => {
  assert.equal(paybackMonths(15_000, 5_000), 3);
  assert.equal(paybackMonths(15_000, 1_250), 12);
  assert.equal(paybackMonths(HUB_IMPLEMENTATION_COST, 30_000), 0.5);
});

test("savings under $1 a month count as $1 instead of dividing by zero", () => {
  assert.equal(paybackMonths(15_000, 0), 15_000);
  assert.equal(paybackMonths(15_000, 0.25), 15_000);
});

test("regression: payback is not 12× too long (the pre-2.10.1 Hub formula)", () => {
  const monthlySavings = 5_000;
  const old = HUB_IMPLEMENTATION_COST / Math.max(monthlySavings / 12, 1);
  assert.equal(old, 36);
  assert.equal(paybackMonths(HUB_IMPLEMENTATION_COST, monthlySavings), old / 12);
});
