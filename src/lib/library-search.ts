/**
 * Full-text search for /library. Pure functions so ranking and snippets are tested without a
 * browser; the page loads the document text (src/tokenops/documents.json) only when someone
 * searches, so the library page itself stays small.
 *
 * Every search word must appear somewhere in a document (title, description, category or text).
 * Matches in the title rank above the description, which ranks above the category and the text.
 */
export interface SearchableDoc {
  file: string;
  title: string;
  desc: string;
  category: string;
}

export interface LibraryHit<T extends SearchableDoc> {
  doc: T;
  /** A short passage of the document text around the first search word found there. */
  snippet?: string;
}

const MAX_TERMS = 8;
const SNIPPET_RADIUS = 90;

/** Lower-cased search words, deduplicated, at most eight. */
export function searchTerms(query: string): string[] {
  const words = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}$%.+#-]+/u)
    .map((word) => word.replace(/^[.\-+#]+|[.\-+#]+$/g, ""))
    .filter(Boolean);
  return [...new Set(words)].slice(0, MAX_TERMS);
}

/** Markdown reduced to readable plain text for matching and snippets. */
export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/```[^\n]*\n/g, " ") // code fence lines (keep the code itself)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // images → alt text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links → link text
    .replace(/<[^>]+>/g, " ") // inline HTML
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+[.)])\s+/gm, "") // headings, quotes, list markers
    .replace(/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/gm, " ") // table rules
    .replace(/[|*_`~]/g, " ") // table pipes, emphasis, code ticks
    .replace(/\s+/g, " ")
    .trim();
}

function snippetAround(text: string, lower: string, terms: string[]): string | undefined {
  let at = -1;
  for (const term of terms) {
    const index = lower.indexOf(term);
    if (index !== -1 && (at === -1 || index < at)) at = index;
  }
  if (at === -1) return undefined;
  let start = Math.max(0, at - SNIPPET_RADIUS);
  let end = Math.min(text.length, at + SNIPPET_RADIUS);
  if (start > 0) start = text.indexOf(" ", start) + 1 || start;
  if (end < text.length) end = text.lastIndexOf(" ", end) > at ? text.lastIndexOf(" ", end) : end;
  return `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
}

/**
 * Documents matching every word of `query`, best first (ties keep their original order). With
 * no search words, every document is returned in order. `bodies` maps a document's `file` to its
 * plain text (see `markdownToPlainText`); without it only titles, descriptions and categories
 * are searched.
 */
export function searchLibrary<T extends SearchableDoc>(
  docs: readonly T[],
  query: string,
  bodies?: Readonly<Record<string, string>>,
): LibraryHit<T>[] {
  const terms = searchTerms(query);
  if (terms.length === 0) return docs.map((doc) => ({ doc }));

  const scored: { hit: LibraryHit<T>; score: number; order: number }[] = [];
  docs.forEach((doc, order) => {
    const title = doc.title.toLowerCase();
    const desc = doc.desc.toLowerCase();
    const category = doc.category.toLowerCase();
    const body = bodies?.[doc.file] ?? "";
    const bodyLower = body.toLowerCase();
    let score = 0;
    const inBodyOnly: string[] = [];
    for (const term of terms) {
      const termScore =
        (title.includes(term) ? 10 : 0) +
        (desc.includes(term) ? 4 : 0) +
        (category.includes(term) ? 3 : 0);
      const bodyHit = bodyLower.includes(term);
      if (termScore === 0 && !bodyHit) return; // every word must match somewhere
      if (termScore === 0) inBodyOnly.push(term);
      score += termScore + (bodyHit ? 1 : 0);
    }
    const snippet = inBodyOnly.length > 0 ? snippetAround(body, bodyLower, inBodyOnly) : undefined;
    scored.push({ hit: snippet ? { doc, snippet } : { doc }, score, order });
  });
  return scored.sort((a, b) => b.score - a.score || a.order - b.order).map(({ hit }) => hit);
}

/** Splits `text` into plain and matching parts so the page can wrap matches in <mark>. */
export function highlightParts(text: string, terms: readonly string[]) {
  const usable = terms.filter(Boolean);
  if (usable.length === 0) return [{ text, match: false }];
  const pattern = new RegExp(
    `(${usable
      .slice()
      .sort((a, b) => b.length - a.length)
      .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|")})`,
    "gi",
  );
  return text
    .split(pattern)
    .filter((part) => part !== "")
    .map((part) => ({ text: part, match: usable.includes(part.toLowerCase()) }));
}
