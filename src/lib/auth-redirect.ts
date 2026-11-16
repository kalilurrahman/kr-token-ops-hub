/**
 * Helpers for the /auth sign-in page. Pure and browser-safe so they can be unit-tested.
 *
 * Sign-in is only for the AI workload adviser; reading lists stay device-local (AGENTS.md).
 */

export const AUTH_PATH = "/auth";
const DEFAULT_REDIRECT = "/";

function hasControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}

/**
 * Where to send someone after sign-in. Only same-site paths are allowed ("/library",
 * "/read/x.md?a=1"), never another origin ("//evil.test", "/\\evil.test", "https://…"),
 * control characters, or the sign-in page itself.
 */
export function safeRedirect(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_REDIRECT;
  const path = value.trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) {
    return DEFAULT_REDIRECT;
  }
  if (hasControlCharacter(path)) return DEFAULT_REDIRECT;
  const pathname = path.split(/[?#]/, 1)[0] ?? "";
  if (pathname === AUTH_PATH || pathname.startsWith(`${AUTH_PATH}/`)) return DEFAULT_REDIRECT;
  return path;
}

/** The URL the emailed sign-in link returns to: /auth, keeping a safe redirect target. */
export function buildEmailRedirect(origin: string, redirect: unknown): string {
  const target = safeRedirect(redirect);
  const query = target === DEFAULT_REDIRECT ? "" : `?redirect=${encodeURIComponent(target)}`;
  return `${origin}${AUTH_PATH}${query}`;
}

/**
 * Supabase reports a failed email link in the URL fragment, for example
 * `#error=access_denied&error_code=otp_expired&error_description=…`. Returns fixed text
 * (the description in the URL is never shown, so a crafted link cannot inject a message).
 */
export function readAuthLinkError(hash: string): string | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  if (!params.has("error") && !params.has("error_code")) return null;
  if (params.get("error_code") === "otp_expired") {
    return "That sign-in link has expired or was already used. Request a new one below.";
  }
  return "That sign-in link could not be used. Request a new one below.";
}
