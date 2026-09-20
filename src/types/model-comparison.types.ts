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
  isFramework?: boolean;
}
