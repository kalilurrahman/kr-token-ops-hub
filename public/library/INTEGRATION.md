# Integration Guide — Adding Content Pack to TokenOps Atlas Site

This document explains how to integrate the new content into the live TokenOps Atlas React site.

---

## Step 1: Copy Template Files

Copy all files from `content-pack/templates/`, `content-pack/guides/`, and `content-pack/advanced/` into the existing `public/templates/` directory:

```bash
# From the project root
cp content-pack/templates/* public/templates/
cp content-pack/guides/* public/templates/
cp content-pack/advanced/* public/templates/
```

---

## Step 2: Update `src/tokenops_content.json`

Add the new templates to the `templates` array:

```json
{
  "title": "Vendor Evaluation Scorecard",
  "desc": "Weighted scoring matrix for comparing LLM API providers across pricing, performance, quality, and compliance.",
  "category": "Governance",
  "format": "Markdown",
  "file": "vendor-evaluation-scorecard.md"
},
{
  "title": "Incident Response Runbook",
  "desc": "P1–P4 cost spike classification with triage checklists, investigation steps, and communication templates.",
  "category": "Engineering",
  "format": "Markdown",
  "file": "incident-response-runbook.md"
},
{
  "title": "Quarterly Business Review",
  "desc": "QBR template with quarterly metrics, team scorecards, optimization tracker, and cost forecasts.",
  "category": "Governance",
  "format": "Markdown",
  "file": "quarterly-business-review.md"
},
{
  "title": "ROI Justification Template",
  "desc": "Business case builder for TokenOps investment with NPV, payback period, and risk analysis.",
  "category": "Finance",
  "format": "Markdown",
  "file": "roi-justification-template.md"
},
{
  "title": "SLA/SLO Definitions",
  "desc": "Service level framework for LLM features covering availability, latency, cost, and quality objectives.",
  "category": "Engineering",
  "format": "Markdown",
  "file": "sla-slo-definitions.md"
},
{
  "title": "Multi-Provider Routing Config",
  "desc": "Production YAML configuration for multi-provider model routing with fallbacks and circuit breakers.",
  "category": "Engineering",
  "format": "YAML",
  "file": "multi-provider-routing-config.yaml"
}
```

Add the new guides to the `resources` array:

```json
{
  "title": "TokenOps Maturity Model",
  "desc": "5-level progression framework from ad-hoc cost management to fully governed token economics.",
  "category": "Document",
  "format": "Markdown",
  "file": "tokenops-maturity-model.md"
},
{
  "title": "Team RACI Matrix",
  "desc": "Role assignments for 11 TokenOps activities across 8 organizational roles.",
  "category": "Document",
  "format": "Markdown",
  "file": "team-raci-matrix.md"
},
{
  "title": "TokenOps Glossary",
  "desc": "50+ term definitions covering tokens, pricing models, optimization techniques, and governance.",
  "category": "Document",
  "format": "Markdown",
  "file": "tokenops-glossary.md"
},
{
  "title": "TokenOps FAQ",
  "desc": "25+ frequently asked questions across getting started, technical, financial, and organizational topics.",
  "category": "Document",
  "format": "Markdown",
  "file": "tokenops-faq.md"
},
{
  "title": "Detailed Case Studies",
  "desc": "4 real-world optimization scenarios with before/after metrics, implementation steps, and lessons learned.",
  "category": "Document",
  "format": "Markdown",
  "file": "case-studies-detailed.md"
},
{
  "title": "Cost Anomaly Detection Guide",
  "desc": "Statistical detection methods, alert configurations, investigation workflows, and automated response strategies.",
  "category": "Document",
  "format": "Markdown",
  "file": "cost-anomaly-detection.md"
},
{
  "title": "Prompt Versioning Workflow",
  "desc": "Git-based prompt management with A/B testing protocols, quality gates, and rollback procedures.",
  "category": "Document",
  "format": "Markdown",
  "file": "prompt-versioning-workflow.md"
},
{
  "title": "LLM Gateway Architecture",
  "desc": "Architecture guide for building a centralized LLM API gateway with routing, caching, and observability.",
  "category": "Document",
  "format": "Markdown",
  "file": "llm-gateway-architecture.md"
},
{
  "title": "Optimization Patterns (Detailed)",
  "desc": "Deep-dive into 10 optimization patterns with code examples, expected savings, and monitoring strategies.",
  "category": "Document",
  "format": "Markdown",
  "file": "optimization-patterns-detailed.md"
}
```

---

## Step 3: Add Template Content to App.jsx (Optional)

For client-side download support, add the file contents to the `templateContents` object in `src/App.jsx`. This enables the "Download" button on each resource card.

For each new file, read its contents and add an entry like:

```javascript
const templateContents = {
  // ... existing entries ...
  "vendor-evaluation-scorecard.md": `... file contents ...`,
  "incident-response-runbook.md": `... file contents ...`,
  // ... etc
};
```

**Alternative**: For files served from `public/templates/`, the existing PDF-style download link will work if you configure the resource card to link directly to the file rather than using client-side blob downloads.

---

## Step 4: Update Navigation Counts (About Page)

In the About component in `App.jsx`, update the stats:

```jsx
<div className="about-stat"><strong>45K+</strong><span>Words of guidance</span></div>
<div className="about-stat"><strong>27</strong><span>Downloadable resources</span></div>  {/* was 12 */}
<div className="about-stat"><strong>10</strong><span>Optimization patterns</span></div>  {/* was 7 */}
<div className="about-stat"><strong>5</strong><span>Interactive tools</span></div>
```

---

## Step 5: Update Starter Kit Banner (Resources Page)

Update the starter kit counts in the Resources component:

```jsx
<span><CheckSquare size={12} /> 13 Templates</span>   {/* was 7 */}
<span><FileText size={12} /> 11 Documents</span>       {/* was 2 */}
<span><FileCode2 size={12} /> YAML + Markdown</span>
```

---

## Step 6: Add New Optimization Patterns (Optional)

The existing `content.patterns` array in `tokenops_content.json` has 7 patterns. Add 3 more to match the detailed patterns guide:

```json
{
  "title": "Embedding optimization",
  "desc": "Reduce embedding costs through dimensionality reduction and vector caching."
},
{
  "title": "Fine-tuning for cost",
  "desc": "Distill frontier model capabilities into smaller, cheaper models."
},
{
  "title": "Agent chain optimization",
  "desc": "Reduce tool calls, enable parallel execution, and set early termination."
}
```

---

## Step 7: Add Sources

Update the `sources` array to include the new reference material:

```json
"sources": [
  "FinOps Foundation AI overview",
  "FinOps GenAI token pricing guide",
  "OpenAI pricing and prompt caching docs",
  "Anthropic pricing and usage-cost docs",
  "Finout TokenOps guide",
  "LiteLLM proxy documentation",
  "DSPy prompt optimization framework",
  "Google Cloud FinOps best practices",
  "AWS Well-Architected AI/ML lens",
  "CNCF cost management guidelines"
]
```
