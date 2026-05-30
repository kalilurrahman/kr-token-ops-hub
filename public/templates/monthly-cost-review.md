# Monthly TokenOps Cost Review — Meeting Template

> **Duration:** 60 minutes · **Cadence:** First Wednesday of each month  
> **Owner:** _[FinOps / AI Platform Lead]_  
> **Attendees:** Engineering leads, Product owners, Finance partner, AI/ML platform team

---

## Pre-Meeting Prep (Complete 2 Days Before)

The meeting owner gathers the following data and distributes the pre-read deck **48 hours** before the session.

### Data to Pull

| #   | Data Source                                                         | Responsible     | Notes                                           |
| --- | ------------------------------------------------------------------- | --------------- | ----------------------------------------------- |
| 1   | Total token spend (current month vs. prior month vs. budget)        | FinOps Lead     | Break down by provider                          |
| 2   | Spend by team / service / feature (top-10 view)                     | FinOps Lead     | Flag any service >15% over budget               |
| 3   | Cost per request by service (P50, P90, P99)                         | Platform Eng    | Identify outlier requests                       |
| 4   | Model mix breakdown (% spend by model)                              | Platform Eng    | Track migration from expensive → cheaper models |
| 5   | Token waste metrics (cache-hit rate, retry tokens, empty responses) | Platform Eng    | Target ≥30% cache-hit rate                      |
| 6   | Optimization initiative tracker (status, savings realized)          | All teams       | Update savings projections                      |
| 7   | Upcoming launches / feature changes that impact token spend         | Product Leads   | Forward-looking demand signals                  |
| 8   | Budget vs. actuals YTD waterfall                                    | Finance Partner | Include committed vs. on-demand split           |

### Pre-Read Deliverables

- [ ] Executive summary slide (1 page) with RAG status for each budget line
- [ ] Cost trend chart (rolling 6 months)
- [ ] Top-5 optimization opportunities ranked by estimated savings
- [ ] Anomaly report: any service with >2× daily spend spike in the past 30 days

---

## Agenda

### 1 · Metrics Review (15 min)

Walk through the headline numbers. The goal is shared awareness, not deep-dives.

#### Key Metrics Table (Example)

| Metric                      | Prior Month | Current Month | Δ (%)   | Budget  | Status |
| --------------------------- | ----------- | ------------- | ------- | ------- | ------ |
| **Total Token Spend**       | $48,200     | $52,750       | +9.4%   | $55,000 | 🟡     |
| **Total Tokens Consumed**   | 1.24 B      | 1.41 B        | +13.7%  | —       | —      |
| **Avg. Cost / 1K Requests** | $3.82       | $3.54         | −7.3%   | —       | 🟢     |
| **Cache-Hit Rate**          | 24%         | 31%           | +7 pp   | 30%     | 🟢     |
| **Retry Token Waste**       | 4.1%        | 3.8%          | −0.3 pp | <5%     | 🟢     |
| **GPT-4o Share of Spend**   | 62%         | 55%           | −7 pp   | —       | 🟢     |
| **Services Over Budget**    | 1           | 2             | —       | 0       | 🔴     |

#### Discussion Prompts

- Are we on track to finish the month within budget? If not, what is the projected overage?
- Which services drove the largest absolute increase in spend?
- Did any model-pricing changes from providers affect our costs this month?
- Is the traffic growth organic (more users) or systemic (longer prompts, more retries)?

---

### 2 · Optimization Progress (15 min)

Review active optimization initiatives and their measured impact.

#### Initiative Tracker (Example)

| #   | Initiative                              | Owner     | Status         | Monthly Savings (Est.) | Monthly Savings (Actual) |
| --- | --------------------------------------- | --------- | -------------- | ---------------------- | ------------------------ |
| 1   | Migrate classification to `gpt-4o-mini` | @eng-lead | ✅ Done        | $4,200                 | $4,850                   |
| 2   | Prompt compression — support chatbot    | @ml-eng   | 🔄 In Progress | $2,800                 | —                        |
| 3   | Semantic cache for FAQ answers          | @platform | 🔄 In Progress | $3,500                 | —                        |
| 4   | Batch window for data pipeline          | @data-eng | 📋 Planned     | $1,600                 | —                        |
| 5   | Output token cap on email generator     | @growth   | ✅ Done        | $900                   | $1,050                   |

