import { test } from "node:test";
import { strict as assert } from "node:assert";
import {
  calculateBatchCost,
  calculatePayloadCost,
  calculateQualityCost,
} from "./optimization-economics";

const prices = { inputTokens: 1000, outputTokens: 100, inputPrice: 2, outputPrice: 10 };

test("bounded retries stop on success and price accepted tasks", () => {
  const result = calculateQualityCost({
    ...prices,
    tasks: 1000,
    successPercent: 50,
    maxAttempts: 3,
  });
  assert.equal(result.expectedAttempts, 1.75);
  assert.equal(result.acceptedTasks, 875);
  assert.equal(result.monthlyCost, 5.25);
  assert.equal(result.costPerAcceptedTask, 0.006);
});

test("zero success has no cost per accepted task, but all attempts are billed", () => {
  const result = calculateQualityCost({
    ...prices,
    tasks: 1000,
    successPercent: 0,
    maxAttempts: 3,
  });
  assert.equal(result.monthlyCost, 9);
  assert.equal(result.costPerAcceptedTask, null);
});

test("tool payload reduction counts subsequent resends and recurring overhead", () => {
  const result = calculatePayloadCost({
    runs: 1000,
    toolCalls: 5,
    payloadTokens: 2000,
    retainedPercent: 25,
    reuseCount: 4,
    inputPrice: 2,
    overhead: 10,
  });
  assert.equal(result.tokens, 40_000_000);
  assert.equal(result.avoidedTokens, 30_000_000);
  assert.equal(result.baseline, 80);
  assert.equal(result.optimized, 30);
  assert.equal(result.savings, 50);
});

test("batch discounts apply only to eligible traffic and may lose money after overhead", () => {
  const result = calculateBatchCost({
    ...prices,
    requests: 100000,
    eligiblePercent: 60,
    discountPercent: 50,
    overhead: 100,
  });
  assert.equal(result.baseline, 300);
  assert.equal(result.batchedRequests, 60000);
  assert.equal(result.grossSavings, 90);
  assert.equal(result.optimized, 310);
  assert.equal(result.savings, -10);
});

test("invalid numeric inputs remain finite and percentages stay bounded", () => {
  const result = calculateBatchCost({
    ...prices,
    requests: Infinity,
    eligiblePercent: 200,
    discountPercent: -10,
    overhead: NaN,
  });
  assert.equal(result.optimized, 0);
  assert.equal(result.savings, 0);
});
