import { test } from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import content from "../tokenops/content.json";
import documents from "../tokenops/documents.json";
import { readerPaths, SITE_URL, sitemapEntries, sitemapXml, STATIC_PAGES } from "./sitemap";

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
/** Paths in FULL_NAV (src/components/SiteHeader.tsx), read as text to avoid loading React. */
const navPaths = [
  ...read("src/components/SiteHeader.tsx")
    .slice(read("src/components/SiteHeader.tsx").indexOf("export const FULL_NAV"))
    .matchAll(/\{ to: "(\/[^"]*)"/g),
].map((match) => match[1]);
const routePaths = new Set(
  [...read("src/routeTree.gen.ts").matchAll(/fullPath: '([^']+)'/g)].map((match) => match[1]),
);
const store = documents as { library: Record<string, string>; templates: Record<string, string> };

test("every page in the navigation is in the sitemap", () => {
  assert.equal(navPaths.length, 23, "FULL_NAV has 23 routes");
  const listed = new Set(STATIC_PAGES.map((entry) => entry.path));
  assert.deepEqual(
    navPaths.filter((path) => !listed.has(path)),
    [],
  );
});

test("every static sitemap page is a real route", () => {
  assert.deepEqual(
    STATIC_PAGES.map((entry) => entry.path).filter((path) => !routePaths.has(path)),
    [],
  );
});

test("every document the reader can open is listed, and every listed one exists", () => {
  const paths = readerPaths(content as Parameters<typeof readerPaths>[0]);
  const library = paths.filter((path) => path.startsWith("/read/library/"));
  const templates = paths.filter((path) => path.startsWith("/read/template/"));
  assert.equal(library.length, (content as { library: unknown[] }).library.length);
  assert.ok(templates.length > 0);
  const missing = paths.filter((path) =>
    path.startsWith("/read/library/")
      ? !(path.slice("/read/library/".length) in store.library)
      : !(path.slice("/read/template/".length) in store.templates),
  );
  assert.deepEqual(missing, [], "sitemap would list reader pages that 404");
});

test("the sitemap has no duplicates and well-formed, absolute, escaped URLs", () => {
  const entries = sitemapEntries();
  const paths = entries.map((entry) => entry.path);
  assert.equal(new Set(paths).size, paths.length);
  const xml = sitemapXml(entries);
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset '));
  assert.equal(xml.match(/<url>/g)?.length, entries.length);
  for (const [, loc] of xml.matchAll(/<loc>([^<]*)<\/loc>/g)) {
    assert.ok(loc.startsWith(`${SITE_URL}/`), loc);
    assert.doesNotMatch(loc, /[ "'<>]|&(?!amp;)/, loc);
  }
  assert.match(
    sitemapXml([{ path: "/read/library/a & b.md" }], "https://x.test"),
    /<loc>https:\/\/x\.test\/read\/library\/a%20&amp;%20b\.md<\/loc>/,
  );
});

test("llms.txt lists every navigation page and the current library size", () => {
  const llms = read("public/llms.txt");
  assert.deepEqual(
    navPaths.filter((path) => !llms.includes(`](${path})`)),
    [],
    "llms.txt is missing pages",
  );
  const count = Number(llms.match(/\]\(\/library\): (\d+) /)?.[1]);
  assert.equal(count, (content as { library: unknown[] }).library.length);
});
