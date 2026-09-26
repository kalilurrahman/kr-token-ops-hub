import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock3, Coins, Layers3, Ruler } from "lucide-react";
import { modelComparisonEntries, MODEL_REVIEW_DATE } from "@/lib/model-comparison";

export const Route = createFileRoute("/models")({
  component: ModelsPage,
  head: () => ({
    meta: [
      { title: "Model comparison matrix — TokenOps Atlas" },
      {
        name: "description",
        content: "Compare five current TokenOps model briefings by capability, context, pricing, latency, and recommended workload.",
      },
      { property: "og:title", content: "Model comparison matrix — TokenOps Atlas" },
      {
        property: "og:description",
        content: "A practical, dated comparison of frontier model capabilities and routing economics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const columns = [
  { key: "capabilities", label: "Capabilities" },
  { key: "contextLimit", label: "Context limits" },
  { key: "pricing", label: "Pricing considerations" },
  { key: "latency", label: "Latency guidance" },
] as const;

function ModelsPage() {
  return (
    <section className="stack">
      <div className="page-heading">
        <p className="eyebrow">Model intelligence</p>
        <h1>Model comparison matrix</h1>
        <p>
          Compare capability and operating economics before choosing a route. Guidance was reviewed on {MODEL_REVIEW_DATE}; verify current provider terms before procurement or production use.
        </p>
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] lg:block">
        <table className="w-full min-w-[1120px] table-fixed border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--line)]">
              <th className="w-[16%] p-4 text-[var(--ink)]">Model / framework</th>
              {columns.map((column) => <th className="p-4 text-[var(--ink)]" key={column.key}>{column.label}</th>)}
              <th className="w-[17%] p-4 text-[var(--ink)]">Recommended use cases</th>
            </tr>
          </thead>
          <tbody>
            {modelComparisonEntries.map((entry) => (
              <tr className="border-b border-[var(--line)] align-top last:border-b-0" key={entry.id}>
                <td className="p-4">
                  <strong className="block text-[var(--ink)]">{entry.name}</strong>
                  <span className="mt-1 block text-xs text-[var(--muted)]">{entry.role}</span>
                  <Link className="mt-3 inline-flex items-center gap-1 font-semibold text-[var(--blue)]" to="/read/$" params={{ _splat: entry.briefingFile }}>
                    Read briefing <ArrowRight size={14} />
                  </Link>
                </td>
                {columns.map((column) => <td className="p-4 leading-6 text-[var(--muted)]" key={column.key}>{entry[column.key]}</td>)}
                <td className="p-4">
                  <ul className="m-0 grid gap-2 pl-4 text-[var(--muted)]">
                    {entry.recommendedUses.map((use) => <li key={use}>{use}</li>)}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 lg:hidden">
        {modelComparisonEntries.map((entry) => (
          <article className="resource-card" key={entry.id}>
            <div>
              <span className="badge">{entry.isFramework ? "Framework" : "Model"}</span>
              <h2 className="mt-3">{entry.name}</h2>
              <p className="text-[var(--muted)]">{entry.role}</p>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <ComparisonDetail icon={Layers3} label="Capabilities" value={entry.capabilities} />
              <ComparisonDetail icon={Ruler} label="Context limits" value={entry.contextLimit} />
              <ComparisonDetail icon={Coins} label="Pricing" value={entry.pricing} />
              <ComparisonDetail icon={Clock3} label="Latency" value={entry.latency} />
            </dl>
            <div>
              <h3>Recommended use cases</h3>
              <div className="flex flex-wrap gap-2">
                {entry.recommendedUses.map((use) => <span className="category-tag" key={use}>{use}</span>)}
              </div>
            </div>
            <Link className="download-btn w-fit" to="/read/$" params={{ _splat: entry.briefingFile }}>
              Read full briefing <ArrowRight size={15} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function ComparisonDetail({ icon: Icon, label, value }: { icon: typeof Layers3; label: string; value: string }) {
  return (
    <div>
      <dt className="mb-1 flex items-center gap-2 font-semibold text-[var(--ink)]"><Icon size={16} />{label}</dt>
      <dd className="m-0 text-sm leading-6 text-[var(--muted)]">{value}</dd>
    </div>
  );
}