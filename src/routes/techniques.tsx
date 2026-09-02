import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, FileText } from "lucide-react";
import { techniques, type Technique } from "../data/tokenopsContent";
import content from "@/tokenops/content.json";
import type { TokenOpsContent } from "@/tokenops/data";

const data = content as TokenOpsContent;
const techniqueBriefings = data.library.filter((i) => i.category === "Techniques");

export const Route = createFileRoute("/techniques")({
  component: TechniquesPage,
  head: () => ({
    meta: [
      { title: "Techniques — TokenOps Atlas" },
      {
        name: "description",
        content:
          "Hands-on token optimization techniques: compression, caching, routing, retrieval, batch arbitrage, output control, and the continuous improvement loop.",
      },
      { property: "og:title", content: "TokenOps Techniques" },
      {
        property: "og:description",
        content:
          "A landing grid of technique briefings plus a full catalog of token-saving methods with savings, effort, and impact.",
      },
    ],
  }),
});

const categories = [
  "All",
  "Caching",
  "Context Engineering",
  "Model Strategy",
  "Prompt Craft",
  "Retrieval",
  "Output Control",
  "Agentic Workflow",
  "FinOps & Governance",
] as const;

const impactColor: Record<Technique["impact"], string> = {
  "Very High": "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  High: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
  Medium: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300",
  Low: "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
};

function TechniquesPage() {
  const [cat, setCat] = useState<(typeof categories)[number]>("All");
  const list = useMemo(
    () => (cat === "All" ? techniques : techniques.filter((t) => t.category === cat)),
    [cat],
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="eyebrow" style={{ marginBottom: 6 }}>
        Techniques
      </p>
      <h1 className="text-4xl font-bold tracking-tight">Token Optimization Techniques</h1>
      <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
        The full toolbox of token-saving techniques. Start with the briefing grid below for deep-dive
        articles, then browse the catalog of every technique sorted by category — each with typical
        savings, effort, and impact.
      </p>

      {/* ── Technique briefings grid (quick links to each article) ── */}
      <section className="mt-10">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <p className="eyebrow" style={{ marginBottom: 4 }}>
              Briefings
            </p>
            <h2 className="text-2xl font-semibold" style={{ margin: 0 }}>
              {techniqueBriefings.length} technique briefings
            </h2>
          </div>
          <Link to="/library" className="secondary-action">
            Browse library →
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {techniqueBriefings.map((item) => (
            <Link
              key={item.file}
              to="/read/$"
              params={{ _splat: `library/${item.file}` }}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition hover:border-emerald-500/50 hover:shadow-md"
            >
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <FileText className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Briefing</span>
              </div>
              <h3 className="mt-2 font-semibold leading-snug">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{item.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Read <ArrowRight className="h-4 w-4 transition-all group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Full techniques catalog ── */}
      <section className="mt-14">
        <div className="mb-4">
          <p className="eyebrow" style={{ marginBottom: 4 }}>
            Catalog
          </p>
          <h2 className="text-2xl font-semibold" style={{ margin: 0 }}>
            Full techniques catalog
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Every technique with typical savings, effort, and where it applies.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                cat === c
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-border text-muted-foreground hover:border-emerald-500/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          {list.map((t) => (
            <article key={t.id} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xl font-semibold">{t.name}</h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                    {t.category}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 font-medium ${impactColor[t.impact]}`}>
                    {t.impact} impact
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                    {t.effort} effort
                  </span>
                </div>
              </div>

              <p className="mt-2 text-muted-foreground">{t.summary}</p>

              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
                {t.how.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>

              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-emerald-700 dark:text-emerald-300">
                  <span className="font-semibold">Typical savings:</span> {t.typicalSavings}
                </div>
                <div className="rounded-lg bg-muted px-3 py-2 text-muted-foreground">
                  <span className="font-semibold">Applies to:</span> {t.appliesTo.join(", ")}
                </div>
              </div>

              {t.pitfalls && (
                <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                  <span className="font-semibold">Watch out:</span> {t.pitfalls}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
