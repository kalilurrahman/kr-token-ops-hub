# TokenOps Team RACI Matrix

> **Purpose:** Clarify who is Responsible, Accountable, Consulted, and Informed for every TokenOps activity.  
> **Audience:** Engineering, platform, product, finance, and executive leadership.  
> **How to use:** Adapt this matrix to your organization's structure. Assign specific names to each role, distribute to all stakeholders, and revisit quarterly.

---

## RACI Legend

| Letter | Meaning | Definition |
|--------|---------|------------|
| **R** | Responsible | Does the work. Executes the task and delivers the output. |
| **A** | Accountable | Owns the outcome. Has final decision authority. Only one "A" per activity. |
| **C** | Consulted | Provides input before or during the work. Two-way communication. |
| **I** | Informed | Notified of progress or outcomes. One-way communication. |

> **Rule:** Every activity must have exactly **one A** (single point of accountability). An activity may have multiple R, C, and I assignments.

---

## Role Definitions

Before reading the matrix, ensure everyone understands what each role contributes to the TokenOps practice.

| Role | Primary Contribution to TokenOps | Typical Title(s) |
|------|----------------------------------|-------------------|
| **Engineering Lead** | Owns service-level implementation — tagging, prompt optimization, model selection for their service. Executes hands-on optimization work. | Tech Lead, Staff Engineer, Service Owner |
| **Platform / Infra Engineer** | Builds and maintains shared TokenOps infrastructure — gateway, telemetry pipeline, caching layer, dashboards. | Platform Engineer, SRE, DevOps Engineer, Infra Engineer |
| **Product Manager** | Defines feature requirements, quality thresholds, and user-experience constraints that inform cost trade-offs. | Product Manager, Product Owner |
| **Finance / FinOps Partner** | Manages budgets, forecasts, chargeback/showback, vendor contracts, and financial reporting. | FinOps Practitioner, Finance Business Partner, FP&A Analyst |
| **Data Engineer** | Builds and maintains the data pipeline that moves enriched request logs from the gateway to the data warehouse. | Data Engineer, Analytics Engineer |
| **Engineering Manager** | Manages engineering teams, allocates engineering time to TokenOps work, and drives adoption within their teams. | Engineering Manager, Dev Manager |
| **VP Engineering** | Sets engineering-wide strategy and priorities. Approves large budget allocations and organizational changes. | VP Engineering, SVP Engineering, Director of Engineering |
| **CTO** | Owns technology strategy. Sponsors the TokenOps practice at the executive level. Makes final calls on vendor strategy. | CTO, Chief Architect |

---

## Core RACI Matrix

| Activity | Engineering Lead | Platform / Infra Engineer | Product Manager | Finance / FinOps Partner | Data Engineer | Engineering Manager | VP Engineering | CTO |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Tagging Schema Design** | C | R | C | C | C | I | I | A |
| **Gateway Deployment** | C | R/A | I | I | C | I | I | C |
| **Cost Dashboard Build** | C | R | C | C | R | I | I | A |
| **Budget Setting** | C | I | C | R | I | C | A | I |
| **Monthly Cost Review** | R | R | C | R | I | R | A | I |
| **Model Selection** | R/A | C | C | I | I | I | I | C |
| **Prompt Optimization** | R/A | I | C | I | I | I | I | I |
| **Incident Response (Cost Anomaly)** | R | R | I | C | R | C | I | A |
| **Vendor Negotiation** | C | C | I | R | I | I | C | A |
| **Quarterly Business Review** | C | C | C | R | I | C | R | A |
| **Architecture Decision Records** | R | C | C | C | I | C | A | C |

---

## Detailed Activity Breakdown

### 1. Tagging Schema Design

**What:** Define the standardized metadata schema (team, service, feature, environment, use_case, cost_center, etc.) applied to every LLM API request.

