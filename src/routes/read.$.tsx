import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowDown, ArrowLeft, ArrowUp, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { marked } from "marked";
import content from "@/tokenops/content.json";
import documents from "@/tokenops/documents.json";
import type { TokenOpsContent } from "@/tokenops/data";
import { downloadLibraryFile, downloadTemplate } from "@/tokenops/data";

const data = content as TokenOpsContent;
const documentStore = documents as {
  library: Record<string, string>;
  templates: Record<string, string>;
};

type ReaderEntry = {
  source: "library" | "template";
  key: string;
  readPath: string;
  title: string;
  desc: string;
  category: string;
  format: string;
};

const readerEntries: ReaderEntry[] = [
  ...data.library.map((item) => ({
    source: "library" as const,
    key: item.file,
    readPath: `library/${item.file}`,
    title: item.title,
    desc: item.desc,
    category: item.category,
    format: item.format,
  })),
  ...[...data.resources, ...data.templates]
    .filter((item) => item.file && item.format !== "PDF")
    .map((item) => ({
      source: "template" as const,
      key: item.file!,
      readPath: `template/${item.file}`,
      title: item.title,
      desc: item.desc,
      category: item.category,
      format: item.format,
    })),
];

function resolveReaderPath(path: string) {
  if (path.startsWith("template/")) return { source: "template" as const, key: path.slice("template/".length) };
  if (path.startsWith("library/")) return { source: "library" as const, key: path.slice("library/".length) };
  return { source: "library" as const, key: path };
}

export const Route = createFileRoute("/read/$")({
  component: ReaderPage,
  head: ({ params }) => {
    const path = (params as { _splat?: string })._splat ?? "";
    const resolved = resolveReaderPath(path);
    const item = readerEntries.find((i) => i.source === resolved.source && i.key === resolved.key);
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
  if (!path) throw notFound();

  const resolved = resolveReaderPath(path);
  const raw = resolved.source === "template"
    ? documentStore.templates[resolved.key]
    : documentStore.library[resolved.key];
  if (!raw) throw notFound();

  const item = readerEntries.find((i) => i.source === resolved.source && i.key === resolved.key);
  const currentIndex = readerEntries.findIndex((i) => i.source === resolved.source && i.key === resolved.key);
  const previous = currentIndex > 0 ? readerEntries[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < readerEntries.length - 1 ? readerEntries[currentIndex + 1] : null;

  const isMarkdown = resolved.key.toLowerCase().endsWith(".md");
  const html = isMarkdown ? (marked.parse(raw) as string) : null;
  const handleDownload = () => {
    if (resolved.source === "template") downloadTemplate(resolved.key);
    else downloadLibraryFile(resolved.key);
  };

  return (
    <section className="reader-shell" id="reader-top">
      <header className="reader-toolbar reader-toolbar-title">
        <div className="reader-title-block">
          <div className="reader-kicker">
            <span>{resolved.source === "template" ? "Starter resource" : "Content library"}</span>
            {item && <span>{item.category}</span>}
          </div>
          <h1>{item?.title ?? resolved.key}</h1>
          {item && <p>{item.desc}</p>}
        </div>
        <div className="reader-actions" aria-label="Reader controls">
          {resolved.source === "template" ? (
            <Link to="/resources" className="reader-icon-btn" title="Back to resources" aria-label="Back to resources">
              <ArrowLeft size={18} />
            </Link>
          ) : (
            <Link to="/library" className="reader-icon-btn" title="Back to library" aria-label="Back to library">
              <ArrowLeft size={18} />
            </Link>
          )}
          {previous && (
            <Link to="/read/$" params={{ _splat: previous.readPath }} className="reader-icon-btn" title="Previous document" aria-label="Previous document">
              <ChevronLeft size={18} />
            </Link>
          )}
          {next && (
            <Link to="/read/$" params={{ _splat: next.readPath }} className="reader-icon-btn" title="Next document" aria-label="Next document">
              <ChevronRight size={18} />
            </Link>
          )}
          <a className="reader-icon-btn" href="#reader-bottom" title="Jump to bottom" aria-label="Jump to bottom">
            <ArrowDown size={18} />
          </a>
          <button className="reader-icon-btn" onClick={handleDownload} title="Download source" aria-label="Download source">
            <Download size={18} />
          </button>
        </div>
      </header>

      <article className="guide reader-article" id="reader-content">
        {item && (
          <div className="reader-meta-row">
            <span className="badge">{item.format}</span>
            <span className="category-tag">{item.category}</span>
          </div>
        )}
        {isMarkdown && html && (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        )}
        {!isMarkdown && (
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{raw}</pre>
        )}
      </article>

      <nav className="reader-bottom-nav" id="reader-bottom" aria-label="Document navigation">
        {previous ? (
          <Link to="/read/$" params={{ _splat: previous.readPath }} className="reader-icon-btn reader-icon-btn-wide">
            <ChevronLeft size={18} /> Previous
          </Link>
        ) : <span />}
        <a className="reader-icon-btn" href="#reader-top" title="Jump to top" aria-label="Jump to top">
          <ArrowUp size={18} />
        </a>
        {next ? (
          <Link to="/read/$" params={{ _splat: next.readPath }} className="reader-icon-btn reader-icon-btn-wide">
            Next <ChevronRight size={18} />
          </Link>
        ) : <span />}
      </nav>
    </section>
  );
}