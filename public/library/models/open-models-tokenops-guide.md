# Open Models in TokenOps — Weights, Licences, and Infrastructure Economics

> **Reviewed 27/09/2026.** Model cards, licences, hosted rates, and serving stacks change independently. Verify all four before procurement or production deployment.

## Executive position

An open model is not automatically free, portable, private, or open source. TokenOps must separate five questions:

1. **Can the weights be downloaded?** This is open-weight access.
2. **What does the licence permit?** Commercial use, redistribution, derivatives, and high-scale deployment can have different conditions.
3. **Can the serving stack be operated reliably?** Memory, throughput, batching, failover, and observability determine practical cost.
4. **Does the model pass the workload quality gate?** A low compute bill is irrelevant when retries or human rework erase the saving.
5. **Which deployment boundary is required?** Self-hosted, managed dedicated, and shared API inference have different control and cost profiles.

## Open source versus open weight

| Label       | What it means in this guide                                              | TokenOps consequence                                                     |
| ----------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Proprietary | Weights are unavailable; access is through a provider-controlled service | Measure token, tool, storage, region, and service-tier charges           |
| Open weight | Weights are downloadable under model-specific terms                      | Review licence and acceptable-use terms; calculate infrastructure TCO    |
| Open source | Weights and relevant code use a permissive open licence                  | Still account for compute, operations, security, evaluation, and updates |

Do not use “open source” as a marketing synonym for downloadable weights. Llama uses a custom community licence. DeepSeek and Qwen terms are model-specific. OpenAI's gpt-oss repository uses Apache 2.0, but downstream serving tools and packaged derivatives can carry separate terms.

## September 2026 portfolio

| Family                   | Classification                        | Reference context | Deployment profile                               | Best-fit evaluation                                         |
| ------------------------ | ------------------------------------- | ----------------: | ------------------------------------------------ | ----------------------------------------------------------- |
| gpt-oss 120B / 20B       | Open source, Apache 2.0               |              128K | Local, private cloud, or specialist host         | Reasoning under a permissive licence; controlled adaptation |
| DeepSeek V4 Pro / Flash  | Open weight                           |                1M | Multi-accelerator or specialist hosted inference | Large-context and high-volume workloads                     |
| Llama 4 Scout / Maverick | Open weight, custom community licence |          10M / 1M | Broad serving ecosystem                          | Long-context retrieval, multimodal workflows, portability   |
| Qwen3.8-Flash-Next       | Open weight; verify exact card        |       262K native | Efficiency-focused serving                       | Multilingual, coding, and throughput-sensitive work         |
| Ministral 8B             | Open weight; model-specific terms     |    128K reference | Edge, workstation, or compact server             | Offline, regulated, and latency-sensitive narrow tasks      |

Context is a capacity ceiling, not a recommendation. Test quality, latency, memory use, and cost at the context lengths your application actually sends.

## The self-hosted cost equation

Use measured effective throughput, not a vendor peak:

```text
monthly infrastructure = accelerators × hourly price × 730
                       + platform overhead + operations

effective tokens/month = measured tokens/second × utilisation × 3,600 × 730

self-hosted $/M tokens = monthly infrastructure ÷ effective million tokens
```

Then compare with the hosted workload mix:

```text
hosted blended $/M = input share × input rate
                   + output share × output rate

break-even million tokens/month = monthly infrastructure ÷ hosted blended $/M
```

The calculator deliberately includes utilisation. An accelerator that achieves high benchmark throughput but sits idle most of the month can be more expensive than an API.

## Costs commonly omitted

- Standby replicas, multi-zone redundancy, and capacity reserved for peaks
- Engineering for serving, quantisation, kernels, autoscaling, and upgrades
- Security patching, vulnerability response, model provenance, and licence review
- Evaluation suites, red teaming, regression triage, and human review
- Object storage, model distribution, telemetry, gateways, and networking
- Power, cooling, data-centre allocation, or managed-platform premiums
- Lower quality that increases retries, escalations, or downstream correction

## Quantisation and serving controls

Treat quantisation as a change to the product, not merely compression. Compare FP16/BF16, FP8, INT8, and lower-bit variants on the same accepted-outcome suite. Record:

- quality delta by task and language;
- tokens per second at target concurrency;
- time to first token and p95 completion latency;
- accelerator memory and replica count;
- output length, retry rate, and escalation rate;
- cost per accepted outcome.

Continuous batching, prefix caching, speculative decoding, and tensor/pipeline parallelism can improve economics, but each changes latency and capacity behaviour. Benchmark a realistic request distribution rather than one prompt size.

## Deployment decision matrix

| Situation                          | Default starting point                                    |
| ---------------------------------- | --------------------------------------------------------- |
| Early product, uncertain demand    | Hosted API; avoid stranded capacity                       |
| Bursty traffic                     | Serverless or shared hosted inference                     |
| Stable high utilisation            | Dedicated hosted or self-hosted benchmark                 |
| Strict data boundary               | Private managed endpoint or self-hosted deployment        |
| Edge/offline requirement           | Compact model fitted to device memory and power           |
| Frequent model changes             | Hosted portfolio plus abstraction layer                   |
| Deep adaptation is differentiating | Open model with governed training and evaluation pipeline |

## Governance gates

Before promotion, require evidence for licence approval, provenance, model-card review, security testing, data handling, quality thresholds, capacity headroom, rollback, incident response, and upgrade ownership. Re-run the evaluation after changing weights, quantisation, serving engine, prompt template, or hardware.

## Sources

- [OpenAI gpt-oss repository](https://github.com/openai/gpt-oss)
- [OpenAI open-weight model guidance](https://help.openai.com/en/articles/11870455-openai-open-weight-models-gpt-oss)
- [DeepSeek V4 preview](https://www.deepseek.com/en/news/v4-preview/)
- [DeepSeek V4 Pro model card](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro)
- [Meta Llama 4 model card](https://github.com/meta-llama/llama-models/blob/main/models/llama4/MODEL_CARD.md)
- [Llama 4 Community License](https://llama.com/llama4/license)
- [Qwen model catalogue](https://huggingface.co/Qwen)
- [Mistral open-model announcements](https://mistral.ai/news/ministraux)

## Review checklist

- [ ] Exact model, revision, licence, and source hash recorded
- [ ] Representative quality and safety evaluation passed
- [ ] Throughput measured at production context and concurrency
- [ ] Full platform and operations costs included
- [ ] Break-even volume stress-tested at low and peak utilisation
- [ ] Hosted fallback and capacity-failure behaviour tested
- [ ] Quarterly model and licence review owner assigned