| Role | Assignment | Details |
|------|:---:|---------|
| Engineering Lead | C | Provides input on service-specific tags and validates feasibility |
| Platform / Infra Engineer | **R** | Designs the schema, implements it in the gateway, and maintains documentation |
| Product Manager | C | Ensures feature-level tags align with product taxonomy |
| Finance / FinOps Partner | C | Ensures cost_center tags align with financial reporting structure |
| Data Engineer | C | Validates schema compatibility with the data warehouse and downstream queries |
| Engineering Manager | I | Informed of the schema and rollout plan |
| VP Engineering | I | Informed of the standard and its enforcement timeline |
| CTO | **A** | Approves the final schema as an engineering-wide standard |

**Key deliverable:** Versioned `request-tagging-schema.yaml` deployed to all environments.

---

### 2. Gateway Deployment

**What:** Deploy, configure, and maintain the centralized LLM API gateway that enforces tagging, routes requests, and collects telemetry.

| Role | Assignment | Details |
|------|:---:|---------|
| Engineering Lead | C | Provides requirements for their service's routing and latency needs |
| Platform / Infra Engineer | **R/A** | Builds, deploys, monitors, and maintains the gateway |
| Product Manager | I | Informed of gateway capabilities and any impact on feature latency |
| Finance / FinOps Partner | I | Informed of gateway's cost-tracking capabilities |
| Data Engineer | C | Ensures telemetry output is compatible with the data pipeline |
| Engineering Manager | I | Informed of migration plan and timeline |
| VP Engineering | I | Informed of progress and any blockers |
| CTO | C | Consulted on technology selection and architectural decisions |

**Key deliverable:** Production gateway handling 100% of LLM API traffic with enforced tagging.

---

### 3. Cost Dashboard Build

**What:** Build and maintain self-serve cost dashboards (executive summary, team view, model mix, anomaly detection, unit economics).

| Role | Assignment | Details |
|------|:---:|---------|
| Engineering Lead | C | Validates team-level dashboards show accurate data for their services |
| Platform / Infra Engineer | **R** | Builds dashboard infrastructure, manages data sources and refresh cadence |
| Product Manager | C | Defines which unit economics to track (cost per conversation, cost per document, etc.) |
| Finance / FinOps Partner | C | Validates financial accuracy; defines executive summary requirements |
| Data Engineer | **R** | Builds the data models, transformations, and warehouse tables that power dashboards |
| Engineering Manager | I | Informed of dashboard availability and how to access team-level views |
| VP Engineering | I | Informed of executive dashboard availability |
| CTO | **A** | Approves the dashboard as the system of record for LLM cost visibility |

**Key deliverable:** Live dashboards accessible to all stakeholders with daily refresh.

---

### 4. Budget Setting

**What:** Define monthly token budgets (soft alerts and hard limits) for each service and team.

| Role | Assignment | Details |
|------|:---:|---------|
| Engineering Lead | C | Provides input on expected usage growth and upcoming feature launches |
| Platform / Infra Engineer | I | Informed of budgets to configure guardrails in the gateway |
| Product Manager | C | Provides input on feature roadmap and expected volume changes |
| Finance / FinOps Partner | **R** | Proposes budgets based on historical data, forecasts, and organizational targets |
| Data Engineer | I | Informed of budget thresholds for anomaly detection queries |
| Engineering Manager | C | Validates budgets are realistic for their teams; commits to staying within limits |
| VP Engineering | **A** | Approves final budgets and signs off on exception thresholds |
| CTO | I | Informed of overall budget allocation and any strategic implications |

**Key deliverable:** `budget-guardrails.yaml` configured and deployed with agreed budgets.

---

### 5. Monthly Cost Review

**What:** Conduct the monthly TokenOps cost review meeting using the structured agenda (metrics review, anomalies, optimization progress, forecasts, action items).

| Role | Assignment | Details |
|------|:---:|---------|
| Engineering Lead | **R** | Presents service-level cost data, explains anomalies, proposes optimizations |
| Platform / Infra Engineer | **R** | Presents infrastructure metrics (cache hit rate, gateway health, telemetry coverage) |
| Product Manager | C | Provides context on feature usage changes that affect costs |
| Finance / FinOps Partner | **R** | Presents financial summary, budget vs. actual, forecast, and chargeback reports |
| Data Engineer | I | Informed of any data quality issues identified during review |
| Engineering Manager | **R** | Presents team-level progress on optimization commitments |
| VP Engineering | **A** | Chairs the review; makes decisions on budget adjustments and priorities |
| CTO | I | Receives summary and escalated items |

