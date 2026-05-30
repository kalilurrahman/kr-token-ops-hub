import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import content from "@/tokenops/content.json";
import type { TokenOpsContent } from "@/tokenops/data";
import { ResourceCard } from "@/components/ResourceCard";

const data = content as TokenOpsContent;

export const Route = createFileRoute("/templates")({
  component: TemplatesPage,
  head: () => ({
    meta: [
      { title: "Templates — TokenOps Atlas" },
      {
        name: "description",
        content: "Starter operating artifacts for making TokenOps repeatable.",
      },
    ],
  }),
});

function TemplatesPage() {
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Engineering", "Finance", "Governance"];
  const filtered =
    filter === "All" ? data.templates : data.templates.filter((t) => t.category === filter);

  return (
    <section className="stack">
      <div className="page-heading">
        <h1>Templates</h1>
        <p>
          Starter operating artifacts for making TokenOps repeatable. Each template is ready to
          download and customize.
        </p>
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
        {filtered.map((template) => (
          <ResourceCard key={template.title} item={template} />
        ))}
      </div>
    </section>
  );
}
