import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";
import content from "@/tokenops/content.json";
import type { TokenOpsContent } from "@/tokenops/data";

const data = content as TokenOpsContent;

export const Route = createFileRoute("/patterns")({
  component: PatternsPage,
  head: () => ({
    meta: [
      { title: "Optimization Patterns — TokenOps Atlas" },
      {
        name: "description",
        content: "Reusable recipes for reducing LLM token waste without degrading outcomes.",
      },
    ],
  }),
});

function PatternsPage() {
  return (
    <section className="stack">
      <div className="page-heading">
        <h1>Optimization Patterns</h1>
        <p>Reusable recipes for reducing waste without degrading outcomes.</p>
      </div>
      <div className="section-grid">
        {data.patterns.map((pattern) => (
          <article className="tile" key={pattern.title}>
            <Layers size={21} />
            <h3>{pattern.title}</h3>
            <p>{pattern.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
