import { test } from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { marked } from "marked";
import documents from "../tokenops/documents.json";
import { renderMarkdown } from "./markdown";

const strip = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

test("task-list items label their checkbox with the item text", () => {
  const html = renderMarkdown("- [ ] Draft budget\n- [x] Tag spend\n");
  assert.match(
    html,
    /<li class="task-list-item"><label><input disabled="" type="checkbox"> Draft budget<\/label><\/li>/,
  );
  assert.match(html, /<label><input checked="" disabled="" type="checkbox"> Tag spend<\/label>/);
});

test("link-only items (a table of contents) are marked, nested lists included", () => {
  const html = renderMarkdown(
    "1. [Summary](#summary)\n2. [Part 1](#part-1)\n   - [Chapter 1](#ch-1)\n",
  );
  assert.equal(html.match(/<li class="link-item">/g)?.length, 3);
});

test("items mixing a link with other text keep the default markup", () => {
  const html = renderMarkdown(
    "- See [pricing](#pricing) for rates\n- **Bold** [link](#x)\n- Plain item\n",
  );
  assert.doesNotMatch(html, /link-item/);
  assert.equal(
    html,
    marked.parse("- See [pricing](#pricing) for rates\n- **Bold** [link](#x)\n- Plain item\n"),
  );
});

test("visible text matches marked's own output", () => {
  const source =
    "# Guide\n\n1. [Summary](#summary)\n   - [Detail](#detail)\n\n- [ ] Task\n\nPara with [a link](#a).\n";
  assert.equal(
    strip(renderMarkdown(source)),
    strip(marked.parse(source, { async: false }) as string),
  );
});

test("long-form tables are keyboard-focusable (they scroll sideways on phones)", () => {
  const html = renderMarkdown("| Model | Price |\n| --- | --- |\n| A | 1 |\n");
  assert.match(html, /<table tabindex="0">/);
  assert.doesNotMatch(html, /<table>/);
});

test("headings get unique GitHub-style ids, and h2/h3 text links to its own section", () => {
  const html = renderMarkdown(
    "# Title\n\n## Part 1: Foundations\n\n## Part 1: Foundations\n\n### Unit Economics & Metrics\n\n## [Linked](https://x.test)\n\n#### Deep `code`\n",
  );
  assert.match(html, /<h1 id="title">Title<\/h1>/);
  assert.match(
    html,
    /<h2 id="part-1-foundations"><a class="heading-link" href="#part-1-foundations">Part 1: Foundations<\/a><\/h2>/,
  );
  assert.match(html, /<h2 id="part-1-foundations-1">/);
  assert.match(html, /<h3 id="unit-economics--metrics"><a class="heading-link"/);
  assert.match(html, /<h2 id="linked"><a href="https:\/\/x\.test">Linked<\/a><\/h2>/);
  assert.match(html, /<h4 id="deep-code">Deep <code>code<\/code><\/h4>/);
});

test("ids restart for each document and can be turned off", () => {
  const source = "## Added\n\n## Added\n";
  assert.equal(renderMarkdown(source), renderMarkdown(source));
  assert.match(renderMarkdown(source), /id="added-1"/);
  assert.doesNotMatch(renderMarkdown(source, undefined, { headingIds: false }), /id=|heading-link/);
});

test("every in-page # link in the guide, sample chapter and library documents resolves", () => {
  const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
  const sources: [string, string][] = [
    ["guide.md", read("../tokenops/guide.md")],
    ["sample chapter", read("../../content/sample-chapter-prompt-caching.md")],
    ...Object.entries(documents.library).filter(([key]) => key.endsWith(".md")),
    ...Object.entries(documents.templates).filter(([key]) => key.endsWith(".md")),
  ];
  const broken: string[] = [];
  for (const [name, markdown] of sources) {
    const html = renderMarkdown(markdown);
    const ids = new Set([...html.matchAll(/ id="([^"]+)"/g)].map((match) => match[1]));
    for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) {
      if (!ids.has(decodeURIComponent(target))) broken.push(`${name} → #${target}`);
    }
  }
  assert.ok(sources.length > 50, `expected the full content pack, got ${sources.length}`);
  assert.deepEqual(broken, []);
});
