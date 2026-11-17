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
 */
/** Returns a new href, `null` to render the link's text without a link, or `undefined` to keep it. */
export type LinkResolver = (href: string) => string | null | undefined;

// Set only for the duration of one synchronous `renderMarkdown` call.
let activeLinkResolver: LinkResolver | undefined;

const longForm = new Marked({
  hooks: { postprocess: focusableTables },
  renderer: {
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

export function renderMarkdown(source: string, resolveLink?: LinkResolver): string {
  activeLinkResolver = resolveLink;
  try {
    return longForm.parse(source, { async: false }) as string;
  } finally {
    activeLinkResolver = undefined;
  }
}
