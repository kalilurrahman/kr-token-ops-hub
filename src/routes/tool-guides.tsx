import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X, Lightbulb } from "lucide-react";
import { toolGuides, comparison } from "../data/tokenopsContent";

export const Route = createFileRoute("/tool-guides")({
  component: ToolGuidesPage,
});

function ToolGuidesPage() {
  const [active, setActive] = useState(toolGuides[0].id);
  const guide = toolGuides.find((g) => g.id === active)!;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight">Tool-Specific Guides</h1>
      <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
        How to spend the least on each major tool. Costs are billed in different
        units — tokens, credits, characters, requests — but the moves rhyme.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {toolGuides.map((g) => (
          <button
            key={g.id}
            onClick={() => setActive(g.id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              active === g.id
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-border text-muted-foreground hover:border-emerald-500/40"
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-2xl font-semibold">{guide.name}</h2>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Billed in {guide.unit}
          </span>
        </div>
        <p className="mt-1 text-emerald-600 dark:text-emerald-400">{guide.tagline}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-semibold">Best for:</span> {guide.bestFor}
        </p>

        <h3 className="mt-6 font-semibold">Key levers</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {guide.keyLevers.map((l) => (
            <div key={l.title} className="rounded-xl border border-border bg-muted/40 p-4">
              <div className="font-medium">{l.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{l.detail}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="font-semibold text-emerald-600 dark:text-emerald-400">Do this</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {guide.doThis.map((d, i) => (
                <li key={i} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-rose-600 dark:text-rose-400">Avoid this</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {guide.avoidThis.map((d, i) => (
                <li key={i} className="flex gap-2">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-6 flex gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          <span>
            <span className="font-semibold">Pro tip: </span>
            {guide.proTip}
          </span>
        </p>
      </section>

      <h2 className="mt-12 text-2xl font-semibold">Caching & batch at a glance</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Provider</th>
              <th className="p-3 font-medium">Cached read</th>
              <th className="p-3 font-medium">Cache write</th>
              <th className="p-3 font-medium">Min tokens</th>
              <th className="p-3 font-medium">TTL</th>
              <th className="p-3 font-medium">Batch</th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((r) => (
              <tr key={r.provider} className="border-t border-border">
                <td className="p-3 font-medium">{r.provider}</td>
                <td className="p-3">{r.cachedReadDiscount}</td>
                <td className="p-3">{r.cacheWriteCost}</td>
                <td className="p-3">{r.cacheMinTokens}</td>
                <td className="p-3">{r.ttl}</td>
                <td className="p-3">{r.batchDiscount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Discounts and TTLs change often — confirm against each provider's current docs before budgeting.
      </p>
    </div>
  );
}
