/**
 * Helpers for the AI workload adviser's email magic-link sign-in (see `src/routes/read.$.tsx`).
 * Pure functions so they can be tested without a browser or a Supabase project.
 */

/** Auth parameters Supabase may add to the return URL; never send them back out in a new link. */
const AUTH_PARAMS = ["code", "error", "error_code", "error_description", "token_hash", "type"];

/** The page to return to from the emailed link: the current page without auth leftovers. */
export function signInRedirectUrl(href: string): string {
  const url = new URL(href);
  url.hash = "";
  for (const key of AUTH_PARAMS) url.searchParams.delete(key);
  return url.toString();
}

/** A light shape check before asking Supabase to send a link; Supabase validates for real. */
export function isLikelyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value.trim());
}

/**
 * A reader-facing message when someone lands back from a link that failed (expired, already
 * used, or rejected). Supabase reports these in the URL hash or query string.
 */
export function linkErrorFromUrl(href: string): string | null {
  const url = new URL(href);
  const params = new URLSearchParams(url.hash.replace(/^#/, ""));
  for (const [key, value] of url.searchParams) if (!params.has(key)) params.set(key, value);
  const code = params.get("error_code");
  if (!code && !params.get("error")) return null;
  if (code === "otp_expired") {
    return "That sign-in link has expired or was already used. Request a new one below.";
  }
  return "That sign-in link didn't work. Request a new one below.";
}

/** Reader-facing text for a failed send, from the Supabase error's HTTP status. */
export function sendLinkErrorMessage(status: number | undefined): string {
  if (status === 429) return "Too many sign-in emails were requested. Wait a minute and try again.";
  return "The sign-in link could not be sent. Check the address and try again.";
}
