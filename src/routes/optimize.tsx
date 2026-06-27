import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Gauge,
  Layers,
  Wrench,
  Sparkles,
  ClipboardList,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { techniques, toolGuides, meta } from "../data/tokenopsContent";

export const Route = createFileRoute("/optimize")({
  component: OptimizeHub,
});

const cards = [
  {
    to: "/techniques",
    icon: Layers,
    title: "Techniques Catalog",
    desc: "Every high-leverage way to cut tokens — caching, routing, compression, RAG, output control and more.",
    stat: `${techniques.length} techniques`,
  },
  {
    to: "/tool-guides",
    icon: Wrench,
    title: "Tool-Specific Guides",
    desc: "Playbooks for Claude, Lovable, ChatGPT/OpenAI, Gemini, Cursor, Copilot and media tools.",
    stat: `${toolGuides.length} tools`,
  },
  {
    to: "/caveman",
    icon: Sparkles,
    title: "Caveman Compression",
    desc: "The telegram-style prompt method: drop filler, keep meaning, save 14–45% of tokens.",
    stat: "Deep dive",
  },
  {
    to: "/templates",
    icon: ClipboardList,
    title: "Prompt Templates",
    desc: "Copy-paste scaffolds for caching, routing, output control, compaction and project memory.",
    stat: "8 templates",
  },
];

function OptimizeHub() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
        <Gauge className="h-4 w-4" />
        Optimize
      </div>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">
        Spend the fewest tokens for the best result
      </h1>
      <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
        A complete, tool-by-tool playbook for token and credit optimization —
        from prompt caching and model routing to the viral Caveman method.
        Plan first, pick the smallest sufficient model, reuse outputs, and batch.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="group rounded-2xl border border-border bg-card p-6 transition hover:border-emerald-500/50 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <c.icon className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {c.stat}
              </span>
            </div>
            <h2 className="mt-4 text-xl font-semibold">{c.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 group-hover:gap-2 dark:text-emerald-400">
              Open <ArrowRight className="h-4 w-4 transition-all" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-border bg-muted/40 p-6">
        <div className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-5 w-5" /> The four moves that win every time
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          {[
            ["Plan first", "Architect & draft in a free chat before spending paid tokens/credits."],
            ["Smallest model", "Route by difficulty; escalate only on low confidence."],
            ["Reuse outputs", "Cache prefixes, cache answers, reuse renders & clips."],
            ["Batch", "Queue non-urgent work for ~50% off."],
          ].map(([t, d]) => (
            <div key={t}>
              <div className="font-medium">{t}</div>
              <div className="mt-1 text-sm text-muted-foreground">{d}</div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        {meta.disclaimer} Last reviewed {meta.reviewed}.
      </p>
    </div>
  );
}
