export interface ModelComparisonEntry {
  id: string;
  name: string;
  role: string;
  capabilities: string;
  contextLimit: string;
  pricing: string;
  latency: string;
  recommendedUses: string[];
  briefingFile: string;
  accessModel?: "Proprietary" | "Open weight" | "Open source" | "Framework";
  deployment?: string;
  license?: string;
  isFramework?: boolean;
}
