import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { marked } from "marked";
import content from "@/tokenops/content.json";
import type { TokenOpsContent } from "@/tokenops/data";
import { downloadLibraryFile } from "@/tokenops/data";

const data = content as TokenOpsContent;

export const Route = createFileRoute("/read/$")({
  component: ReaderPage,
  head: ({ params }) => {
    const path = (params as { _splat?: string })._splat ?? "";
    const item = data.library.find((i) => i.file === path);
    const title = item ? `${item.title} — TokenOps Atlas` : "Read — TokenOps Atlas";
    return {
      meta: [
        { title },
        { name: "description", content: item?.desc ?? "Read TokenOps reference material in your browser." },
      ],
    };
  },
});

function ReaderPage() {
  const { _splat } = Route.useParams() as { _splat: string };
  const path = _splat;
  const item = data.library.find((i) => i.file === path);

  const [raw, setRaw] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRaw(null);
    setError(null);
    fetch(`/library/${path}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load (${r.status})`);
        return r.text();
      })
      .then((t) => { if (!cancelled) setRaw(t); })
      .catch((e) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [path]);

  if (!path) throw notFound();

  const isMarkdown = path.toLowerCase().endsWith(".md");
  const html = raw && isMarkdown ? (marked.parse(raw) as string) : null;

  return (
    <section className="reader-shell">
      <div className="reader-toolbar">
        <Link to="/library" className="reader-back">
          <ArrowLeft size={16} /> Back to Library
        </Link>
        <div className="reader-actions">
          <a
            className="download-btn"
            href={`/library/${path}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={15} /> View raw
          </a>
          <button className="download-btn" onClick={() => downloadLibraryFile(path)}>
            <Download size={15} /> Download
          </button>
        </div>
      </div>

      {item && (
        <header className="reader-header">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            <span className="badge">{item.format}</span>
            <span className="category-tag">{item.category}</span>
          </div>
          <h1>{item.title}</h1>
          <p>{item.desc}</p>
        </header>
      )}

      <article className="guide reader-article">
        {error && <p style={{ color: "var(--red, #a13b32)" }}>Couldn't load document: {error}</p>}
        {!raw && !error && <p style={{ color: "var(--muted)" }}>Loading…</p>}
        {raw && isMarkdown && html && (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        )}
        {raw && !isMarkdown && (
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{raw}</pre>
        )}
      </article>
    </section>
  );
}