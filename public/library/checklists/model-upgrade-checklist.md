# Model Upgrade/Migration Checklist

**Current Model:** ************\_************ → **New Model:** ************\_************
**Service(s) Affected:** ********\_\_\_********
**Migration Owner:** **********\_\_\_**********
**Target Date:** ************\_\_\_************

---

## 1. Pre-Migration Assessment

- [ ] **Current model performance benchmarked**  
      Accuracy: \_**\_% | Latency P95: \_\_**ms | Cost/request: $\__\_\_
      \_Record baseline metrics before any changes._

- [ ] **New model benchmarked on same test set**  
      Accuracy: \_**\_% | Latency P95: \_\_**ms | Cost/request: $\__\_\_
      \_Must use identical test set for fair comparison._

- [ ] **Cost comparison calculated**  
      Current monthly cost: $\_**\_ | Projected monthly cost: $\_\_**
      Savings/increase: $\_**_ (_**%)
      _Ensure the cost impact is understood and approved._

- [ ] **Latency comparison measured under load**  
      New model TTFT: \_**\_ms | TPS: \_\_**tok/s
      _Test under realistic production load, not just single requests._

- [ ] **Context window differences checked**  
      Current: \_**\_K tokens | New: \_\_**K tokens
      _Smaller context windows may truncate existing prompts._

- [ ] **Quality threshold defined for approval**  
      Metric: **\_\_\_\_** | Minimum acceptable: **\_\_\_\_**
      _"The new model passes if accuracy ≥ X%."_

- [ ] **Rate limits compared**  
      Current RPM: **\_\_\_\_** | New RPM: **\_\_\_\_**
      _Lower rate limits may require request queuing._

- [ ] **Pricing model differences noted**  
      ☐ Same pricing structure ☐ Different input/output rates ☐ Different billing unit
      _Some models charge differently (e.g., cached tokens, reasoning tokens)._

---

## 2. Compatibility Check

- [ ] **Prompt format compatibility verified**  
      ☐ Same system/user/assistant format ☐ Changes needed: **\_\_\_\_**
      _Some models handle system prompts differently._

- [ ] **Response format compatibility verified**  
      ☐ JSON mode available ☐ Structured output supported ☐ Changes needed
      _Not all models support JSON mode or structured outputs._

- [ ] **Tool/function calling API compatibility checked**  
      ☐ Compatible ☐ Requires changes ☐ Not applicable
      _Function calling schemas may differ between providers._

- [ ] **Max output token limits checked**  
      Current max: **\_\_** | New max: **\_\_**
      _Some models have lower output limits._

- [ ] **Streaming API compatibility verified**  
      ☐ SSE streaming compatible ☐ Changes needed
      _Streaming chunk format may differ._

- [ ] **Special tokens / stop sequences checked**  
      ☐ Same behavior ☐ Adjustments needed
      _Stop sequences may behave differently on new models._

---

## 3. Testing Protocol

- [ ] **Shadow testing configured (compare without serving)**  
      Duration: \_**\_ days | Traffic: \_\_**%
      _Run both models in parallel; compare outputs._

- [ ] **A/B test plan written**  
      Test group: \_**\_% | Control group: \_\_**%
      _Clear split for measuring real-world impact._

- [ ] **Quality gates defined with pass/fail criteria**  
      Gate 1: Accuracy ≥ \__\_\_% → proceed to canary
      Gate 2: No new failure modes → proceed to 50%
      Gate 3: User satisfaction stable → proceed to 100%
      \_Explicit criteria prevent "it seems fine" deployment._

- [ ] **Rollback triggers documented**  
      Auto-rollback if: quality drops > \_**\_%, error rate > \_\_**%, latency > \__\_\_ms
      \_Automated triggers catch issues faster than humans._

- [ ] **Edge case regression test completed**  
      Failures: \_**\_ out of \_\_** edge cases
      _New models may fail on edge cases the old model handled._

- [ ] **Multi-language / locale testing completed (if applicable)**  
      ☐ Tested ☐ Not applicable
      _Model quality varies by language._

- [ ] **Long-context test completed (if applicable)**  
      Tested at \__\_\_K tokens | Quality: ☐ Pass ☐ Fail
      \_Performance often degrades at context window edges._

- [ ] **Concurrency/load test completed**  
      Tested at \__\_\_× production load | Results: ☐ Pass
      \_New model endpoints may have different scaling characteristics._

---

## 4. Deployment

- [ ] **Canary deployment configured**  
      Canary traffic: \_**\_% | Duration: \_\_** hours
      _Start small to catch issues before full rollout._

- [ ] **Feature flag configured for instant rollback**  
      Flag name: **\_\_\_\_** | Rollback method: **\_\_\_\_**
      _One-click rollback capability is non-negotiable._

- [ ] **Monitoring dashboards updated for new model**  
      ☐ Cost dashboard ☐ Quality dashboard ☐ Latency dashboard
      _Dashboards must show the new model as a distinct entity._

- [ ] **Alert thresholds recalibrated**  
      New baselines: cost $\_**\_, latency \_\_**ms, error rate \__\_\_%
      \_Old thresholds may trigger false alarms or miss real issues._

- [ ] **Team notified of migration schedule**  
      ☐ Slack notification ☐ Email ☐ Standup announcement
      _On-call engineers must know a migration is in progress._

- [ ] **Rollout schedule defined**  
      5% → 25% → 50% → 100% over \__\_\_ days
      \_Gradual rollout with bake time at each stage._

---

## 5. Post-Migration Validation

- [ ] **Quality metrics compared to pre-migration baseline**  
      Before: \_**\_% | After: \_\_**% | Delta: \__\_\_%
      \_Must be within defined threshold._

- [ ] **Cost validated against projections**  
      Projected: $\_**\_ | Actual: $\_\_** | Variance: \__\_\_%
      \_Investigate if actual differs from projected by >10%._

- [ ] **Latency validated within SLO**  
      P50: \_**\_ms | P95: \_\_**ms | P99: \__\_\_ms | All within SLO: ☐ Yes
      \_Latency regression is common with model changes._

- [ ] **Error rate compared to baseline**  
      Before: \_**\_% | After: \_\_**% | Acceptable: ☐ Yes
      _New models may have different error patterns._

- [ ] **Customer feedback monitored (7 days post-migration)**  
      Complaints: \_**\_ | Positive: \_\_** | Neutral: \__\_\_
      \_Some quality changes only surface through user feedback._

- [ ] **Old model configuration archived**  
      Archived prompts, model config, and routing rules for 30 days
      _Enables rollback even after the migration is "complete."_

---

## Sign-Off

| Role            | Name | Date | ☐ Approved |
| --------------- | ---- | ---- | ---------- |
| Migration Owner |      |      | ☐          |
| Service Owner   |      |      | ☐          |
| Quality Lead    |      |      | ☐          |

---

_Template from the TokenOps Atlas — [tokenops-atlas](https://github.com/kalilurrahman/tokenops-atlas)_
