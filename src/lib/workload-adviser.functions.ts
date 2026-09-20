import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, streamText } from "ai";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createLovableAiGatewayRunIdFetch } from "@/lib/ai-gateway.server";

const workloadInputSchema = z.object({
  workload: z.string().trim().min(20).max(4000),
  volume: z.enum(["pilot", "moderate", "high", "very-high"]),
  contextSize: z.enum(["small", "medium", "large", "very-large"]),
  latency: z.enum(["interactive", "seconds", "minutes", "batch"]),
  risk: z.enum(["low", "medium", "high", "regulated"]),
  priority: z.enum(["lowest-cost", "balanced", "highest-quality"]),
  currentBriefing: z.string().max(200).nullable(),
});

export interface WorkloadAdviceResult {
  advice: string;
  reasoningSummary?: string;
  runId?: string;
}

interface GatewayErrorBody {
  message?: unknown;
  error?: { message?: unknown };
}

function safeGatewayMessage(error: unknown): string {
  if (!APICallError.isInstance(error)) {
    return error instanceof Error ? error.message : "The recommendation could not be generated.";
  }
  if (error.responseBody) {
    try {
      const body: unknown = JSON.parse(error.responseBody);
      if (typeof body === "object" && body !== null) {
        const parsed = body as GatewayErrorBody;
        if (typeof parsed.message === "string") return parsed.message;
        if (typeof parsed.error?.message === "string") return parsed.error.message;
      }
    } catch {
      if (error.responseBody.length <= 300) return error.responseBody;
    }
  }
  return error.message;
}

function retryDelay(attempt: number): Promise<void> {
  const jitter = Math.floor(Math.random() * 250);
  return new Promise((resolve) => setTimeout(resolve, 900 * 2 ** attempt + jitter));
}

async function generateAdvice(
  lovableApiKey: string,
  data: z.infer<typeof workloadInputSchema>,
): Promise<WorkloadAdviceResult> {
  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const lovable = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: lovableApiKey,
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
    fetch: runIdFetch.fetch,
  });

  const prompt = `Recommend a production model portfolio for this workload.

WORKLOAD
Description: ${data.workload}
Monthly volume: ${data.volume}
Typical context: ${data.contextSize}
Latency: ${data.latency}
Risk: ${data.risk}
Priority: ${data.priority}
Current briefing: ${data.currentBriefing ?? "none"}

TOKENOPS EVIDENCE SNAPSHOT (reviewed 18/09/2026)
- GPT-6 Astra: hardest reasoning, coding and research; 1.05M context; expensive; entire request reprices above 272K input; use selective escalation.
- GPT-5.6 portfolio: Luna for high-volume utility work, Terra for balanced generation, Sol for difficult professional work; 1.05M context; tiered cascade economics.
- Claude Fable 5.1: premium coding/knowledge agent; strongest economics when stable context is reused through low-cost cache reads; validate current context limit.
- Gemini 3.8 Flash: cost-efficient multimodal and agentic workhorse; 1,048,576 input; introductory pricing doubles on 01/01/2027.
- Routing policy: measure cost per accepted outcome, use deterministic validation, cap retries/tool loops, and allow at most one premium escalation by default.

Return a concise professional recommendation with exactly these headings:
1. Recommended portfolio
2. Routing strategy
3. Cost controls
4. Risks and validation
5. First 30-day experiment

Name a primary model and alternatives. Do not invent prices, latency figures, or capabilities. Treat prices as dated snapshots and tell the reader to verify current provider terms. State assumptions clearly. Keep the answer below 650 words.`;

  const result = streamText({
    model: lovable.responses("openai/gpt-6-astra"),
    prompt,
    maxRetries: 0,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  const [advice, reasoningSummary] = await Promise.all([result.text, result.reasoningText]);
  if (!advice.trim() && !reasoningSummary?.trim()) {
    throw new Error("The model completed without a recommendation. Please start a fresh request.");
  }
  return {
    advice: advice.trim() || reasoningSummary?.trim() || "No recommendation was returned.",
    ...(reasoningSummary?.trim() ? { reasoningSummary: reasoningSummary.trim() } : {}),
    ...(runIdFetch.getRunId() ? { runId: runIdFetch.getRunId() } : {}),
  };
}

export const recommendWorkload = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => workloadInputSchema.parse(input))
  .handler(async ({ data }) => {
    const lovableApiKey = process.env['LOVABLE_API_KEY'];
    if (!lovableApiKey) throw new Error("Lovable AI is not configured for this project.");

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await generateAdvice(lovableApiKey, data);
      } catch (error) {
        const status = APICallError.isInstance(error) ? error.statusCode : undefined;
        const retryable = status === 429 || (status !== undefined && status >= 500);
        if (!retryable || attempt === 2) throw new Error(safeGatewayMessage(error));
        await retryDelay(attempt);
      }
    }
    throw new Error("The recommendation could not be generated.");
  });
