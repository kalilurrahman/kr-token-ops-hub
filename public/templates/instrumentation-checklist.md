# Instrumentation Checklist — Pre-Production Readiness

> **Purpose:** Ensure every AI-powered service has complete cost observability, governance controls, and operational readiness before going live.  
> **When to use:** During the final sprint before any LLM-integrated service reaches production.  
> **Sign-off required from:** Engineering Lead, FinOps Lead, Service Owner.

---

## How to Use

1. Work through each section in order. Items build on each other.
2. Check each box only when the item is **verified in the staging environment**.
3. Attach evidence (screenshot, link, or test result) for each item in the "Evidence" column.
4. All items must be checked before the production launch gate is cleared.

---

## Section 1 — Tagging

> *Every LLM API call must carry metadata that enables cost attribution, filtering, and alerting.*

| # | Item | Evidence |
|---|------|----------|
| | **1.1** | |

- [ ] **1.1 All outbound LLM calls include required metadata tags**  
  Every request to an LLM provider carries the mandatory fields defined in [`request-tagging-schema.yaml`](./request-tagging-schema.yaml): `team`, `service`, `feature`, `environment`, `model`, `use_case`, `cost_center`, and `region`.  
  > *Validation:* Fire 10 test requests in staging and verify all tags appear in the request log.

- [ ] **1.2 Tags are validated at the gateway before the request is forwarded**  
  The API gateway rejects or logs a warning for any request missing required tags. Untagged requests must not silently pass through.  
  > *Validation:* Send a request with a missing `cost_center` field and confirm it is rejected (or flagged, per your policy).

- [ ] **1.3 Tags are propagated to the LLM response log**  
  When the LLM provider responds, the gateway appends the original request tags to the response log entry alongside `input_tokens`, `output_tokens`, `model`, `latency_ms`, and `status_code`.  
  > *Validation:* Query the response log and confirm all tag fields are present and correctly populated.

- [ ] **1.4 Tag values are logged to the observability platform**  
  Tags are emitted as metric dimensions (e.g., Datadog tags, Prometheus labels, CloudWatch dimensions) so that dashboards and alerts can filter by `team`, `service`, `feature`, and `model`.  
  > *Validation:* Open the observability platform, filter by `service=<your_service>`, and confirm metrics appear.

- [ ] **1.5 Session and correlation IDs are attached (if applicable)**  
  For multi-turn conversation services, the `session_id` field is populated so that cost can be tracked per conversation, not just per request.  
  > *Validation:* Initiate a 3-turn conversation in staging and verify all 3 requests share the same `session_id`.

---

## Section 2 — Cost Tracking

> *Raw request logs must flow into a cost-analysis pipeline so that spend is visible and attributable.*

- [ ] **2.1 Request logs flow to the data warehouse**  
  Enriched request logs (tags + token counts + model + timestamp) are exported to the analytics warehouse (e.g., BigQuery, Snowflake, Redshift) with a latency of ≤1 hour.  
  > *Validation:* Fire 10 requests, wait 1 hour, and query the warehouse table for matching records.

- [ ] **2.2 Cost is computed and stored per request**  
  A transformation job multiplies `input_tokens × input_rate` and `output_tokens × output_rate` using the pricing table for each model. The computed cost is stored as a column in the warehouse.  
  > *Validation:* Query 5 requests and manually verify the computed cost matches the expected value.

- [ ] **2.3 Cost allocation reports are built and accessible**  
  A reporting layer (Looker, Tableau, Metabase, or similar) provides pre-built views:
  - Spend by team (weekly, monthly)
  - Spend by service and feature
  - Spend by model
  - Cost per request (P50, P90, P99)
  - Trend charts (rolling 30/60/90 days)  
  > *Validation:* Open the dashboard, confirm data is populating, and verify totals match a manual spot-check.

- [ ] **2.4 Unit economics metrics are tracked**  
  For user-facing services, compute and track:
  - Cost per conversation / session
  - Cost per end-user action (e.g., cost per email generated, cost per ticket routed)
  - Cost per customer tier (free / pro / enterprise)  
  > *Validation:* Confirm at least one unit-economics metric is visible on the dashboard.

