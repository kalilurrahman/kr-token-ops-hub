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
 */
const longForm = new Marked({
  hooks: { postprocess: focusableTables },
  renderer: {
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

export function renderMarkdown(source: string): string {
  return longForm.parse(source, { async: false }) as string;
}
