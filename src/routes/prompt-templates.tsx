import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, CheckCheck } from "lucide-react";
import { templates, checklists } from "../data/tokenopsContent";

export const Route = createFileRoute("/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copy = async (id: string, body: string) => {
    await navigator.clipboard.writeText(body);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight">Prompt Templates & Checklists</h1>
      <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
        Copy-paste scaffolds for the highest-leverage moves, plus checklists you
        can run before, during, and in production.
      </p>

      <div className="mt-8 space-y-5">
        {templates.map((t) => (
          <div key={t.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">{t.title}</h2>
              <button
                onClick={() => copy(t.id, t.body)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs hover:border-emerald-500/50"
              >
                {copiedId === t.id ? (
                  <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copiedId === t.id ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium">Use when:</span> {t.useWhen}
            </p>
            <pre className="mt-3 overflow-x-auto rounded-xl bg-zinc-950 p-4 text-sm leading-relaxed text-zinc-100">
              <code>{t.body}</code>
            </pre>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-2xl font-semibold">Checklists</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {checklists.map((c) => (
          <div key={c.id} className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold">{c.title}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {c.items.map((it, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
