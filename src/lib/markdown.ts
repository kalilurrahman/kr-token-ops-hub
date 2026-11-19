import { Marked, type Tokens } from "marked";

/** Wide tables scroll sideways on phones; tabindex lets keyboard users focus and scroll them. */
export const focusableTables = (html: string) => html.replaceAll("<table>", '<table tabindex="0">');

/**
 * Markdown renderer for long-form pages (guide, sample chapter, library reader).
 *
 * Identical output to `marked` except list items, and visible text is unchanged:
 * - GFM task-list items are wrapped in a <label> so their own text names the (disabled)
 *   checkbox for assistive technology.
 * - Items that are nothing but one link (optionally with a nested list), as in a table of
 *   contents, get `class="link-item"` so the component layer can give them full tap targets.
 * - Tables get `tabindex="0"` (see `focusableTables`).
 * - With a `resolveLink` callback (the library reader passes `resolveReaderLink`), each link's
 *   href can be rewritten, or the link dropped to its text when it points at nothing.
 * - Headings get GitHub-style ids (`## Part 1: Foundations` → `id="part-1-foundations"`, unique
 *   within the document), so a table of contents and shared `#section` links work. The text of
 *   an h2/h3 links to its own section (`a.heading-link`, a "#" shown on hover); headings that
 *   already contain a link only get the id. Pass `{ headingIds: false }` where several rendered
 *   fragments share one page (the release notes cards).
 */
/** Returns a new href, `null` to render the link's text without a link, or `undefined` to keep it. */
export type LinkResolver = (href: string) => string | null | undefined;

// Set only for the duration of one synchronous `renderMarkdown` call.
let activeLinkResolver: LinkResolver | undefined;
let headingIds = true;
let usedSlugs = new Map<string, number>();

/** GitHub's heading slug: lowercase, punctuation dropped, each space a hyphen. */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s/g, "-");
}

function uniqueSlug(text: string): string {
  const base = slugify(text);
  if (!base) return "";
  const seen = usedSlugs.get(base) ?? 0;
  usedSlugs.set(base, seen + 1);
  return seen ? `${base}-${seen}` : base;
}

const containsLink = (tokens: Tokens.Generic[] = []): boolean =>
  tokens.some((token) => token.type === "link" || containsLink(token.tokens));

const longForm = new Marked({
  hooks: { postprocess: focusableTables },
  renderer: {
    heading(token) {
      if (!headingIds) return false;
      const text = this.parser.parseInline(token.tokens, this.parser.textRenderer);
      const id = uniqueSlug(text);
      if (!id) return false;
      const inner = this.parser.parseInline(token.tokens);
      const body =
        token.depth >= 2 && token.depth <= 3 && !containsLink(token.tokens)
          ? `<a class="heading-link" href="#${id}">${inner}</a>`
          : inner;
      return `<h${token.depth} id="${id}">${body}</h${token.depth}>\n`;
    },
    link(token) {
      const next = activeLinkResolver?.(token.href);
      if (next === undefined) return false; // default rendering
      if (next === null) return this.parser.parseInline(token.tokens);
      token.href = next;
      return false; // default rendering, with the rewritten href
    },
    listitem(item) {
      if (item.task && !item.loose) {
        return `<li class="task-list-item"><label>${this.parser.parse(item.tokens)}</label></li>\n`;
      }
      if (isLinkOnly(item)) return `<li class="link-item">${this.parser.parse(item.tokens)}</li>\n`;
      return false; // default rendering
    },
  },
});

function isLinkOnly(item: Tokens.ListItem): boolean {
  if (item.task || item.loose) return false;
  const [first, ...rest] = item.tokens;
  return (
    first?.type === "text" &&
    "tokens" in first &&
    first.tokens?.length === 1 &&
    first.tokens[0].type === "link" &&
    rest.every((token) => token.type === "list" || token.type === "space")
  );
}

export function renderMarkdown(
  source: string,
  resolveLink?: LinkResolver,
  options: { headingIds?: boolean } = {},
): string {
  activeLinkResolver = resolveLink;
  headingIds = options.headingIds ?? true;
  usedSlugs = new Map();
  try {
    return longForm.parse(source, { async: false }) as string;
  } finally {
    activeLinkResolver = undefined;
    headingIds = true;
  }
}
