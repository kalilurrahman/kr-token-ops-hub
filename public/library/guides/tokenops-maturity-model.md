# TokenOps Maturity Model

> **Purpose:** Assess your organization's current TokenOps maturity and chart a clear path to the next level.  
> **Audience:** Engineering leadership, FinOps practitioners, platform teams, and executive sponsors.  
> **How to use:** Read each level, identify where your organization sits today, then follow the "What to Do Next" guidance to advance.

---

## Overview

The TokenOps Maturity Model defines five levels of organizational capability for managing LLM token costs. Most organizations start at Level 1 and progress incrementally. Skipping levels is rare and usually unsustainable — each level builds the foundation for the next.

```
Level 1        Level 2        Level 3          Level 4         Level 5
 Ad Hoc   →    Aware    →  Instrumented  →   Optimized   →   Governed
   ○              ○              ○               ○               ●
No visibility  Basic billing  Full tagging    Model routing   Full chargeback
No tagging     Some tagging   Dashboards      Caching         Automated policy
Reactive       Manual reviews Budget alerts   Prompt tuning   Cost culture
```

---

## Level 1: Ad Hoc

> _"We know we're using LLMs. We don't know how much they cost."_

### Description

The organization uses LLMs in production but has no systematic visibility into token consumption or costs. API keys may be shared across services. Billing is reviewed only when an unexpectedly large invoice arrives. There is no tagging, no cost attribution, and no optimization strategy. Teams make model selection decisions based on capability alone, without considering cost implications.

### Key Capabilities

| Capability       | Status                                                          |
| ---------------- | --------------------------------------------------------------- |
| Cost visibility  | ❌ None — only raw provider invoices                            |
| Request tagging  | ❌ No metadata on API calls                                     |
| Cost attribution | ❌ Cannot attribute costs to teams, features, or services       |
| Budgets          | ❌ No token budgets defined                                     |
| Optimization     | ❌ No deliberate optimization; model choice is "whatever works" |
| Governance       | ❌ No policies, no review cadence                               |

### Typical Metrics

| Metric                        | Typical Value                    |
| ----------------------------- | -------------------------------- |
| % of LLM calls tagged         | 0%                               |
| Cost attribution coverage     | 0%                               |
| Time to detect cost anomaly   | Days to weeks (invoice surprise) |
| Optimization savings realized | $0                               |
| Teams with cost dashboards    | 0                                |

### Signs You're Here

- [ ] You only learn about LLM costs when the monthly invoice arrives
- [ ] Multiple teams share API keys or accounts
- [ ] Nobody can answer "How much does feature X cost in tokens?"
- [ ] Model selection is based solely on capability, not cost-efficiency
- [ ] There's no regular meeting or review focused on LLM costs
- [ ] You've had at least one "bill shock" moment
- [ ] Developers spin up new LLM integrations without any cost review

### What to Do Next

1. **Export the last 3 months of LLM provider invoices** — Establish a spending baseline
2. **Inventory every service calling an LLM API** — Search codebases for `openai`, `anthropic`, `google.generativeai`, `litellm`, `langchain` imports
3. **Identify your top-3 cost drivers** — 80/20 rule: a small number of services likely drive most of your spend
4. **Assign an owner** — Designate one person (ideally a platform engineer or FinOps practitioner) to own TokenOps as a practice
5. **Schedule a single cost review** — Even an informal 30-minute meeting creates momentum

**Target timeline to reach Level 2:** 2–4 weeks

---

## Level 2: Aware

> _"We can see our LLM costs. We're starting to ask the right questions."_

### Description

The organization has basic visibility into LLM spending through provider dashboards and billing exports. Some teams have begun adding metadata tags to their API calls. Cost reviews happen, but they are manual, ad hoc, and focused on total spend rather than unit economics. There's growing awareness that LLM costs need active management, but tooling and processes are immature.

### Key Capabilities

| Capability       | Status                                                            |
| ---------------- | ----------------------------------------------------------------- |
| Cost visibility  | 🟡 Basic — provider dashboards and exported invoices              |
| Request tagging  | 🟡 Partial — some teams tag, most don't                           |
| Cost attribution | 🟡 Rough estimates — based on API key or account mapping          |
| Budgets          | 🟡 Informal — "try to keep it under $X" but not enforced          |
| Optimization     | 🟡 Opportunistic — individual developers make ad hoc improvements |
| Governance       | 🟡 Minimal — occasional cost review, no formal cadence            |

### Typical Metrics

