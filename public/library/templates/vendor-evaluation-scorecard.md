# LLM API Vendor Evaluation Scorecard

**Version:** 1.0  
**Evaluation Date:** ********\_\_\_\_********
**Evaluator(s):** ********\_\_\_\_********
**Review Cycle:** ☐ New Vendor Selection ☐ Annual Re-evaluation ☐ Contract Renewal

---

## How to Use This Scorecard

1. Complete one scorecard per vendor being evaluated
2. Use consistent data sources across all vendors (same benchmark tasks, same time period)
3. Weight criteria based on your organization's priorities before scoring
4. Score each criterion 1–5 using the rubric provided
5. Calculate weighted scores and compare vendors side by side
6. Attach supporting evidence (benchmark results, pricing quotes, compliance certs) as appendices

**Scoring Rubric:**

| Score | Label         | Definition                                    |
| ----- | ------------- | --------------------------------------------- |
| 1     | Unacceptable  | Does not meet minimum requirements            |
| 2     | Below Average | Meets some requirements with significant gaps |
| 3     | Acceptable    | Meets core requirements adequately            |
| 4     | Strong        | Exceeds requirements in meaningful ways       |
| 5     | Exceptional   | Best-in-class; clear competitive advantage    |

---

## 1. Provider Overview

| Field                                     | Details                               |
| ----------------------------------------- | ------------------------------------- |
| **Provider Name**                         |                                       |
| **Website**                               |                                       |
| **Headquarters / Jurisdiction**           |                                       |
| **Year Founded**                          |                                       |
| **Funding / Public Status**               |                                       |
| **Enterprise Customers (reference-able)** |                                       |
| **Primary Contact (Sales)**               |                                       |
| **Primary Contact (Technical)**           |                                       |
| **Evaluation Period**                     | Start: **\_\_\_\_** End: **\_\_\_\_** |
| **Models Under Evaluation**               |                                       |

### Provider Maturity Signals

- [ ] SOC 2 Type II certified
- [ ] Listed on major cloud marketplaces (AWS, Azure, GCP)
- [ ] Published uptime history / status page
- [ ] Public model cards / technical documentation
- [ ] Enterprise reference customers in our industry
- [ ] Dedicated enterprise support tier available
- [ ] Published security whitepaper

---

## 2. Pricing Comparison

### 2.1 Per-Token Pricing

| Model | Input Rate ($/1M tokens) | Output Rate ($/1M tokens) | Output Premium | Context Window | Max Output Length |
| ----- | ------------------------ | ------------------------- | -------------- | -------------- | ----------------- |
|       |                          |                           |                |                |                   |
|       |                          |                           |                |                |                   |
|       |                          |                           |                |                |                   |
|       |                          |                           |                |                |                   |

### 2.2 Volume Tier Discounts

| Monthly Spend Tier | Discount | Effective Input Rate | Effective Output Rate | Commitment Required |
| ------------------ | -------- | -------------------- | --------------------- | ------------------- |
| $0 – $10K          | 0%       |                      |                       | None                |
| $10K – $50K        | \_\_%    |                      |                       |                     |
| $50K – $200K       | \_\_%    |                      |                       |                     |
| $200K – $1M        | \_\_%    |                      |                       |                     |
| $1M+               | \_\_%    |                      |                       |                     |

### 2.3 Batch / Async Pricing

| Feature        | Available? | Discount vs. Real-Time | SLA (turnaround) | Max Batch Size |
| -------------- | ---------- | ---------------------- | ---------------- | -------------- |
| Batch API      | ☐ Yes ☐ No | \_\_%                  |                  |                |
| Cached Input   | ☐ Yes ☐ No | \_\_%                  | N/A              | N/A            |
| Prompt Caching | ☐ Yes ☐ No | \_\_%                  | N/A              |                |

### 2.4 Free Tier / Credits

| Item                              | Details    |
| --------------------------------- | ---------- |
| Free tier available?              | ☐ Yes ☐ No |
| Free tier monthly token allowance |            |
| Startup / enterprise credits      |            |
| Credit expiration                 |            |
| Restrictions on free-tier usage   |            |

### 2.5 Blended Cost Projection

Use your organization's actual or projected workload mix:

