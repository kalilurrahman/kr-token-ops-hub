import { test } from "node:test";
import { strict as assert } from "node:assert";
import { marked } from "marked";
import { renderMarkdown, renderUntrustedMarkdown } from "./markdown";

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

test("untrusted markdown renders tables and headings", () => {
  const html = renderUntrustedMarkdown(
    "## 1. Strategy comparison\n\n| Strategy | Saving |\n| --- | --- |\n| Prompt caching | high |\n",
  );
  assert.match(html, /<h2>1\. Strategy comparison<\/h2>/);
  assert.match(html, /<table tabindex="0">[\s\S]*<td>Prompt caching<\/td>[\s\S]*<\/table>/);
});

test("untrusted markdown escapes raw HTML and drops images", () => {
  const html = renderUntrustedMarkdown(
    '<script>alert(1)</script>\n\nText <img src=x onerror="alert(1)"> and ![pic](https://evil.test/x.png)\n\n| a |\n| - |\n| <b onclick=x>b</b> |\n',
  );
  // No real tags survive; the attempted markup is shown as escaped text.
  assert.doesNotMatch(html, /<script|<img|<b[\s>]/i);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  assert.match(html, /<td>&lt;b onclick=x&gt;b&lt;\/b&gt;<\/td>/);
  assert.match(html, /pic/);
});

test("untrusted markdown keeps safe links only", () => {
  const html = renderUntrustedMarkdown(
    "[docs](https://example.com/a?b=1) [mail](mailto:a@b.co) [x](javascript:alert(1)) [d](data:text/html,hi) [p](//evil.test)",
  );
  assert.match(
    html,
    /<a href="https:\/\/example\.com\/a\?b=1" target="_blank" rel="noopener noreferrer nofollow">docs<\/a>/,
  );
  assert.match(html, /href="mailto:a@b\.co"/);
  assert.doesNotMatch(html, /javascript:|data:text|href="\/\/evil/);
  assert.match(html, /> x d p<\/p>|\bx\b/);
});

test("long-form tables are keyboard-focusable (they scroll sideways on phones)", () => {
  const html = renderMarkdown("| Model | Price |\n| --- | --- |\n| A | 1 |\n");
  assert.match(html, /<table tabindex="0">/);
  assert.doesNotMatch(html, /<table>/);
});
