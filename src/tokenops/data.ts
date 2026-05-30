import {
  BookOpen,
  ClipboardList,
  Database,
  FileCode2,
  FileDown,
  FileText,
  Gauge,
  ShieldCheck,
  Target,
  type LucideIcon,
} from "lucide-react";

export const providerPresets: Record<
  string,
  { premiumInput: number; premiumOutput: number; cheapInput: number; cheapOutput: number; label: string }
> = {
  openai: { premiumInput: 5, premiumOutput: 15, cheapInput: 0.15, cheapOutput: 0.6, label: "OpenAI mix" },
  anthropic: { premiumInput: 3, premiumOutput: 15, cheapInput: 0.8, cheapOutput: 4, label: "Anthropic mix" },
  google: { premiumInput: 1.25, premiumOutput: 10, cheapInput: 0.075, cheapOutput: 0.3, label: "Google mix" },
};

export const operatingPillars: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Gauge, title: "Visibility", body: "Know which services, features, teams, and use cases consume tokens and at what cost." },
  { icon: Target, title: "Optimization", body: "Reduce waste through prompt engineering, model tiering, caching, and context management." },
  { icon: ShieldCheck, title: "Governance", body: "Embed token economics into budgets, alerts, reviews, and architecture decisions." },
];

export const playbook = [
  { title: "Instrument every call", body: "Tag requests by team, service, feature, environment, model, and outcome." },
  { title: "Allocate spend", body: "Join usage metadata with billing data so token costs become accountable." },
  { title: "Improve token yield", body: "Target 80%+ useful output by reducing retries, irrelevant context, and discarded generations." },
  { title: "Operate continuously", body: "Review budgets, anomalies, model choices, and optimization backlog every month." },
];

export const modelPricingData: Record<string, { input: number; output: number }> = {
  "GPT-4o": { input: 5, output: 15 },
  "GPT-4o Mini": { input: 0.15, output: 0.6 },
  "Claude 3.5 Sonnet": { input: 3, output: 15 },
  "Claude 3.5 Haiku": { input: 0.8, output: 4 },
  "Gemini 2.0 Flash": { input: 0.075, output: 0.3 },
  "Llama 3.1 70B": { input: 0.4, output: 0.6 },
};

export const formatIcons: Record<string, LucideIcon> = {
  YAML: FileCode2,
  Markdown: FileText,
  Guide: BookOpen,
  CSV: ClipboardList,
  SQL: Database,
  PDF: FileDown,
};

export const formatBadgeClass: Record<string, string> = {
  YAML: "badge-yaml",
  Markdown: "badge-md",
  Guide: "badge-guide",
  CSV: "badge-csv",
  SQL: "badge-yaml",
  PDF: "badge-csv",
};

export const categoryIconClass: Record<string, string> = {
  Engineering: "",
  Finance: "finance",
  Governance: "",
  Document: "doc",
};

