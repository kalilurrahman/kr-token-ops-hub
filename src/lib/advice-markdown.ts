import { Marked } from "marked";

/**
 * Markdown for AI workload adviser answers. These are model output that a reader can steer
 * through the workload description, so unlike `renderMarkdown` (trusted library documents):
 * - raw HTML in the answer is shown as text, never parsed;
 * - links keep only https:, http:, mailto: and same-site paths; external ones open in a new tab;
 * - images are not loaded (no remote requests, nothing that can track readers); the alt text
 *   is shown instead.
 * Everything else (headings, lists, emphasis, GFM tables, code) is marked's escaped output.
 */

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** A link target that is safe to render, or null to show the link text only. */
export function safeAdviceHref(href: string): { href: string; external: boolean } | null {
  const value = href.trim();
  if (value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")) {
    return { href: value, external: false };
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol === "https:" || url.protocol === "http:")
    return { href: url.href, external: true };
  if (url.protocol === "mailto:") return { href: url.href, external: false };
  return null;
}

const advice = new Marked({
  gfm: true,
  renderer: {
    html({ text, block }) {
      return block ? `<p>${escapeHtml(text.trim())}</p>\n` : escapeHtml(text);
    },
    link({ href, title, tokens }) {
      const inner = this.parser.parseInline(tokens);
      const safe = safeAdviceHref(href);
      if (!safe) return inner;
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
      const externalAttrs = safe.external
        ? ' target="_blank" rel="noopener noreferrer nofollow"'
        : "";
      return `<a href="${escapeHtml(safe.href)}"${titleAttr}${externalAttrs}>${inner}</a>`;
    },
    image({ text }) {
      return escapeHtml(text);
    },
  },
});

export function renderAdviceMarkdown(source: string): string {
  return advice.parse(source, { async: false }) as string;
}
