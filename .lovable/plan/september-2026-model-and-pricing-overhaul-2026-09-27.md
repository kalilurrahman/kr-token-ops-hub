# September 2026 model and pricing overhaul

## Outcome
Replace the dated May/July model picture with a source-backed September 2026 catalogue supporting both reference reading and realistic cost calculation.

## What will change

### Model and pricing data
- Refresh the central pricing dataset from official provider and model sources, with a visible 27/09/2026 review date.
- Cover current proprietary frontier, balanced, and economy tiers across OpenAI, Anthropic, Google, and relevant hosted providers.
- Expand coverage across major open-weight and genuinely open-source families, clearly labelling the distinction.
- Record context limits, public input/output/cache rates, licence or access model, deployment mode, source URL, and verification date.
- Retain older entries only when useful, labelling superseded models instead of presenting them as current defaults.

### Calculators and comparison
- Feed current hosted API rates into every calculator through the central dataset.
- Add model selectors so RAG and routing scenarios can use catalogue values without manual transcription.
- Add a self-hosted model economics calculator covering accelerator cost, utilisation, throughput, replicas, operational overhead, and hosted-model break-even volume.
- Expand the model comparison view with proprietary, open-weight, and open-source filters plus deployment and licensing guidance.
- Date volatile prices and explain that hosted open-model rates vary by inference provider.

### Curated reference content
- Add an “Open models in TokenOps” guide covering licences, weights versus source openness, hosting, quantisation, batching, throughput, infrastructure cost, governance, and evaluation.
- Add an updated model-landscape briefing and practical selection checklist with authoritative links.
- Register and bundle the new articles so Read opens them in-app and users can bookmark them.

## Technical details
- Keep `data/pricing.json` as the single source of truth and extend its fields instead of duplicating prices in pages.
- Update the generator so reference tables expose model type, deployment, licence, and dated sources; regenerate public and bundled copies together.
- Add focused calculation utilities and tests for hosted request cost, self-hosted monthly cost, unit cost, and break-even volume.
- Preserve current themes, navigation, reading lists, AI adviser, disclaimers, and privacy rules; no accounts, tracking, or unrelated redesign.
- Record the expanded pricing-data contract in the project architecture notes.

## Validation
- Run lint, strict TypeScript checks, calculation tests, and the pricing consistency checker.
- Verify calculator outputs against independent calculations.
- Test the models, calculator, library, and reader at desktop and mobile widths with no horizontal overflow.
- Confirm every factual model entry has a dated authoritative source and no unverified claim is presented as fact.
