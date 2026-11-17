/**
 * Cross-document links inside library and template Markdown.
 *
 * The documents were written as files in a content pack: a library guide at
 * `library/guides/tokenops-faq.md` links to a template as `../../public/templates/x.md` and to
 * a sibling as `./other.md`. On the site they open in the reader (`/read/library/<key>`,
 * `/read/template/<key>`), where the browser would resolve those paths against the reader URL
 * and land on a 404. `resolveReaderLink` resolves them against the document's place in the pack
 * instead and returns the reader URL of the target.
 */
export type ReaderSource = "library" | "template";

export interface ReaderDocRef {
  source: ReaderSource;
  key: string;
}

/** The keys of `src/tokenops/documents.json`. */
export interface ReaderDocIndex {
  library: Record<string, unknown>;
  templates: Record<string, unknown>;
}

/**
 * Returns the reader URL for a relative link, `null` when it points at nothing on the site
 * (render its text without a link), or `undefined` for links that need no change: absolute URLs,
 * other schemes, root-relative paths and in-page `#anchors`.
 */
export function resolveReaderLink(
  href: string,
  from: ReaderDocRef,
  docs: ReaderDocIndex,
): string | null | undefined {
  if (!href || href.startsWith("#") || href.startsWith("/") || /^[a-z][a-z\d+.-]*:/i.test(href)) {
    return undefined;
  }
  const cut = href.search(/[?#]/);
  const path = cut === -1 ? href : href.slice(0, cut);
  const hash = href.indexOf("#");
  const fragment = hash === -1 ? "" : href.slice(hash);

  const parts =
    from.source === "library" ? ["library", ...from.key.split("/").slice(0, -1)] : ["templates"];
  for (const segment of path.split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") parts.pop();
    else parts.push(segment);
  }
  if (parts[0] === "public") parts.shift();

  const [area, ...rest] = parts;
  const key = rest.join("/");
  let name = key;
  try {
    name = decodeURIComponent(key);
  } catch {
    // keep the raw key
  }
  if (area === "templates") {
    if (!key) return "/templates";
    return name in docs.templates ? `/read/template/${key}${fragment}` : null;
  }
  if (area === "library") {
    if (!key) return "/library";
    return name in docs.library ? `/read/library/${key}${fragment}` : null;
  }
  return null;
}
