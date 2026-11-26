import { lastReviewed, PRICING_CHANGE_NOTE, PRICING_NOTE_PAGES } from "@/lib/review-dates";

/**
 * "Last reviewed: YYYY-MM-DD" for a pricing or model page, plus the pricing note on the pages
 * listed in PRICING_NOTE_PAGES. Renders nothing for a page without a review date.
 */
export function LastReviewed({ page, className }: { page: string; className?: string }) {
  const date = lastReviewed(page);
  if (!date) return null;
  return (
    <div className={["to-review", className].filter(Boolean).join(" ")}>
      <p className="to-review-date">
        Last reviewed: <time dateTime={date}>{date}</time>
      </p>
      {PRICING_NOTE_PAGES.has(page) && (
        <p className="to-review-note" role="note">
          {PRICING_CHANGE_NOTE}
        </p>
      )}
    </div>
  );
}
