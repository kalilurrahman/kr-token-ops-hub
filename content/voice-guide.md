# Voice Guide

One page. Applies to everything a buyer or prospect reads: the Handbook, trend briefings, marketing pages, emails, changelog entries, receipts. Written for the person doing the writing — you.

## The voice

**Direct.** Say what you mean in the first sentence. If a paragraph has a "however," check that the "however" isn't the actual point.

**Practitioner-first.** Every claim is grounded in something a reader can act on: a formula they can plug into, a config they can copy, a number from `data/pricing.json`. Not "prompt caching can be effective" — "prompt caching cuts repeated-context input cost by up to 90% on GPT-5 and DeepSeek V3.2; break-even happens after ~10 reuses on Anthropic's 1-hour cache." Numbers must come from the pricing dataset or be labeled illustrative.

**Opinionated.** The reader is paying for judgment. Choose. "Route classification traffic to GPT-5 Nano" beats "consider routing classification traffic to a smaller model." Where two options are genuinely close, say what tips it: "Anthropic if long stable prefixes, DeepSeek if the workload is embarrassingly parallel."

**Second person.** "You" — one reader at a time. Not "engineers," not "practitioners," not "one." "Teams" is acceptable when talking about org-level outcomes.

**No hedging filler.** Cut on sight: _just_, _simply_, _basically_, _actually_, _really_, _very_, _quite_, _arguably_, _perhaps_, _some_, _many_, _typically_ (unless it modifies a real number), "it's important to note," "worth mentioning," "the fact that," "in order to." A search that finds any of these is a mandatory revision — usually into a shorter, better sentence.

**Ranges only with conditions.** "20–50% savings" alone is category filler. "20–50% savings when the system prompt is ≥1K tokens, cache hit rate ≥60%, and cache-write surcharges land in your favor" is content.

## The mechanics

- **US English.** organize, optimization, catalog.
- **Numbers.** `$1.25/M` tokens (never `$1.25/1M`, never `$0.00000125/token`). Dollar amounts under $10,000 spelled with commas ($1,500), above spelled compactly ($45k, $2M). Percentages as `20%`, not `20 percent`.
- **Code identifiers** in backticks: `data/pricing.json`, `increment_uses_count`, `POST /v1/customer-portal/license-keys/activate`.
- **Provider + model names** exactly as they appear on the provider's own pricing page: `GPT-5`, `Claude Opus 4.5`, `Gemini 3 Pro`, `DeepSeek V3.2`.
- **Links** inline in prose, not footnoted, unless it's a claims-hygiene citation to a provider pricing page or a comp.
- **Headings** in sentence case, not title case. "Prompt caching economics," not "Prompt Caching Economics."
- **One space** after periods.
- **Serial comma** on.

## What we do NOT do

- **No emoji.** Not in prose, not in headings, not in tables.
- **No "As you can see."** The reader has eyes.
- **No "In this section, we will."** Just do it.
- **No aggregate savings claims without a source.** The banned pattern: _"teams typically cut LLM spend by 30–60%."_ We have no primary data for that — replace with the mechanism it references (prompt caching, model routing, batch API) tied to a provider-documented rate.
- **No screenshotted terminal output** we can't reproduce. If we cite a benchmark, the harness ships in the companion repo.
- **No em-dashes as sentence connectors** where a period works — but freely as pause or aside, like this one. If a sentence has two em-dashes and neither could be a comma or parenthesis, one of them is wrong.
- **No AI-model self-references.** The words _AI-generated_, _LLM-drafted_, _Claude_, _GPT_, _ChatGPT_ appear only as subjects of a sentence about a product, never as the voice of one.

## The three-question edit

Before shipping any 500+ word piece, answer these in one sentence each:

1. **Who is this for?** (One persona. If more than one, split it.)
2. **What does this tell them they didn't already know?** (If the answer is "nothing," delete it.)
3. **What action can they take before end of day?** (If "none," add one.)

If any answer is longer than one sentence, the piece isn't focused enough yet.
