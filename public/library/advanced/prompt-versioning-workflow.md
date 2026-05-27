# Prompt Versioning Workflow

> **Purpose:** Treat prompts as production artifacts with full version control, quality gates, cost impact analysis, and safe rollout/rollback procedures. This workflow ensures every prompt change is traceable, testable, and cost-accountable.

---

## 1 · Why Version Prompts?

Prompts are the most volatile component in an LLM-powered system. A one-line change can:

| Impact | Example | Without Versioning | With Versioning |
|--------|---------|-------------------|-----------------|
| **Cost** | Adding "think step by step" triples output tokens | Silent 3× cost increase | Caught in CI: token count delta alert |
| **Quality** | Removing a constraint causes format regression | Discovered in production by users | Caught by test suite before merge |
| **Compliance** | Changing a system prompt removes PII guardrails | Audit trail missing | Full change history with author + reviewer |
| **Rollback** | New prompt causes hallucination spike | Manual "what was the old prompt?" scramble | One-click rollback to previous version |
| **Attribution** | Which prompt version drove last month's costs? | Impossible to determine | Exact cost-per-version in analytics |

**Rule of thumb:** If a prompt reaches production, it must be versioned.

---

## 2 · Version Schema

Every prompt version is tracked with the following metadata:

| Field | Type | Description |
|-------|------|-------------|
| `prompt_id` | `VARCHAR(64)` | Stable identifier for the prompt (e.g., `ticket-classifier-v1`) |
| `version` | `INTEGER` | Auto-incrementing version number |
| `content_hash` | `CHAR(64)` | SHA-256 hash of the prompt content (detects silent changes) |
| `content` | `TEXT` | Full prompt text |
| `created_at` | `TIMESTAMPTZ` | When this version was created |
| `author` | `VARCHAR(128)` | Who created this version (email or handle) |
| `status` | `ENUM` | `draft` → `testing` → `canary` → `active` → `deprecated` → `rolled_back` |
| `model` | `VARCHAR(64)` | Target model this prompt was designed for |
| `token_count` | `INTEGER` | Number of tokens in the prompt (measured with the target model's tokenizer) |
| `estimated_cost_per_call` | `NUMERIC(10,6)` | Estimated cost per invocation based on token count + model pricing |
| `test_pass_rate` | `NUMERIC(5,2)` | Pass rate from automated test suite (%) |
| `change_description` | `TEXT` | Human-readable description of what changed and why |
| `parent_version` | `INTEGER` | Previous version this was derived from |
| `tags` | `JSONB` | Arbitrary metadata (e.g., `{"experiment": "compression-test"}`) |

### Status Lifecycle

```
draft → testing → canary → active → deprecated
                     ↓                    ↑
                  rolled_back ────────────┘
```

| Status | Meaning |
|--------|---------|
| `draft` | Work in progress; not evaluated yet |
| `testing` | Running through automated test suite |
| `canary` | Serving a small percentage of live traffic |
| `active` | Serving 100% of production traffic |
| `deprecated` | Replaced by a newer version; kept for audit trail |
| `rolled_back` | Reverted due to quality or cost issues; previous version re-activated |

---

## 3 · Git-Based Workflow (Prompts as Code)

### 3.1 Directory Structure

```
repo/
├── prompts/
│   ├── ticket-classifier/
│   │   ├── prompt.md              # The actual prompt text
│   │   ├── config.yaml            # Model, parameters, metadata
│   │   ├── tests/
│   │   │   ├── test_cases.yaml    # Input/output test cases
│   │   │   └── eval_config.yaml   # Evaluation criteria
│   │   └── CHANGELOG.md           # Human-readable change log
│   ├── email-generator/
│   │   ├── prompt.md
│   │   ├── config.yaml
│   │   ├── tests/
│   │   │   ├── test_cases.yaml
│   │   │   └── eval_config.yaml
│   │   └── CHANGELOG.md
│   └── _shared/                   # Shared prompt fragments
│       ├── safety-preamble.md
│       └── output-format-json.md
├── scripts/
│   ├── tokenize.py                # Count tokens for a prompt
│   ├── cost_estimate.py           # Estimate cost impact
│   └── run_eval.py                # Run test suite
└── .github/
    └── workflows/
        └── prompt-ci.yaml         # CI pipeline
```

### 3.2 Prompt Config File

```yaml
# prompts/ticket-classifier/config.yaml
prompt_id: ticket-classifier
display_name: "Support Ticket Classifier"
description: "Classifies incoming support tickets into routing categories"

model:
  primary: gpt-4.1-mini
  fallback: gemini-2.5-flash

parameters:
  temperature: 0.1
  max_output_tokens: 100
  response_format: json

owner: "@cx-platform-team"
cost_center: "CC-5520-CX"

quality_requirements:
  min_test_pass_rate: 95.0      # Percent
  max_token_count_delta_pct: 20 # Max allowed increase from current active version
  max_cost_delta_pct: 30        # Max allowed cost increase

tags:
  service: support_chatbot
  sla_tier: p1
```

### 3.3 PR Workflow

```
1. Engineer creates a branch:  feat/ticket-classifier-v12
2. Edits prompt.md and/or config.yaml
3. Opens a Pull Request with:
   - Description of the change and motivation
   - Before/after token counts (auto-generated by CI)
   - Before/after cost estimate (auto-generated by CI)
   - Test results (auto-generated by CI)
4. Required reviewers:
   - Prompt engineer or ML engineer (quality review)
   - FinOps team member (cost review — if cost_delta > 10%)
   - Service owner (operational sign-off)
5. CI checks must all pass before merge
6. Merge to main triggers version registration + canary deployment
```

---

## 4 · A/B Testing Protocol

### 4.1 Shadow Testing (Pre-deployment)

Run the new prompt version against live traffic **without serving its results** to users.

```
┌──────────────┐
│  Live Traffic │
└──────┬───────┘
       │
       ├──→ Active Prompt (v11) ──→ Response served to user
       │
       └──→ Candidate Prompt (v12) ──→ Response logged, not served
                                        ↓
                                    Compare metrics:
                                    - Token count
                                    - Cost
                                    - Quality (vs. ground truth or LLM judge)
                                    - Latency
```

**Duration:** 24–48 hours of shadow traffic (or 1,000+ requests, whichever comes first).

**Promotion criteria:**

- [ ] Quality ≥ active version (within 1% tolerance)
- [ ] Token count ≤ active version + allowed delta (from `config.yaml`)
- [ ] Cost ≤ active version + allowed delta
- [ ] No new error patterns (format errors, refusals, hallucinations)

### 4.2 Canary Rollout

Serve the new version to a small percentage of live traffic and monitor for regressions.

| Phase | Traffic % | Duration | Criteria to Advance |
|-------|----------|----------|-------------------|
| Canary Start | 5% | 2 hours | No errors, quality stable |
| Canary Expand | 20% | 4 hours | Metrics within tolerance |
| Canary Full | 50% | 8 hours | Statistical significance on quality metrics |
| Full Rollout | 100% | — | All checks pass |

**Rollback trigger:** Any of the following during canary:

- Error rate > 2× baseline
- Cost-per-request > 1.5× baseline
- Quality score < 90% of baseline (measured by automated judge)
- Any P0 customer-facing issue

### 4.3 Full Deployment

```python
# Pseudocode for promoting a prompt version
def promote_prompt(prompt_id: str, new_version: int):
    """Atomically promote a new prompt version to active status."""

    current = get_active_version(prompt_id)

    # 1. Validate canary results
    canary_results = get_canary_metrics(prompt_id, new_version)
    assert canary_results.quality >= current.quality * 0.99
    assert canary_results.cost_per_req <= current.cost_per_req * 1.30
    assert canary_results.error_rate <= 0.02

    # 2. Atomic swap
    with database.transaction():
        update_version_status(prompt_id, current.version, "deprecated")
        update_version_status(prompt_id, new_version, "active")
        log_promotion_event(prompt_id, current.version, new_version)

    # 3. Invalidate caches that reference the old prompt
    invalidate_prompt_cache(prompt_id)

    # 4. Notify stakeholders
    notify(f"✅ {prompt_id} promoted: v{current.version} → v{new_version}")
```

---

## 5 · Quality Gates

Automated checks that run in CI before a prompt change can be merged or promoted.

### 5.1 Gate Definitions

| Gate | Check | Pass Criteria | Blocks |
|------|-------|--------------|--------|
| **Token Count** | Count tokens with target model's tokenizer | Delta ≤ `max_token_count_delta_pct` from active version | Merge |
| **Cost Estimate** | Calculate estimated cost per call | Delta ≤ `max_cost_delta_pct` from active version | Merge |
| **Format Validation** | Parse prompt for required sections (system, user, output format) | All required sections present | Merge |
| **Test Case Pass Rate** | Run prompt against test cases with expected outputs | Pass rate ≥ `min_test_pass_rate` | Merge |
| **Regression Test** | Compare quality on golden dataset vs. active version | No degradation >1% on any metric | Promotion |
| **Safety Check** | Run prompt through content safety classifier | No unsafe outputs detected | Merge |
| **PII Scan** | Scan prompt for hardcoded PII or secrets | Zero PII matches | Merge |
| **Idempotency** | Run same input 5 times; check output consistency | Consistency rate ≥ 95% | Merge |

### 5.2 CI Gate Script (Pseudocode)

```python
def run_quality_gates(prompt_id: str, candidate_path: str) -> GateResult:
    """Run all quality gates for a prompt change. Returns pass/fail + details."""

    active = load_active_prompt(prompt_id)
    candidate = load_prompt_from_file(candidate_path)
    config = load_config(prompt_id)
    results = GateResult()

    # Gate 1: Token count delta
    active_tokens = count_tokens(active.content, config.model.primary)
    candidate_tokens = count_tokens(candidate.content, config.model.primary)
    token_delta_pct = (candidate_tokens - active_tokens) / active_tokens * 100
    results.add("token_count", {
        "active_tokens": active_tokens,
        "candidate_tokens": candidate_tokens,
        "delta_pct": token_delta_pct,
        "passed": abs(token_delta_pct) <= config.quality_requirements.max_token_count_delta_pct
    })

    # Gate 2: Cost estimate
    active_cost = estimate_cost(active_tokens, config.model.primary)
    candidate_cost = estimate_cost(candidate_tokens, config.model.primary)
    cost_delta_pct = (candidate_cost - active_cost) / active_cost * 100
    results.add("cost_estimate", {
        "active_cost": active_cost,
        "candidate_cost": candidate_cost,
        "delta_pct": cost_delta_pct,
        "passed": cost_delta_pct <= config.quality_requirements.max_cost_delta_pct
    })

    # Gate 3: Test case pass rate
    test_cases = load_test_cases(prompt_id)
    pass_count = 0
    for test in test_cases:
        output = run_prompt(candidate.content, test.input, config)
        if evaluate(output, test.expected, test.criteria):
            pass_count += 1
    pass_rate = pass_count / len(test_cases) * 100
    results.add("test_pass_rate", {
        "total": len(test_cases),
        "passed": pass_count,
        "pass_rate": pass_rate,
        "gate_passed": pass_rate >= config.quality_requirements.min_test_pass_rate
    })

    # Gate 4: Format validation
    format_ok = validate_prompt_format(candidate.content, config)
    results.add("format_validation", {"passed": format_ok})

    # Gate 5: PII scan
    pii_matches = scan_for_pii(candidate.content)
    results.add("pii_scan", {"matches": pii_matches, "passed": len(pii_matches) == 0})

    return results
```

---

## 6 · Rollback Procedure

When a prompt version causes issues in production, roll back immediately and investigate later.

### 6.1 Automated Rollback Triggers

The gateway automatically rolls back if (during canary or after promotion):

- Error rate exceeds 5% for 10+ minutes
- Cost-per-request exceeds 2× the previous version for 15+ minutes
- Quality score drops below 85% on automated evaluation

### 6.2 Manual Rollback Steps

```
1. Identify the problematic version:
   SELECT * FROM prompt_versions
   WHERE prompt_id = 'ticket-classifier' AND status = 'active';

2. Identify the rollback target:
   SELECT * FROM prompt_versions
   WHERE prompt_id = 'ticket-classifier' AND status = 'deprecated'
   ORDER BY version DESC LIMIT 1;

3. Execute rollback:
   BEGIN;
   UPDATE prompt_versions SET status = 'rolled_back'
   WHERE prompt_id = 'ticket-classifier' AND status = 'active';

   UPDATE prompt_versions SET status = 'active'
   WHERE prompt_id = 'ticket-classifier' AND version = <target_version>;
   COMMIT;

4. Invalidate caches:
   NOTIFY prompt_cache_invalidation, 'ticket-classifier';

5. Verify:
   - Confirm active version in the registry
   - Check that live traffic is using the rolled-back version
   - Monitor error rate and cost for 30 minutes

6. Communicate:
   Post in #tokenops-alerts with:
   - What happened
   - Which version was rolled back
   - Impact assessment (users affected, cost impact)
```

### 6.3 Rollback SLA

| Severity | Detection → Rollback | Method |
|----------|---------------------|--------|
| Automated trigger | < 2 minutes | Automatic |
| P0 (user-facing issue) | < 15 minutes | Manual + automated support |
| P1 (quality degradation) | < 1 hour | Manual after investigation |
| P2 (cost increase) | < 4 hours | Manual after cost analysis |

---

## 7 · Cost Impact Analysis

After every prompt version change, measure the actual cost impact (not just the estimate).

### 7.1 Pre-Change Estimate

Generated automatically during CI (see Quality Gates, Section 5):

```
Prompt: ticket-classifier
Version: v11 → v12

Token Count:    350 → 280 tokens (-20.0%)
Est. Cost/Call: $0.000077 → $0.000062 (-19.5%)
Monthly Volume: 180,000 calls
Est. Monthly Savings: $2.70/month
```

### 7.2 Post-Change Measurement

Run this query 7 days after the new version reaches 100% traffic:

```sql
-- Compare cost metrics between prompt versions
WITH version_costs AS (
    SELECT
        prompt_version,
        COUNT(*)                                        AS request_count,
        AVG(input_tokens)                               AS avg_input_tokens,
        AVG(output_tokens)                              AS avg_output_tokens,
        AVG(estimated_cost_usd)                         AS avg_cost,
        SUM(estimated_cost_usd)                         AS total_cost,
        PERCENTILE_CONT(0.95) WITHIN GROUP
            (ORDER BY estimated_cost_usd)               AS p95_cost
    FROM llm_usage_log
    WHERE service = 'support_chatbot'
      AND feature = 'ticket-classifier'
      AND created_at >= CURRENT_DATE - INTERVAL '14 days'
    GROUP BY prompt_version
)
SELECT
    prompt_version,
    request_count,
    ROUND(avg_input_tokens)                             AS avg_input_tokens,
    ROUND(avg_output_tokens)                            AS avg_output_tokens,
    ROUND(avg_cost::numeric, 6)                         AS avg_cost_per_req,
    ROUND(total_cost::numeric, 2)                       AS total_cost,
    ROUND(p95_cost::numeric, 6)                         AS p95_cost
FROM version_costs
ORDER BY prompt_version;
```

### 7.3 Cost Impact Report Template

```
╔══════════════════════════════════════════════════════════╗
║         PROMPT COST IMPACT REPORT                       ║
╠══════════════════════════════════════════════════════════╣
║ Prompt:       ticket-classifier                         ║
║ Change:       v11 → v12                                 ║
║ Deployed:     2026-05-20                                ║
║ Analysis:     2026-05-27 (7-day window)                 ║
╠══════════════════════════════════════════════════════════╣
║                                                         ║
║  Metric           │ v11       │ v12       │ Δ           ║
║  ─────────────────┼───────────┼───────────┼───────────  ║
║  Avg input tokens │ 350       │ 282       │ -19.4%      ║
║  Avg output tokens│ 42        │ 38        │ -9.5%       ║
║  Avg $/request    │ $0.000077 │ $0.000060 │ -22.1%      ║
║  P95 $/request    │ $0.000120 │ $0.000095 │ -20.8%      ║
║  Quality (pass%)  │ 95.2%     │ 96.1%     │ +0.9pp      ║
║  Error rate       │ 0.3%      │ 0.2%      │ -0.1pp      ║
║                                                         ║
║  Projected Annual Savings: $36.72                       ║
║  Quality Impact: Neutral to positive                    ║
║  Recommendation: KEEP v12 as active version             ║
╚══════════════════════════════════════════════════════════╝
```

---

## 8 · Database Schema for Prompt Registry

```sql
-- ==========================================================================
-- TokenOps — Prompt Version Registry Schema
-- ==========================================================================
-- Tracks every prompt version and its lifecycle. Works alongside the main
-- llm_usage_log table, which references prompt_version in each request.
-- ==========================================================================

-- Prompt definitions (one row per logical prompt)
CREATE TABLE IF NOT EXISTS prompts (
    prompt_id           VARCHAR(64)     PRIMARY KEY,
    display_name        VARCHAR(256)    NOT NULL,
    description         TEXT,
    service             VARCHAR(128)    NOT NULL,
    feature             VARCHAR(128),
    owner               VARCHAR(128)    NOT NULL,
    cost_center         VARCHAR(32),
    primary_model       VARCHAR(64)     NOT NULL,
    fallback_model      VARCHAR(64),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Prompt versions (one row per version of each prompt)
CREATE TABLE IF NOT EXISTS prompt_versions (
    id                  BIGSERIAL       PRIMARY KEY,
    prompt_id           VARCHAR(64)     NOT NULL REFERENCES prompts(prompt_id),
    version             INTEGER         NOT NULL,
    content             TEXT            NOT NULL,
    content_hash        CHAR(64)        NOT NULL,  -- SHA-256
    status              VARCHAR(20)     NOT NULL DEFAULT 'draft'
                        CHECK (status IN (
                            'draft', 'testing', 'canary', 'active',
                            'deprecated', 'rolled_back'
                        )),
    author              VARCHAR(128)    NOT NULL,
    change_description  TEXT,
    parent_version      INTEGER,
    model               VARCHAR(64)     NOT NULL,
    token_count         INTEGER         NOT NULL,
    estimated_cost_per_call NUMERIC(10, 6),
    test_pass_rate      NUMERIC(5, 2),
    tags                JSONB           DEFAULT '{}',
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    promoted_at         TIMESTAMPTZ,
    deprecated_at       TIMESTAMPTZ,

    UNIQUE (prompt_id, version),
    UNIQUE (prompt_id, content_hash)
);

-- Indexes for common queries
CREATE INDEX idx_prompt_versions_status
    ON prompt_versions (prompt_id, status);

CREATE INDEX idx_prompt_versions_active
    ON prompt_versions (prompt_id)
    WHERE status = 'active';

CREATE INDEX idx_prompt_versions_created
    ON prompt_versions (created_at DESC);

-- Prompt test results (one row per test run)
CREATE TABLE IF NOT EXISTS prompt_test_runs (
    id                  BIGSERIAL       PRIMARY KEY,
    prompt_id           VARCHAR(64)     NOT NULL REFERENCES prompts(prompt_id),
    version             INTEGER         NOT NULL,
    run_type            VARCHAR(20)     NOT NULL
                        CHECK (run_type IN ('ci', 'shadow', 'canary', 'manual')),
    total_cases         INTEGER         NOT NULL,
    passed_cases        INTEGER         NOT NULL,
    failed_cases        INTEGER         NOT NULL,
    pass_rate           NUMERIC(5, 2)   NOT NULL,
    avg_input_tokens    NUMERIC(10, 2),
    avg_output_tokens   NUMERIC(10, 2),
    avg_cost_per_call   NUMERIC(10, 6),
    avg_latency_ms      NUMERIC(10, 2),
    results_json        JSONB,          -- Detailed per-case results
    triggered_by        VARCHAR(128),   -- CI commit hash or user
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    FOREIGN KEY (prompt_id, version)
        REFERENCES prompt_versions(prompt_id, version)
);

-- Prompt deployment events (audit trail)
CREATE TABLE IF NOT EXISTS prompt_deployments (
    id                  BIGSERIAL       PRIMARY KEY,
    prompt_id           VARCHAR(64)     NOT NULL REFERENCES prompts(prompt_id),
    from_version        INTEGER,
    to_version          INTEGER         NOT NULL,
    action              VARCHAR(20)     NOT NULL
                        CHECK (action IN (
                            'promote', 'rollback', 'canary_start',
                            'canary_expand', 'canary_abort'
                        )),
    traffic_pct         NUMERIC(5, 2),  -- % of traffic on new version
    triggered_by        VARCHAR(128)    NOT NULL,
    reason              TEXT,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    FOREIGN KEY (prompt_id, to_version)
        REFERENCES prompt_versions(prompt_id, version)
);

-- View: current active version for each prompt
CREATE OR REPLACE VIEW active_prompts AS
SELECT
    p.prompt_id,
    p.display_name,
    p.service,
    pv.version,
    pv.content,
    pv.content_hash,
    pv.token_count,
    pv.estimated_cost_per_call,
    pv.test_pass_rate,
    pv.author,
    pv.promoted_at
FROM prompts p
JOIN prompt_versions pv
    ON p.prompt_id = pv.prompt_id
    AND pv.status = 'active';
```

---

## 9 · CI/CD Pipeline Configuration

### 9.1 GitHub Actions Workflow

```yaml
# .github/workflows/prompt-ci.yaml
name: Prompt CI/CD

on:
  pull_request:
    paths:
      - 'prompts/**'
  push:
    branches: [main]
    paths:
      - 'prompts/**'

env:
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  PROMPT_REGISTRY_URL: ${{ secrets.PROMPT_REGISTRY_URL }}

jobs:

  # --------------------------------------------------
  # Job 1: Static checks (runs on every PR)
  # --------------------------------------------------
  static-checks:
    name: Static Checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Detect changed prompts
        id: changes
        run: |
          CHANGED=$(git diff --name-only ${{ github.event.before }} \
            ${{ github.sha }} -- 'prompts/' | \
            grep -oP 'prompts/\K[^/]+' | sort -u)
          echo "prompts=$CHANGED" >> $GITHUB_OUTPUT

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: pip install tiktoken pyyaml

      - name: Token count check
        run: |
          for prompt_dir in ${{ steps.changes.outputs.prompts }}; do
            python scripts/tokenize.py \
              --prompt "prompts/${prompt_dir}/prompt.md" \
              --config "prompts/${prompt_dir}/config.yaml" \
              --output token_report.json
          done

      - name: Cost estimate
        run: |
          for prompt_dir in ${{ steps.changes.outputs.prompts }}; do
            python scripts/cost_estimate.py \
              --prompt "prompts/${prompt_dir}/prompt.md" \
              --config "prompts/${prompt_dir}/config.yaml" \
              --compare-active
          done

      - name: Format validation
        run: |
          for prompt_dir in ${{ steps.changes.outputs.prompts }}; do
            python scripts/validate_format.py \
              --prompt "prompts/${prompt_dir}/prompt.md" \
              --config "prompts/${prompt_dir}/config.yaml"
          done

      - name: PII scan
        run: |
          for prompt_dir in ${{ steps.changes.outputs.prompts }}; do
            python scripts/pii_scan.py \
              --prompt "prompts/${prompt_dir}/prompt.md"
          done

      - name: Post PR comment with report
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const report = require('./token_report.json');
            const body = `## 📊 Prompt Change Report\n\n` +
              `| Metric | Current | Proposed | Delta |\n` +
              `|--------|---------|----------|-------|\n` +
              `| Token Count | ${report.active_tokens} | ${report.candidate_tokens} | ${report.delta_pct}% |\n` +
              `| Est. Cost/Call | $${report.active_cost} | $${report.candidate_cost} | ${report.cost_delta_pct}% |\n`;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: body
            });

  # --------------------------------------------------
  # Job 2: Evaluation (runs on PR, requires API calls)
  # --------------------------------------------------
  evaluation:
    name: Run Test Suite
    runs-on: ubuntu-latest
    needs: static-checks
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: pip install openai pyyaml

      - name: Run evaluation
        run: |
          for prompt_dir in ${{ steps.changes.outputs.prompts }}; do
            python scripts/run_eval.py \
              --prompt "prompts/${prompt_dir}/prompt.md" \
              --config "prompts/${prompt_dir}/config.yaml" \
              --tests "prompts/${prompt_dir}/tests/test_cases.yaml" \
              --eval-config "prompts/${prompt_dir}/tests/eval_config.yaml" \
              --output eval_results.json \
              --fail-under 95.0
          done

      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: eval-results
          path: eval_results.json

  # --------------------------------------------------
  # Job 3: Deploy (runs on merge to main)
  # --------------------------------------------------
  deploy:
    name: Register & Deploy
    runs-on: ubuntu-latest
    needs: [static-checks, evaluation]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4

      - name: Register new version
        run: |
          for prompt_dir in $(git diff --name-only HEAD~1 -- 'prompts/' | \
            grep -oP 'prompts/\K[^/]+' | sort -u); do
            python scripts/register_version.py \
              --prompt-dir "prompts/${prompt_dir}" \
              --registry-url "$PROMPT_REGISTRY_URL" \
              --author "${{ github.actor }}" \
              --commit "${{ github.sha }}"
          done

      - name: Start canary deployment
        run: |
          python scripts/deploy_canary.py \
            --registry-url "$PROMPT_REGISTRY_URL" \
            --traffic-pct 5 \
            --duration-hours 2

      - name: Notify
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "🚀 Prompt version deployed to canary (5% traffic).\nCommit: ${{ github.sha }}\nAuthor: ${{ github.actor }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 10 · Checklist: Setting Up Prompt Versioning

- [ ] Create the `prompts/` directory structure in your repo
- [ ] Write `config.yaml` for each prompt with model, owner, and quality requirements
- [ ] Build a test suite (`test_cases.yaml`) with ≥ 20 cases per prompt
- [ ] Deploy the prompt registry database schema (Section 8)
- [ ] Configure CI pipeline with static checks and evaluation jobs (Section 9)
- [ ] Set up canary deployment infrastructure in your LLM gateway
- [ ] Configure automated rollback triggers
- [ ] Train the team on the PR review process for prompt changes
- [ ] Schedule monthly prompt optimization reviews (use the Monthly Cost Review template)

---

*Template version 1.0 — Maintained by the TokenOps team.*