| Workload             | Monthly Volume (M tokens) | Input % | Output % | Model | Monthly Cost |
| -------------------- | ------------------------- | ------- | -------- | ----- | ------------ |
| Customer Support Bot |                           | 75%     | 25%      |       | $            |
| Document Extraction  |                           | 85%     | 15%      |       | $            |
| Code Generation      |                           | 60%     | 40%      |       | $            |
| Batch Enrichment     |                           | 90%     | 10%      |       | $            |
| **Total**            |                           |         |          |       | **$**        |

---

## 3. Performance Metrics

### 3.1 Latency

Measured under your representative workload (specify prompt length and output length):

| Metric                               | Target     | Measured Value | Score (1–5) |
| ------------------------------------ | ---------- | -------------- | ----------- |
| Time to First Token (p50)            | < 200ms    |                |             |
| Time to First Token (p95)            | < 500ms    |                |             |
| Time to First Token (p99)            | < 1,000ms  |                |             |
| End-to-End Latency (p50)             | < 1.5s     |                |             |
| End-to-End Latency (p95)             | < 3s       |                |             |
| End-to-End Latency (p99)             | < 5s       |                |             |
| Tokens per Second (generation speed) | > 80 tok/s |                |             |

### 3.2 Throughput & Capacity

| Metric                          | Details |
| ------------------------------- | ------- |
| Requests per Minute (RPM) limit |         |
| Tokens per Minute (TPM) limit   |         |
| Tokens per Day (TPD) limit      |         |
| Concurrent request limit        |         |
| Burst capacity above limits     |         |
| Rate limit increase process     |         |
| Time to provision higher limits |         |

### 3.3 Reliability & Uptime

| Metric                             | Target            | Measured / Published | Score (1–5) |
| ---------------------------------- | ----------------- | -------------------- | ----------- |
| Monthly uptime SLA                 | 99.9%             |                      |             |
| Actual uptime (last 6 months)      | > 99.9%           |                      |             |
| Mean Time to Recovery (MTTR)       | < 30 min          |                      |             |
| Incident frequency (last 6 months) | < 3 incidents     |                      |             |
| Degraded performance events        | < 5 events        |                      |             |
| Status page transparency           | Public, real-time |                      |             |

---

## 4. Quality Assessment

### 4.1 Accuracy by Task Type

Benchmark each model on your actual use cases. Use ≥ 100 test cases per task.

| Task Type         | Test Set Size | Metric               | Target | Model A Score | Model B Score | Notes |
| ----------------- | ------------- | -------------------- | ------ | ------------- | ------------- | ----- |
| Classification    | 200           | Accuracy (%)         | > 95%  |               |               |       |
| Entity Extraction | 200           | F1 Score             | > 0.90 |               |               |       |
| Summarization     | 100           | ROUGE-L / Human Eval | > 0.85 |               |               |       |
| Code Generation   | 100           | Pass@1 (%)           | > 80%  |               |               |       |
| Complex Reasoning | 100           | Human Eval (1–5)     | > 4.0  |               |               |       |
| RAG + Q&A         | 150           | Answer Accuracy (%)  | > 90%  |               |               |       |
| JSON Compliance   | 200           | Valid JSON (%)       | > 99%  |               |               |       |

### 4.2 Output Quality Characteristics

| Characteristic                        | Rating (1–5) | Evidence |
| ------------------------------------- | ------------ | -------- |
| Instruction following                 |              |          |
| Hallucination rate (lower = better)   |              |          |
| Format compliance / structured output |              |          |
| Consistency across identical prompts  |              |          |
| Multilingual capability               |              |          |
| Reasoning chain quality               |              |          |
| Refusal rate on valid requests        |              |          |

---

## 5. Security & Compliance

### 5.1 Certifications & Standards

| Requirement         | Status                   | Expiry / Audit Date | Evidence |
| ------------------- | ------------------------ | ------------------- | -------- |
| SOC 2 Type II       | ☐ Yes ☐ No ☐ In Progress |                     |          |
| SOC 3               | ☐ Yes ☐ No               |                     |          |
| ISO 27001           | ☐ Yes ☐ No ☐ In Progress |                     |          |
| ISO 27701 (Privacy) | ☐ Yes ☐ No               |                     |          |
| HIPAA BAA available | ☐ Yes ☐ No ☐ N/A         |                     |          |
| FedRAMP             | ☐ Yes ☐ No ☐ In Progress |                     |          |
| PCI DSS             | ☐ Yes ☐ No ☐ N/A         |                     |          |

### 5.2 Data Privacy & Residency

