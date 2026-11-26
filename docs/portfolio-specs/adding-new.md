# Recipes: adding new things without new sprawl

The programme cut 51 hosts to a working set because each new site started from zero: no leads, no shared header, no server HTML, no route to a buyer. These recipes add new work inside the four groups instead.

## The test before anything new

Add it only if you can answer all four:
1. **Buyer.** Who pays, and for which offer (briefing, Baseline, fractional, assurance, training, KR Library plan)?
2. **Home.** Which group does it live in: VERITRAIL, GCC Compass, KR Library or the front door?
3. **Capture.** Which `interest` value does its call to action send to the Lead API?
4. **Upkeep.** Who refreshes its figures, and how often?

If the answer to 2 is "a new subdomain", it needs a reason the four groups cannot carry. Write that reason in `sites.csv`.

## A new GCC Compass edition (for example BFSI, Automotive, Retail)

1. Content first: chapters as Markdown or JSON with a source and year for every figure.
2. Decide the host. Default: a path on gcc-compass (`/editions/bfsi`). A separate host only if the edition will be sold or sponsored on its own.
3. If it gets its own host, start from the Pharma repo's structure (reader, key stats, metrics, method) rather than a blank project.
4. Apply `edition-shell.md` from day one: header bar, sourced numbers, two CTAs, email capture, footer menu, server HTML.
5. Rows to add: `sites.csv` (decision Build, group "GCC Compass edition", final_state live, needs_server_html Y, needs_email_capture Y) and backlog tasks for content import, shell, capture and pre-render.
6. Add the edition to the footer series menu on every other edition and to gcc-compass's editions list.
7. Done when the verify script passes and a test lead from the edition arrives with its `site` value.

## A new KR Library collection (for example a new prompt set or skill pack)

1. Put the content in a repo as JSON or Markdown files.
2. Write `scripts/import-configs/<collection>.json` (copy `example.finance.json`).
3. `node scripts/import_collection.mjs <config> <source-dir> <library-repo> --dry-run` until read = written + dropped.
4. Run it for real, open a PR on the Library repo. The Collections UI picks it up from `index.json`; no UI work needed.
5. Decide `access` (free or pro). Free collections need an email gate on bulk download only.
6. If the content had its own site, add the old paths to `redirect-map.csv` and use the redirect page template.

## A new VERITRAIL module (for example agent runtime controls, third-party AI risk)

1. Optional module beside the five pillars. The 64 core controls and their counts do not change.
2. Same format as the control library: id, title, intent, evidence, framework mapping.
3. Add to the framework page, the self-assessment (optional questions) and, if sold, as an add-on on the Baseline page.
4. Any evidence pack (test cases, templates) goes under `/resources/` behind the Lead API.

## A new offer or price

1. Page on VERITRAIL under the offers menu: scope, exclusions, length, "from" price (or "Talk to us"), call to action with its own `interest` value.
2. Add the `interest` value to `lead-api.md` and to the admin filter.
3. Add a card on the front door only if it is one of the two headline offers.

## A new integration (for example a CRM, newsletter or booking tool)

1. It connects to the Lead API, not to each site. One webhook or export from `/api/leads`, never a second form.
2. Keep consent: only send leads whose consent text covers the new use.
3. Secrets live in the hosting platform's secret store, never in the repo.
