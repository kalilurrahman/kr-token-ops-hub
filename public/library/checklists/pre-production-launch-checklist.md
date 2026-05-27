# Pre-Production Launch Checklist — LLM-Powered Features

**Feature Name:** _________________________  
**Service/Team:** _________________________  
**Target Launch Date:** ___________________  
**Completed By:** _________________________

---

## 1. Cost Estimation ✦ Finance

- [ ] **Projected daily request volume estimated**  
  Source: product analytics, load testing, or comparable feature data.  
  _Why: Without volume projections, you cannot estimate costs or set budgets._

- [ ] **Cost per request calculated**  
  Formula: `(avg_input_tokens × input_rate + avg_output_tokens × output_rate) / 1M`  
  _Why: This is your fundamental unit cost. It must be known before launch._

- [ ] **Monthly cost projection computed**  
  Formula: `cost_per_request × daily_volume × 30`  
  Projected monthly cost: $________  
  _Why: Finance needs this for budget approval and forecasting._

- [ ] **Monthly budget approved by finance partner**  
  Budget: $________ | Approved by: ________  
  _Why: Unapproved AI spend creates surprise bills and organizational friction._

- [ ] **Cost ceiling (hard cap) configured**  
  Daily ceiling: $________ | Monthly ceiling: $________  
  _Why: Prevents runaway costs from bugs, retry loops, or traffic spikes._

- [ ] **Per-request cost guard configured**  
  Max cost per request: $________  
  _Why: A single malformed request shouldn't consume your daily budget._

- [ ] **Batch vs. real-time decision documented**  
  Mode: ☐ Real-time ☐ Batch ☐ Hybrid  
  _Why: Batch API is 50% cheaper. Only use real-time if latency is critical._

- [ ] **Model selected with cost-quality tradeoff documented**  
  Model: ________ | Reason: ________  
  _Why: Teams often default to the most expensive model. Justify the choice._

- [ ] **Scaling cost projection completed**  
  Cost at 2× volume: $________ | Cost at 10× volume: $________  
  _Why: Features that cost $5K/month at launch may cost $50K at scale._

- [ ] **Caching opportunity assessed**  
  Cacheable? ☐ Yes ☐ No | Expected hit rate: ___%  
  _Why: Even 20% cache hit rate reduces costs by 20% for free._

---

## 2. Quality Assurance ✦ Engineering

- [ ] **Test suite created with ≥200 test cases**  
  Test set location: ________  
  _Why: You cannot measure quality regression without a benchmark._

- [ ] **Accuracy/quality benchmarks met**  
  Metric: ________ | Score: ________ | Threshold: ________  
  _Why: Ensures the model meets minimum quality for the use case._

- [ ] **Edge cases tested (10%+ of test set)**  
  Examples: empty input, max-length input, adversarial input, non-English, special characters  
  _Why: Edge cases cause production failures and wasted tokens._

- [ ] **Output format validation implemented**  
  ☐ JSON schema validation ☐ Regex check ☐ Type checking  
  _Why: Malformed outputs waste downstream processing and may require retries._

- [ ] **Hallucination rate assessed**  
  Rate: ____% | Threshold: ____% | Mitigation: ________  
  _Why: Hallucinations create user trust issues and potential liability._

- [ ] **Human evaluation completed (sample of 50+ responses)**  
  Average score: ____/5.0 | Threshold: ____/5.0  
  _Why: Automated metrics miss nuances that humans catch._

- [ ] **Prompt version pinned and stored in version control**  
  Commit hash: ________ | Prompt ID: ________  
  _Why: Enables rollback and cost-quality tracking per prompt version._

- [ ] **Latency tested under expected load**  
  P50: ____ms | P95: ____ms | P99: ____ms | SLO: ____ms  
  _Why: Users won't wait. Latency SLOs must be met before launch._

---

## 3. Instrumentation ✦ Platform

- [ ] **Tagging schema applied**  
  Tags: `team=____, service=____, feature=____, use_case=____`  
  _Why: Cost attribution requires consistent tagging from day one._

- [ ] **Requests routed through centralized gateway**  
  Gateway: ☐ LiteLLM ☐ Custom ☐ Other: ________  
  _Why: Gateway enables tagging, routing, rate limiting, and cost logging._