| Requirement                               | Status               | Details |
| ----------------------------------------- | -------------------- | ------- |
| GDPR compliant                            | ☐ Yes ☐ No           |         |
| CCPA compliant                            | ☐ Yes ☐ No           |         |
| Data residency options (US, EU, APAC)     |                      |         |
| Data processing agreement (DPA) available | ☐ Yes ☐ No           |         |
| Customer data used for training           | ☐ Yes ☐ No ☐ Opt-out |         |
| Data retention policy                     |                      |         |
| Right to deletion / purge                 | ☐ Yes ☐ No           |         |
| PII detection and redaction               | ☐ Yes ☐ No           |         |

### 5.3 Network & Encryption

| Feature                                 | Status     | Details |
| --------------------------------------- | ---------- | ------- |
| TLS 1.3 in transit                      | ☐ Yes ☐ No |         |
| Encryption at rest (AES-256)            | ☐ Yes ☐ No |         |
| Customer-managed encryption keys (CMEK) | ☐ Yes ☐ No |         |
| VPC / Private Link connectivity         | ☐ Yes ☐ No |         |
| IP allowlisting                         | ☐ Yes ☐ No |         |
| API key rotation support                | ☐ Yes ☐ No |         |
| SSO / SAML for management console       | ☐ Yes ☐ No |         |
| Audit logging (API access logs)         | ☐ Yes ☐ No |         |

---

## 6. Operational Features

### 6.1 API & Developer Experience

| Feature                            | Status                 | Score (1–5) |
| ---------------------------------- | ---------------------- | ----------- |
| REST API                           | ☐ Yes ☐ No             |             |
| Streaming support (SSE)            | ☐ Yes ☐ No             |             |
| Function / Tool calling            | ☐ Yes ☐ No             |             |
| Structured output (JSON mode)      | ☐ Yes ☐ No             |             |
| Vision / multimodal support        | ☐ Yes ☐ No             |             |
| Embeddings API                     | ☐ Yes ☐ No             |             |
| Fine-tuning support                | ☐ Yes ☐ No             |             |
| Model versioning / pinning         | ☐ Yes ☐ No             |             |
| Deprecation notice period          | ****\_\_\_\_****       |             |
| SDK quality (Python, JS, Go, etc.) | ☐ Official ☐ Community |             |
| OpenAI-compatible API surface      | ☐ Yes ☐ Partial ☐ No   |             |

### 6.2 Monitoring & Observability

| Feature                             | Status     | Score (1–5) |
| ----------------------------------- | ---------- | ----------- |
| Usage dashboard                     | ☐ Yes ☐ No |             |
| Real-time token consumption API     | ☐ Yes ☐ No |             |
| Cost breakdown by API key / project | ☐ Yes ☐ No |             |
| Custom metadata / tags on requests  | ☐ Yes ☐ No |             |
| Webhook / alert integration         | ☐ Yes ☐ No |             |
| Spending alerts and limits          | ☐ Yes ☐ No |             |
| Exportable usage reports (CSV/JSON) | ☐ Yes ☐ No |             |

### 6.3 Support

| Feature                                | Details                            | Score (1–5) |
| -------------------------------------- | ---------------------------------- | ----------- |
| Support tiers available                |                                    |             |
| Enterprise support SLA (response time) | P1: \_**\_ P2: \_\_** P3: \_\_\_\_ |             |
| Dedicated account manager              | ☐ Yes ☐ No (min spend: $\_\_\_\_)  |             |
| Technical onboarding assistance        | ☐ Yes ☐ No                         |             |
| Community / forum support              | ☐ Active ☐ Limited ☐ None          |             |
| Documentation quality                  |                                    |             |

---

## 7. Contract Terms

| Term                               | Details                              | Assessment |
| ---------------------------------- | ------------------------------------ | ---------- |
| Minimum commitment period          |                                      |            |
| Annual spend commitment            |                                      |            |
| Prepaid credits required           | ☐ Yes ☐ No                           |            |
| Overage pricing (above commitment) |                                      |            |
| Price protection / rate lock       |                                      |            |
| Termination for convenience        | ☐ Yes ☐ No — notice period: \_\_\_\_ |            |
| Data portability on exit           |                                      |            |
| Model deprecation guarantees       |                                      |            |
| SLA credit mechanism               |                                      |            |
| Auto-renewal terms                 |                                      |            |
| Liability cap                      |                                      |            |
| Indemnification (IP / output)      | ☐ Yes ☐ No                           |            |
| Insurance (E&O, Cyber)             | ☐ Yes ☐ No                           |            |

