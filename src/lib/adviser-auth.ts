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

/**
 * True when the URL carries the result of an emailed sign-in link: session tokens or a link
 * error. Supabase falls back to the Site URL (the homepage) when the return page isn't on its
 * redirect allow-list, so the link can land on any page, not just the briefing.
 */
export function hasEmailLinkResult(href: string): boolean {
  const url = new URL(href);
  const params = new URLSearchParams(url.hash.replace(/^#/, ""));
  for (const [key, value] of url.searchParams) if (!params.has(key)) params.set(key, value);
  return params.has("access_token") || params.has("error_code") || params.has("error_description");
}

/** localStorage key for the briefing a sign-in link was requested from (path only). */
export const RETURN_PATH_KEY = "tokenops-adviser-return";
/** Supabase email links expire after an hour by default; an older return path is ignored. */
export const RETURN_PATH_TTL_MS = 60 * 60 * 1000;

/** A same-site path ("/read/x.md?a=1"), or null for anything that could leave the site. */
export function safeReturnPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 0x20 || code === 0x7f) return null;
  }
  return value;
}

/** The stored form of a return path: the page's path and query, stamped with the time. */
export function encodeReturnPath(href: string, now: number): string | null {
  const url = new URL(signInRedirectUrl(href));
  const path = safeReturnPath(`${url.pathname}${url.search}`);
  return path ? JSON.stringify({ path, at: now }) : null;
}

/** The return path from storage if it is well formed, same-site and under an hour old. */
export function decodeReturnPath(raw: string | null, now: number): string | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;
    const { path, at } = value as { path?: unknown; at?: unknown };
    if (typeof at !== "number" || now - at < 0 || now - at > RETURN_PATH_TTL_MS) return null;
    return safeReturnPath(path);
  } catch {
    return null;
  }
}
