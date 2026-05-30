# Quarterly Cost Optimization Audit Checklist

**Audit Period:** Q** 20** (****\_\_**** to ****\_\_****)
**Auditor:** ************\_************
**Last Audit Date:** ********\_\_********

---

## 1. System Prompt Review

- [ ] **Measured token count for all active system prompts**  
      Count: \_**\_ prompts audited | Largest: \_\_** tokens | Average: \_\_\_\_ tokens

- [ ] **Identified prompts exceeding 500 tokens**  
      Count: \_**\_ prompts | Combined monthly cost of excess tokens: $\_\_**

- [ ] **Checked for redundant instructions across prompts**  
      Findings: **************************\_\_\_\_**************************

- [ ] **Tested compressed versions of top-5 costliest prompts**  
      Results: \_**\_% average compression | Quality impact: **\_\_****

- [ ] **Removed stale instructions (features deprecated, rules outdated)**  
      Removed from \_**\_ prompts | Tokens saved: **\_\_****

- [ ] **Verified system prompts are in version control**  
      ☐ All versioned ☐ \_\_\_\_ prompts not versioned

**Estimated savings from prompt optimization:** $\_\_\_\_/month

---

## 2. Model Selection Review

- [ ] **Verified each use case is on the optimal model tier**  
      Reviewed \_**\_ use cases | \_\_** candidates for downgrade

- [ ] **Checked for new cheaper models released since last audit**  
      New models to evaluate: ******************\_\_\_\_******************

- [ ] **Re-ran quality benchmarks with current test sets**  
      All use cases above threshold: ☐ Yes ☐ No — exceptions: **\_\_\_\_**

- [ ] **Reviewed model pricing changes since last audit**  
      Price changes: **********************\_\_\_\_**********************

- [ ] **Assessed fine-tuning candidates (high-volume, consistent task)**  
      Candidates: ************************\_\_************************

- [ ] **Checked for deprecated models requiring migration**  
      Deprecations: **********************\_\_\_\_**********************

**Estimated savings from model re-selection:** $\_\_\_\_/month

---

## 3. Caching Review

- [ ] **Reviewed cache hit rates for all cached services**  
      | Service | Hit Rate | Target | Status |
      |---------|----------|--------|--------|
      | | | ≥40% | ☐ OK ☐ Below |
      | | | ≥40% | ☐ OK ☐ Below |

- [ ] **Identified new cacheable workloads**  
      Candidates: ************************\_\_************************

- [ ] **Reviewed TTL settings (too short = low hit rate, too long = stale)**  
      Adjustments needed: ********************\_\_********************

- [ ] **Checked semantic cache threshold accuracy**  
      Spot-checked \_**\_ semantic matches | Accuracy: \_\_**%

- [ ] **Validated cache invalidation on prompt version changes**  
      ☐ Invalidation working correctly ☐ Issues found

- [ ] **Assessed cache storage costs vs. savings**  
      Storage cost: $\_**\_/month | Savings from caching: $\_\_**/month | Net: $\_\_\_\_

**Estimated savings from caching improvements:** $\_\_\_\_/month

---

## 4. Context Management Review

- [ ] **Reviewed RAG retrieval settings (top_k, threshold)**  
      Current top_k: \_**\_ | Recommended: \_\_** | Context utilization: \_\_\_\_%

- [ ] **Checked conversation history management**  
      Max history turns: \_\_\_\_ | Summarization active: ☐ Yes ☐ No

- [ ] **Measured average context tokens per request by service**  
      | Service | Avg Context Tokens | Change vs Last Quarter |
      |---------|-------------------|----------------------|
      | | | |

- [ ] **Identified context bloat (tokens increasing over time)**  
      Services with >10% context growth: **************\_\_\_\_**************

- [ ] **Reviewed few-shot example counts**  
      Services using >5 examples: **\_\_** | Tested reducing to 3: ☐ Yes

- [ ] **Checked for unnecessary data in context (metadata, formatting)**  
      Findings: **************************\_\_\_\_**************************

**Estimated savings from context optimization:** $\_\_\_\_/month

---

## 5. Batch Processing Review

- [ ] **Identified real-time workloads eligible for batch migration**  
      Candidates: ************************\_\_************************

- [ ] **Reviewed batch API utilization and discount realization**  
      Expected discount: \_**\_% | Realized discount: \_\_**%

- [ ] **Checked batch job completion times (within SLA)**  
      Average: \_**\_ hours | SLA: \_\_** hours | ☐ Within SLA

- [ ] **Reviewed batch failure rates**  
      Failure rate: \_\_\_\_% | Target: <1% | ☐ Acceptable

**Estimated savings from batch optimization:** $\_\_\_\_/month

---

## 6. Budget & Governance Review

- [ ] **Reviewed budget utilization by team**  
      | Team | Budget | Actual | Utilization |
      |------|--------|--------|------------|
      | | $**K | $**K | **% |
      | | $**K | $**K | **% |

- [ ] **Checked alert effectiveness (false positive rate)**  
      Total alerts: \_**\_ | Actionable: \_\_** | False positive rate: \_\_\_\_%

- [ ] **Reviewed chargeback accuracy**  
      ☐ All costs attributed ☐ Unattributed costs: $\_\_\_\_

- [ ] **Verified tagging coverage**  
      ☐ 100% tagged ☐ \_**\_% tagged | Untagged services: **\_\_****

- [ ] **Reviewed cost incident history**  
      Incidents: \_**\_ | MTTD average: \_\_** minutes | MTTR average: \_\_\_\_ minutes

- [ ] **Updated cost forecasts for next quarter**  
      Q** forecast: $\_\_**K | Growth assumption: \_\_\_\_%

---

## Audit Summary

| Category           | Current Quarterly Cost | Identified Savings | Priority           |
| ------------------ | ---------------------- | ------------------ | ------------------ |
| System Prompts     | $\_\_K                 | $\_\_K/mo          | ☐ High ☐ Med ☐ Low |
| Model Selection    | $\_\_K                 | $\_\_K/mo          | ☐ High ☐ Med ☐ Low |
| Caching            | $\_\_K                 | $\_\_K/mo          | ☐ High ☐ Med ☐ Low |
| Context Management | $\_\_K                 | $\_\_K/mo          | ☐ High ☐ Med ☐ Low |
| Batch Processing   | $\_\_K                 | $\_\_K/mo          | ☐ High ☐ Med ☐ Low |
| **Total**          | **$\_\_K**             | **$\_\_K/mo**      |                    |

### Action Items

| #   | Action | Owner | Deadline | Expected Impact |
| --- | ------ | ----- | -------- | --------------- |
| 1   |        |       |          | $\_\_K/mo       |
| 2   |        |       |          | $\_\_K/mo       |
| 3   |        |       |          | $\_\_K/mo       |

---

_Template from the TokenOps Atlas — [tokenops-atlas](https://github.com/kalilurrahman/tokenops-atlas)_
