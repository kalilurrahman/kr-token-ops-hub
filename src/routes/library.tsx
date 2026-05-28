import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Download, Library as LibraryIcon } from "lucide-react";
import content from "@/tokenops/content.json";
import type { TokenOpsContent } from "@/tokenops/data";
import { downloadLibraryFile, libraryCategoryMeta } from "@/tokenops/data";

const data = content as TokenOpsContent;

export const Route = createFileRoute("/library")({
  component: LibraryPage,
  head: () => ({
    meta: [
      { title: "Library — TokenOps Atlas" },
      { name: "description", content: "29 guides, playbooks, checklists, references, and operating templates for running TokenOps in production." },
      { property: "og:title", content: "TokenOps Library" },
      { property: "og:description", content: "Guides, playbooks, checklists, references, and operating templates for running TokenOps." },
    ],
  }),
});

const CATEGORIES = ["All", "Advanced", "Checklist", "Guide", "Playbook", "Reference", "Operating"] as const;

function LibraryPage() {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("All");
  const items = filter === "All" ? data.library : data.library.filter((i) => i.category === filter);

  return (
    <section className="stack">
      <div className="page-heading">
        <p className="eyebrow">Content library</p>
        <h1>The full TokenOps reference library</h1>
        <p>
          {data.library.length} long-form artifacts — every guide, playbook, checklist, reference, and operating template
          from the TokenOps content pack. Read in the browser or download the source markdown.
        </p>
      </div>

      <div className="filter-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-tab ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat === "All" ? "All" : libraryCategoryMeta[cat]?.label ?? cat}
          </button>
        ))}
      </div>

      {filter !== "All" && libraryCategoryMeta[filter] && (
        <p className="hero-copy" style={{ marginTop: -8, color: "var(--muted)" }}>
          {libraryCategoryMeta[filter].tagline}
        </p>
      )}

      <div className="section-grid two">
        {items.map((item) => (
          <article className="resource-card" key={item.file}>
            <div className="resource-card-header">
              <div className="resource-card-icon">
                <LibraryIcon size={22} />
              </div>
              <div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
            <div className="resource-card-footer">
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span className="badge">{item.format}</span>
                <span className="category-tag">{item.category}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Link
                  className="download-btn"
                  to="/read/$"
                  params={{ _splat: item.file }}
                >
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