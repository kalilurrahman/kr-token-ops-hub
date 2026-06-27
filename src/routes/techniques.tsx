import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { techniques, type Technique } from "../data/tokenopsContent";

export const Route = createFileRoute("/techniques")({
  component: TechniquesPage,
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
      <h1 className="text-4xl font-bold tracking-tight">Techniques Catalog</h1>
      <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
        The full toolbox of token-saving techniques, sorted by category. Each
        card shows typical savings, effort, and where it applies.
      </p>

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
              <h2 className="text-xl font-semibold">{t.name}</h2>
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
    </div>
  );
}
