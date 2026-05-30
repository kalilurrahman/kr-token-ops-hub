import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowLeft, ArrowUp, Download } from "lucide-react";
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
  const downloadGuide = () => {
    const blob = new Blob([guideRaw], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tokenops-operating-manual.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="reader-shell" id="guide-top">
      <header className="reader-toolbar reader-toolbar-title">
        <div className="reader-title-block">
          <div className="reader-kicker">
            <span>Master guide</span>
            <span>Operating manual</span>
          </div>
          <h1>TokenOps Operating Manual</h1>
          <p>The complete operating manual from the source markdown.</p>
        </div>
        <div className="reader-actions" aria-label="Guide controls">
          <Link to="/" className="reader-icon-btn" title="Back home" aria-label="Back home">
            <ArrowLeft size={18} />
          </Link>
          <a
            className="reader-icon-btn"
            href="#guide-bottom"
            title="Jump to bottom"
            aria-label="Jump to bottom"
          >
            <ArrowDown size={18} />
          </a>
          <button
            className="reader-icon-btn"
            onClick={downloadGuide}
            title="Download guide"
            aria-label="Download guide"
          >
            <Download size={18} />
          </button>
        </div>
      </header>
      <article className="guide reader-article" dangerouslySetInnerHTML={{ __html: html }} />
      <nav className="reader-bottom-nav" id="guide-bottom" aria-label="Guide navigation">
        <span />
        <a
          className="reader-icon-btn"
          href="#guide-top"
          title="Jump to top"
          aria-label="Jump to top"
        >
          <ArrowUp size={18} />
        </a>
        <span />
      </nav>
    </section>
  );
}
