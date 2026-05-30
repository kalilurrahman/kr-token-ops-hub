import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckSquare, FileCode2, FileText, FolderDown, Package } from "lucide-react";
import content from "@/tokenops/content.json";
import type { TokenOpsContent } from "@/tokenops/data";
import { downloadAllTemplates } from "@/tokenops/data";
import { ResourceCard } from "@/components/ResourceCard";

const data = content as TokenOpsContent;

export const Route = createFileRoute("/resources")({
  component: ResourcesPage,
  head: () => ({
    meta: [
      { title: "Resources — TokenOps Atlas" },
      {
        name: "description",
        content:
          "Documents, templates, and starter artifacts to implement TokenOps across your organization.",
      },
    ],
  }),
});

function ResourcesPage() {
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Document", "Engineering", "Finance", "Governance"];
  const allItems = [...data.resources, ...data.templates];
  const filtered =
    filter === "All" ? allItems : allItems.filter((item) => item.category === filter);

  return (
    <section className="stack">
      <div className="page-heading">
        <h1>Resources</h1>
        <p>
          Documents, templates, and starter artifacts to implement TokenOps across your
          organization.
        </p>
      </div>

      <div className="starter-kit-banner">
        <div>
          <h3>
            <Package size={20} style={{ verticalAlign: "middle", marginRight: 8 }} />
            Starter Kit — All Templates
          </h3>
          <p>
            Download every template and reference document in one batch. Get your team from zero to
            instrumented in weeks, not months.
          </p>
          <div className="starter-kit-items">
            <span>
              <CheckSquare size={12} /> 8 Templates
            </span>
            <span>
              <FileText size={12} /> 2 Documents
            </span>
            <span>
              <FileCode2 size={12} /> YAML + Markdown + SQL
            </span>
          </div>
        </div>
        <button className="download-btn" onClick={downloadAllTemplates}>
          <FolderDown size={18} /> Download All
        </button>
      </div>

      <div className="filter-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-tab ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="section-grid two">
        {filtered.map((item) => (
          <ResourceCard key={item.title} item={item} />
        ))}
      </div>
    </section>
  );
}
