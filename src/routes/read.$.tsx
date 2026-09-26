import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Bookmark, BookmarkCheck, BrainCircuit, ChevronLeft, ChevronRight, Download, FolderHeart, LoaderCircle } from "lucide-react";
import { marked } from "marked";
import { Button } from "@/components/ui/button";
import { recommendWorkload } from "@/lib/workload-adviser.functions";
import { getReadingCollections, READING_LISTS_CHANGED, toggleBriefingInCollection } from "@/lib/reading-lists";
import content from "@/tokenops/content.json";
import documents from "@/tokenops/documents.json";
import type { TokenOpsContent } from "@/tokenops/data";
import { downloadLibraryFile, downloadTemplate } from "@/tokenops/data";
import type { ReadingCollection, SavedBriefing } from "@/types/reading-list.types";

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
  if (path.startsWith("template/"))
    return { source: "template" as const, key: path.slice("template/".length) };
  if (path.startsWith("library/"))
    return { source: "library" as const, key: path.slice("library/".length) };
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
        {
          name: "description",
          content: item?.desc ?? "Read TokenOps reference material in your browser.",
        },
        { property: "og:title", content: title },
        { property: "og:description", content: item?.desc ?? "Read TokenOps reference material in your browser." },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
});

function ReaderPage() {
  const { _splat } = Route.useParams() as { _splat: string };
  const path = _splat;
  if (!path) throw notFound();

  const resolved = resolveReaderPath(path);
  const raw =
    resolved.source === "template"
      ? documentStore.templates[resolved.key]
      : documentStore.library[resolved.key];
  if (!raw) throw notFound();

  const item = readerEntries.find((i) => i.source === resolved.source && i.key === resolved.key);
  const currentIndex = readerEntries.findIndex(
    (i) => i.source === resolved.source && i.key === resolved.key,
  );
  const previous = currentIndex > 0 ? readerEntries[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < readerEntries.length - 1
      ? readerEntries[currentIndex + 1]
      : null;

  const isMarkdown = resolved.key.toLowerCase().endsWith(".md");
  const html = isMarkdown ? (marked.parse(raw) as string) : null;
  const handleDownload = () => {
    if (resolved.source === "template") downloadTemplate(resolved.key);
    else downloadLibraryFile(resolved.key);
  };
  const bookmarkEligible = item?.category === "Models" || item?.category === "Techniques";

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
            <Link
              to="/resources"
              className="reader-icon-btn"
              title="Back to resources"
              aria-label="Back to resources"
            >
              <ArrowLeft size={18} />
            </Link>
          ) : (
            <Link
              to="/library"
              className="reader-icon-btn"
              title="Back to library"
              aria-label="Back to library"
            >
              <ArrowLeft size={18} />
            </Link>
          )}
          {previous && (
            <Link
              to="/read/$"
              params={{ _splat: previous.readPath }}
              className="reader-icon-btn"
              title="Previous document"
              aria-label="Previous document"
            >
              <ChevronLeft size={18} />
            </Link>
          )}
          {next && (
            <Link
              to="/read/$"
              params={{ _splat: next.readPath }}
              className="reader-icon-btn"
              title="Next document"
              aria-label="Next document"
            >
              <ChevronRight size={18} />
            </Link>
          )}
          <a
            className="reader-icon-btn"
            href="#reader-bottom"
            title="Jump to bottom"
            aria-label="Jump to bottom"
          >
            <ArrowDown size={18} />
          </a>
          <button
            className="reader-icon-btn"
            onClick={handleDownload}
            title="Download source"
            aria-label="Download source"
          >
            <Download size={18} />
          </button>
          {bookmarkEligible && item && <ReaderBookmark item={{ file: item.key, title: item.title, description: item.desc, category: item.category, savedAt: "" }} />}
        </div>
      </header>

      <article className="guide reader-article" id="reader-content">
        {item && (
          <div className="reader-meta-row">
            <span className="badge">{item.format}</span>
            <span className="category-tag">{item.category}</span>
          </div>
        )}
        {isMarkdown && html && <div dangerouslySetInnerHTML={{ __html: html }} />}
        {!isMarkdown && (
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{raw}</pre>
        )}
      </article>

      {bookmarkEligible && item && <WorkloadAdviser currentBriefing={item.title} />}

      <nav className="reader-bottom-nav" id="reader-bottom" aria-label="Document navigation">
        {previous ? (
          <Link
            to="/read/$"
            params={{ _splat: previous.readPath }}
            className="reader-icon-btn reader-icon-btn-wide"
          >
            <ChevronLeft size={18} /> Previous
          </Link>
        ) : (
          <span />
        )}
        <a
          className="reader-icon-btn"
          href="#reader-top"
          title="Jump to top"
          aria-label="Jump to top"
        >
          <ArrowUp size={18} />
        </a>
        {next ? (
          <Link
            to="/read/$"
            params={{ _splat: next.readPath }}
            className="reader-icon-btn reader-icon-btn-wide"
          >
            Next <ChevronRight size={18} />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </section>
  );
}

