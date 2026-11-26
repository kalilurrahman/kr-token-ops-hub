# Spec: GCC Compass editions

GCC Compass is the public platform. GCC Playbook, Pharma and Healthcare stay on their own hosts and keep their own look, but read as editions of one product. This keeps each site unique while the shared parts live in one place.

## What every edition has

1. **Header bar** above the site's own header, 36 to 44 px tall:
   - left: `GCC Compass · <Edition name>` linking to `https://gcc-compass.kalilurrahman.com`
   - right: four links — Assess (`/app/assess`), AI-ready (`/app/ai-ready`), Cost model (`/app/cost-model`), Ask (the Ask feature) — all on gcc-compass
   - small screens: name on the left, a "Tools" menu on the right
2. **Sourced numbers.** Every figure in a stats ticker, Key Stats or GCC Metrics page shows its source and year on hover and on the page. A figure without a source is removed, not kept with "estimate".
3. **Two calls to action** at the end of every reader page:
   - "Run the AI-ready GCC assessment" → `https://gcc-compass.kalilurrahman.com/app/ai-ready`
   - "Book a briefing" → `https://veritrail.kalilurrahman.com/contact` (Pharma: "Book a GxP AI governance briefing"; Healthcare: "Book an AI governance briefing for healthcare GCCs"; Playbook: "Book a GCC AI governance briefing")
4. **Email capture** before downloads (PDF, board pack, assessment report), never before reading. Uses the shared Lead API.
5. **Footer series menu** lists only: GCC Compass, GCC Playbook, Pharma edition, Healthcare edition, VERITRAIL, KR Library, kalilurrahman.com.
6. **Wording.** "Global Capability Centre" in full in page titles and descriptions. No Gulf (GCC states) content.
7. **Readable without JavaScript** (see prerender.md).

## What editions do not share

Colours, fonts, chapter structure and the reader stay as they are. Do not move content between editions.

## Header bar markup (reference)

```html
<div class="gccc-bar" role="navigation" aria-label="GCC Compass">
  <a class="gccc-brand" href="https://gcc-compass.kalilurrahman.com">GCC Compass <span>· Pharma edition</span></a>
  <nav>
    <a href="https://gcc-compass.kalilurrahman.com/app/assess">Assess</a>
    <a href="https://gcc-compass.kalilurrahman.com/app/ai-ready">AI-ready</a>
    <a href="https://gcc-compass.kalilurrahman.com/app/cost-model">Cost model</a>
    <a href="https://gcc-compass.kalilurrahman.com/ask">Ask</a>
  </nav>
</div>
```

Confirm the Ask route on gcc-compass before linking it; use the path the site actually serves.

## Done when

- All three editions show the bar, the two CTAs and a footer with only the kept sites.
- `python3 scripts/verify_portfolio.py --only gcc-playbook,pharma,healthcare` passes the email and words checks.
- A spot check of five figures per edition shows a source and year for each.
