import { test } from "node:test";
import { strict as assert } from "node:assert";
import { marked } from "marked";
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