**Key deliverable:** Meeting minutes with action items, owners, and deadlines.

---

### 6. Model Selection

**What:** Evaluate and select the optimal model for a given workload, balancing cost, quality, and latency using the Model Selection Matrix.

| Role | Assignment | Details |
|------|:---:|---------|
| Engineering Lead | **R/A** | Runs the evaluation (offline eval → shadow mode → A/B test), makes the selection |
| Platform / Infra Engineer | C | Advises on gateway routing configuration and infrastructure implications |
| Product Manager | C | Defines quality thresholds and user-experience constraints |
| Finance / FinOps Partner | I | Informed of expected cost impact |
| Data Engineer | I | Informed of any changes to data pipeline (new model fields, pricing updates) |
| Engineering Manager | I | Informed of model change and rollout plan |
| VP Engineering | I | Informed of significant model changes |
| CTO | C | Consulted on strategic model decisions (e.g., single-vendor vs. multi-vendor) |

**Key deliverable:** Completed Model Selection Matrix evaluation with A/B test results.

---

### 7. Prompt Optimization

**What:** Audit, compress, and optimize prompts to reduce input/output token consumption without degrading quality.

| Role | Assignment | Details |
|------|:---:|---------|
| Engineering Lead | **R/A** | Executes prompt optimization using the Prompt Optimization Checklist |
| Platform / Infra Engineer | I | Informed of any changes that affect caching or routing |
| Product Manager | C | Validates that output quality meets user expectations after optimization |
| Finance / FinOps Partner | I | Informed of estimated savings |
| Data Engineer | I | Informed if schema or tracking changes are needed |
| Engineering Manager | I | Informed of optimization progress |
| VP Engineering | I | Informed via monthly review |
| CTO | I | Informed via monthly review |

**Key deliverable:** Optimized prompts deployed with before/after metrics documented.

---

### 8. Incident Response (Cost Anomaly)

**What:** Detect, investigate, and resolve unexpected cost spikes or anomalies (e.g., runaway loops, traffic surges, misconfigured models).

| Role | Assignment | Details |
|------|:---:|---------|
| Engineering Lead | **R** | Investigates root cause within their service; implements fix |
| Platform / Infra Engineer | **R** | Investigates gateway-level issues; may need to enforce emergency rate limits |
| Product Manager | I | Informed of user-facing impact and any feature degradation |
| Finance / FinOps Partner | C | Provides financial context; estimates cost impact of the anomaly |
| Data Engineer | **R** | Runs ad-hoc queries to diagnose anomaly patterns in the data warehouse |
| Engineering Manager | C | Coordinates team response; removes blockers |
| VP Engineering | I | Informed of significant incidents (>$5K impact or >2× daily spend) |
| CTO | **A** | Accountable for resolution of critical incidents; authorizes emergency measures |

**Key deliverable:** Incident post-mortem with root cause, impact, and preventive measures.

---

### 9. Vendor Negotiation

**What:** Negotiate pricing, volume discounts, committed-use agreements, and SLAs with LLM API providers.

| Role | Assignment | Details |
|------|:---:|---------|
| Engineering Lead | C | Provides technical requirements and consumption patterns |
| Platform / Infra Engineer | C | Provides infrastructure requirements (rate limits, SLAs, API compatibility) |
| Product Manager | I | Informed of any capability or pricing changes resulting from negotiations |
| Finance / FinOps Partner | **R** | Leads the negotiation; prepares consumption data and business case |
| Data Engineer | I | Informed of any data format or reporting changes |
| Engineering Manager | I | Informed of contract terms relevant to their teams |
| VP Engineering | C | Provides strategic context; approves negotiation parameters |
| CTO | **A** | Approves final contracts and vendor commitments |

**Key deliverable:** Signed vendor contract with documented terms, pricing, and SLAs.

---

### 10. Quarterly Business Review (QBR)

**What:** Present TokenOps program results to executive leadership — ROI summary, savings achieved, forecast, strategic direction, budget adjustments.