### Contract Risk Assessment

| Risk                             | Severity           | Mitigation |
| -------------------------------- | ------------------ | ---------- |
| Vendor lock-in (proprietary API) | ☐ High ☐ Med ☐ Low |            |
| Price increase exposure          | ☐ High ☐ Med ☐ Low |            |
| Model discontinuation risk       | ☐ High ☐ Med ☐ Low |            |
| Data sovereignty risk            | ☐ High ☐ Med ☐ Low |            |
| Single-vendor dependency         | ☐ High ☐ Med ☐ Low |            |

---

## 8. Weighted Scoring Matrix

Adjust weights to match your organization's priorities (weights must sum to 100).

| #   | Criteria                            | Weight (%) | Score (1–5) | Weighted Score |
| --- | ----------------------------------- | ---------- | ----------- | -------------- |
| 1   | **Pricing & Cost Efficiency**       | 20         |             |                |
|     | Per-token pricing competitiveness   |            |             |                |
|     | Volume discount depth               |            |             |                |
|     | Batch / caching discounts           |            |             |                |
| 2   | **Performance**                     | 20         |             |                |
|     | Latency (TTFT + E2E)                |            |             |                |
|     | Throughput / rate limits            |            |             |                |
|     | Uptime / reliability                |            |             |                |
| 3   | **Quality**                         | 20         |             |                |
|     | Accuracy on target tasks            |            |             |                |
|     | Structured output compliance        |            |             |                |
|     | Hallucination rate                  |            |             |                |
| 4   | **Security & Compliance**           | 15         |             |                |
|     | Certifications (SOC2, ISO, etc.)    |            |             |                |
|     | Data privacy & residency            |            |             |                |
|     | Encryption & network security       |            |             |                |
| 5   | **Operational Features**            | 10         |             |                |
|     | API capabilities & DX               |            |             |                |
|     | Monitoring & observability          |            |             |                |
|     | Support quality                     |            |             |                |
| 6   | **Contract & Commercial**           | 10         |             |                |
|     | Flexibility (commitment, exit)      |            |             |                |
|     | Price protection                    |            |             |                |
|     | IP indemnification                  |            |             |                |
| 7   | **Strategic Fit**                   | 5          |             |                |
|     | Roadmap alignment                   |            |             |                |
|     | Multi-model strategy support        |            |             |                |
|     | Ecosystem / marketplace integration |            |             |                |
|     | **TOTAL**                           | **100**    |             | **/5.00**      |

---

## 9. Comparative Summary

Complete after evaluating all vendors:

| Dimension                  | Vendor A                       | Vendor B                       | Vendor C                       |
| -------------------------- | ------------------------------ | ------------------------------ | ------------------------------ |
| **Weighted Total Score**   | /5.00                          | /5.00                          | /5.00                          |
| **Projected Monthly Cost** | $                              | $                              | $                              |
| **Projected Annual Cost**  | $                              | $                              | $                              |
| **Top Strength**           |                                |                                |                                |
| **Top Risk**               |                                |                                |                                |
| **Recommendation**         | ☐ Primary ☐ Secondary ☐ Reject | ☐ Primary ☐ Secondary ☐ Reject | ☐ Primary ☐ Secondary ☐ Reject |

---

## 10. Evaluation Sign-Off

| Role                     | Name | Signature | Date |
| ------------------------ | ---- | --------- | ---- |
| Engineering Lead         |      |           |      |
| FinOps / Finance         |      |           |      |
| Security / Compliance    |      |           |      |
| Product Owner            |      |           |      |
| VP / Director (Approver) |      |           |      |

### Decision Record

**Selected Vendor(s):** ********\_\_\_\_********
**Rationale:** ********\_\_\_\_********
**Contract Start Date:** ********\_\_\_\_********
**Next Re-evaluation Date:** ********\_\_\_\_********

### Appendices Checklist

- [ ] A: Benchmark test results (raw data)
- [ ] B: Pricing quotes / proposals from each vendor
- [ ] C: Security questionnaire responses
- [ ] D: Reference customer call notes
- [ ] E: Contract redline / legal review notes

---

_Template from the TokenOps Atlas — [tokenops-atlas](https://github.com/kalilurrahman/tokenops-atlas)_