- [ ] **Token usage logging verified**  
  Logged fields: input_tokens, output_tokens, model, latency, cost  
  _Why: Cannot optimize what you don't measure._

- [ ] **Cost dashboard created/updated**  
  Dashboard URL: ________  
  _Why: Real-time visibility enables fast detection and response._

- [ ] **Cost allocated to correct cost center**  
  Cost center: ________ | Budget line: ________  
  _Why: Chargeback requires accurate cost center mapping._

- [ ] **Request tracing enabled (correlation ID)**  
  Trace ID format: ________ | Propagated to LLM calls: ☐ Yes  
  _Why: Debugging production issues requires end-to-end tracing._

- [ ] **Metrics exported to monitoring system**  
  System: ☐ Prometheus ☐ Datadog ☐ CloudWatch ☐ Other  
  _Why: Centralized monitoring enables cross-service cost views._

- [ ] **Baseline metrics recorded**  
  Pre-launch baseline: cost/request $____, latency ____ms, quality ____%  
  _Why: Post-launch comparison requires a pre-launch baseline._

---

## 4. Security ✦ Security

- [ ] **PII filtering enabled on inputs**  
  Method: ☐ Regex ☐ NER model ☐ Provider-side ☐ N/A  
  _Why: Sending PII to LLM providers may violate data protection regulations._

- [ ] **API keys stored in secrets manager**  
  ☐ AWS Secrets Manager ☐ GCP Secret Manager ☐ Vault ☐ Other  
  _Why: Hardcoded API keys in code are a security vulnerability._

- [ ] **Tenant isolation verified (multi-tenant systems)**  
  Isolation method: ☐ Separate API keys ☐ Tagging ☐ N/A (single tenant)  
  _Why: Tenant A must not see tenant B's data in responses._

- [ ] **Data residency requirements checked**  
  Required region: ________ | Provider region: ________  
  _Why: Some regulations require data to stay within geographic boundaries._

- [ ] **Provider DPA (Data Processing Agreement) signed**  
  ☐ Yes ☐ In progress ☐ N/A  
  _Why: Required for GDPR compliance when processing personal data._

- [ ] **Training data opt-out confirmed**  
  Provider training opt-out: ☐ Confirmed ☐ N/A  
  _Why: Enterprise data should not be used to train public models._

---

## 5. Operations ✦ SRE/Platform

- [ ] **Budget alerts configured**  
  Alert at: 50% ($____), 75% ($____), 90% ($____), 100% ($____)  
  _Why: Graduated alerts enable proactive cost management._

- [ ] **Cost anomaly alert configured**  
  Threshold: >____% deviation from rolling average  
  _Why: Detects runaway costs, retry loops, and traffic spikes._

- [ ] **Latency alert configured**  
  Alert if P95 > ____ms for > ____ minutes  
  _Why: Latency spikes indicate provider issues or prompt regression._

- [ ] **Error rate alert configured**  
  Alert if error rate > ____% for > ____ minutes  
  _Why: Elevated errors waste tokens on retries and degrade user experience._

- [ ] **Runbook written for cost incidents**  
  Runbook location: ________  
  _Why: On-call engineers need step-by-step guidance during incidents._

- [ ] **Escalation contacts documented**  
  L1: ________ | L2: ________ | Finance: ________  
  _Why: Clear escalation prevents delayed response to cost incidents._

- [ ] **Rollback plan tested**  
  Rollback method: ☐ Feature flag ☐ Model revert ☐ Gateway config  
  _Why: If the launch causes issues, you need a tested rollback path._

- [ ] **Rate limiting configured**  
  RPM limit: ________ | TPM limit: ________  
  _Why: Prevents runaway consumption from bugs or abuse._

---

## 6. Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Engineering Lead | | | |
| Product Owner | | | |
| Finance/FinOps Partner | | | |
| Security Review | | | |

**Launch Decision:** ☐ Approved ☐ Approved with conditions ☐ Not approved

**Conditions (if any):** _______________________________________________

---

*Template from the TokenOps Atlas — [tokenops-atlas](https://github.com/kalilurrahman/tokenops-atlas)*
