import reviewDates from "@/tokenops/review-dates.json";

/**
 * "Last reviewed" dates for pricing and model pages, generated from git history by
 * scripts/gen-review-dates.mjs (npm run review-dates). Keys are route paths ("/models") and
 * reader paths ("library/trends/2026-pricing-landscape.md", "template/…").
 */
export const REVIEW_DATES: Readonly<Record<string, string>> = reviewDates.pages;

export const PRICING_CHANGE_NOTE =
  "Prices and model line-ups change often; check the provider's current pricing page before relying on these figures.";

/** Pages that carry the pricing note under their review date. */
export const PRICING_NOTE_PAGES: ReadonlySet<string> = new Set([
  "/dashboard",
  "library/trends/2026-pricing-landscape.md",
]);

export function lastReviewed(page: string): string | undefined {
  return REVIEW_DATES[page];
}