| Metric                        | Typical Value                 |
| ----------------------------- | ----------------------------- |
| % of LLM calls tagged         | 10–30%                        |
| Cost attribution coverage     | 30–50% (rough, account-level) |
| Time to detect cost anomaly   | 1–3 days                      |
| Optimization savings realized | 5–15% (ad hoc wins)           |
| Teams with cost dashboards    | 0–1                           |

### Signs You're Here

- [ ] You can tell your total monthly LLM spend but not per-feature or per-team costs
- [ ] At least one engineer or manager is tracking costs informally
- [ ] Some API calls have metadata tags, but there's no standard schema
- [ ] You've done a few one-off optimizations (e.g., switching one workload to a cheaper model)
- [ ] Cost discussions happen reactively — when budgets are exceeded or invoices spike
- [ ] You know which provider is most expensive but not which features drive the cost
- [ ] There's interest from leadership but no formal mandate or staffing

### What to Do Next

1. **Adopt a standard tagging schema** — Use [`request-tagging-schema.yaml`](../../public/templates/request-tagging-schema.yaml) and deploy it across all services
2. **Deploy a centralized LLM gateway or client wrapper** — Ensures consistent tagging and telemetry
3. **Set up a telemetry pipeline** — Ship enriched request logs to your data warehouse
4. **Compute per-request costs** — Multiply token counts by model pricing rates
5. **Schedule a monthly cost review** — Use the [`monthly-cost-review.md`](../../public/templates/monthly-cost-review.md) agenda template
6. **Identify 3 quick-win optimizations** — Focus on expensive models used for simple tasks

**Target timeline to reach Level 3:** 4–6 weeks

---

## Level 3: Instrumented

> _"We have full visibility. Every token is tagged, tracked, and attributed."_

### Description

The organization has achieved comprehensive observability over LLM token consumption. Every API call is tagged with standardized metadata (team, service, feature, environment, use case). A telemetry pipeline computes per-request costs and feeds dashboards that give every team self-serve visibility into their spend. Budget alerts fire automatically when thresholds are breached. Cost reviews happen on a regular cadence with structured agendas.

### Key Capabilities

| Capability       | Status                                                                          |
| ---------------- | ------------------------------------------------------------------------------- |
| Cost visibility  | ✅ Full — real-time dashboards with drill-down by team, service, feature, model |
| Request tagging  | ✅ 100% — standardized schema enforced by gateway                               |
| Cost attribution | ✅ Accurate — per-request cost computed and attributed to cost centers          |
| Budgets          | ✅ Defined — monthly token budgets set per service/team with soft/hard limits   |
| Optimization     | 🟡 Emerging — optimization backlog exists but execution is inconsistent         |
| Governance       | 🟡 Structured — monthly review cadence, but policies are not yet codified       |

### Typical Metrics

| Metric                        | Typical Value                             |
| ----------------------------- | ----------------------------------------- |
| % of LLM calls tagged         | 95–100%                                   |
| Cost attribution coverage     | 95–100%                                   |
| Time to detect cost anomaly   | < 1 hour (automated alerts)               |
| Optimization savings realized | 15–30% (from visibility-driven decisions) |
| Teams with cost dashboards    | All teams                                 |

### Signs You're Here

- [ ] Every LLM API call carries standardized metadata tags
- [ ] Dashboards show spend by team, service, feature, model, and environment
- [ ] Budget alerts fire automatically when thresholds are breached
- [ ] Per-request cost is computed and stored in the data warehouse
- [ ] Monthly cost reviews happen on a regular cadence with structured agendas
- [ ] Teams can self-serve their own cost data without asking a central team
- [ ] You can answer "How much does feature X cost per user per month?" within minutes
- [ ] Showback reports are distributed to team leads monthly

### What to Do Next

1. **Build an optimization backlog** — Rank services by total cost and cost-per-request; identify model downgrade, caching, and prompt compression opportunities
2. **Implement model routing** — Use the [Model Selection Matrix](../../public/templates/model-selection-matrix.md) to match tasks to the cheapest viable model
3. **Deploy caching** — Start with exact-match caching for high-volume, repetitive workloads; add semantic caching for conversational use cases
4. **Run prompt optimization sprints** — Use the [Prompt Optimization Checklist](../../public/templates/prompt-optimization-checklist.md) on the top-5 prompts by token count
5. **Adopt batch APIs** — Move non-latency-sensitive workloads to batch endpoints for 50% cost reduction
6. **Formalize optimization targets** — Set quarterly cost reduction goals (e.g., "Reduce cost-per-request by 20% this quarter")

