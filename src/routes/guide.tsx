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
    <section className="reader-shell">
      <header className="reader-header">
        <p className="eyebrow">Master guide</p>
        <h1>TokenOps Operating Manual</h1>
        <p>The complete operating manual from the source markdown.</p>
      </header>
      <article className="guide reader-article" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}