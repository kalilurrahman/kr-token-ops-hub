# Spec: KR Library collections

The KR Library (`kr-library.kalilurrahman.com`; the old `industrybizcapability.kalilurrahman.com` and `kr-products.kalilurrahman.com` redirect to it with the path kept; project "IndustryPrompt Hub") becomes the one home for prompts, skills, capability models and test packs. Each merged site becomes a collection: a JSON file the existing UI reads. Content moves as data, so nothing is rebuilt by hand.

## File layout in the KR Library repo

```
public/data/collections/
  index.json               # list of collections (generated)
  finance.json
  general.json
  agents.json
  claude-skills.json
  lovable-skills.json
  capability-models.json
  test-packs.json
```

## Collection file

```json
{
  "id": "finance",
  "title": "Finance prompts",
  "description": "Prompts for finance, FP&A, treasury and audit work.",
  "source": { "host": "finprompt.kalilurrahman.com", "repo": "kalilurrahman/kr-finance-prompt-hub", "importedAt": "2026-12-01" },
  "licence": "MIT (original notice kept in LICENSES/finance.txt)",
  "items": [ ITEM, ... ]
}
```

## Item

| field | type | required | notes |
|---|---|---|---|
| id | string | yes | keep the source id; prefix with the collection id if ids collide |
| title | string | yes | no consultancy brand names |
| body | string | yes | the prompt, skill text or table, as Markdown |
| summary | string | no | one line for the card |
| tags | string[] | yes | lower-case |
| platform | string | no | `claude`, `chatgpt`, `perplexity`, `lovable`, `any` |
| industry | string | no | reuse the Library's industry slugs where they match |
| collection | string | yes | the file's id |
| access | `"free"` or `"pro"` | yes | default from the backlog task; Pro uses the existing lock |
| sourceUrl | string | yes | the old URL, for the redirect map and credit |
| updatedAt | string | no | ISO date if the source has one |

## Import rules

1. Read the source data files; never scrape the live site.
2. One mapping config per source (`scripts/import-configs/<collection>.json`) that names the files and maps fields.
3. Keep every item. If one cannot be mapped, drop it only with a reason printed in the run log.
4. Replace consultancy brand names (McKinsey, BCG, Bain, Deloitte, Accenture and similar) in titles and role lines with neutral roles ("a strategy consultant"). Leave quotations of public frameworks only where the framework is generic.
5. Keep licence notices: copy the source LICENSE file into `LICENSES/<collection>.txt`.
6. Print: items read, written, dropped (with reasons), duplicate ids fixed.
7. Validate against the schema before writing. Fail the run on any invalid item.

## Counts to reconcile

FinPrompt's home page and data disagree (1,120 vs 500 prompts in the review). The import's count is the truth; the KR Library shows the imported number, and the old figure is not carried over.

## Done when

- Each collection file validates.
- Items written + items dropped = items read, for each source.
- The Library's collection page shows the same count as the file.
