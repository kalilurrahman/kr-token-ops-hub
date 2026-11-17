import { test } from "node:test";
import { strict as assert } from "node:assert";
import content from "../tokenops/content.json";
import documents from "../tokenops/documents.json";
import {
  highlightParts,
  markdownToPlainText,
  searchLibrary,
  searchTerms,
  type SearchableDoc,
} from "./library-search";

const docs: SearchableDoc[] = [
  { file: "a.md", title: "Budget guardrails", desc: "Alerts for spend", category: "Playbook" },
  { file: "b.md", title: "Prompt caching", desc: "Cut input cost", category: "Techniques" },
  {
    file: "c.md",
    title: "Routing guide",
    desc: "Send easy work to caching tiers",
    category: "Guide",
  },
  { file: "d.md", title: "Glossary", desc: "Terms", category: "Reference" },
];
const bodies = {
  "a.md": "Set a monthly budget and alert at 80% of spend.",
  "d.md": "Prefix caching reuses a stable prompt prefix across calls. Many more words follow here.",
};

test("search words are lower-cased, deduplicated and keep model-name punctuation", () => {
  assert.deepEqual(searchTerms("  Prompt   CACHING caching, GPT-5.6? "), [
    "prompt",
    "caching",
    "gpt-5.6",
  ]);
  assert.deepEqual(searchTerms("   "), []);
  assert.equal(searchTerms("a b c d e f g h i j").length, 8);
});

test("markdown is reduced to readable text", () => {
  const md =
    "# Title\n\n- **Bold** item with [a link](./x.md)\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n```ts\nconst x = 1;\n```";
  assert.equal(markdownToPlainText(md), "Title Bold item with a link A B 1 2 const x = 1;");
});

test("an empty search lists every document in its original order", () => {
  assert.deepEqual(
    searchLibrary(docs, "  ").map((hit) => hit.doc.file),
    ["a.md", "b.md", "c.md", "d.md"],
  );
});

test("title matches rank above descriptions, which rank above document text", () => {
  const hits = searchLibrary(docs, "caching", bodies);
  assert.deepEqual(
    hits.map((hit) => hit.doc.file),
    ["b.md", "c.md", "d.md"],
  );
  // Only the text-only match gets a snippet.
  assert.equal(hits[0].snippet, undefined);
  assert.match(hits[2].snippet ?? "", /Prefix caching reuses/);
});

test("every word must match somewhere in the document", () => {
  assert.deepEqual(
    searchLibrary(docs, "budget alert", bodies).map((hit) => hit.doc.file),
    ["a.md"],
  );
  assert.deepEqual(searchLibrary(docs, "budget caching", bodies), []);
  // Without document text, only titles, descriptions and categories are searched.
  assert.deepEqual(
    searchLibrary(docs, "prefix").map((hit) => hit.doc.file),
    [],
  );
});

test("snippets are cut at word boundaries with ellipses", () => {
  const long = `${"intro ".repeat(40)}the needle sits here ${"outro ".repeat(40)}`;
  const [hit] = searchLibrary([{ file: "x.md", title: "X", desc: "", category: "" }], "needle", {
    "x.md": long,
  });
  assert.ok(hit.snippet?.startsWith("…intro"));
  assert.ok(hit.snippet?.endsWith("outro…"));
  assert.match(hit.snippet ?? "", /the needle sits here/);
});

test("matches are split out for highlighting, longest first and regex-safe", () => {
  assert.deepEqual(highlightParts("Prompt caching cuts cost", ["caching", "cach"]), [
    { text: "Prompt ", match: false },
    { text: "caching", match: true },
    { text: " cuts cost", match: false },
  ]);
  assert.deepEqual(highlightParts("Price is $3.00 (in)", ["$3.00", "(in)"]), [
    { text: "Price is ", match: false },
    { text: "$3.00", match: true },
    { text: " ", match: false },
    { text: "(in)", match: true },
  ]);
  assert.deepEqual(highlightParts("unchanged", []), [{ text: "unchanged", match: false }]);
});

test("the real library is searchable by its full text", () => {
  const library = (content as { library: SearchableDoc[] }).library;
  const text = Object.fromEntries(
    Object.entries((documents as { library: Record<string, string> }).library).map(([file, md]) => [
      file,
      markdownToPlainText(md),
    ]),
  );
  assert.ok(library.length >= 60);
  assert.ok(
    library.every((doc) => doc.file in text),
    "every library card has its document text",
  );

  const started = performance.now();
  const caching = searchLibrary(library, "prompt caching", text);
  const elapsed = performance.now() - started;
  assert.ok(caching.length >= 5, `expected several caching documents, got ${caching.length}`);
  assert.match(caching[0].doc.title, /cach/i);
  assert.ok(elapsed < 100, `search took ${elapsed.toFixed(1)}ms`);

  // Documents that mention a word only in their text are found, with a snippet showing it;
  // documents that mention it in the title or description need no snippet.
  const hits = searchLibrary(library, "idempotency", text);
  assert.ok(
    hits.some((hit) => hit.snippet),
    "some matches come from document text alone",
  );
  for (const hit of hits) {
    const where = hit.snippet ?? `${hit.doc.title} ${hit.doc.desc}`;
    assert.match(where, /idempotency/i, hit.doc.file);
  }
});
