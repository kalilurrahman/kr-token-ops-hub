import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowLeft, ArrowUp, Download } from "lucide-react";
import { marked } from "marked";
import chapterRaw from "../../content/sample-chapter-prompt-caching.md?raw";

const html = marked.parse(chapterRaw) as string;

const TITLE = "Prompt Caching Economics — free chapter from The TokenOps Handbook";
const DESCRIPTION =
  "A complete chapter on prompt caching: the break-even math for write-premium caches, provider-by-provider mechanics, the six anti-patterns that destroy hit rates, and a worked example cutting a support agent's bill 62.7%.";
const PAGE_URL = "https://tokenops.kalilurrahman.com/sample-chapter";

export const Route = createFileRoute("/sample-chapter")({
  component: SampleChapterPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: PAGE_URL },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Prompt Caching Economics",
          description: DESCRIPTION,
          isPartOf: {
            "@type": "Book",
            name: "The TokenOps Handbook, 2026 Edition",
          },
          isAccessibleForFree: true,
          author: { "@type": "Person", name: "Kalilur Rahman" },
          publisher: {
            "@type": "Organization",
            name: "TokenOps Atlas",
            logo: {
              "@type": "ImageObject",
              url: "https://tokenops.kalilurrahman.com/icon-512.png",
            },
          },
          mainEntityOfPage: PAGE_URL,
        }),
      },
    ],
  }),
});

function SampleChapterPage() {
  const downloadChapter = () => {
    const blob = new Blob([chapterRaw], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tokenops-handbook-ch8-prompt-caching.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="reader-shell" id="chapter-top">
      <header className="reader-toolbar reader-toolbar-title">
        <div className="reader-title-block">
          <div className="reader-kicker">
            <span>Free chapter</span>
            <span>The TokenOps Handbook, 2026 Edition</span>
          </div>
          <h1>Prompt Caching Economics</h1>
          <p>
            Chapter 8, published in full. The break-even math for write-premium caches, the six
            anti-patterns that silently destroy hit rates, and a worked example that cuts a support
            agent's bill by 62.7% — every figure rendered from the maintained pricing dataset and
            verified by an automated arithmetic check.
          </p>
        </div>
        <div className="reader-actions" aria-label="Chapter controls">
          <Link to="/" className="reader-icon-btn" title="Back home" aria-label="Back home">
            <ArrowLeft size={18} />
          </Link>
          <a
            className="reader-icon-btn"
            href="#chapter-bottom"
            title="Jump to bottom"
            aria-label="Jump to bottom"
          >
            <ArrowDown size={18} />
          </a>
          <button
            className="reader-icon-btn"
            onClick={downloadChapter}
            title="Download chapter"
            aria-label="Download chapter"
          >
            <Download size={18} />
          </button>
        </div>
      </header>

      <article className="guide reader-article" dangerouslySetInnerHTML={{ __html: html }} />

      <nav className="reader-bottom-nav" id="chapter-bottom" aria-label="Chapter navigation">
        <Link to="/guide" className="reader-icon-btn reader-icon-btn-wide">
          Read the free operating manual
        </Link>
        <a
          className="reader-icon-btn"
          href="#chapter-top"
          title="Jump to top"
          aria-label="Jump to top"
        >
          <ArrowUp size={18} />
        </a>
        <Link to="/calculator" className="reader-icon-btn reader-icon-btn-wide">
          Price your own workload
        </Link>
      </nav>
    </section>
  );
}
