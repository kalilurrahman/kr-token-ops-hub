# Token Cost Incident Response Runbook

**Version:** 1.0  
**Last Updated:** May 2026  
**Owner:** TokenOps / Platform Engineering  
**Review Cadence:** Quarterly

---

## Purpose

This runbook provides a structured response procedure for incidents where LLM token consumption or cost exceeds expected thresholds. Token cost incidents differ from traditional infrastructure incidents because they often lack visible user impact while generating significant financial exposure. This runbook ensures consistent detection, triage, containment, and resolution.

---

## 1. Incident Classification

### Severity Levels

| Severity | Trigger Condition | Example | Response Time | Escalation |
|----------|-------------------|---------|---------------|------------|
| **P1 — Critical** | > 200% of daily budget **OR** projected monthly overage > $50K | Runaway loop consuming $10K/hr; compromised API key | **15 min** | VP Eng + Finance immediately |
| **P2 — Major** | 150–200% of daily budget **OR** projected monthly overage $10K–$50K | Prompt regression doubling token usage; model misconfiguration after deploy | **30 min** | Eng Manager + FinOps within 1 hr |
| **P3 — Moderate** | 120–150% of daily budget **OR** single service spike > 200% of its baseline | Upstream traffic surge; cache miss rate spike; new feature launch without cost review | **2 hr** | Team lead within 4 hr |
| **P4 — Low** | 100–120% of daily budget **OR** gradual upward trend over 5+ days | Slow prompt drift; seasonal traffic increase; context window creep | **Next business day** | Review in weekly TokenOps standup |

### Auto-Classification Rules

```yaml
# Alert rule pseudocode — integrate with your monitoring platform
rules:
  - name: p1_cost_spike
    condition: daily_spend > (daily_budget * 2.0) OR hourly_spend > (hourly_budget * 5.0)
    severity: P1
    channels: [pagerduty, slack-tokenops-critical, sms-oncall]

  - name: p2_cost_elevated
    condition: daily_spend > (daily_budget * 1.5) AND daily_spend <= (daily_budget * 2.0)
    severity: P2
    channels: [slack-tokenops-alerts, email-eng-manager]

  - name: p3_service_spike
    condition: service_hourly_spend > (service_hourly_baseline * 2.0)
    severity: P3
    channels: [slack-tokenops-alerts]

  - name: p4_trend_drift
    condition: rolling_7d_avg > (rolling_30d_avg * 1.2)
    severity: P4
    channels: [slack-tokenops-digest]
```

---

## 2. Detection & Alerting

### 2.1 Detection Sources

| Source | What It Detects | Latency | Tool Example |
|--------|-----------------|---------|--------------|
| LLM Gateway metrics | Per-request cost, token volume anomalies | Real-time | LiteLLM, custom proxy |
| Cost monitoring platform | Budget threshold breaches | 1–5 min | Datadog, Grafana, New Relic |
| Provider billing API | Invoice-level spend anomalies | 15–60 min | OpenAI Usage API, Anthropic Console |
| Automated anomaly detection | Statistical outliers in spend patterns | 5–15 min | Custom ML model, CloudWatch Anomaly |
| Manual observation | Dashboard review, invoice review | Hours–days | Weekly cost review meeting |

### 2.2 Alert Routing

| Severity | Primary Channel | Secondary Channel | Acknowledge SLA |
|----------|----------------|-------------------|-----------------|
| P1 | PagerDuty (on-call rotation) | Slack #tokenops-critical + SMS | 5 min |
| P2 | Slack #tokenops-alerts | Email to eng-manager | 15 min |
| P3 | Slack #tokenops-alerts | Jira ticket auto-created | 1 hr |
| P4 | Slack #tokenops-digest (daily) | Weekly review agenda | Next standup |

### 2.3 Alert Content Template

Every alert should include:

```
🚨 [SEVERITY] Token Cost Alert — [SERVICE NAME]

Current hourly spend:    $X,XXX  (budget: $XXX)
Current daily spend:     $XX,XXX (budget: $X,XXX)
Projected monthly:       $XXX,XXX (budget: $XX,XXX)
Overage:                 XXX% above budget

Top consumers:
  1. [service/feature] — $X,XXX (XX% of total)
  2. [service/feature] — $X,XXX (XX% of total)
  3. [service/feature] — $X,XXX (XX% of total)

Spike started:           HH:MM UTC
Duration:                X hours
Runbook:                 [link to this document]
Dashboard:               [link to cost dashboard]
```

---

## 3. Triage Checklist (First Responder)

The on-call engineer or FinOps analyst who acknowledges the alert should complete these steps:

### Immediate (0–15 minutes)

