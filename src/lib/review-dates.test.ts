import { test } from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import content from "../tokenops/content.json";
import documents from "../tokenops/documents.json";
import { REVIEW_CTA_LABEL, REVIEW_CTA_URL } from "../components/ReviewCta";
import { PRICING_CHANGE_NOTE, PRICING_NOTE_PAGES, REVIEW_DATES } from "./review-dates";

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
/** Paths in FULL_NAV (src/components/SiteHeader.tsx), read as text to avoid loading React. */
const header = read("src/components/SiteHeader.tsx");
const navPaths = new Set(
  [
    ...header
      .slice(
        header.indexOf("export const FULL_NAV"),
        header.indexOf("] as const", header.indexOf("export const FULL_NAV")),
      )
      .matchAll(/to: "([^"]+)"/g),
  ].map((m) => m[1]),
);

test("every review date is a real ISO day, not in the future", () => {
  const today = new Date().toISOString().slice(0, 10);
  for (const [page, date] of Object.entries(REVIEW_DATES)) {
    assert.match(date, /^\d{4}-\d{2}-\d{2}$/, `${page}: ${date} is not YYYY-MM-DD`);
    assert.equal(new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10), date, `${page}`);
    assert.ok(date <= today, `${page}: ${date} is in the future`);
  }
});

test("every dated page exists: a FULL_NAV route or a reader document", () => {
  for (const page of Object.keys(REVIEW_DATES)) {
    if (page.startsWith("/")) {
      assert.ok(navPaths.has(page), `${page} is not a route in FULL_NAV`);
    } else if (page.startsWith("library/")) {
      assert.ok(page.slice(8) in documents.library, `${page} is not in documents.json`);
    } else {
      assert.ok(page.startsWith("template/"), `${page} has an unknown prefix`);
      assert.ok(page.slice(9) in documents.templates, `${page} is not in documents.json`);
    }
  }
});

test("every Models briefing and the pricing pages carry a review date", () => {
  const models = content.library.filter((item) => item.category === "Models");
  assert.ok(models.length > 0);
  for (const item of models) {
    assert.ok(`library/${item.file}` in REVIEW_DATES, `${item.file} has no review date`);
  }
  for (const page of [
    "/models",
    "/calculator",
    "/hub",
    "/toolkit",
    "/dashboard",
    "library/trends/2026-pricing-landscape.md",
    "library/references/provider-comparison-matrix.md",
    "template/token-pricing-reference.md",
  ]) {
    assert.ok(page in REVIEW_DATES, `${page} has no review date`);
  }
});

test("the pricing note sits on the pricing landscape and the dashboard sample", () => {
  assert.equal(
    PRICING_CHANGE_NOTE,
    "Prices and model line-ups change often; check the provider's current pricing page before relying on these figures.",
  );
  assert.deepEqual([...PRICING_NOTE_PAGES].sort(), [
    "/dashboard",
    "library/trends/2026-pricing-landscape.md",
  ]);
  for (const page of PRICING_NOTE_PAGES) assert.ok(page in REVIEW_DATES, `${page} has no date`);
});

test("primary calls to action point to the VERITRAIL review", () => {
  assert.equal(REVIEW_CTA_URL, "https://veritrail.kalilurrahman.com/contact");
  assert.equal(REVIEW_CTA_LABEL, "Book an AI cost governance review");
  for (const file of [
    "src/components/SiteHeader.tsx",
    "src/components/SiteFooter.tsx",
    "src/routes/index.tsx",
    "src/routes/roadmap.tsx",
    "src/routes/about.tsx",
  ]) {
    assert.match(read(file), /<ReviewCta\b/, `${file} has no ReviewCta`);
  }
  assert.match(header, /<ReviewCta[\s\S]{0,80}site-header-cta/, "header CTA is not the review");
  for (const file of ["src/routes/index.tsx", "src/routes/roadmap.tsx", "src/routes/about.tsx"]) {
    assert.doesNotMatch(
      read(file),
      /<Link[^>]*className="primary-action/,
      `${file} still has an in-site primary call to action`,
    );
  }
});
