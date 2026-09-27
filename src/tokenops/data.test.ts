import { describe, expect, it } from "vitest";
import { calcSelfHostedEconomics } from "@/tokenops/data";

describe("calcSelfHostedEconomics", () => {
  it("calculates capacity, unit cost, and hosted break-even", () => {
    const result = calcSelfHostedEconomics({
      accelerators: 2,
      acceleratorHourlyCost: 3,
      utilizationPercent: 50,
      throughputTokensPerSecond: 200,
      monthlyOperationsCost: 2000,
      monthlyPlatformCost: 500,
      hostedInputPrice: 2,
      hostedOutputPrice: 10,
      inputSharePercent: 80,
    });

    expect(result.monthlyInfrastructureCost).toBe(6880);
    expect(result.effectiveMillionTokensPerMonth).toBeCloseTo(262.8);
    expect(result.selfHostedCostPerMillion).toBeCloseTo(26.1796);
    expect(result.hostedBlendedCostPerMillion).toBeCloseTo(3.6);
    expect(result.breakEvenMillionTokens).toBeCloseTo(1911.1111);
  });

  it("does not produce capacity when utilisation is zero", () => {
    const result = calcSelfHostedEconomics({
      accelerators: 1,
      acceleratorHourlyCost: 2,
      utilizationPercent: 0,
      throughputTokensPerSecond: 100,
      monthlyOperationsCost: 0,
      monthlyPlatformCost: 0,
      hostedInputPrice: 1,
      hostedOutputPrice: 5,
      inputSharePercent: 75,
    });

    expect(result.effectiveMillionTokensPerMonth).toBe(0);
    expect(result.selfHostedCostPerMillion).toBe(0);
  });
});