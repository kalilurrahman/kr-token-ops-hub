import type { ModelComparisonEntry } from "@/types/model-comparison.types";

export const MODEL_REVIEW_DATE = "27/09/2026";

export const modelComparisonEntries: ModelComparisonEntry[] = [
  {
    id: "astra",
    name: "GPT-6 Astra",
    role: "Frontier escalation",
    capabilities:
      "Highest-complexity reasoning, coding, research, tool use, and end-to-end professional work.",
    contextLimit: "1.05M input · 128K output · material price boundary above 272K input",
    pricing:
      "$10/M input · $1/M cached · $50/M output. Batch/Flex 50% lower; long context and Fast mode carry premiums.",
    latency:
      "Expect deliberate reasoning. Measure p95 with tools; reserve for high-value work where completion quality outweighs delay.",
    recommendedUses: [
      "Complex research",
      "Hard coding escalations",
      "Gated cybersecurity",
      "Cross-document judgement",
    ],
    briefingFile: "models/openai-gpt-6-astra-tokenops.md",
    accessModel: "Proprietary",
    deployment: "Hosted API",
    license: "Proprietary",
  },
  {
    id: "gpt-56",
    name: "GPT-5.6 portfolio",
    role: "Three-tier routing ladder",
    capabilities:
      "Luna for utility work, Terra for balanced generation, and Sol for complex professional tasks.",
    contextLimit: "1.05M input · 128K output · long-context premium above 272K input",
    pricing:
      "Luna $0.20/$1.20, Terra $2/$12, Sol $4/$20 per M input/output. Sol pricing is promotional.",
    latency:
      "Route for the product SLO: Luna for interactive volume, Terra for balanced work, Sol when additional reasoning is justified.",
    recommendedUses: ["Classification", "Extraction", "Drafting", "Tiered coding and analysis"],
    briefingFile: "models/openai-gpt-5-6-routing-economics.md",
    accessModel: "Proprietary",
    deployment: "Hosted API",
    license: "Proprietary",
  },
  {
    id: "fable",
    name: "Claude Fable 5.1",
    role: "Cache-efficient premium agent",
    capabilities:
      "Demanding coding and knowledge work with unusually strong repeated-context cache economics and compaction.",
    contextLimit: "1M input · 128K output; verify endpoint availability and regional terms",
    pricing:
      "$10/M input · $50/M output · $0.25/M cache reads. Cache writes break even after roughly 2–3 uses within TTL.",
    latency:
      "No stable public figure in the briefing. Benchmark full agent runs, including tools and compaction, against your SLO.",
    recommendedUses: [
      "Repository agents",
      "Repeated evidence packs",
      "High-value analysis",
      "Stable tool-schema workloads",
    ],
    briefingFile: "models/claude-fable-5-1-cache-economics.md",
    accessModel: "Proprietary",
    deployment: "Hosted API / managed cloud",
    license: "Proprietary",
  },
  {
    id: "gemini",
    name: "Gemini 3.8 Flash",
    role: "Cost-efficient agent workhorse",
    capabilities:
      "Long-horizon coding and agents, multimodal input, built-in tools, tunable thinking, caching, Batch and priority tiers.",
    contextLimit: "1,048,576 input · 65,536 output",
    pricing:
      "Introductory $0.75/M input and $3.75/M output through 31/12/2026; listed rates double on 01/01/2027.",
    latency:
      "Designed for efficient work, but validate p50/p95 including thinking and tools. Use Batch only for delay-tolerant jobs.",
    recommendedUses: [
      "Agentic workflows",
      "Multimodal context",
      "High-volume coding",
      "Batch enrichment",
    ],
    briefingFile: "models/gemini-3-8-flash-agent-economics.md",
    accessModel: "Proprietary",
    deployment: "Hosted API / managed cloud",
    license: "Proprietary",
  },
  {
    id: "gpt-oss",
    name: "gpt-oss 120B / 20B",
    role: "Permissive self-hosted reasoning",
    capabilities:
      "Downloadable reasoning models for controlled environments, local adaptation, and infrastructure-owned inference.",
    contextLimit: "128K reference context; validate serving engine and quantisation configuration",
    pricing:
      "No universal token price. Calculate accelerator, utilisation, throughput, platform, and operations cost.",
    latency:
      "Hardware, precision, batching, concurrency, and serving engine determine latency; benchmark the deployed stack.",
    recommendedUses: [
      "Private inference",
      "Controlled adaptation",
      "Edge or dedicated serving",
      "Apache-licensed deployments",
    ],
    briefingFile: "models/open-models-tokenops-guide.md",
    accessModel: "Open source",
    deployment: "Self-hosted or third-party inference",
    license: "Apache 2.0",
  },
  {
    id: "deepseek-v4",
    name: "DeepSeek V4 family",
    role: "Large-context open-weight portfolio",
    capabilities:
      "Mixture-of-experts models for high-capability self-hosted or specialist-hosted inference.",
    contextLimit: "1M reference context; validate model-card and serving configuration",
    pricing:
      "Compute-priced when self-hosted; third-party token rates vary by inference provider and region.",
    latency:
      "Depends on active parameters, memory topology, quantisation, batching, and host capacity.",
    recommendedUses: [
      "Sovereign deployment",
      "Large-context analysis",
      "Custom serving",
      "High-volume batch",
    ],
    briefingFile: "models/open-models-tokenops-guide.md",
    accessModel: "Open weight",
    deployment: "Self-hosted or third-party inference",
    license: "DeepSeek model licence",
  },
  {
    id: "llama-4",
    name: "Llama 4 Scout / Maverick",
    role: "Broad-ecosystem open-weight models",
    capabilities:
      "Scout emphasizes very long context; Maverick provides a larger multimodal capability tier.",
    contextLimit: "Scout 10M · Maverick 1M reference context",
    pricing:
      "No universal token price. Hosted rates vary; self-hosted costs depend on the complete serving stack.",
    latency:
      "Benchmark each host and quantisation. Headline context limits do not imply economical full-window operation.",
    recommendedUses: [
      "Long-context retrieval",
      "Multimodal pipelines",
      "Cloud portability",
      "Custom evaluation",
    ],
    briefingFile: "models/open-models-tokenops-guide.md",
    accessModel: "Open weight",
    deployment: "Self-hosted or third-party inference",
    license: "Llama 4 Community License",
  },
  {
    id: "qwen-mistral",
    name: "Qwen and Mistral open families",
    role: "Efficient specialist deployment",
    capabilities:
      "Compact and mixture-of-experts options for multilingual, coding, edge, and throughput-sensitive workloads.",
    contextLimit: "Model-specific; verify exact model card, licence, and serving configuration",
    pricing:
      "No universal token price for downloaded weights. Compare measured accepted-output cost, not parameter count alone.",
    latency:
      "Smaller active footprints can improve throughput, but quality gates and hardware fit determine the useful result.",
    recommendedUses: [
      "Multilingual workloads",
      "Edge inference",
      "Coding assistants",
      "Cost-sensitive batch",
    ],
    briefingFile: "models/open-models-tokenops-guide.md",
    accessModel: "Open weight",
    deployment: "Self-hosted or third-party inference",
    license: "Model-specific; verify card",
  },
  {
    id: "routing-playbook",
    name: "Frontier routing playbook",
    role: "Decision framework — not a model",
    capabilities:
      "Five-route governance framework spanning utility, balanced, long-context, agentic, and frontier work.",
    contextLimit:
      "Not applicable. Enforces workload-specific context admission and budget thresholds.",
    pricing:
      "Normalizes input, cache, reasoning/output, tool, retry, fallback, regional, and priority costs across providers.",
    latency:
      "Requires per-route p50/p95, retry, timeout, and failover evidence instead of relying on provider claims.",
    recommendedUses: [
      "Portfolio design",
      "Governance",
      "Evaluation planning",
      "Procurement and telemetry",
    ],
    briefingFile: "models/frontier-model-routing-playbook-september-2026.md",
    accessModel: "Framework",
    deployment: "Provider-neutral",
    license: "Not applicable",
    isFramework: true,
  },
];
