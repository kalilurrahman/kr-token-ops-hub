import type { ReactNode } from "react";

/** TokenOps' primary call to action: an AI cost governance review with VERITRAIL. */
export const REVIEW_CTA_URL = "https://veritrail.kalilurrahman.com/contact";
export const REVIEW_CTA_LABEL = "Book an AI cost governance review";

/** The secondary link beside it: VERITRAIL's AI cost governance practice page. */
export const PRACTICE_URL = "https://veritrail.kalilurrahman.com/practice/ai-cost";
export const PRACTICE_LABEL = "AI cost governance at VERITRAIL";

export function ReviewCta({
  className,
  before,
  after,
}: {
  className: string;
  before?: ReactNode;
  after?: ReactNode;
}) {
  return (
    <a href={REVIEW_CTA_URL} className={className}>
      {before}
      {REVIEW_CTA_LABEL}
      {after}
    </a>
  );
}

/** Secondary text link to the practice page, shown next to the primary review button. */
export function PracticeLink() {
  return (
    <a href={PRACTICE_URL} className="to-secondary-link">
      {PRACTICE_LABEL}
    </a>
  );
}
