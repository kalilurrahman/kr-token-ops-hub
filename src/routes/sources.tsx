import { createFileRoute } from "@tanstack/react-router";
import content from "@/tokenops/content.json";
import type { TokenOpsContent } from "@/tokenops/data";

const data = content as TokenOpsContent;

export const Route = createFileRoute("/sources")({
  component: SourcesPage,
  head: () => ({
    meta: [
      { title: "Sources — TokenOps Atlas" },
      { name: "description", content: "Reference material used by the TokenOps guide and implementation spec." },
    ],
  }),
});

function SourcesPage() {
  return (
    <section className="stack">
      <div className="page-heading">
        <h1>Sources</h1>
        <p>Reference material used by the TokenOps guide and implementation spec.</p>
      </div>
      <div className="source-list">
        {data.sources.map((source) => (
          <div key={source}>{source}</div>
        ))}
      </div>
    </section>
  );
}