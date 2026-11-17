/**
 * The blended-savings calculator's inputs as a shareable URL (`/calculator?r=5000000&cache=50`).
 * Pure functions: the route parses the search string with them on the server and in the browser,
 * and the "Copy scenario link" button builds the query from the current inputs. Only values that
 * differ from the defaults are written, so a default scenario is plain `/calculator`.
 */

export type CalculatorScenario = {
  provider: string;
  requestsPerMonth: number;
  inputTokens: number;
  outputTokens: number;
  cacheHitRate: number;
  batchShare: number;
  cheapModelShare: number;
  implementationCost: number;
};

export const DEFAULT_SCENARIO: CalculatorScenario = {
  provider: "openai",
  requestsPerMonth: 3_000_000,
  inputTokens: 1800,
  outputTokens: 450,
  cacheHitRate: 35,
  batchShare: 30,
  cheapModelShare: 60,
  implementationCost: 25_000,
};

type NumericKey = Exclude<keyof CalculatorScenario, "provider">;

/** Short URL names and the accepted range for each numeric input. */
const FIELDS: Record<NumericKey, { param: string; max: number }> = {
  requestsPerMonth: { param: "r", max: 1e12 },
  inputTokens: { param: "in", max: 1e7 },
  outputTokens: { param: "out", max: 1e7 },
  cacheHitRate: { param: "cache", max: 100 },
  batchShare: { param: "batch", max: 100 },
  cheapModelShare: { param: "cheap", max: 100 },
  implementationCost: { param: "impl", max: 1e10 },
};
const PROVIDER_PARAM = "p";

/**
 * Search params as the route sees them: every key optional, so plain links need no search.
 * Numbers stay numbers so TanStack writes `r=5000000`, not the quoted `r="5000000"`.
 */
export type CalculatorSearch = Partial<Record<string, string | number>>;

/**
 * Keep only known, valid params. Used as the route's validateSearch and again in the page:
 * TanStack merges the root route's raw search into `useSearch()`, so it is not pre-validated.
 */
export function validateCalculatorSearch(
  search: Record<string, unknown>,
  providers: readonly string[],
): CalculatorSearch {
  const out: CalculatorSearch = {};
  const provider = search[PROVIDER_PARAM];
  if (typeof provider === "string" && providers.includes(provider)) out[PROVIDER_PARAM] = provider;
  for (const { param, max } of Object.values(FIELDS)) {
    const value = toNumber(search[param]);
    if (value !== null && value >= 0 && value <= max) out[param] = value;
  }
  return out;
}

/** The scenario a search describes. Validates first; missing or invalid values use defaults. */
export function scenarioFromSearch(
  search: Record<string, unknown>,
  providers: readonly string[],
): CalculatorScenario {
  const valid = validateCalculatorSearch(search, providers);
  const scenario = { ...DEFAULT_SCENARIO };
  const provider = valid[PROVIDER_PARAM];
  if (typeof provider === "string") scenario.provider = provider;
  for (const [key, { param }] of Object.entries(FIELDS) as [NumericKey, { param: string }][]) {
    const value = valid[param];
    if (typeof value === "number") scenario[key] = value;
  }
  return scenario;
}

/** Query params for a scenario: only the values that differ from the defaults. */
export function scenarioToSearch(scenario: CalculatorScenario): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  if (scenario.provider !== DEFAULT_SCENARIO.provider) out[PROVIDER_PARAM] = scenario.provider;
  for (const [key, { param }] of Object.entries(FIELDS) as [NumericKey, { param: string }][]) {
    if (scenario[key] !== DEFAULT_SCENARIO[key]) out[param] = scenario[key];
  }
  return out;
}

/** An absolute share URL for a scenario. */
export function scenarioShareUrl(origin: string, scenario: CalculatorScenario): string {
  const params = Object.entries(scenarioToSearch(scenario)).map(([k, v]) => [k, String(v)]);
  const query = new URLSearchParams(params).toString();
  return `${origin}/calculator${query ? `?${query}` : ""}`;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
