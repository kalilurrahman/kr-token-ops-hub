/**
 * The Hub calculator's payback figure: months for the monthly savings to repay the one-off cost of
 * putting the optimization levers in place. Same formula as the /calculator page (cost ÷ monthly
 * savings). Until 2.8.1 the Hub divided by a twelfth of the monthly savings, showing 12× too long.
 */

/** Assumed one-off implementation cost behind the Hub's payback figure (USD). */
export const HUB_IMPLEMENTATION_COST = 15_000;

/** Months to repay `oneOffCost` from `monthlySavings`; savings under $1/month count as $1. */
export function paybackMonths(oneOffCost: number, monthlySavings: number): number {
  return oneOffCost / Math.max(monthlySavings, 1);
}
