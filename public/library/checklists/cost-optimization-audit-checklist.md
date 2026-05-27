# Quarterly Cost Optimization Audit Checklist

**Audit Period:** Q__ 20__ (__________ to __________)  
**Auditor:** _________________________  
**Last Audit Date:** __________________

---

## 1. System Prompt Review

- [ ] **Measured token count for all active system prompts**  
  Count: ____ prompts audited | Largest: ____ tokens | Average: ____ tokens

- [ ] **Identified prompts exceeding 500 tokens**  
  Count: ____ prompts | Combined monthly cost of excess tokens: $____

- [ ] **Checked for redundant instructions across prompts**  
  Findings: ________________________________________________________

- [ ] **Tested compressed versions of top-5 costliest prompts**  
  Results: ____% average compression | Quality impact: ________

- [ ] **Removed stale instructions (features deprecated, rules outdated)**  
  Removed from ____ prompts | Tokens saved: ________

- [ ] **Verified system prompts are in version control**  
  ☐ All versioned ☐ ____ prompts not versioned

**Estimated savings from prompt optimization:** $____/month

---

## 2. Model Selection Review

- [ ] **Verified each use case is on the optimal model tier**  
  Reviewed ____ use cases | ____ candidates for downgrade

- [ ] **Checked for new cheaper models released since last audit**  
  New models to evaluate: ________________________________________

- [ ] **Re-ran quality benchmarks with current test sets**  
  All use cases above threshold: ☐ Yes ☐ No — exceptions: ________

- [ ] **Reviewed model pricing changes since last audit**  
  Price changes: ________________________________________________

- [ ] **Assessed fine-tuning candidates (high-volume, consistent task)**  
  Candidates: __________________________________________________

- [ ] **Checked for deprecated models requiring migration**  
  Deprecations: ________________________________________________

**Estimated savings from model re-selection:** $____/month

---

## 3. Caching Review

- [ ] **Reviewed cache hit rates for all cached services**  
  | Service | Hit Rate | Target | Status |
  |---------|----------|--------|--------|
  | | | ≥40% | ☐ OK ☐ Below |
  | | | ≥40% | ☐ OK ☐ Below |

- [ ] **Identified new cacheable workloads**  
  Candidates: __________________________________________________

- [ ] **Reviewed TTL settings (too short = low hit rate, too long = stale)**  
  Adjustments needed: __________________________________________

- [ ] **Checked semantic cache threshold accuracy**  
  Spot-checked ____ semantic matches | Accuracy: ____%

- [ ] **Validated cache invalidation on prompt version changes**  
  ☐ Invalidation working correctly ☐ Issues found

- [ ] **Assessed cache storage costs vs. savings**  
  Storage cost: $____/month | Savings from caching: $____/month | Net: $____

**Estimated savings from caching improvements:** $____/month

---

## 4. Context Management Review

- [ ] **Reviewed RAG retrieval settings (top_k, threshold)**  
  Current top_k: ____ | Recommended: ____ | Context utilization: ____%

- [ ] **Checked conversation history management**  
  Max history turns: ____ | Summarization active: ☐ Yes ☐ No

- [ ] **Measured average context tokens per request by service**  
  | Service | Avg Context Tokens | Change vs Last Quarter |
  |---------|-------------------|----------------------|
  | | | |

- [ ] **Identified context bloat (tokens increasing over time)**  
  Services with >10% context growth: ________________________________

- [ ] **Reviewed few-shot example counts**  
  Services using >5 examples: ______ | Tested reducing to 3: ☐ Yes

- [ ] **Checked for unnecessary data in context (metadata, formatting)**  
  Findings: ________________________________________________________

**Estimated savings from context optimization:** $____/month

---

## 5. Batch Processing Review

- [ ] **Identified real-time workloads eligible for batch migration**  
  Candidates: __________________________________________________

- [ ] **Reviewed batch API utilization and discount realization**  
  Expected discount: ____% | Realized discount: ____%

- [ ] **Checked batch job completion times (within SLA)**  
  Average: ____ hours | SLA: ____ hours | ☐ Within SLA

- [ ] **Reviewed batch failure rates**  
  Failure rate: ____% | Target: <1% | ☐ Acceptable

**Estimated savings from batch optimization:** $____/month

---

## 6. Budget & Governance Review

- [ ] **Reviewed budget utilization by team**  
  | Team | Budget | Actual | Utilization |
  |------|--------|--------|------------|
  | | $__K | $__K | __% |
  | | $__K | $__K | __% |

- [ ] **Checked alert effectiveness (false positive rate)**  
  Total alerts: ____ | Actionable: ____ | False positive rate: ____%

- [ ] **Reviewed chargeback accuracy**  
  ☐ All costs attributed ☐ Unattributed costs: $____

- [ ] **Verified tagging coverage**  
  ☐ 100% tagged ☐ ____% tagged | Untagged services: ________

- [ ] **Reviewed cost incident history**  
  Incidents: ____ | MTTD average: ____ minutes | MTTR average: ____ minutes

- [ ] **Updated cost forecasts for next quarter**  
  Q__ forecast: $____K | Growth assumption: ____%

---

## Audit Summary

| Category | Current Quarterly Cost | Identified Savings | Priority |
|----------|----------------------|-------------------|----------|
| System Prompts | $__K | $__K/mo | ☐ High ☐ Med ☐ Low |
| Model Selection | $__K | $__K/mo | ☐ High ☐ Med ☐ Low |
| Caching | $__K | $__K/mo | ☐ High ☐ Med ☐ Low |
| Context Management | $__K | $__K/mo | ☐ High ☐ Med ☐ Low |
| Batch Processing | $__K | $__K/mo | ☐ High ☐ Med ☐ Low |
| **Total** | **$__K** | **$__K/mo** | |

### Action Items

| # | Action | Owner | Deadline | Expected Impact |
|---|--------|-------|----------|----------------|
| 1 | | | | $__K/mo |
| 2 | | | | $__K/mo |
| 3 | | | | $__K/mo |

---

*Template from the TokenOps Atlas — [tokenops-atlas](https://github.com/kalilurrahman/tokenops-atlas)*
