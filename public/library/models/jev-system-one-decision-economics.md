# Jev: System One decision economics

Reviewed 14/11/2026. A decision model is a different architectural building block, not simply a cheaper chat model.

## What Jev does

TypeSafe AI's Jev returns typed answers to questions over a supplied state. Jev 1.14 supports Choice, Score, Noul and Box questions, with probabilities where supported. It does not write free-form prose. Treat confidence as a signal to calibrate, not proof of correctness. Jev and Meta's JEPA are unrelated products: JEPA learns representations, whereas Jev answers typed questions.

## Verified model and billing limits

| Item | Current reference |
|---|---|
| Pinned model | jev-1.14.0, released 14/10/2026 |
| Input rate | $42/billion tokens = $0.042/million tokens |
| Output charge | No output-token charge |
| Default request limit | 64K state plus all questions |
| Default per-question limit | 32K state plus any one question |
| Experimental long context | 262K with explicit opt-in; slower and less accurate per provider guidance |
| Inputs | Text and experimental images; no native audio/video |

These limits are not interchangeable. A request under 64K may still exceed the per-question limit. Pin the version: mutable latest aliases can change model behaviour without a code change. Do not assume a hosted closed model is open source because its SDK is available.

## Route by output shape

1. Execute deterministic rules first when the answer is already computable.
2. Use a typed decision model for bounded classification, policy selection, eligibility, or tool choice.
3. Abstain and escalate when calibrated confidence is insufficient or the input is outside the evaluation distribution.
4. Use a generative LLM when the task requires an explanation, code, synthesis, or creative output.
5. Require human authorization before irreversible or high-risk actions. Model scores never grant permissions.

## Cost every decision, including fallbacks

For N requests, decision tokens T, rate P, resolved fraction R, full fallback cost F, and monthly overhead H:

Decision spend = N × T × P / 1,000,000.

Proposed spend = decision spend + N × (1 − R) × F + H.

Illustrative example: one million requests at 1,000 input tokens cost $42 in Jev input. With 80% resolved, a $0.01 fallback and $100 overhead, proposed spend is $2,142 versus a $10,000 LLM-only baseline. The $7,858 difference is a hypothetical estimate, not measured savings or a claim of equivalent quality.

## Production acceptance gates

Measure precision/recall per decision class, expected calibration error, abstention coverage, false-positive consequence, timeout rate and end-to-end p95. Replay representative rare cases, adversarial state and prompt injection attempts. Compare total accepted-task cost including human review and reruns. Run in shadow mode before granting any side effects. Version thresholds and keep a rollback route.

## Sources

- [TypeSafe official models and pricing](https://docs.typesafe.ai/models)
- [Jev and the era of model Tetris — CIO, November 2026](https://www.cio.com/article/4247450/jev-and-the-era-of-model-tetris.html)