- [ ] **2.5 Token waste metrics are tracked**  
  The following waste signals are monitored:
  - Cache-hit rate (semantic and exact-match)
  - Retry token overhead (tokens consumed by retried requests)
  - Empty / invalid response rate
  - Output tokens exceeding the useful portion (over-generation)  
  > *Validation:* Confirm each metric is emitting data in the observability platform.

---

## Section 3 — Governance

> *Budget limits, alerts, and team accountability must be in place before production traffic flows.*

- [ ] **3.1 Monthly token budget is set for this service**  
  The service has a defined monthly token budget in [`budget-guardrails.yaml`](./budget-guardrails.yaml) with `monthly_token_budget`, `soft_alert`, `hard_limit`, and `owners` configured.  
  > *Validation:* Open the guardrails config and confirm the service entry exists with correct values.

- [ ] **3.2 Soft alert is configured and tested**  
  The soft alert fires at the configured threshold (default: 80% of budget). The alert message includes current usage, budget, and projected end-of-month usage.  
  > *Validation:* Simulate 80% budget consumption in staging and confirm the alert fires in the correct Slack channel / email.

- [ ] **3.3 Hard limit is configured and tested**  
  The hard limit fires at the configured threshold (default: 110% of budget). The configured action (reject / throttle / log_only) is enforced correctly.  
  > *Validation:* Simulate 110% budget consumption in staging and confirm requests are rejected/throttled and the escalation chain is triggered.

- [ ] **3.4 Escalation chain is defined and contacts are valid**  
  The escalation chain includes at least 3 levels: service owner → FinOps team → VP Engineering. All email addresses and Slack handles are verified.  
  > *Validation:* Send a test alert at each escalation level and confirm delivery.

- [ ] **3.5 Team is trained on cost awareness**  
  The owning team has completed a briefing on:
  - How token costs are calculated
  - Where to find their service's cost dashboard
  - What to do when an alert fires
  - How to request a budget exception  
  > *Validation:* At least one team member can demonstrate navigating the dashboard and describing the alert response process.

---

## Section 4 — Operations

> *Ongoing operational practices ensure cost optimization is continuous, not a one-time effort.*

- [ ] **4.1 Monthly cost review is scheduled**  
  The service is included in the [Monthly TokenOps Cost Review](./monthly-cost-review.md). The service owner is added to the recurring meeting invite.  
  > *Validation:* Confirm the calendar invite includes the service owner and the service is on the review agenda.

- [ ] **4.2 Quality baseline is established**  
  A quality evaluation baseline has been recorded for the service:
  - Evaluation metric (accuracy, F1, ROUGE, human preference, pass rate)
  - Baseline score on a held-out test set (n ≥ 100)
  - Test set is versioned and stored  
  > *Validation:* The baseline score is documented and the test set is accessible in the team's repository.

- [ ] **4.3 Optimization plan is documented**  
  A forward-looking optimization plan exists for the service, including:
  - Prompt compression opportunities
  - Model downgrade candidates
  - Caching strategy
  - Batching opportunities
  - Timeline and owners for each initiative  
  > *Validation:* The optimization plan is linked in the service's README or operational runbook.

- [ ] **4.4 Runbook includes cost-related incident response**  
  The service's operational runbook includes a section on cost anomalies:
  - How to identify a cost spike (dashboard link, alert channel)
  - Immediate triage steps (check traffic, check prompt length, check retries)
  - Escalation path
  - Rollback procedure (e.g., feature flag to disable LLM calls)  
  > *Validation:* The runbook section exists and has been reviewed by the on-call rotation.

- [ ] **4.5 Feature flag or kill switch is in place**  
  The LLM integration can be disabled via a feature flag without a code deployment. This is the fastest mitigation for a cost runaway scenario.  
  > *Validation:* Toggle the feature flag in staging and confirm LLM calls stop and the service gracefully degrades.

---

## Sign-Off

| Role | Name | Date | Sign-Off |
|------|------|------|----------|
| Engineering Lead | | | ☐ Approved |
| FinOps Lead | | | ☐ Approved |
| Service Owner | | | ☐ Approved |

---

## Quick Stats

| Metric | Value |
|--------|-------|
| Total checklist items | 19 |
| Tagging items | 5 |
| Cost Tracking items | 5 |
| Governance items | 5 |
| Operations items | 5 |
| Estimated time to complete | 2–4 hours (assumes infrastructure is built) |

---

*Template version 1.0 — Maintained by the TokenOps team.*
