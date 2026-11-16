import { test } from "node:test";
import { strict as assert } from "node:assert";
import { renderAdviceMarkdown, safeAdviceHref } from "./advice-markdown";

test("adviser answers render headings, lists, emphasis and the strategy table", () => {
  const html = renderAdviceMarkdown(
    [
      "## 1. Strategy comparison",
      "",
      "| Strategy | Tokens affected | Relative saving |",
      "| --- | --- | --- |",
      "| Prompt caching | input | high |",
      "| Output limits | output | medium |",
      "",
      "## 2. Recommended combination",
      "",
      "1. **Prompt caching** first",
      "2. Then *output limits*",
    ].join("\n"),
  );
  assert.match(html, /<h2>1\. Strategy comparison<\/h2>/);
  assert.match(
    html,
    /<table tabindex="0">[\s\S]*<th>Strategy<\/th>[\s\S]*<td>Prompt caching<\/td>/,
  );
  assert.match(html, /<ol>\s*<li><strong>Prompt caching<\/strong> first<\/li>/);
  assert.match(html, /<em>output limits<\/em>/);
});

test("raw HTML from the model is shown as text, block or inline", () => {
  for (const source of [
    "<script>alert(1)</script>",
    "<img src=x onerror=alert(1)>",
    "Hello <img src=x onerror=alert(1)> world",
    '<div onclick="steal()">click</div>',
    "| a |\n| --- |\n| <svg onload=alert(1)> |",
  ]) {
    const html = renderAdviceMarkdown(source);
    assert.doesNotMatch(html, /<(script|img|div|svg)\b/i, `${source} → ${html}`);
    assert.match(html, /&lt;(script|img|div|svg)/i, `${source} is visible as text`);
  }
});

test("only https, http, mailto and same-site links become links", () => {
  for (const href of [
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    " javascript:alert(1)",
    "&#106;avascript:alert(1)",
    "vbscript:msgbox(1)",
    "data:text/html,<b>x</b>",
    "//evil.test/a",
    "/\\evil.test",
    "#section",
    "guide",
  ]) {
    const html = renderAdviceMarkdown(`[label](${href})`);
    assert.doesNotMatch(html, /<a\b/, `${href} → ${html}`);
    assert.match(html, /label/);
  }

  const external = renderAdviceMarkdown('[docs](https://example.com/a?b=1&c=2 "say \\"hi\\"")');
  assert.match(external, /<a href="https:\/\/example\.com\/a\?b=1&amp;c=2"/);
  assert.match(external, /title="say &quot;hi&quot;"/);
  assert.match(external, /target="_blank" rel="noopener noreferrer nofollow"/);

  const internal = renderAdviceMarkdown("[the guide](/guide)");
  assert.match(internal, /<a href="\/guide">the guide<\/a>/);

  const autolink = renderAdviceMarkdown("See https://example.com/pricing for terms.");
  assert.match(autolink, /<a href="https:\/\/example\.com\/pricing" target="_blank"/);

  assert.equal(safeAdviceHref("mailto:team@example.com")?.external, false);
  assert.equal(safeAdviceHref("ftp://example.com"), null);
});

test("images are never loaded; their alt text is shown", () => {
  const html = renderAdviceMarkdown("![Cost chart](https://evil.test/pixel.gif)");
  assert.doesNotMatch(html, /<img\b/);
  assert.match(html, /Cost chart/);
});

test("code keeps markup as text", () => {
  const html = renderAdviceMarkdown("Use `<b>` sparingly.\n\n```\n<script>x</script>\n```");
  assert.match(html, /<code>&lt;b&gt;<\/code>/);
  assert.match(html, /&lt;script&gt;x&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script\b/);
});

test("advice tables are keyboard-focusable (they scroll inside the card)", () => {
  const html = renderAdviceMarkdown(
    "| Strategy | Saving |\n| --- | --- |\n| Prompt caching | high |\n",
  );
  assert.match(html, /<table tabindex="0">/);
  assert.match(renderAdviceMarkdown("<table><tr><td>x</td></tr></table>"), /&lt;table&gt;/);
});
