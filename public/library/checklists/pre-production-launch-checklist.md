# Pre-Production Launch Checklist — LLM-Powered Features

**Feature Name:** ************\_************
**Service/Team:** ************\_************
**Target Launch Date:** ********\_\_\_********
**Completed By:** ************\_************

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
      Projected monthly cost: $**\_\_\_\_**
      _Why: Finance needs this for budget approval and forecasting._

- [ ] **Monthly budget approved by finance partner**  
      Budget: $**\_\_\_\_** | Approved by: **\_\_\_\_**
      _Why: Unapproved AI spend creates surprise bills and organizational friction._

- [ ] **Cost ceiling (hard cap) configured**  
      Daily ceiling: $**\_\_\_\_** | Monthly ceiling: $**\_\_\_\_**
      _Why: Prevents runaway costs from bugs, retry loops, or traffic spikes._

- [ ] **Per-request cost guard configured**  
      Max cost per request: $**\_\_\_\_**
      _Why: A single malformed request shouldn't consume your daily budget._

- [ ] **Batch vs. real-time decision documented**  
      Mode: ☐ Real-time ☐ Batch ☐ Hybrid
      _Why: Batch API is 50% cheaper. Only use real-time if latency is critical._

- [ ] **Model selected with cost-quality tradeoff documented**  
      Model: **\_\_\_\_** | Reason: **\_\_\_\_**
      _Why: Teams often default to the most expensive model. Justify the choice._

- [ ] **Scaling cost projection completed**  
      Cost at 2× volume: $**\_\_\_\_** | Cost at 10× volume: $**\_\_\_\_**
      _Why: Features that cost $5K/month at launch may cost $50K at scale._

- [ ] **Caching opportunity assessed**  
      Cacheable? ☐ Yes ☐ No | Expected hit rate: _\_\_%
      \_Why: Even 20% cache hit rate reduces costs by 20% for free._

---

## 2. Quality Assurance ✦ Engineering

- [ ] **Test suite created with ≥200 test cases**  
      Test set location: **\_\_\_\_**
      _Why: You cannot measure quality regression without a benchmark._

- [ ] **Accuracy/quality benchmarks met**  
      Metric: **\_\_\_\_** | Score: **\_\_\_\_** | Threshold: **\_\_\_\_**
      _Why: Ensures the model meets minimum quality for the use case._

- [ ] **Edge cases tested (10%+ of test set)**  
      Examples: empty input, max-length input, adversarial input, non-English, special characters
      _Why: Edge cases cause production failures and wasted tokens._

- [ ] **Output format validation implemented**  
      ☐ JSON schema validation ☐ Regex check ☐ Type checking
      _Why: Malformed outputs waste downstream processing and may require retries._

- [ ] **Hallucination rate assessed**  
      Rate: \_**\_% | Threshold: \_\_**% | Mitigation: **\_\_\_\_**
      _Why: Hallucinations create user trust issues and potential liability._

- [ ] **Human evaluation completed (sample of 50+ responses)**  
      Average score: \_**\_/5.0 | Threshold: \_\_**/5.0
      _Why: Automated metrics miss nuances that humans catch._

- [ ] **Prompt version pinned and stored in version control**  
      Commit hash: **\_\_\_\_** | Prompt ID: **\_\_\_\_**
      _Why: Enables rollback and cost-quality tracking per prompt version._

- [ ] **Latency tested under expected load**  
      P50: \_**\_ms | P95: \_\_**ms | P99: \_**\_ms | SLO: \_\_**ms
      _Why: Users won't wait. Latency SLOs must be met before launch._

---

## 3. Instrumentation ✦ Platform

- [ ] **Tagging schema applied**  
      Tags: `team=____, service=____, feature=____, use_case=____`
      _Why: Cost attribution requires consistent tagging from day one._

- [ ] **Requests routed through centralized gateway**  
      Gateway: ☐ LiteLLM ☐ Custom ☐ Other: **\_\_\_\_**
      _Why: Gateway enables tagging, routing, rate limiting, and cost logging._

- [ ] **Token usage logging verified**  
      Logged fields: input*tokens, output_tokens, model, latency, cost
      \_Why: Cannot optimize what you don't measure.*

- [ ] **Cost dashboard created/updated**  
      Dashboard URL: **\_\_\_\_**
      _Why: Real-time visibility enables fast detection and response._

- [ ] **Cost allocated to correct cost center**  
      Cost center: **\_\_\_\_** | Budget line: **\_\_\_\_**
      _Why: Chargeback requires accurate cost center mapping._

- [ ] **Request tracing enabled (correlation ID)**  
      Trace ID format: **\_\_\_\_** | Propagated to LLM calls: ☐ Yes
      _Why: Debugging production issues requires end-to-end tracing._

- [ ] **Metrics exported to monitoring system**  
      System: ☐ Prometheus ☐ Datadog ☐ CloudWatch ☐ Other
      _Why: Centralized monitoring enables cross-service cost views._

- [ ] **Baseline metrics recorded**  
      Pre-launch baseline: cost/request $\_**\_, latency \_\_**ms, quality \__\_\_%
      \_Why: Post-launch comparison requires a pre-launch baseline._

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
      Required region: **\_\_\_\_** | Provider region: **\_\_\_\_**
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
      Alert at: 50% ($____), 75% ($\_**\_), 90% ($\_\_**), 100% ($\__\_\_)
      \_Why: Graduated alerts enable proactive cost management._

- [ ] **Cost anomaly alert configured**  
      Threshold: >\__\_\_% deviation from rolling average
      \_Why: Detects runaway costs, retry loops, and traffic spikes._

- [ ] **Latency alert configured**  
      Alert if P95 > \_**\_ms for > \_\_** minutes
      _Why: Latency spikes indicate provider issues or prompt regression._

- [ ] **Error rate alert configured**  
      Alert if error rate > \_**\_% for > \_\_** minutes
      _Why: Elevated errors waste tokens on retries and degrade user experience._

- [ ] **Runbook written for cost incidents**  
      Runbook location: **\_\_\_\_**
      _Why: On-call engineers need step-by-step guidance during incidents._

- [ ] **Escalation contacts documented**  
      L1: **\_\_\_\_** | L2: **\_\_\_\_** | Finance: **\_\_\_\_**
      _Why: Clear escalation prevents delayed response to cost incidents._

- [ ] **Rollback plan tested**  
      Rollback method: ☐ Feature flag ☐ Model revert ☐ Gateway config
      _Why: If the launch causes issues, you need a tested rollback path._

- [ ] **Rate limiting configured**  
      RPM limit: **\_\_\_\_** | TPM limit: **\_\_\_\_**
      _Why: Prevents runaway consumption from bugs or abuse._

---

## 6. Sign-Off

| Role                   | Name | Signature | Date |
| ---------------------- | ---- | --------- | ---- |
| Engineering Lead       |      |           |      |
| Product Owner          |      |           |      |
| Finance/FinOps Partner |      |           |      |
| Security Review        |      |           |      |

**Launch Decision:** ☐ Approved ☐ Approved with conditions ☐ Not approved

**Conditions (if any):** **********************\_\_\_**********************

---

_Template from the TokenOps Atlas — [tokenops-atlas](https://github.com/kalilurrahman/tokenops-atlas)_
