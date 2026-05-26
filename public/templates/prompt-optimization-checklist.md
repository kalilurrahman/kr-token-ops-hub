# Prompt Optimization Checklist

> **Goal:** Reduce token consumption per request without degrading output quality.  
> **When to use:** Before any prompt goes to production, and quarterly for existing prompts.  
> **Expected outcome:** 20–50% token reduction on most prompts after completing all items.

---

## How to Use This Checklist

1. **Measure first.** Record the current prompt's token count, cost per request, and quality score before making changes.
2. **Work through each item** in order. Compression changes yield the biggest gains.
3. **Validate after every change.** Never ship a compressed prompt without running the validation section.
4. **Document everything.** Future you (and your teammates) will thank you.

---

## Baseline Metrics (Fill In Before Starting)

| Metric | Before | After | Δ |
|--------|--------|-------|---|
| System prompt tokens | | | |
| Avg. user prompt tokens | | | |
| Avg. output tokens | | | |
| Total tokens / request | | | |
| Cost / request | | | |
| Quality score (task-specific) | | | |
| Eval set size | | | |

---

## Section 1 — Compression

These changes reduce input tokens. They typically deliver the largest cost savings.

- [ ] **1.1 Remove redundant instructions**  
  Audit the system prompt for repeated or overlapping instructions. LLMs do not need to be told the same thing twice. Remove any instruction that restates a prior one in different words.  
  > *Example:* "Be concise. Keep your answer short. Do not write long responses." → "Be concise."

- [ ] **1.2 Compress few-shot examples**  
  If your prompt includes examples, reduce them to the minimum set that covers distinct edge cases. Replace verbose examples with compact ones. Consider using a single well-chosen example instead of three similar ones.  
  > *Benchmark:* Each removed example saves its full token count on every single request. A 200-token example at 10K requests/day = 2M tokens/day saved.

- [ ] **1.3 Remove meta-instructions the model already follows**  
  Modern models follow formatting, safety, and style norms by default. Remove instructions like "respond in English" (if all inputs are English), "do not make up information" (if the model is already grounded), or "be helpful and polite."  
  > *Test:* Remove the instruction, run 50 samples, and check if behavior changes. If not, it's safe to delete.

- [ ] **1.4 Move static context to prompt templates**  
  If your prompt includes static reference data (e.g., a category taxonomy, a list of valid values, a style guide), move it to a server-side template that is injected at runtime. This enables caching and lets you version the static content independently.  
  > *Technique:* Use your gateway's prompt-template feature or a simple string interpolation layer. Cache the rendered template to avoid re-tokenization.

---

## Section 2 — Format

These changes reduce output tokens and improve parseability.

- [ ] **2.1 Request structured output**  
  Ask the model to return JSON, YAML, CSV, or another structured format instead of free-form prose. This reduces filler words and makes downstream parsing deterministic.  
  > *Example:* Instead of "Explain the sentiment and list the entities," use:  
  > ```
  > Return JSON: {"sentiment": "positive"|"negative"|"neutral", "entities": ["..."]}
  > ```

- [ ] **2.2 Set explicit output length constraints**  
  Tell the model the maximum length you need. Without a constraint, models tend to over-generate.  
  > *Example:* "Respond in ≤3 sentences." or "Return only the category label, nothing else."  
  > *Also:* Set `max_tokens` in the API call as a hard backstop. Don't rely on the instruction alone.

---

## Section 3 — Validation

Never ship a compressed prompt without proving quality is preserved.

- [ ] **3.1 Test on ≥100 representative cases**  
  Run the optimized prompt against a held-out evaluation set of at least 100 examples that represent production traffic. Include edge cases and failure modes from past incidents.  
  > *Why 100?* At n=100, you can detect a 5-percentage-point quality drop with ~80% statistical power.

- [ ] **3.2 Compare cost: before vs. after**  
  Calculate the actual token-count reduction and cost savings. Verify the savings match your estimate. If they don't, investigate which optimization didn't land as expected.  

  | Metric | Before | After | Savings |
  |--------|--------|-------|---------|
  | Avg. tokens / request | _e.g., 1,240_ | _e.g., 780_ | _37%_ |
  | Cost / request | _e.g., $0.0031_ | _e.g., $0.0019_ | _39%_ |
  | Monthly cost (10K req/day) | _e.g., $930_ | _e.g., $570_ | _$360/mo_ |

- [ ] **3.3 A/B test at 10% traffic before full rollout**  
  Deploy the optimized prompt to 10% of production traffic for at least 1 week. Monitor quality metrics, error rates, and user satisfaction side-by-side with the original prompt. Only promote to 100% if all metrics hold.  
  > *Rollback trigger:* Quality score drops >2 points, or error rate increases by >50%.

---

## Section 4 — Operations

Ensure the optimized prompt is maintainable and continuously improving.

- [ ] **4.1 Document every change with rationale**  
  Create a changelog entry for the prompt. Record what was changed, why, the measured impact, and any edge cases discovered. Store this alongside the prompt in version control.  
  > *Format:*  
  > ```
  > ## v2.3 — 2026-05-25
  > - Removed 2 redundant few-shot examples (−180 tokens)
  > - Added max_tokens=150 backstop
  > - Quality: 95.2% → 95.0% (within tolerance)
  > - Cost: $0.0031 → $0.0019/req (−39%)
  > ```

- [ ] **4.2 Set up monitoring and alerts**  
  Configure dashboards and alerts for the optimized prompt:
  - Token count per request (P50, P90, P99) — alert if P90 increases >20%
  - Quality score (if automated) — alert if score drops below threshold
  - Cost per request — alert if cost rises above pre-optimization baseline
  - Error rate — alert if rate doubles

- [ ] **4.3 Schedule a quarterly review**  
  Add a recurring calendar event to re-evaluate this prompt. Models improve, traffic patterns change, and new optimization techniques emerge. A prompt optimized today may have further savings available in 3 months.  
  > *Review checklist:*  
  > - Has the model been updated? Re-run quality eval.  
  > - Has traffic volume changed? Update cost projections.  
  > - Are there new, cheaper models that meet quality thresholds?  
  > - Has the prompt drifted (e.g., someone added instructions without compression)?

---

## Summary of Expected Impact

| Section | Typical Token Reduction | Effort |
|---------|------------------------|--------|
| Compression | 15–35% | 2–4 hours |
| Format | 5–15% | 30 min–1 hour |
| Validation | — (quality assurance) | 2–4 hours |
| Operations | — (sustainability) | 1 hour setup |
| **Total** | **20–50%** | **1–2 days** |

---

*Template version 1.0 — Maintained by the TokenOps team.*