- [ ] **Acknowledge** the alert in PagerDuty / Slack
- [ ] **Open the cost dashboard** — identify which service(s) / feature(s) are spiking
- [ ] **Verify it's real** — rule out monitoring false positives (check provider dashboard)
- [ ] **Check for known causes** — recent deployments, scheduled batch jobs, marketing campaigns
- [ ] **Assess blast radius** — is spend accelerating, stable, or decelerating?
- [ ] **Classify severity** — confirm or reclassify P1/P2/P3/P4 based on current data
- [ ] **Start incident channel** — for P1/P2, create `#inc-token-cost-YYYYMMDD` in Slack

### Context Gathering (15–30 minutes)

- [ ] **Pull deployment history** — any releases in the last 24 hours to affected services?
- [ ] **Check traffic volume** — is the call volume up, or is per-call cost up?
- [ ] **Check model usage** — has a model been changed or misconfigured?
- [ ] **Check prompt changes** — has the system prompt been modified recently?
- [ ] **Check cache hit rate** — has caching stopped working?
- [ ] **Check error/retry rate** — are retries spiking?
- [ ] **Check upstream sources** — is an upstream system flooding requests?

### Decision Point

Based on triage findings, proceed to the appropriate investigation path:

| Finding | Go To |
|---------|-------|
| Runaway loop / infinite recursion | §4.1 |
| Prompt regression / context bloat | §4.2 |
| Model misconfiguration | §4.3 |
| Upstream volume spike | §4.4 |
| Cache failure | §4.5 |
| Compromised credentials | §4.6 |
| Unknown / unclear | §4.7 |

---

## 4. Investigation Paths

### 4.1 Runaway Loop / Infinite Recursion

**Symptoms:** Exponentially growing request count from a single service; identical or near-identical prompts repeating; agent tool-calling loops.

**Investigation Steps:**

1. Query gateway logs for the affected service — look for repeated request patterns
   ```sql
   SELECT request_hash, COUNT(*) as call_count, SUM(total_tokens) as tokens
   FROM llm_requests
   WHERE service = '<service>' AND timestamp > NOW() - INTERVAL '1 hour'
   GROUP BY request_hash
   ORDER BY call_count DESC
   LIMIT 20;
   ```
2. Check agent orchestration logs for circular tool calls
3. Inspect retry logic — is a failing validation causing infinite retry?
4. Check for recursive prompt chains (LLM output fed back as input)

**Containment:** Kill switch on the specific service endpoint (see §5.1)

### 4.2 Prompt Regression / Context Bloat

**Symptoms:** Per-request token count has increased significantly; total call volume is normal; recent prompt or RAG configuration change.

**Investigation Steps:**

1. Compare current average tokens/request vs. 7-day baseline
   ```sql
   SELECT
     DATE(timestamp) as day,
     AVG(input_tokens) as avg_input,
     AVG(output_tokens) as avg_output,
     AVG(input_tokens + output_tokens) as avg_total
   FROM llm_requests
   WHERE service = '<service>' AND timestamp > NOW() - INTERVAL '14 days'
   GROUP BY DATE(timestamp)
   ORDER BY day;
   ```
2. Pull the current system prompt — compare to last known-good version in version control
3. Check RAG retrieval settings — number of chunks, similarity threshold, max context size
4. Check conversation history management — is sliding window / summarization working?
5. Review `max_tokens` parameter — was it removed or increased?

**Containment:** Roll back prompt / config to previous version (see §5.2)

### 4.3 Model Misconfiguration

**Symptoms:** Requests being routed to a more expensive model than intended; model field shows unexpected value in logs.

**Investigation Steps:**

1. Check model routing configuration in the LLM gateway
2. Review recent configuration deploys or feature flag changes
3. Verify A/B test populations — is a test sending 100% traffic to a frontier model?
4. Check for hardcoded model overrides in application code

**Containment:** Force model override at the gateway level (see §5.3)

### 4.4 Upstream Volume Spike

**Symptoms:** Per-request cost is normal; total request volume has spiked; upstream system is sending more traffic.

**Investigation Steps:**

1. Check upstream service metrics — API call volume, user traffic, batch job schedules
2. Verify rate limits are in place and functioning
3. Check if a marketing campaign, product launch, or viral event is driving traffic
4. Determine if the spike is temporary (campaign) or permanent (growth)

**Containment:** Enforce rate limits at the gateway (see §5.4)

### 4.5 Cache Failure

**Symptoms:** Cache hit rate has dropped significantly; total API calls to LLM provider have increased; cached results are not being served.

**Investigation Steps:**

1. Check cache infrastructure health (Redis, pgvector, Pinecone)
2. Verify cache TTL settings haven't been changed
3. Check if a deployment cleared the cache
4. Verify similarity threshold hasn't been increased (fewer cache hits)
5. Check for cache key format changes that invalidate existing entries

**Containment:** Fix cache infrastructure; temporarily lower similarity threshold

