import type { ReactNode } from "react";

/** TokenOps' primary call to action: an AI cost governance review with VERITRAIL. */
export const REVIEW_CTA_URL = "https://veritrail.kalilurrahman.com/contact";
export const REVIEW_CTA_LABEL = "Book an AI cost governance review";

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
