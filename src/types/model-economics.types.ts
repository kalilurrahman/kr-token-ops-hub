export interface ModelCatalogueEntry {
  id: string;
  provider: string;
  name: string;
  inputPrice: number | null;
  cachedInputPrice: number | null;
  outputPrice: number | null;
  contextTokens: number;
  tier: string;
  accessModel: "proprietary" | "open-weight" | "open-source";
  deployment: string;
  license: string;
  verifiedDate: string;
  verifiedUrl: string;
  notes: string;
}

export interface SelfHostedEconomicsInput {
  accelerators: number;
  acceleratorHourlyCost: number;
  utilizationPercent: number;
  throughputTokensPerSecond: number;
  monthlyOperationsCost: number;
  monthlyPlatformCost: number;
  hostedInputPrice: number;
  hostedOutputPrice: number;
  inputSharePercent: number;
}

export interface SelfHostedEconomicsResult {
  monthlyInfrastructureCost: number;
  effectiveMillionTokensPerMonth: number;
  selfHostedCostPerMillion: number;
  hostedBlendedCostPerMillion: number;
  breakEvenMillionTokens: number | null;
  monthlyCostAtCapacityHosted: number;
  monthlySavingsAtCapacity: number;
}