| Role | Assignment | Details |
|------|:---:|---------|
| Engineering Lead | C | Provides service-level results and upcoming optimization plans |
| Platform / Infra Engineer | C | Provides platform health, reliability, and tooling roadmap |
| Product Manager | C | Provides context on product roadmap and expected volume changes |
| Finance / FinOps Partner | **R** | Prepares the QBR deck: financial summary, ROI, forecast, budget recommendations |
| Data Engineer | I | Informed of any data-related action items from the QBR |
| Engineering Manager | C | Provides team execution progress and resource needs |
| VP Engineering | **R** | Presents the QBR to executive leadership; advocates for resources |
| CTO | **A** | Approves strategic direction, budget adjustments, and resource allocation |

**Key deliverable:** QBR presentation with ROI summary, 90-day plan, and approved budget.

---

### 11. Architecture Decision Records (ADRs)

**What:** Document the cost analysis and rationale for AI/LLM architecture decisions — model choice, context strategy, caching approach, etc.

| Role | Assignment | Details |
|------|:---:|---------|
| Engineering Lead | **R** | Authors the ADR, including cost modeling and alternatives analysis |
| Platform / Infra Engineer | C | Reviews infrastructure implications and provides cost estimates for platform components |
| Product Manager | C | Provides context on user requirements, quality thresholds, and roadmap |
| Finance / FinOps Partner | C | Reviews cost projections and validates alignment with budgets |
| Data Engineer | I | Informed of any data pipeline changes implied by the decision |
| Engineering Manager | C | Reviews and provides organizational context |
| VP Engineering | **A** | Approves the ADR and authorizes the decision |
| CTO | C | Consulted on strategic or high-impact architecture decisions |

**Key deliverable:** Approved ADR with cost analysis, alternatives, and decision rationale.

---

## Adapting the Matrix

### For Smaller Organizations (< 50 engineers)

In smaller organizations, roles often overlap. Common consolidations:

| Combined Role | Covers |
|---------------|--------|
| **Full-stack / Service Owner** | Engineering Lead + prompt optimization + model selection |
| **Platform Engineer** | Platform / Infra + Data Engineer + gateway + dashboards |
| **Engineering Manager** | Engineering Manager + VP Engineering (single layer) |
| **Finance Lead** | Finance / FinOps Partner + vendor negotiation |
| **CTO** | CTO + executive sponsor + architecture authority |

### For Larger Organizations (> 500 engineers)

In larger organizations, you may need to add roles:

| Additional Role | Responsibility |
|-----------------|----------------|
| **TokenOps Lead** | Full-time owner of the TokenOps practice; runs reviews, sets strategy, coordinates across teams |
| **AI/ML Engineer** | Specialist in model evaluation, fine-tuning, and advanced optimization techniques |
| **Security / Compliance** | Reviews data handling in caches, ensures PII is not logged in telemetry |
| **Procurement** | Manages vendor contracts and purchase orders alongside Finance |

---

## Rollout Checklist

Use this checklist when deploying the RACI matrix in your organization:

- [ ] Assign a specific person's name to each role
- [ ] Distribute the matrix to all stakeholders
- [ ] Walk through the matrix in a team meeting — resolve any ambiguity
- [ ] Verify every activity has exactly one **A** (accountable)
- [ ] Confirm all **R** (responsible) parties have the time and authority to do the work
- [ ] Post the matrix in a shared location (wiki, Confluence, Notion)
- [ ] Add a quarterly review of the RACI to your TokenOps review cadence
- [ ] Update the matrix when roles change or new activities are added

---

## Related Resources

- [Implementation Playbook](../../public/templates/implementation-playbook.md) — 12-week guide that sequences these activities
- [Monthly Cost Review Agenda](../../public/templates/monthly-cost-review.md) — Structured agenda for activity #5
- [Architecture Decision Record](../../public/templates/architecture-decision-record.md) — Template for activity #11
- [Model Selection Matrix](../../public/templates/model-selection-matrix.md) — Framework for activity #6
- [Budget Guardrails Config](../../public/templates/budget-guardrails.yaml) — Configuration for activity #4

---

*Template version 1.0 — Maintained by the TokenOps team.*
