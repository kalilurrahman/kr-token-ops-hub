# The TokenOps Continuous Improvement Loop

Optimisation is not a project. Savings decay as traffic mixes shift, prompts drift, and models change. This is the operating cadence that keeps them.

## 1. The weekly loop (60 minutes)

| Step | Owner | Output |
|---|---|---|
| Review top 10 endpoints by cost delta | Platform eng | Anomalies flagged |
| Review cache hit rate and prefix misses | Platform eng | Prefix regressions filed |
| Review retry and truncation rates | Feature owners | Prompt fixes queued |
| Confirm budget burn vs forecast | FinOps | Guardrail adjustments |
| Pick one optimisation to ship | Program lead | One ticket, one owner |

One shipped optimisation per week beats a quarterly optimisation sprint, because the eval and rollback surface stays small.

## 2. The monthly loop

- Refresh the **model mix report**: share of traffic by tier, cost per tier, quality per tier.
- Re-run the **golden eval** against current production prompts to detect drift.
- Reprice against current vendor rates; 2026 pricing moves quarterly.
- Update the **savings ledger** — realised savings, annualised, with the baseline stated.

## 3. The quarterly loop

- Full cost-optimisation audit (tagging coverage, orphaned endpoints, dead prompts).
- Vendor review: consumption vs commitment, negotiation triggers, new tiers.
- Maturity re-score and a single target for the next quarter.
- Retire experiments that never graduated; every live variant costs tokens and attention.

## 4. The savings ledger

Every claimed saving needs five fields, or it will be disputed:

```
change_id, baseline_cost_per_unit, post_change_cost_per_unit,
volume_basis, measurement_window
```

Report **cost per successful outcome**, not total spend — total spend rises with growth even when the program is working. A program that halves unit cost while spend grows 30% is a success, and the ledger is how you prove it.

## 5. Drift detection

Automate alerts for:

- cache hit rate down >10 points week over week,
- average input tokens per request up >15%,
- small-model traffic share down >10 points,
- retry rate above 2% on any endpoint,
- reasoning-token share above the endpoint's configured band,
- any endpoint appearing in the top 10 by cost for the first time.

These six alerts catch the large majority of cost regressions before month-end.

## 6. Culture rules that make it stick

- **Cost is a product metric,** shown next to latency and quality on the same dashboard.
- **Every new AI feature ships with a unit-cost estimate** and a tag, or it does not ship.
- **No optimisation without an eval.** No eval without a golden set.
- **Celebrate unit-cost wins publicly**; teams optimise what gets recognised.
- **Keep a written "we tried this and it did not work" log** — it prevents the same experiment being re-run every two quarters.