### 4.6 Compromised Credentials

**Symptoms:** Requests from unknown IPs or user agents; requests to unusual models; traffic patterns that don't match normal usage.

**Investigation Steps:**

1. Check API key usage by IP address and user agent
2. Review access logs for the management console
3. Verify API keys haven't been exposed in public repositories
4. Check for unauthorized key creation

**Containment:** Rotate all API keys immediately (see §5.5)

### 4.7 Unknown Root Cause

**Symptoms:** None of the above patterns match clearly.

**Investigation Steps:**

1. Widen the analysis window — compare last 30 days of data
2. Segment by every available dimension (team, service, feature, model, environment)
3. Look for correlation with external events (provider outage, API behavior change)
4. Engage the vendor's support team with specific timestamps and request IDs
5. Escalate to P2 if projected overage exceeds $10K

---

## 5. Remediation Actions

### 5.1 Kill Switch — Disable Service Endpoint

**When:** Runaway loop or uncontrolled spend acceleration. P1 only.

```bash
# Gateway-level kill switch (example: LiteLLM)
litellm --disable-endpoint <service_name>

# Feature flag (example: LaunchDarkly)
ldcli flags update --project tokenops --flag <feature-flag> --off

# Direct API key disable (last resort)
# Revoke the API key via provider dashboard — affects ALL services on that key
```

**Rollback:** Re-enable after root cause is fixed and verified in staging.

### 5.2 Rollback — Revert Prompt or Configuration

```bash
# Revert prompt configuration to last known-good
git log --oneline prompts/<service>/
git checkout <commit-hash> -- prompts/<service>/system_prompt.txt
# Deploy via normal CI/CD with expedited review
```

### 5.3 Model Override — Force Cheaper Model at Gateway

```yaml
# Emergency gateway override
overrides:
  - service: <service_name>
    force_model: "gpt-4o-mini"    # Override to cheaper model
    reason: "Cost incident INC-2026-0527"
    expires: "2026-05-28T00:00:00Z"
```

### 5.4 Rate Limit — Throttle Request Volume

```yaml
# Emergency rate limit
rate_limits:
  - service: <service_name>
    requests_per_minute: 100       # Reduced from normal 1000
    tokens_per_minute: 500000      # Hard cap
    reason: "Cost incident INC-2026-0527"
```

### 5.5 Credential Rotation

1. Generate new API keys via provider dashboard
2. Update secrets in vault / environment variables
3. Deploy key rotation to all affected services
4. Revoke old keys
5. Audit access logs for the compromised key period

---

## 6. Communication Templates

### 6.1 P1 — Initial Alert (Slack)

```
🔴 P1 TOKEN COST INCIDENT — [SERVICE NAME]

Status: INVESTIGATING
Incident Commander: @[name]
Started: HH:MM UTC

Impact: Token spend is at XXX% of daily budget ($XX,XXX vs. $X,XXX budget).
        Projected monthly overage: $XXX,XXX.

Actions taken:
• [Kill switch activated / Rate limit applied / Investigation underway]

Next update: 30 minutes
Thread: Follow this thread for updates
Runbook: [link]
```

### 6.2 P1 — Containment Update

```
🟡 P1 TOKEN COST INCIDENT — UPDATE

Status: CONTAINED
Root cause: [brief description]

Containment actions:
• [Actions taken with timestamps]

Current spend rate: $XXX/hr (down from $X,XXX/hr peak)
Estimated total incident cost: $XX,XXX

Next steps:
• [Permanent fix in progress — ETA HH:MM UTC]

Next update: 60 minutes
```

### 6.3 P1 — Resolution

```
🟢 P1 TOKEN COST INCIDENT — RESOLVED

Duration: X hours Y minutes
Total incident cost: $XX,XXX above budget
Root cause: [description]

Resolution:
• [What was done to fix it]

Prevention:
• [What will prevent recurrence]

Post-incident review: Scheduled for [date/time]
PIR document: [link]
```

### 6.4 P2/P3 — Alert

```
🟠 P[2/3] Token Cost Alert — [SERVICE NAME]

Spend is at XXX% of daily budget for [service].
Cause: [known/investigating]
Owner: @[name]
Action: [description]
ETA: [when this will be resolved]
```

### 6.5 Executive Summary (for P1/P2, email)

```
Subject: Token Cost Incident Summary — [DATE]

Executive Summary:
On [date], [service] experienced a token cost spike reaching [X]% of daily
budget over [duration]. The root cause was [brief description]. The incident
was contained within [time] and fully resolved at [time].

Financial Impact:
• Total excess spend: $XX,XXX
• Annualized risk if undetected: $XXX,XXX
• Budgeted monthly spend: $XX,XXX

Root Cause: [2-3 sentences]

Remediation: [2-3 sentences on permanent fix]

Prevention Measures: [numbered list of changes being implemented]

Next Steps: Post-incident review on [date]. Updated guardrails deployed by [date].
```

