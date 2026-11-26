# Spec: pages readable without JavaScript

Eight of the eleven busiest sites send about eight words of HTML before JavaScript runs. Search engines, LinkedIn previews and AI assistants see almost nothing. This spec fixes that without a redesign.

## Target

For each listed route, `curl -s <url>` returns:
- a unique `<title>` and `<meta name="description">`
- `og:title`, `og:description`, `og:image` and a canonical link
- the page's main heading and body text in the HTML
- at least 300 words on content pages (the checker uses this threshold for home pages)

Plus `sitemap.xml` and `robots.txt` at the root.

## Options, in order of preference

1. **Server rendering** where the project already supports it (VERITRAIL uses TanStack Start). Nothing to do but make sure each route sets its own head tags.
2. **Pre-render at build time** for Vite + React projects: a post-build step that loads each route in a headless browser and writes the rendered HTML to `dist/<route>/index.html` (for example `vite-plugin-prerender`, `react-snap`, or a short Puppeteer script). The client app then takes over as usual.
3. **Static HTML shells** for the content: generate `dist/<route>/index.html` from the same Markdown or JSON the reader uses, with the React bundle included so the app still loads.

## Caveat to check first

Lovable builds and hosts the site. Before relying on option 2, confirm in one small PR that Lovable's build runs the post-build step and serves the generated files (check with curl on the published site, not only the preview). If it does not, use option 3, or move hosting of that one site to a host you control and point the domain there. Write the finding in PROGRESS.md; do not guess.

## Route lists

Take them from the backlog tasks `L-P1-04-*`. Generate chapter routes from the content files, not by hand.

## Done when

`python3 scripts/verify_portfolio.py` shows `raw_html_words >= 300` for the home page of each kept site, and a manual curl of two deep routes per site shows their own title and text.