#### Discussion Prompts

- Which completed initiative delivered the most value? Can we replicate the pattern elsewhere?
- Are any in-progress items blocked? What do they need to unblock?
- Should we re-prioritize the backlog based on this month's spend data?
- Are there new optimization opportunities we should add to the tracker?

---

### 3 · Budget Forecast (10 min)

Project forward based on current run-rate, known launches, and seasonal patterns.

#### Forecast Table (Example)

| Month    | Projected Spend | Budget   | Variance | Key Assumption                      |
| -------- | --------------- | -------- | -------- | ----------------------------------- |
| Jun 2026 | $56,400         | $55,000  | +$1,400  | New feature launch adds ~8% traffic |
| Jul 2026 | $54,100         | $55,000  | −$900    | Cache rollout offsets growth        |
| Aug 2026 | $58,200         | $57,000  | +$1,200  | Seasonal traffic peak               |
| Q3 Total | $168,700        | $167,000 | +$1,700  | —                                   |

#### Discussion Prompts

- Do we need to request a budget adjustment for next quarter?
- Are there committed-use or reserved-capacity deals we should evaluate?
- What is the impact if the new feature launch drives 2× expected traffic?
- Should we set up an automatic scale-down for non-critical services during peak cost?

---

### 4 · Priorities for Next Month (15 min)

Agree on the top 3–5 priorities for the coming month. Each must have an **owner** and a **measurable target**.

#### Priority Template

| Priority                                     | Owner      | Target                                 | Due Date |
| -------------------------------------------- | ---------- | -------------------------------------- | -------- |
| 1. Deploy semantic cache to production       | @platform  | ≥30% cache hit on support chatbot      | Jun 15   |
| 2. Complete prompt compression for chatbot   | @ml-eng    | ≥20% token reduction, <1% quality loss | Jun 20   |
| 3. Negotiate batch-pricing tier with OpenAI  | @finops    | Secure ≥15% discount on batch calls    | Jun 30   |
| 4. Build cost-per-conversation dashboard     | @analytics | Dashboard live in Looker               | Jun 10   |
| 5. Onboard data-eng team to tagging standard | @platform  | 100% of data pipeline calls tagged     | Jun 25   |

#### Discussion Prompts

- Do these priorities reflect our biggest cost-reduction levers?
- Are owners resourced to hit these targets, or do we need to negotiate capacity?
- What is the "do nothing" cost if we defer any of these?

---

### 5 · Action Items

Capture every commitment made during the meeting.

| #   | Action Item                                       | Owner     | Due Date | Status  |
| --- | ------------------------------------------------- | --------- | -------- | ------- |
| 1   | _e.g., Share updated forecast model with Finance_ | _@finops_ | _Jun 5_  | ⬜ Open |
| 2   |                                                   |           |          | ⬜ Open |
| 3   |                                                   |           |          | ⬜ Open |
| 4   |                                                   |           |          | ⬜ Open |
| 5   |                                                   |           |          | ⬜ Open |

---

## Appendix: Meeting Hygiene

| Guideline        | Detail                                                             |
| ---------------- | ------------------------------------------------------------------ |
| **Pre-read**     | Distributed 48 hours before; attendees arrive having reviewed      |
| **Decision log** | Decisions captured inline and posted to #tokenops-decisions        |
| **Parking lot**  | Off-topic items logged for async follow-up                         |
| **Recording**    | Meeting recorded and transcript shared within 24 hours             |
| **Rotation**     | Note-taking rotates alphabetically each month                      |
| **Escalation**   | Any budget breach >10% escalated to VP Engineering within 24 hours |

---

_Template version 1.0 — Maintained by the TokenOps team._
