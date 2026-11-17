import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Fragment, useEffect, useMemo, useState } from "react";
import { BookOpen, Download, Library as LibraryIcon, Search } from "lucide-react";
import {
  highlightParts,
  markdownToPlainText,
  searchLibrary,
  searchTerms,
} from "@/lib/library-search";
import content from "@/tokenops/content.json";
import type { TokenOpsContent } from "@/tokenops/data";
import { downloadLibraryFile, libraryCategoryMeta } from "@/tokenops/data";

const data = content as TokenOpsContent;

export const Route = createFileRoute("/library")({
  // The search words live in the URL (?q=) so a search can be shared, bookmarked or reloaded.
  // `q` is always returned (undefined when empty) so a raw value can't bypass this check.
  validateSearch: (search: Record<string, unknown>): { q?: string } => {
    // The router parses ?q=123 as a number; a search for a number is still a search.
    const raw = search["q"];
    const q = typeof raw === "number" ? String(raw) : raw;
    return { q: typeof q === "string" && q.trim() ? q.slice(0, 200) : undefined };
  },
  component: LibraryPage,
  head: () => ({
    meta: [
      { title: "Library — TokenOps Atlas" },
      {
        name: "description",
        content: `${data.library.length} guides, playbooks, checklists, references, and operating templates for running TokenOps in production.`,
      },
      { property: "og:title", content: "TokenOps Library" },
      {
        property: "og:description",
        content:
          "Guides, playbooks, checklists, references, and operating templates for running TokenOps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const CATEGORIES = [
  "All",
  "Models",
  "Techniques",
  "Trends",
  "Advanced",
  "Checklist",
  "Guide",
  "Playbook",
  "Reference",
  "Operating",
] as const;

type LibraryText = Record<string, string>;
let libraryText: Promise<LibraryText> | null = null;

/** The documents' plain text, loaded on first search (it is ~230 KB gzipped, shared with /read). */
function loadLibraryText(): Promise<LibraryText> {
  libraryText ??= import("@/tokenops/documents.json")
    .then(({ default: documents }) =>
      Object.fromEntries(
        Object.entries((documents as { library: Record<string, string> }).library).map(
          ([file, markdown]) => [file, markdownToPlainText(markdown)],
        ),
      ),
    )
    .catch((error: unknown) => {
      libraryText = null; // let the next search try again
      throw error;
    });
  return libraryText;
}

function Highlighted({ text, terms }: { text: string; terms: string[] }) {
  return highlightParts(text, terms).map((part, index) =>
    part.match ? (
      <mark key={index}>{part.text}</mark>
    ) : (
      <Fragment key={index}>{part.text}</Fragment>
    ),
  );
}

function LibraryPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/library" });
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("All");
  const [query, setQuery] = useState(q ?? "");
  const [text, setText] = useState<LibraryText | null>(null);
  const terms = useMemo(() => searchTerms(query), [query]);
  const searching = terms.length > 0;

  // Load the full text once someone searches; focusing the box starts the download early.
  useEffect(() => {
    if (!searching || text) return;
    let current = true;
    loadLibraryText().then(
      (loaded) => current && setText(loaded),
      () => {},
    );
    return () => {
      current = false;
    };
  }, [searching, text]);
  useEffect(() => {
    void navigate({
      search: { q: query.trim() ? query : undefined },
      replace: true,
      resetScroll: false,
    });
  }, [navigate, query]);

  const inCategory = useMemo(
    () => (filter === "All" ? data.library : data.library.filter((i) => i.category === filter)),
    [filter],
  );
  const hits = useMemo(
    () => searchLibrary(inCategory, query, text ?? undefined),
    [inCategory, query, text],
  );
  const status = !searching
    ? ""
    : hits.length === 0
      ? `No documents match “${query.trim()}”${filter === "All" ? "" : " in this category"}.`
      : `${hits.length} of ${inCategory.length} documents match${text ? "" : " by title or description (searching the full text…)"}.`;

  return (
    <section className="stack">
      <div className="page-heading">
        <p className="eyebrow">Content library</p>
        <h1>The full TokenOps reference library</h1>
        <p>
          {data.library.length} long-form artifacts — every guide, playbook, checklist, reference,
          and operating template from the TokenOps content pack. Read in the browser or download the
          source markdown.
        </p>
      </div>

      <form className="library-search" role="search" onSubmit={(e) => e.preventDefault()}>
        <div className="library-search-field">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            aria-label="Search the library"
            placeholder={`Search ${data.library.length} documents (e.g. prompt caching, budget alerts)…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => void loadLibraryText().catch(() => {})}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <p className="library-search-status" role="status">
          {status}
        </p>
      </form>

      <div className="filter-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-tab ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat === "All" ? "All" : (libraryCategoryMeta[cat]?.label ?? cat)}
          </button>
        ))}
      </div>

      {filter !== "All" && libraryCategoryMeta[filter] && (
        <p className="hero-copy -mt-2 text-[var(--muted)]">{libraryCategoryMeta[filter].tagline}</p>
      )}

      <div className="section-grid two library-results">
        {hits.map(({ doc: item, snippet }) => (
          <article className="resource-card" key={item.file}>
            <div className="resource-card-header">
              <div className="resource-card-icon">
                <LibraryIcon size={22} />
              </div>
              <div>
                <h2>
                  <Highlighted text={item.title} terms={terms} />
                </h2>
                <p>
                  <Highlighted text={item.desc} terms={terms} />
                </p>
                {snippet && (
                  <p className="library-snippet">
                    <Highlighted text={snippet} terms={terms} />
                  </p>
                )}
              </div>
            </div>
            <div className="resource-card-footer">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge">{item.format}</span>
                <span className="category-tag">{item.category}</span>
              </div>
              <div className="flex gap-2">
                <Link className="download-btn" to="/read/$" params={{ _splat: item.file }}>
                  <BookOpen size={15} /> Read
                </Link>
                <button className="download-btn" onClick={() => downloadLibraryFile(item.file)}>
                  <Download size={15} /> Download
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
