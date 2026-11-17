import { test } from "node:test";
import { strict as assert } from "node:assert";
import documents from "../tokenops/documents.json";
import { renderMarkdown } from "./markdown";
import { resolveReaderLink, type ReaderDocRef } from "./reader-links";

const docs = {
  library: { "guides/faq.md": "", "guides/raci.md": "", "checklists/launch.md": "" },
  templates: { "playbook.md": "", "budget-guardrails.yaml": "" },
};
const faq: ReaderDocRef = { source: "library", key: "guides/faq.md" };
const playbook: ReaderDocRef = { source: "template", key: "playbook.md" };

test("content-pack paths to templates open the template in the reader", () => {
  assert.equal(
    resolveReaderLink("../../public/templates/playbook.md", faq, docs),
    "/read/template/playbook.md",
  );
  assert.equal(
    resolveReaderLink("../../public/templates/budget-guardrails.yaml", faq, docs),
    "/read/template/budget-guardrails.yaml",
  );
  assert.equal(resolveReaderLink("../../public/templates/", faq, docs), "/templates");
});

test("sibling and cross-folder links stay within their collection", () => {
  assert.equal(resolveReaderLink("./raci.md", faq, docs), "/read/library/guides/raci.md");
  assert.equal(resolveReaderLink("raci.md", faq, docs), "/read/library/guides/raci.md");
  assert.equal(
    resolveReaderLink("../checklists/launch.md#before-launch", faq, docs),
    "/read/library/checklists/launch.md#before-launch",
  );
  assert.equal(
    resolveReaderLink("./budget-guardrails.yaml", playbook, docs),
    "/read/template/budget-guardrails.yaml",
  );
});

test("links to documents that do not exist resolve to null", () => {
  assert.equal(resolveReaderLink("./INTEGRATION.md", faq, docs), null);
  assert.equal(resolveReaderLink("../../src/App.jsx", faq, docs), null);
  assert.equal(resolveReaderLink("../../../../../../etc/passwd", faq, docs), null);
});

test("absolute, root-relative, in-page and other-scheme links are left alone", () => {
  for (const href of [
    "https://example.com/x.md",
    "mailto:team@example.com",
    "/library/references/matrix.md",
    "#part-1",
    "",
  ]) {
    assert.equal(resolveReaderLink(href, faq, docs), undefined, href);
  }
});

test("renderMarkdown rewrites resolved links and drops dead ones to their text", () => {
  const html = renderMarkdown(
    "See [the playbook](../../public/templates/playbook.md), [integration](./INTEGRATION.md) " +
      "and [docs](https://example.com).",
    (href) => resolveReaderLink(href, faq, docs),
  );
  assert.match(html, /<a href="\/read\/template\/playbook\.md">the playbook<\/a>/);
  assert.match(html, /, integration and /);
  assert.match(html, /<a href="https:\/\/example\.com">docs<\/a>/);
  // Without a resolver the output is plain marked.
  assert.match(renderMarkdown("[x](./INTEGRATION.md)"), /<a href="\.\/INTEGRATION\.md">x<\/a>/);
});

test("no library or template document renders a link to a missing reader page", () => {
  const store = documents as { library: Record<string, string>; templates: Record<string, string> };
  const pages: [ReaderDocRef, string][] = [
    ...Object.entries(store.library).map(([key, md]): [ReaderDocRef, string] => [
      { source: "library", key },
      md,
    ]),
    ...Object.entries(store.templates).map(([key, md]): [ReaderDocRef, string] => [
      { source: "template", key },
      md,
    ]),
  ].filter(([ref]) => ref.key.endsWith(".md"));
  assert.ok(pages.length >= 70, `expected the full corpus, got ${pages.length}`);

  const broken: string[] = [];
  let rewritten = 0;
  for (const [ref, md] of pages) {
    const html = renderMarkdown(md, (href) => resolveReaderLink(href, ref, store));
    for (const [, href] of html.matchAll(/<a href="([^"]*)"/g)) {
      if (/^(https?:|mailto:|#)/.test(href)) continue;
      const path = decodeURIComponent(href.split("#")[0]);
      const ok =
        (path.startsWith("/read/library/") && path.slice(14) in store.library) ||
        (path.startsWith("/read/template/") && path.slice(15) in store.templates) ||
        path === "/templates" ||
        path === "/library";
      if (path.startsWith("/read/")) rewritten++;
      if (!ok) broken.push(`${ref.source}/${ref.key} -> ${href}`);
    }
  }
  assert.deepEqual(broken, []);
  assert.ok(rewritten >= 45, `expected the cross-document links to be rewritten, got ${rewritten}`);
});
