import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X, Copy, CheckCheck } from "lucide-react";
import { caveman } from "../data/tokenopsContent";

export const Route = createFileRoute("/caveman")({
  component: CavemanPage,
});

function CavemanPage() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(caveman.skillSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        Featured method
      </span>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">Caveman Compression</h1>
      <p className="mt-3 text-lg text-muted-foreground">{caveman.what}</p>

      <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
        <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          Realistic savings
        </div>
        <p className="mt-1 text-sm">{caveman.savings}</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
            <Check className="h-4 w-4" /> Keep
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {caveman.keepList.map((k) => (
              <li key={k} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {k}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 font-semibold text-rose-600 dark:text-rose-400">
            <X className="h-4 w-4" /> Drop
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {caveman.dropList.map((k) => (
              <li key={k} className="flex gap-2">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                {k}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="mt-10 text-2xl font-semibold">Before &rarr; after</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-muted/40 p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Before
          </div>
          <p className="mt-2 text-sm">{caveman.example.before}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            After
          </div>
          <p className="mt-2 text-sm font-medium">{caveman.example.after}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">Use it when</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
            {caveman.whenToUse.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">Skip it when</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
            {caveman.whenNotToUse.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="mt-10 text-2xl font-semibold">Drop-in skill</h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-zinc-950 text-zinc-100">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <span className="text-xs text-zinc-400">caveman-skill.txt</span>
          <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-xs hover:bg-white/20"
          >
            {copied ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
          <code>{caveman.skillSnippet}</code>
        </pre>
      </div>
    </div>
  );
}
