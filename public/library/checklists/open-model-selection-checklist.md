# Open-Model Selection Checklist

> **Reviewed 27/09/2026.** Use before approving downloaded weights, a dedicated endpoint, or a self-hosted inference platform.

## Rights and provenance

- [ ] Record the exact model name, revision, hash, source, and release date.
- [ ] Classify it accurately as proprietary, open weight, or open source.
- [ ] Legal has reviewed commercial use, redistribution, derivatives, attribution, and scale thresholds.
- [ ] Training-data, model-card, acceptable-use, and geographic constraints are documented.
- [ ] Dependencies, quantised variants, adapters, and serving containers have separate licence checks.

## Quality and safety

- [ ] A representative accepted-outcome evaluation exists for every target workload.
- [ ] Results are segmented by language, input length, risk tier, and output format.
- [ ] Quantisation quality delta is measured, not assumed.
- [ ] Hallucination, refusal, prompt-injection, privacy, and harmful-output tests pass.
- [ ] Human-review and escalation paths are defined for high-risk outcomes.

## Capacity and economics

- [ ] Throughput and latency are measured at target concurrency and context length.
- [ ] Accelerator memory, replica count, utilisation, and failover headroom are included.
- [ ] Platform, networking, storage, observability, engineering, and operations costs are included.
- [ ] Cost per accepted outcome is compared with at least one hosted API.
- [ ] Break-even volume is stress-tested for low utilisation and demand spikes.
- [ ] Batch, prefix-cache, and quantisation assumptions are separately measured.

## Operations

- [ ] Autoscaling, admission control, queue limits, and overload behaviour are tested.
- [ ] Rollback and hosted fallback paths preserve data and safety requirements.
- [ ] Model, prompt, adapter, tokenizer, and serving-engine versions are observable.
- [ ] Security patching, vulnerability response, and model-file integrity have owners.
- [ ] Capacity, quality drift, energy use, and cost are reviewed monthly.
- [ ] Re-evaluation is mandatory after any model, quantisation, adapter, hardware, or serving change.

## Decision record

Record the approved workload, rejected alternatives, evidence date, licence interpretation, cost range, quality threshold, deployment owner, fallback, and next review date. Approval is for the evaluated combination—not the family name in general.