export function downloadTemplate(file: string) {
  const a = document.createElement("a");
  a.href = `/templates/${file}`;
  a.download = file;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export const ALL_TEMPLATE_FILES = [
  "request-tagging-schema.yaml",
  "monthly-cost-review.md",
  "model-selection-matrix.md",
  "architecture-decision-record.md",
  "prompt-optimization-checklist.md",
  "budget-guardrails.yaml",
  "instrumentation-checklist.md",
  "supabase-schema.sql",
  "implementation-playbook.md",
  "token-pricing-reference.md",
];

export function downloadAllTemplates() {
  ALL_TEMPLATE_FILES.forEach((file, i) => {
    setTimeout(() => downloadTemplate(file), i * 250);
  });
}

export interface CompressionResult {
  compressed: string;
  changes: string[];
  originalLength: number;
  compressedLength: number;
  savingsPercent: number;
}

export function compressPrompt(text: string): CompressionResult {
  const changes: string[] = [];
  let current = text;
  const originalLength = current.length;

  const step1 = current.replace(/\s+/g, " ").trim();
  if (step1.length < current.length) changes.push(`Collapsed whitespace: -${current.length - step1.length} chars`);
  current = step1;

  const fluffPatterns = [
    /\b(please|kindly|could you|would you|i'd like you to)\b/gi,
    /\b(thanks|thank you|appreciate it)\b/gi,
    /\b(just|simply|basically|actually)\b/gi,
  ];
  for (const pattern of fluffPatterns) current = current.replace(pattern, "");
  const step2 = current.replace(/\s+/g, " ").trim();
  if (step2.length < step1.length) changes.push(`Removed fluff words: -${step1.length - step2.length} chars`);
  current = step2;

  current = current
    .replace(/\bdo not\b/gi, "don't")
    .replace(/\bin order to\b/gi, "to")
    .replace(/\bit is (important|critical|necessary) that\b/gi, "must");
  const step3 = current.replace(/\s+/g, " ").trim();
  if (step3.length < step2.length) changes.push(`Optimized phrasing: -${step2.length - step3.length} chars`);
  current = step3;

  return {
    compressed: current,
    changes,
    originalLength,
    compressedLength: current.length,
    savingsPercent: ((originalLength - current.length) / originalLength) * 100,
  };
}

export function exportScenarioCSV(rows: (string | number)[][], filename = "tokenops-scenario.csv") {
  const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export interface ResourceItem {
  title: string;
  desc: string;
  category: string;
  format: string;
  file: string | null;
}

export interface TokenOpsContent {
  nav: string[];
  patterns: { title: string; desc: string }[];
  templates: ResourceItem[];
  resources: ResourceItem[];
  sources: string[];
  library: LibraryItem[];
}

export interface LibraryItem {
  title: string;
  desc: string;
  category: "Advanced" | "Checklist" | "Guide" | "Playbook" | "Reference" | "Operating" | string;
  format: string;
  /** Path relative to /library/ (e.g. "guides/tokenops-faq.md") */
  file: string;
}

export const libraryCategoryMeta: Record<string, { label: string; tagline: string }> = {
  Advanced:   { label: "Advanced",   tagline: "Deep technical guides for platform engineers." },
  Checklist:  { label: "Checklists", tagline: "Pre-flight and audit checklists you can print and run." },
  Guide:      { label: "Guides",     tagline: "Reference reading for understanding TokenOps end-to-end." },
  Playbook:   { label: "Playbooks",  tagline: "Multi-week programs with phases, owners, and outcomes." },
  Reference:  { label: "References", tagline: "Look-up material — metrics, vendors, tools, comparisons." },
  Operating:  { label: "Operating",  tagline: "Day-to-day artifacts: runbooks, QBRs, scorecards, SLAs." },
};

export function downloadLibraryFile(file: string) {
  const a = document.createElement("a");
  a.href = `/library/${file}`;
  a.download = file.split("/").pop() ?? file;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ─── Intelligent calculator engines (RAG, Routing, Budget, Caching ROI, TCO) ─── */

export interface RAGCostInput {
  docsPerQuery: number; avgChunkTokens: number; queriesPerDay: number;
  systemPromptTokens: number; avgOutputTokens: number;
  modelInputPrice: number; modelOutputPrice: number;
  cacheHitRate: number; cachePriceDiscount: number;
}
export interface RAGCostResult {
  inputTokensPerQuery: number; dailyInputTokens: number;
  dailyCost: number; monthlyCost: number;
  monthlyCostWithCache: number; cacheSavings: number; costPerQuery: number;
}
export function calcRAGCost(i: RAGCostInput): RAGCostResult {
  const contextTokens = i.docsPerQuery * i.avgChunkTokens;
  const inputTokensPerQuery = contextTokens + i.systemPromptTokens;
  const dailyInputTokens = inputTokensPerQuery * i.queriesPerDay;
  const dailyOutputTokens = i.avgOutputTokens * i.queriesPerDay;
  const dailyCost =
    (dailyInputTokens / 1_000_000) * i.modelInputPrice +
    (dailyOutputTokens / 1_000_000) * i.modelOutputPrice;
  const monthlyCost = dailyCost * 30;
  const cachedFraction = i.cacheHitRate * (1 - i.cachePriceDiscount);
  const monthlyCostWithCache = monthlyCost * (1 - i.cacheHitRate + cachedFraction);
  return {
    inputTokensPerQuery, dailyInputTokens, dailyCost, monthlyCost,
    monthlyCostWithCache, cacheSavings: monthlyCost - monthlyCostWithCache,
    costPerQuery: i.queriesPerDay ? dailyCost / i.queriesPerDay : 0,
  };
}

export interface RoutingInput {
  totalCallsPerMonth: number; premiumFraction: number; cheapFraction: number;
  avgInputTokens: number; avgOutputTokens: number;
  premiumInputPrice: number; premiumOutputPrice: number;
  cheapInputPrice: number; cheapOutputPrice: number;
}
export interface RoutingResult {
  baselineMonthlyCost: number; optimisedMonthlyCost: number;
  monthlySavings: number; annualSavings: number; savingsPercent: number;
  premiumCallCost: number; cheapCallCost: number;
}
export function calcRoutingSavings(r: RoutingInput): RoutingResult {
  const per = (i: number, o: number) =>
    (r.avgInputTokens / 1_000_000) * i + (r.avgOutputTokens / 1_000_000) * o;
  const premiumCallCost = per(r.premiumInputPrice, r.premiumOutputPrice);
  const cheapCallCost = per(r.cheapInputPrice, r.cheapOutputPrice);
  const baseline = r.totalCallsPerMonth * premiumCallCost;
  const optimised =
    r.totalCallsPerMonth * r.premiumFraction * premiumCallCost +
    r.totalCallsPerMonth * r.cheapFraction * cheapCallCost;
  const monthlySavings = baseline - optimised;
  return {
    baselineMonthlyCost: baseline, optimisedMonthlyCost: optimised,
    monthlySavings, annualSavings: monthlySavings * 12,
    savingsPercent: baseline ? (monthlySavings / baseline) * 100 : 0,
    premiumCallCost, cheapCallCost,
  };
}

export interface BudgetInput {
  monthlyBudgetUSD: number; currentDayOfMonth: number;
  spendToDate: number; projectedGrowthRate: number;
}
export interface BudgetResult {
  dailyBurnRate: number; projectedMonthEnd: number;
  budgetUtilization: number; daysUntilBudgetHit: number | null;
  status: "on-track" | "warning" | "over-budget";
  recommendedDailyBudget: number;
}
export function calcBudgetBurnRate(b: BudgetInput): BudgetResult {
  const dailyBurnRate = b.currentDayOfMonth ? b.spendToDate / b.currentDayOfMonth : 0;
  const daysLeft = Math.max(0, 30 - b.currentDayOfMonth);
  const projectedMonthEnd = b.spendToDate + dailyBurnRate * daysLeft;
  const budgetUtilization = b.monthlyBudgetUSD ? (projectedMonthEnd / b.monthlyBudgetUSD) * 100 : 0;
  const remaining = b.monthlyBudgetUSD - b.spendToDate;
  const daysUntilBudgetHit = dailyBurnRate > 0 && remaining > 0
    ? Math.floor(remaining / dailyBurnRate) : null;
  const status = budgetUtilization > 100 ? "over-budget" : budgetUtilization > 80 ? "warning" : "on-track";
  return {
    dailyBurnRate, projectedMonthEnd, budgetUtilization,
    daysUntilBudgetHit, status,
    recommendedDailyBudget: b.monthlyBudgetUSD / 30,
  };
}

export interface CachingROIInput {
  systemPromptTokens: number; callsPerDay: number;
  modelInputPrice: number; cacheWritePrice: number;
  cacheReadPrice: number; cacheHitRate: number;
}
export interface CachingROIResult {
  baselineDailyCost: number; cachedDailyCost: number;
  dailySavings: number; monthlySavings: number; breakEvenCalls: number;
}
export function calcCachingROI(c: CachingROIInput): CachingROIResult {
  const basePerCall = (c.systemPromptTokens / 1_000_000) * c.modelInputPrice;
  const writePerCall = (c.systemPromptTokens / 1_000_000) * c.cacheWritePrice;
  const readPerCall = (c.systemPromptTokens / 1_000_000) * c.cacheReadPrice;
  const cachedPerCall = (1 - c.cacheHitRate) * writePerCall + c.cacheHitRate * readPerCall;
  const baselineDailyCost = basePerCall * c.callsPerDay;
  const cachedDailyCost = cachedPerCall * c.callsPerDay;
  const dailySavings = baselineDailyCost - cachedDailyCost;
  const breakEvenCalls = writePerCall > basePerCall
    ? Infinity
    : Math.ceil(writePerCall / Math.max(0.0000001, basePerCall - readPerCall));
  return { baselineDailyCost, cachedDailyCost, dailySavings, monthlySavings: dailySavings * 30, breakEvenCalls };
}

export interface TCOInput {
  monthlyTokenCostUSD: number; monthlyInfraUSD: number;
  monthlyEngineeringHours: number; engineerHourlyRate: number;
  monthlyOperationsHours: number; opsHourlyRate: number;
  monthlyRevenueLift: number; monthlyChurnReduction: number;
}
export interface TCOResult {
  totalMonthlyCost: number; totalMonthlyBenefit: number;
  netMonthlyCashflow: number; roi: number;
  tokenCostFraction: number; paybackMonths: number | null;
}
export function calcTCO(t: TCOInput): TCOResult {
  const totalMonthlyCost =
    t.monthlyTokenCostUSD + t.monthlyInfraUSD +
    t.monthlyEngineeringHours * t.engineerHourlyRate +
    t.monthlyOperationsHours * t.opsHourlyRate;
  const totalMonthlyBenefit = t.monthlyRevenueLift + t.monthlyChurnReduction;
  const netMonthlyCashflow = totalMonthlyBenefit - totalMonthlyCost;
  const roi = totalMonthlyCost ? (netMonthlyCashflow / totalMonthlyCost) * 100 : 0;
  return {
    totalMonthlyCost, totalMonthlyBenefit, netMonthlyCashflow, roi,
    tokenCostFraction: totalMonthlyCost ? (t.monthlyTokenCostUSD / totalMonthlyCost) * 100 : 0,
    paybackMonths: netMonthlyCashflow > 0 ? Math.ceil(totalMonthlyCost / netMonthlyCashflow) : null,
  };
}