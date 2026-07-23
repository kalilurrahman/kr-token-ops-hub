# Fine-Tuning vs Prompting Economics (2026)

*The prompting-only era is ending for high-volume workloads. Here's when to fine-tune, when to distil, and when to stay stateless.*

## The decision framework

- **Low volume, narrow task** → Prompt + few-shot
- **High volume, narrow task** → Distil an SLM (LoRA on 8B)
- **Low volume, broad task** → Prompt + RAG
- **High volume, broad task** → Prompt caching + routing tiers

"High volume" ≈ >500K requests/month on the same task shape. Below that, fine-tuning maintenance cost eats the inference savings.

## The 2026 fine-tuning cost snapshot

| Approach | One-time cost | Ongoing cost | Break-even vs GPT-5 |
|---|---|---|---|
| **OpenAI GPT-5 Mini fine-tune** | $3–15 (small dataset) | 1.5× base inference | ~200K similar-shape calls |
| **Anthropic Claude Haiku fine-tune** | Enterprise-tier | 1.5× base inference | ~500K calls |
| **LoRA on 8B (self-hosted)** | ~$5–30 GPU time | ~$0.05/M tokens hosted | ~1M calls |
| **Full fine-tune 8B** | $200–2000 | Same hosting | >5M calls |
| **DPO / RLHF alignment** | $500–5000 | Same as base | Rarely justified on cost alone |

## The distillation pattern (highest ROI in 2026)

1. Run production workload on GPT-5 / Claude Opus 4.5 for 2 weeks.
2. Log 10K–50K (input → output) pairs where downstream signal was positive.
3. Fine-tune Llama 3.3 8B / Qwen 2.5 7B with LoRA on those pairs.
4. Deploy the LoRA on serverless GPU (Together, Fireworks, Modal).
5. Route the same task shape to the SLM; keep frontier as fallback.

**Reported outcomes:** 40–90% cost reduction at 95–99% quality retention.

## When NOT to fine-tune

- **Task is still changing.** Every prompt tweak invalidates the fine-tune.
- **Frontier improves faster than you can re-train.**
- **Volume is <100K/month.** Prompt caching gets 80% of the savings with 0% of the ops burden.
- **You need chain-of-thought.** SLMs are worse at CoT than frontier reasoning tiers.

## The hidden cost: eval infrastructure

A fine-tune with no continuous eval is a liability. Budget:
- Golden dataset: 500–2000 hand-labeled examples, refreshed quarterly.
- Automated eval: Ragas / Promptfoo / DeepEval on every candidate.
- Shadow deployment: 2 weeks minimum before cutover.
- Rollback plan: keep the frontier route warm for 30 days post-cutover.

Total eval investment: 2–4 engineer-weeks up front, ~2 hours/week ongoing.

## The regulated / on-prem case

Even below the volume break-even, fine-tuning wins when data cannot leave your VPC (healthcare, defense, finance), model must be reproducible (SEC, FDA), or you need deterministic outputs across upgrades. In those cases it is a compliance investment, not a cost optimisation.

## The 2026 shift

Managed fine-tuning is closing the gap with self-hosted LoRA on ease-of-use, while OSS SLMs close the gap with frontier on capability. The combination — **managed OSS SLM fine-tunes on serverless GPU** — is the fastest-growing production pattern.
