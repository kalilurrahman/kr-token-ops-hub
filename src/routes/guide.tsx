import { createFileRoute } from "@tanstack/react-router";
import { marked } from "marked";
import guideRaw from "@/tokenops/guide.md?raw";

const html = marked.parse(guideRaw) as string;

export const Route = createFileRoute("/guide")({
  component: GuidePage,
  head: () => ({
    meta: [
      { title: "Guide — TokenOps Atlas" },
      { name: "description", content: "The complete TokenOps operating manual." },
    ],
  }),
});

function GuidePage() {
  return (
    <section className="article-shell">
      <aside>
        <h2>Guide</h2>
        <p>The complete TokenOps operating manual from the source markdown.</p>
      </aside>
      <article className="guide" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}