**Target timeline to reach Level 4:** 6–10 weeks

---

## Level 4: Optimized

> _"We're systematically driving down cost-per-request without sacrificing quality."_

### Description

The organization has moved beyond visibility into active, systematic optimization. Intelligent model routing directs each request to the cheapest model that meets quality thresholds. Caching (exact-match and semantic) eliminates redundant LLM calls. Prompts are regularly audited and compressed. Batch APIs handle all non-real-time workloads. Optimization is not a one-time project but a continuous practice with measurable targets and regular improvement cycles.

### Key Capabilities

| Capability       | Status                                                                          |
| ---------------- | ------------------------------------------------------------------------------- |
| Cost visibility  | ✅ Full — with unit economics (cost per conversation, cost per document, etc.)  |
| Request tagging  | ✅ 100% — schema enforced; untagged requests rejected                           |
| Cost attribution | ✅ Full chargeback or showback operational                                      |
| Budgets          | ✅ Enforced — hard limits prevent budget overruns; exception process defined    |
| Optimization     | ✅ Systematic — model routing, caching, prompt compression, batching all active |
| Governance       | 🟡 Emerging — optimization targets set, but policy enforcement is manual        |

### Typical Metrics

| Metric                        | Typical Value                     |
| ----------------------------- | --------------------------------- |
| % of LLM calls tagged         | 100%                              |
| Cost attribution coverage     | 100%                              |
| Time to detect cost anomaly   | < 15 minutes                      |
| Optimization savings realized | 40–65% (cumulative from baseline) |
| Cache hit rate                | 25–40%                            |
| Model routing coverage        | 80–100% of workloads              |
| Prompt token reduction        | 20–40% from original prompts      |
| Batch API adoption            | 100% of eligible workloads        |

### Signs You're Here

- [ ] A model routing layer automatically selects the cheapest viable model per task type
- [ ] Caching is deployed and achieving ≥25% hit rate on conversational workloads
- [ ] Prompts are regularly audited and compressed; there's a backlog of prompt optimization tasks
- [ ] Batch APIs handle all non-real-time workloads (ETL, nightly jobs, bulk processing)
- [ ] Quarterly optimization targets exist and are tracked (e.g., "−20% cost-per-request this quarter")
- [ ] A/B testing protocol is followed before every model change
- [ ] Unit economics are tracked (cost per conversation, cost per processed document, etc.)
- [ ] Teams proactively look for optimization opportunities

### What to Do Next

1. **Implement full chargeback** — Move from showback to actual budget impact; LLM costs flow to team P&Ls
2. **Embed cost review in architecture decisions** — Require an [Architecture Decision Record](../../public/templates/architecture-decision-record.md) with cost analysis for every new AI feature
3. **Codify governance policies** — Document model selection policy, prompt change policy, budget exception process
4. **Automate policy enforcement** — Gateway rejects requests that violate policies (e.g., unapproved model, missing cost review)
5. **Build a culture of cost awareness** — Include token cost metrics in sprint demos, post-mortems, and team OKRs
6. **Negotiate provider contracts** — Use your consumption data to negotiate volume discounts or committed-use deals

**Target timeline to reach Level 5:** 8–12 weeks

---

## Level 5: Governed

> _"Token cost awareness is embedded in our engineering culture. It's how we build."_

### Description

TokenOps is fully integrated into the organization's engineering and financial processes. Chargeback is operational — every team's LLM costs are reflected in their budget. Architecture reviews include mandatory cost analysis. Automated guardrails enforce governance policies without human intervention. Cost-per-outcome metrics are tracked alongside traditional KPIs. There is a shared culture of cost awareness where engineers consider token efficiency as naturally as they consider performance or security. The organization leverages its consumption data for strategic vendor negotiations and long-term capacity planning.

### Key Capabilities

| Capability       | Status                                                                                |
| ---------------- | ------------------------------------------------------------------------------------- |
| Cost visibility  | ✅ Full — real-time, self-serve, with forecasting and anomaly detection               |
| Request tagging  | ✅ 100% — enforced; schema versioned and governed                                     |
| Cost attribution | ✅ Full chargeback — costs flow to team/product P&Ls                                  |
| Budgets          | ✅ Enforced with automated guardrails and codified exception process                  |
| Optimization     | ✅ Continuous — optimization is a sustained practice, not a project                   |
| Governance       | ✅ Full — policies codified, automated, audited; cost is part of architecture reviews |

### Typical Metrics