---

## 7. Post-Incident Review (PIR) Template

Complete within **3 business days** of incident resolution (P1/P2) or **1 week** (P3).

### Incident Metadata

| Field | Value |
|-------|-------|
| Incident ID | INC-YYYY-MMDD-### |
| Severity | P__ |
| Duration | |
| Detection method | |
| Time to detect | |
| Time to contain | |
| Time to resolve | |
| Incident Commander | |
| Total excess cost | $ |

### Timeline

| Time (UTC) | Event |
|------------|-------|
| HH:MM | [Triggering event — e.g., deploy, config change, traffic spike] |
| HH:MM | Alert fired |
| HH:MM | Alert acknowledged by [name] |
| HH:MM | Incident classified as P__ |
| HH:MM | Root cause identified |
| HH:MM | Containment action taken |
| HH:MM | Permanent fix deployed |
| HH:MM | Incident resolved |

### Root Cause Analysis

**What happened:**  
[Detailed technical description]

**Why it happened:**  
[5 Whys analysis]

1. Why did spend spike? → [answer]
2. Why did [answer above] occur? → [answer]
3. Why did [answer above] occur? → [answer]
4. Why did [answer above] occur? → [answer]
5. Why did [answer above] occur? → [root cause]

**Contributing factors:**

- [ ] Missing guardrails (no budget limit / rate limit)
- [ ] Configuration change without cost review
- [ ] Monitoring gap (alert didn't fire or fired too late)
- [ ] Insufficient testing (no cost impact test in staging)
- [ ] Documentation gap (runbook missing or outdated)
- [ ] Process gap (no approval required for this type of change)

### Action Items

| # | Action | Owner | Priority | Due Date | Status |
|---|--------|-------|----------|----------|--------|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

---

## 8. Prevention Measures

### 8.1 Guardrails Checklist

Verify these guardrails are in place for every service consuming LLM tokens:

- [ ] **Budget limits** — Daily and monthly spend caps configured at gateway level
- [ ] **Rate limits** — RPM and TPM limits set per service and per feature
- [ ] **Max tokens per request** — `max_tokens` parameter set on every API call
- [ ] **Model allowlist** — Services can only use approved models
- [ ] **Cost alerts** — Alerts configured for 80%, 100%, 120%, 150%, 200% of budget
- [ ] **Kill switch** — Documented and tested procedure to disable any service endpoint
- [ ] **Prompt version control** — All system prompts stored in Git with review required

### 8.2 Process Guardrails

- [ ] **Cost impact review** — Every PR that modifies prompts, models, or LLM config includes estimated cost impact
- [ ] **Staging cost test** — Run cost estimation in staging before production deploy
- [ ] **Change approval** — Model changes and prompt changes require TokenOps lead sign-off
- [ ] **Batch job limits** — All batch jobs have maximum token budget; job aborts if exceeded
- [ ] **New feature cost review** — All new LLM-powered features go through cost review before launch

### 8.3 Monitoring Improvements

After each incident, evaluate whether these monitoring capabilities need to be added or improved:

- [ ] Per-service spend anomaly detection (statistical, not just threshold)
- [ ] Per-request token count anomaly detection (catch prompt bloat early)
- [ ] Cache hit rate monitoring with alerts on degradation
- [ ] Model routing verification (alert if requests go to unexpected model)
- [ ] Retry rate monitoring (catch retry storms)
- [ ] Correlation with deployment events (automatic flag on spend change post-deploy)

---

## Appendix A: On-Call Rotation

| Week | Primary On-Call | Secondary On-Call | Escalation Manager |
|------|----------------|-------------------|---------------------|
| Current | | | |
| Next | | | |

**On-call responsibilities:**
- Monitor #tokenops-alerts Slack channel
- Respond to PagerDuty alerts within SLA
- Execute this runbook for any triggered incident
- Escalate per severity matrix
- Update incident channel with status every 30 min (P1) or 2 hr (P2)

## Appendix B: Key Contacts

| Role | Name | Slack | Phone |
|------|------|-------|-------|
| TokenOps Lead | | | |
| Platform Eng Manager | | | |
| FinOps Lead | | | |
| VP Engineering | | | |
| Finance Director | | | |
| Provider Account Manager | | | |

## Appendix C: Quick Reference Links

| Resource | URL |
|----------|-----|
| Cost Dashboard | |
| LLM Gateway Admin | |
| Provider Usage Dashboard | |
| Alert Configuration | |
| Prompt Repository | |
| Budget Guardrails Config | |
| Incident Tracker | |

---

*Template from the TokenOps Atlas — [tokenops-atlas](https://github.com/kalilurrahman/tokenops-atlas)*
