/**
 * Canonical links. Every page names itself at https://tokenops.kalilurrahman.com<path>, without
 * a query string or fragment, and without a trailing slash except on the home page. The root
 * route (src/routes/__root.tsx) adds the link for whichever route is showing, so no route file
 * has to remember it.
 */
export const SITE_ORIGIN = "https://tokenops.kalilurrahman.com";

/** The canonical URL for a pathname (a full path with a query string or fragment is accepted). */
export function canonicalUrl(pathname: string): string {
  let path = pathname.split(/[?#]/, 1)[0] || "/";
  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/{2,}/g, "/");
  if (path.length > 1) path = path.replace(/\/+$/, "");
  return `${SITE_ORIGIN}${path}`;
}

/** The <link rel="canonical"> for a pathname, in the shape a TanStack head() returns. */
export function canonicalLink(pathname: string): { rel: "canonical"; href: string } {
  return { rel: "canonical", href: canonicalUrl(pathname) };
}
