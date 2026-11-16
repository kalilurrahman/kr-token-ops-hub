import { Marked, type Tokens } from "marked";

/** Wide tables scroll sideways on phones; tabindex lets keyboard users focus and scroll them. */
const focusableTables = (html: string) => html.replaceAll("<table>", '<table tabindex="0">');

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

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** http(s), mailto, same-page anchors and same-site paths; anything else (javascript:, data:) is dropped. */
const SAFE_HREF = /^(?:https?:\/\/|mailto:|#|\/(?![/\\]))/i;

/**
 * Markdown from an untrusted source (AI adviser output). Marked already escapes text, code and
 * attributes; this renderer also escapes raw HTML, drops images, and keeps only safe links, which
 * open in a new tab so the advice stays on screen.
 */
const untrusted = new Marked({
  hooks: { postprocess: focusableTables },
  renderer: {
    html({ text }) {
      return escapeHtml(text);
    },
    image({ text }) {
      return escapeHtml(text);
    },
    link({ href, title, tokens }) {
      const label = this.parser.parseInline(tokens);
      const target = href.trim();
      if (!SAFE_HREF.test(target)) return label;
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
      return `<a href="${escapeHtml(target)}"${titleAttr} target="_blank" rel="noopener noreferrer nofollow">${label}</a>`;
    },
  },
});

export function renderUntrustedMarkdown(source: string): string {
  return untrusted.parse(source, { async: false }) as string;
}