function ReaderBookmark({ item }: { item: SavedBriefing }) {
  const [collections, setCollections] = useState<ReadingCollection[]>([]);
  const [open, setOpen] = useState(false);

  const refresh = async () => setCollections(await getReadingCollections());
  useEffect(() => {
    void refresh();
    window.addEventListener(READING_LISTS_CHANGED, refresh);
    return () => window.removeEventListener(READING_LISTS_CHANGED, refresh);
  }, []);

  const saved = collections.some((collection) => collection.items.some((entry) => entry.file === item.file));
  return (
    <div className="relative">
      <button className="reader-icon-btn" type="button" title="Save to reading list" aria-label="Save to reading list" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
        {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-30 w-72 rounded-md border border-[var(--line)] bg-[var(--surface)] p-3 shadow-[var(--shadow)]">
          <p className="mb-2 text-sm font-semibold text-[var(--ink)]">Save to a private collection</p>
          <div className="grid gap-1">
            {collections.map((collection) => {
              const inCollection = collection.items.some((entry) => entry.file === item.file);
              return <Button key={collection.id} type="button" variant={inCollection ? "default" : "outline"} className="justify-start" onClick={() => void toggleBriefingInCollection(collection.id, item)}>{inCollection ? <BookmarkCheck /> : <Bookmark />} {collection.name}</Button>;
            })}
          </div>
          <Link className="mt-3 flex items-center gap-2 text-sm font-semibold text-[var(--blue)]" to="/reading-lists"><FolderHeart size={16} /> Manage reading lists</Link>
        </div>
      )}
    </div>
  );
}

const adviserOptions = {
  volume: [["pilot", "Pilot"], ["moderate", "Moderate"], ["high", "High"], ["very-high", "Very high"]],
  contextSize: [["small", "Small"], ["medium", "Medium"], ["large", "Large"], ["very-large", "Very large"]],
  latency: [["interactive", "Interactive"], ["seconds", "Seconds"], ["minutes", "Minutes"], ["batch", "Batch"]],
  risk: [["low", "Low"], ["medium", "Medium"], ["high", "High"], ["regulated", "Regulated"]],
  priority: [["lowest-cost", "Lowest cost"], ["balanced", "Balanced"], ["highest-quality", "Highest quality"]],
} as const;

function WorkloadAdviser({ currentBriefing }: { currentBriefing: string }) {
  const recommend = useServerFn(recommendWorkload);
  const [workload, setWorkload] = useState("");
  const [volume, setVolume] = useState<(typeof adviserOptions.volume)[number][0]>("moderate");
  const [contextSize, setContextSize] = useState<(typeof adviserOptions.contextSize)[number][0]>("medium");
  const [latency, setLatency] = useState<(typeof adviserOptions.latency)[number][0]>("seconds");
  const [risk, setRisk] = useState<(typeof adviserOptions.risk)[number][0]>("medium");
  const [priority, setPriority] = useState<(typeof adviserOptions.priority)[number][0]>("balanced");
  const [advice, setAdvice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (workload.trim().length < 20) {
      setError("Describe the workload in at least 20 characters.");
      return;
    }
    setLoading(true);
    setAdvice("");
    setError("");
    try {
      const result = await recommend({ data: { workload, volume, contextSize, latency, risk, priority, currentBriefing } });
      setAdvice(result.advice);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The recommendation could not be generated.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]" aria-labelledby="adviser-title">
      <div className="mb-5 flex items-start gap-3">
        <BrainCircuit className="mt-1 shrink-0 text-[var(--blue)]" />
        <div><p className="eyebrow">AI workload adviser</p><h2 id="adviser-title">Ask TokenOps</h2><p className="m-0 text-[var(--muted)]">Describe a real workload to receive a model portfolio, routing policy, and cost controls grounded in the current briefings.</p></div>
      </div>
      <label className="grid gap-2 font-semibold text-[var(--ink)]">Workload description<textarea className="min-h-32 rounded-md p-3 font-normal" value={workload} onChange={(event) => setWorkload(event.target.value)} maxLength={4000} placeholder="Example: Review 20,000 support conversations monthly, classify themes, draft summaries, and escalate regulated cases for human review." /></label>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <AdviserSelect label="Monthly volume" value={volume} options={adviserOptions.volume} onChange={(value) => setVolume(value as typeof volume)} />
        <AdviserSelect label="Context size" value={contextSize} options={adviserOptions.contextSize} onChange={(value) => setContextSize(value as typeof contextSize)} />
        <AdviserSelect label="Latency" value={latency} options={adviserOptions.latency} onChange={(value) => setLatency(value as typeof latency)} />
        <AdviserSelect label="Risk" value={risk} options={adviserOptions.risk} onChange={(value) => setRisk(value as typeof risk)} />
        <AdviserSelect label="Priority" value={priority} options={adviserOptions.priority} onChange={(value) => setPriority(value as typeof priority)} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3"><Button type="button" onClick={() => void submit()} disabled={loading}>{loading ? <LoaderCircle className="animate-spin" /> : <BrainCircuit />} {loading ? "Analysing workload" : "Recommend a strategy"}</Button><span className="text-xs text-[var(--muted)]">AI-assisted guidance; validate with provider terms and controlled evaluation.</span></div>
      {error && <p className="mt-4 rounded-md border border-[var(--line)] p-3 text-[var(--red)]" role="alert">{error}</p>}
      {advice && <div className="guide mt-5 whitespace-pre-wrap rounded-md border border-[var(--line)] p-5" aria-live="polite">{advice}</div>}
    </section>
  );
}

function AdviserSelect({ label, value, options, onChange }: { label: string; value: string; options: ReadonlyArray<readonly [string, string]>; onChange: (value: string) => void }) {
  return <label className="grid gap-2 text-sm font-semibold text-[var(--ink)]">{label}<select className="min-h-11 rounded-md px-3 font-normal" value={value} onChange={(event) => onChange(event.target.value)}>{options.map(([optionValue, optionLabel]) => <option value={optionValue} key={optionValue}>{optionLabel}</option>)}</select></label>;
}
