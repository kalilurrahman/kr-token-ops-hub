import { test } from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { canonicalLink, canonicalUrl, SITE_ORIGIN } from "./canonical";
import { SITE_URL } from "./sitemap";

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
/** Paths in FULL_NAV (src/components/SiteHeader.tsx), read as text to avoid loading React. */
const header = read("src/components/SiteHeader.tsx");
const navPaths = [
  ...header.slice(header.indexOf("export const FULL_NAV")).matchAll(/\{ to: "(\/[^"]*)"/g),
].map((match) => match[1]);

test("every route in FULL_NAV gets its own canonical on the site's host", () => {
  assert.equal(navPaths.length, 23, "FULL_NAV has 23 routes");
  const hrefs = navPaths.map((path) => canonicalLink(path).href);
  navPaths.forEach((path, i) => {
    const expected = path === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;
    assert.equal(hrefs[i], expected, path);
  });
  assert.equal(new Set(hrefs).size, navPaths.length, "no two routes share a canonical");
});

test("the home page's canonical keeps its slash; inner pages have none", () => {
  assert.equal(canonicalUrl("/"), "https://tokenops.kalilurrahman.com/");
  assert.equal(canonicalUrl(""), "https://tokenops.kalilurrahman.com/");
  assert.equal(canonicalUrl("/guide/"), "https://tokenops.kalilurrahman.com/guide");
});

test("a query string or fragment never reaches the canonical", () => {
  assert.equal(
    canonicalUrl("/calculator?model=x&tokens=10"),
    "https://tokenops.kalilurrahman.com/calculator",
  );
  assert.equal(canonicalUrl("/glossary#cache"), "https://tokenops.kalilurrahman.com/glossary");
  assert.equal(canonicalUrl("/?ref=a"), "https://tokenops.kalilurrahman.com/");
});

test("uses the same host as the sitemap", () => {
  assert.equal(SITE_ORIGIN, SITE_URL);
});

test("the root route adds the canonical for the route that is showing", () => {
  const root = read("src/routes/__root.tsx");
  assert.match(root, /head: \(\{ matches \}\) =>/);
  assert.match(root, /canonicalLink\(matches\[matches\.length - 1\]\?\.pathname \?\? "\/"\)/);
});

test("routes that set their own canonical agree with the shared one", () => {
  for (const [file, path] of [
    ["src/routes/guide.tsx", "/guide"],
    ["src/routes/changelog.tsx", "/changelog"],
    ["src/routes/sample-chapter.tsx", "/sample-chapter"],
  ] as const) {
    assert.ok(read(file).includes(canonicalUrl(path)), file);
  }
});
