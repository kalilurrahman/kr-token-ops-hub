# Token Pricing Changelog

Public, verifiable proof-of-life for the [TokenOps living pricing dataset](./pricing.json). One entry per changed field, oldest at the bottom. **"No change" lines are intentional** — they distinguish _reviewed and stable_ from _not looked at_.

The site's calculators, guide tables, and every published pricing figure render from `data/pricing.json`; changes here propagate on the next deploy. Pipeline and SLA in [`data/README.md`](./README.md).

---

## 2026-07-26 · v2026.07 — Initial published dataset

Baseline established. All figures verified against provider pages today; every model row in `pricing.json` carries `verified_url` and `verified_date=2026-07-26`.

- **OpenAI** · GPT-5 $1.25 / $10 (cached $0.125), GPT-5 Mini $0.25 / $2, GPT-5 Nano $0.05 / $0.40, o3 $2 / $8 · <https://openai.com/api/pricing>
- **Anthropic** · Claude Opus 4.5 $5 / $25 (cached $0.50, 5-min write $6.25, 1-hr write $10), Claude Sonnet 5 $2 / $10 introductory (reverts to $3 / $15 after 2026-08-31), Claude Haiku 4.5 $1 / $5 · <https://www.anthropic.com/pricing>
- **Google** · Gemini 3 Pro $2 / $12 (≤200K ctx) — $3.50 / $14 (>200K), Gemini 2.5 Flash $0.15 / $0.60 (≤200K) — $0.30 / $1.80 (>200K), Gemini 2.0 Flash Lite $0.075 / $0.30 · <https://ai.google.dev/pricing>
- **DeepSeek** · V3.2 $0.28 / $0.42 (cached $0.028) · <https://api-docs.deepseek.com/quick_start/pricing>
- **Meta Llama (hosted)** · Llama 4 Scout $0.15 / $0.40 (10M ctx), Llama 4 Maverick $0.35 / $1.40 (1M ctx) · <https://www.together.ai/pricing>
- **Mistral** · Mistral Large $2 / $6, Mistral Medium $0.40 / $1.20 · <https://mistral.ai/products>

**Retired from the corpus** as part of the pricing consolidation:
- `public/templates/token-pricing-reference.md` and `public/library/references/provider-comparison-matrix.md` are now generated snapshots of this dataset — do not hand-edit.
- The `providerPresets` and `modelPricingData` tables in `src/tokenops/data.ts`, and the `PRESETS` and `MODELS` tables in `src/routes/hub.tsx`, now import from `data/pricing.json`.
- `src/tokenops/guide.md` Appendix A retired in favor of a pointer to this dataset.

Verified stable this cycle (no change): none — this is the initial baseline.
