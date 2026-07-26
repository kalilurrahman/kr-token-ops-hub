# Editorial Checklist

Every piece a buyer or prospect reads passes this before shipping. Ten items, ~5 minutes end to end. Items 1–4 are the D6 quality gate the strategy makes launch-blocking.

## Quality gate (launch-blocking, per docs/premium-strategy/01)

- [ ] **One pricing source of truth.** Every `$/M` figure in the piece traces to `data/pricing.json` (either quoted directly, computed from a formula whose inputs come from the dataset, or explicitly labeled a stable illustrative constant). No hand-typed price outside `data/pricing.json` and its generated outputs.
- [ ] **No invented number presented as measurement.** Every quantitative claim is either sourced (link or dataset row), computed (formula shown, machine-checked in `scripts/check-math.mjs`), or labeled "illustrative scenario, not measured data."
- [ ] **Arithmetic machine-checked.** Every worked example lives in `scripts/check-math.mjs`. New examples add new assertions before the piece ships.
- [ ] **Dated stamps are true.** The only "reviewed" or "verified" dates that appear are ones set by an actual review that happened on that date — `verified_date` on a `pricing.json` row, or the changelog entry for a dataset refresh. No `Last updated: {month}` header hand-typed at the top of a file.

## Voice pass (per `content/voice-guide.md`)

- [ ] **Hedging filler search.** `grep -inE '\b(just|simply|basically|actually|really|very|quite|arguably|perhaps|in order to|the fact that|worth mentioning|it (is|'"'"'s) important to note)\b'` returns zero matches — or every match is intentional and defensible.
- [ ] **Ranges have conditions.** Every "X–Y%" savings claim states the conditions under which the range holds. Bare ranges are edited or cut.
- [ ] **Second person.** The reader is addressed as "you," not as "engineers," "teams," or "practitioners" (except when discussing org-level outcomes).
- [ ] **No banned phrases.** Zero "In this section, we will," zero "As you can see," zero emoji, zero AI-model self-references outside sentences that are literally about the model as a product.

## The three-question edit (per `content/voice-guide.md`)

- [ ] **Who is this for?** — answerable in one sentence, one persona.
- [ ] **What does it tell them they didn't already know?** — one sentence, non-obvious.
- [ ] **What can they do before end of day?** — one concrete action.

## Claims-hygiene rule (marketing surfaces only)

- [ ] **Every savings percentage carries the results disclaimer.** The exact wording is fixed in `docs/premium-strategy/05-operations-legal-sustainability.md` §4.3; add it inline where it appears, don't just link to a legal page.

## Sign-off

Piece ships only when all boxes above are checked. If any box can't be checked, note why in the commit message — that becomes the record of the exception.
