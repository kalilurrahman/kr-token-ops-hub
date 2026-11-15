import { Marked } from "marked";

/**
 * Markdown renderer for long-form pages (guide, sample chapter, library reader).
 *
 * Identical output to `marked` except GFM task-list items: the item is wrapped in a
 * <label> so its own text names the (disabled) checkbox for assistive technology.
 * Visible text is unchanged.
 */
const longForm = new Marked({
  renderer: {
    listitem(item) {
      if (!item.task || item.loose) return false; // default rendering
      return `<li class="task-list-item"><label>${this.parser.parse(item.tokens)}</label></li>\n`;
    },
  },
});

export function renderMarkdown(source: string): string {
  return longForm.parse(source, { async: false }) as string;
}
