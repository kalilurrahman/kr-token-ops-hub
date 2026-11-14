# LLM Wiki: maintained knowledge, not repeated context

Reviewed 14/11/2026. LLM Wiki is a knowledge-maintenance pattern, not a model, a guaranteed factual database, or a replacement for all retrieval.

## The architecture

An agent reads immutable raw sources and maintains linked Markdown pages: source summaries, entities, concepts, comparisons and indexes. A schema or instruction file defines the conventions. Ingest adds or revises pages; query reads relevant pages and cites evidence; lint finds missing citations, stale links and contradictions.

| Layer | Ownership | Control |
|---|---|---|
| Raw sources | Human-controlled, immutable | Provenance, licence, access policy and retention |
| Wiki pages | Agent-maintained, reviewed | Citation spans, source date, version history and change approval |
| Instructions | Human-approved | Structure, ingestion rules, review gates and rollback |

## LLM Wiki versus RAG

RAG retrieves source chunks at query time. A wiki pays for synthesis earlier and can reuse smaller, curated pages later. Combine them: use the wiki for stable concepts, retrieval for exact quotations and newly changed facts. Highly dynamic, legally sensitive or precision-critical content should keep direct source retrieval and expert review. Never discard originals after summarization.

## Amortization, not free memory

Let Q be monthly questions, Tr raw context tokens, Tw wiki context tokens and P input price. Include amortized maintenance M: ingestion and revisions, generation, linting, storage, retrieval and human review.

Baseline input spend = Q × Tr × P / 1,000,000.

Wiki spend = Q × Tw × P / 1,000,000 + M.

Break-even queries = M / ((Tr − Tw) × P / 1,000,000), only if the denominator is positive.

Illustrative values: 10,000 questions, 10,000 raw tokens, 2,000 wiki tokens and $2/M input imply $200 baseline and $40 wiki query input. With $100 monthly maintenance, the total is $140 and break-even is 6,250 queries. Equal output costs cancel in this narrow comparison; differing output, cache hits or tools require separate modelling. Low query volumes or frequent source changes can make the wiki more expensive.

## A disciplined operating loop

1. Record each source's owner, access scope, date and checksum before ingestion.
2. Revise only pages affected by changed evidence; cap page fan-out and agent iterations.
3. Link claims to source passages, distinguish facts from synthesis and preserve contradictions.
4. Run bounded lint checks for orphan pages, unsupported assertions and obsolete references.
5. Require review for high-impact changes and retain a reversible revision history.
6. Query within the caller's original source permissions; a summary must never widen access.
7. Track cost per accepted answer, source freshness, citation support, correction rate and review time.

## Failure modes

Summary drift can compound across repeated rewrites. A polished synthesis can hide weak evidence. Malicious source text can inject instructions into ingestion agents. Use source content as data, separate instructions from evidence, and prohibit autonomous publication or tool permissions inferred from document text. A deleted source also requires checking every derived page for retention and access obligations.

## Source

- [LLM wiki: pattern, RAG differences and maintenance costs — November 2026](https://crowllmwiki.com/llm-wiki/)

This source describes the April 2026 Karpathy idea; the original gist was not independently retrieved during this update. Treat this as a source-backed architecture briefing, not a certified implementation standard.
