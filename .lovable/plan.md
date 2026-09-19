# Model intelligence, saved reading lists, and AI workload adviser

## Outcome
Add three connected capabilities without rebuilding the site:

1. A responsive comparison matrix covering the five new model briefings.
2. Private, device-local reading lists with named collections and bookmarks from cards and the reader.
3. An AI workload adviser inside the reader that recommends a model, routing strategy, and cost controls.

## What will be built

### Model comparison
- Add a dedicated `/models` page using the existing TokenOps visual language.
- Compare the five briefing subjects across capabilities, context limits, pricing considerations, latency guidance, and recommended workloads.
- Link every row/card directly to its full briefing.
- Add the `Models` category to the library filters and navigation.
- Use a compact desktop table plus stacked mobile cards so no horizontal scrolling is required.
- Clearly date volatile pricing guidance and retain links to source briefings rather than presenting figures as permanent.

### Saved reading lists
- Add bookmark controls to model and technique briefing cards and to the full-screen reader toolbar.
- Add a `/reading-lists` page where users can create, rename, and delete collections; add or remove briefings; and reopen saved articles.
- Store collections in IndexedDB on the current device only. This preserves privacy, requires no account, and follows the project rule against using localStorage beyond theme state.
- Provide clear empty states and accessible labels; keep bookmarked state synchronized across open pages.

### AI workload adviser
- Add an “Ask TokenOps” panel in the reader for model and technique briefings.
- Let readers describe workload type, volume, context size, latency sensitivity, quality/risk level, and budget priorities.
- Send the request server-side through Lovable AI Gateway using `openai/gpt-6-astra` on the Responses API with streamed reasoning summaries and answer text.
- Ground the prompt in the five model briefings and require a concise recommendation containing:
  - primary model and rationale;
  - routing/fallback strategy;
  - caching, context, output, retry, and agent-loop controls;
  - important pricing assumptions and validation steps.
- Show the Gateway’s safe error message. Retry only bounded transient `429`/`5xx` failures with backoff; treat all other failures, denials, refusals, and empty results as terminal.
- Keep the API key server-only and propagate the Gateway run identifier.

## Technical approach
- Enable Lovable Cloud for secure server-side AI execution; no database or authentication will be added.
- Add the AI SDK packages needed for the Responses API and a server-only Gateway helper.
- Add shared types under `src/types/`, small reusable bookmark/collection utilities, and focused UI components kept below the project size limit.
- Use existing shadcn controls, Lucide icons, semantic colour tokens, and current light/dark themes.
- Add unique title, description, Open Graph, type, and Twitter metadata to every new content route.

## Validation
- Run lint with zero warnings, TypeScript checks, and the full available test suite.
- Make one live AI Gateway request through the app route and inspect its streamed response before declaring it complete.
- Verify model comparison, collection management, bookmarking, and adviser flows at desktop and mobile widths in the preview.
- Confirm no horizontal overflow, unreadable table text, broken article links, exposed secret, account flow, analytics, or tracking is introduced.

## Scope boundary
- Existing content, calculators, themes, disclaimers, external links, and reader navigation remain intact.
- “Honing” is limited to fixes discovered while validating these three features; no unrelated redesign will be introduced.
