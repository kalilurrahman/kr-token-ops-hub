# The TokenOps Pricing Dataset

`data/pricing.json` is the **single source of truth** for every LLM price on this site. It powers the calculators (`src/routes/calculator.tsx`, `src/routes/hub.tsx`), the tables in the guide's appendix, and the two provider-comparison markdown files (which are now regenerated snapshots — do not hand-edit).

If a price is quoted anywhere and doesn't trace back to this file, that's a bug.

## The SLA (published on the product page)

> **Reviewed monthly. Provider pricing changes reflected within 7 days of the provider's announcement. Every figure carries a verification date and a source link.**

Two intentional properties: _reviewed monthly_ is achievable solo forever; _within 7 days_ covers off-cycle major changes without promising real-time monitoring. Enterprise / negotiated / self-hosted pricing is explicitly out of scope.

## The pipeline (≈3–4 hrs/month, per the strategy's ops budget)

1. **Diff** the current [LiteLLM `model_prices_and_context_window.json`](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json) against last month's archived snapshot. LiteLLM is a community-maintained early-warning feed — it is _not_ trusted blind.
2. For every diff that touches a tracked model, open the **provider's own pricing page** (URLs live in each `pricing_url` field), confirm the number, and note today's date.
3. Update the model's row in `pricing.json`; each row carries `verified_url` and `verified_date`.
4. Append the changes to [`pricing-changelog.md`](./pricing-changelog.md) in the format `YYYY-MM-DD · Provider · Model field old → new · source_url`. Add a `No change: <providers> (verified)` line for providers that were reviewed and stable.
5. Commit + deploy. The site, calculators, and the two regenerated reference files all update atomically.
6. Send the Token Price Watch newsletter (Kit) with the changelog snippet.

Off-cycle hotfix (headline provider change mid-month): steps 2–5 only, ~1 hour.

## Regenerating derived files

Run `node scripts/gen-pricing-tables.mjs` after editing `pricing.json`. It rewrites:

- `public/templates/token-pricing-reference.md` (front-matter warning + auto tables)
- `public/library/references/provider-comparison-matrix.md` (same)
- `src/tokenops/documents.json` entries for the two files above

`scripts/check-math.mjs` validates the JSON shape and cross-checks every price the guide quotes.

## Anti-patterns (what caused the audit findings)

- **Never** hand-type a `$X/M` figure in markdown, `.ts`, or `.tsx`. If you're about to, add a helper that reads the field from `pricing.json` instead.
- **Never** claim "Last reviewed: {month}" on a file whose numbers weren't actually re-checked that month. Only `verified_date` on the row you actually looked at.
- **Never** delete a `No change: … (verified)` line to keep the changelog short. The absence of that line is the signal.