| Metric                        | Typical Value                                |
| ----------------------------- | -------------------------------------------- |
| % of LLM calls tagged         | 100%                                         |
| Cost attribution coverage     | 100% (chargeback)                            |
| Time to detect cost anomaly   | < 5 minutes (automated detection + alerting) |
| Optimization savings realized | 50–75% (cumulative from baseline)            |
| Cache hit rate                | 30–50%                                       |
| New features with cost review | 100%                                         |
| Policy compliance rate        | ≥ 98%                                        |
| Vendor contract savings       | 10–25% off list price                        |

### Signs You're Here

- [ ] Full chargeback is operational — team LLM costs appear in their financial reports
- [ ] Every new AI feature requires an Architecture Decision Record with cost analysis before launch
- [ ] Automated guardrails enforce governance policies (model selection, budget limits, tagging)
- [ ] Cost-per-outcome metrics are in executive dashboards alongside revenue and usage metrics
- [ ] Engineering teams proactively optimize; cost awareness is part of the culture
- [ ] Vendor contracts include volume discounts negotiated using consumption data
- [ ] Capacity planning uses token consumption forecasts alongside infrastructure forecasts
- [ ] Cost metrics are discussed in sprint reviews, retrospectives, and architecture reviews
- [ ] There is a named TokenOps lead or team with clear organizational authority
- [ ] Quarterly executive briefings include LLM cost ROI and strategic direction

### Sustaining Level 5

At Level 5, the focus shifts from building capabilities to sustaining and evolving them:

| Activity                                  | Cadence       | Purpose                                                    |
| ----------------------------------------- | ------------- | ---------------------------------------------------------- |
| Re-evaluate model selection               | Quarterly     | New models and price drops are frequent                    |
| Re-run prompt optimization audits         | Quarterly     | Prompts accumulate cruft; new techniques emerge            |
| Refresh pricing reference tables          | Monthly       | Provider pricing changes without notice                    |
| Review vendor contracts                   | Annually      | Negotiate based on updated consumption data                |
| Benchmark against industry peers          | Semi-annually | Ensure competitiveness                                     |
| Update governance policies                | Semi-annually | Adapt to new models, use cases, and organizational changes |
| Train new engineers on TokenOps practices | Onboarding    | Sustain the culture as the team grows                      |
| Run cost war games / chaos exercises      | Semi-annually | Test guardrails and incident response under stress         |

---

## Maturity Progression Summary

| Dimension           | Level 1: Ad Hoc | Level 2: Aware          | Level 3: Instrumented     | Level 4: Optimized                         | Level 5: Governed                        |
| ------------------- | --------------- | ----------------------- | ------------------------- | ------------------------------------------ | ---------------------------------------- |
| **Visibility**      | None            | Provider dashboards     | Full real-time dashboards | Unit economics                             | Forecasting + anomaly detection          |
| **Tagging**         | None            | Partial, inconsistent   | 100%, standardized        | 100%, enforced                             | 100%, versioned, governed                |
| **Attribution**     | None            | Account-level estimates | Per-request, per-team     | Full showback/chargeback                   | Full chargeback to P&L                   |
| **Budgets**         | None            | Informal                | Defined with alerts       | Enforced with limits                       | Automated guardrails + exception process |
| **Optimization**    | None            | Ad hoc individual wins  | Emerging backlog          | Systematic (routing, caching, compression) | Continuous improvement culture           |
| **Governance**      | None            | Occasional reviews      | Monthly review cadence    | Policies defined                           | Policies automated + audited             |
| **Culture**         | Unaware         | Curious                 | Informed                  | Proactive                                  | Embedded                                 |
| **Typical Savings** | 0%              | 5–15%                   | 15–30%                    | 40–65%                                     | 50–75%                                   |
| **Time Investment** | —               | 2–4 weeks               | 4–6 weeks                 | 6–10 weeks                                 | 8–12 weeks                               |

---

## Self-Assessment Checklist

Use this checklist to determine your current maturity level. Check every statement that is true for your organization today. Your level is the **highest level where you can check all items**.

### Level 1 Baseline (Everyone starts here)

- [ ] We use LLMs in at least one production service
- [ ] We have at least one active LLM provider account

### Level 2: Aware

- [ ] We can state our total monthly LLM spend within ±20% accuracy
- [ ] We have an inventory of all services that call LLM APIs
- [ ] At least one person is informally tracking LLM costs
- [ ] We have performed at least one cost-motivated optimization (e.g., model downgrade)
- [ ] We can identify our top-3 most expensive LLM integrations

### Level 3: Instrumented

- [ ] ≥ 95% of LLM API calls carry standardized metadata tags
- [ ] A centralized gateway or client wrapper handles all LLM requests
- [ ] Per-request cost is computed automatically and stored in a data warehouse
- [ ] Self-serve cost dashboards are available to all teams
- [ ] Monthly token budgets are defined for each service or team
- [ ] Budget alerts fire automatically when soft thresholds are breached
- [ ] Monthly cost reviews happen on a regular cadence with a structured agenda
- [ ] Showback reports are distributed to team leads monthly

### Level 4: Optimized

- [ ] A model routing layer selects the cheapest viable model per task type
- [ ] Caching (exact-match or semantic) is deployed on at least one workload
- [ ] Prompt optimization has been completed on the top-5 prompts by token count
- [ ] Batch APIs are used for all non-real-time workloads
- [ ] Quarterly optimization targets are set and tracked
- [ ] A/B testing protocol is followed before model changes
- [ ] Unit economics (cost per outcome) are tracked for key use cases
- [ ] Cache hit rate is ≥ 25% on eligible workloads

### Level 5: Governed

- [ ] Full chargeback is operational — LLM costs flow to team/product budgets
- [ ] Every new AI feature requires a cost analysis before launch
- [ ] Governance policies are codified and documented (model selection, budgets, tagging)
- [ ] Automated guardrails enforce policies without human intervention
- [ ] Cost-per-outcome metrics appear in executive dashboards
- [ ] Vendor contracts include negotiated volume discounts
- [ ] Token consumption forecasts are used for capacity planning
- [ ] Cost awareness is part of engineering culture (discussed in sprints, retros, reviews)
- [ ] A named TokenOps lead or team has clear organizational authority
- [ ] Continuous improvement cadence is established and sustained

---

### Scoring Guide

| Items Checked (per level)                          | Assessment                                                         |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| All items in Level 2                               | ✅ You are at Level 2                                              |
| All items in Level 2 + Level 3                     | ✅ You are at Level 3                                              |
| All items in Level 2 + Level 3 + Level 4           | ✅ You are at Level 4                                              |
| All items in Level 2 + Level 3 + Level 4 + Level 5 | ✅ You are at Level 5                                              |
| Some items checked at next level                   | 🟡 You are transitioning — focus on completing the remaining items |

> **Tip:** It's normal to have some capabilities from higher levels while not fully completing a lower level. Focus on completing the current level before advancing — each level builds the foundation for the next.

---

## Common Pitfalls by Level

| Pitfall                                         | Level | What Goes Wrong                                                    | How to Avoid                                                                 |
| ----------------------------------------------- | ----- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Jumping to optimization without instrumentation | 1 → 4 | You optimize blindly; can't measure impact; wins are unsustainable | Complete Level 3 first — you need data to optimize effectively               |
| Over-engineering the gateway                    | 2 → 3 | Months spent building a perfect gateway while costs spiral         | Start with a simple client wrapper; iterate based on actual needs            |
| Dashboard fatigue                               | 3     | Beautiful dashboards that nobody looks at                          | Tie dashboards to monthly reviews with action items; send weekly digests     |
| Optimization without quality gates              | 3 → 4 | Aggressive model downgrades degrade user experience                | Always A/B test; define measurable quality thresholds before switching       |
| Governance theater                              | 4 → 5 | Policies exist on paper but are not enforced                       | Automate enforcement in the gateway; manual policies will be ignored         |
| Chargeback without buy-in                       | 4 → 5 | Teams resist chargeback; it becomes adversarial                    | Start with showback; get teams used to seeing costs before impacting budgets |
| Declaring victory                               | 5     | Governance set up but not maintained; maturity regresses           | Assign an owner; establish continuous improvement cadence; audit quarterly   |

---

## Related Resources

- [Implementation Playbook](../../public/templates/implementation-playbook.md) — 12-week step-by-step guide to stand up a TokenOps practice
- [Monthly Cost Review Agenda](../../public/templates/monthly-cost-review.md) — Structured agenda for the monthly TokenOps review meeting
- [Budget Guardrails Config](../../public/templates/budget-guardrails.yaml) — YAML configuration for automated budget enforcement
- [Model Selection Matrix](../../public/templates/model-selection-matrix.md) — Framework for cost-optimized model routing
- [Prompt Optimization Checklist](../../public/templates/prompt-optimization-checklist.md) — Systematic prompt compression and optimization guide
- [Architecture Decision Record](../../public/templates/architecture-decision-record.md) — Template for documenting AI architecture decisions with cost analysis

---

_Template version 1.0 — Maintained by the TokenOps team._
