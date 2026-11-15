import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartTheme } from "@/lib/chart-theme";
import { useIsMobile } from "@/hooks/use-mobile";

const teamData = [
  { team: "Product", spend: 42000, yield: 86 },
  { team: "Marketing", spend: 35000, yield: 78 },
  { team: "Data", spend: 23000, yield: 91 },
  { team: "Support", spend: 18000, yield: 82 },
];

const modelData = [
  { model: "GPT-5", spend: 28000 },
  { model: "GPT-5 Nano", spend: 37000 },
  { model: "Claude Sonnet 5", spend: 33000 },
  { model: "Gemini 2.5 Flash", spend: 20000 },
];

const monthlyTrend = [
  { month: "Jan", baseline: 82000, optimized: 82000, yieldRate: 68 },
  { month: "Feb", baseline: 92000, optimized: 78000, yieldRate: 72 },
  { month: "Mar", baseline: 98000, optimized: 76000, yieldRate: 77 },
  { month: "Apr", baseline: 106000, optimized: 74000, yieldRate: 81 },
  { month: "May", baseline: 118000, optimized: 73000, yieldRate: 83 },
  { month: "Jun", baseline: 126000, optimized: 71000, yieldRate: 84 },
];

const anomalies: [string, string, string][] = [
  ["Support chatbot", "+22% input tokens", "Conversation history exceeded sliding-window policy."],
  ["Content pipeline", "9.4k retries", "Schema validation failed after provider model change."],
  ["Research agent", "$8.6k context waste", "Top-10 retrieval included low-similarity chunks."],
];

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Operational Dashboard (Sample Data Demo) — TokenOps Atlas" },
      {
        name: "description",
        content:
          "A sample-data demo of a TokenOps dashboard: visibility, allocation, optimization progress, and anomalies for LLM token spend.",
      },
      {
        property: "og:title",
        content: "Operational Dashboard (Sample Data Demo) — TokenOps Atlas",
      },
      {
        property: "og:description",
        content:
          "A sample-data demo of a TokenOps dashboard: visibility, allocation, optimization progress, and anomalies for LLM token spend.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function DashboardPage() {
  const kpis = useMemo(() => {
    const latest = monthlyTrend[monthlyTrend.length - 1];
    return [
      { label: "Current monthly spend", value: `$${latest.baseline.toLocaleString()}` },
      { label: "Optimized run-rate", value: `$${latest.optimized.toLocaleString()}` },
      {
        label: "Monthly savings",
        value: `$${(latest.baseline - latest.optimized).toLocaleString()}`,
      },
      { label: "Token yield rate", value: `${latest.yieldRate}%` },
    ];
  }, []);

  const t = useChartTheme();
  const axisTick = { fill: t.axis, fontFamily: t.mono, fontSize: 12 };
  // Below 768px the bar charts run horizontally so category names never rotate or collide.
  const isMobile = useIsMobile();
  const barLayout = isMobile ? "vertical" : "horizontal";

  return (
    <section className="dashboard stack">
      <div className="page-heading">
        <h1>Operational Dashboard</h1>
        <p>Visibility, allocation, optimization progress, and anomalies in one operating view.</p>
        <p className="badge">
          Sample data demo — every figure on this page is illustrative, showing what a TokenOps
          dashboard looks like. Wire it to your own metering to make it real.
        </p>
      </div>

      <div className="dashboard-kpis">
        {kpis.map((kpi) => (
          <article className="dash-card" key={kpi.label}>
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
          </article>
        ))}
      </div>

      <div className="dashboard-grid">
        <article className="dash-panel wide">
          <h2>Spend trend and token yield</h2>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={monthlyTrend}>
                <CartesianGrid stroke={t.grid} vertical={false} />
                <XAxis dataKey="month" stroke={t.axis} tick={axisTick} />
                <YAxis yAxisId="cost" stroke={t.axis} tick={axisTick} />
                <YAxis
                  yAxisId="yield"
                  orientation="right"
                  domain={[50, 100]}
                  stroke={t.axis}
                  tick={axisTick}
                />
                <Tooltip contentStyle={t.tooltip} />
                <Legend />
                <Area
                  yAxisId="cost"
                  type="monotone"
                  dataKey="baseline"
                  name="Baseline spend"
                  stroke={t.baseline}
                  fill={t.baselineFill}
                />
                <Area
                  yAxisId="cost"
                  type="monotone"
                  dataKey="optimized"
                  name="Optimized spend"
                  stroke={t.saving}
                  fill={t.savingFill}
                />
                <Line
                  yAxisId="yield"
                  type="monotone"
                  dataKey="yieldRate"
                  name="Yield rate"
                  stroke={t.money}
                  strokeWidth={2.5}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dash-panel">
          <h2>Spend by team</h2>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={teamData} layout={barLayout}>
                <CartesianGrid stroke={t.grid} vertical={isMobile} horizontal={!isMobile} />
                {isMobile ? (
                  <XAxis type="number" stroke={t.axis} tick={axisTick} />
                ) : (
                  <XAxis dataKey="team" stroke={t.axis} tick={axisTick} />
                )}
                {isMobile ? (
                  <YAxis
                    type="category"
                    dataKey="team"
                    width={132}
                    stroke={t.axis}
                    tick={axisTick}
                  />
                ) : (
                  <YAxis stroke={t.axis} tick={axisTick} />
                )}
                <Tooltip contentStyle={t.tooltip} />
                <Bar dataKey="spend" name="Spend">
                  {teamData.map((entry, index) => (
                    <Cell key={entry.team} fill={t.series[index % t.series.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dash-panel">
          <h2>Spend by model</h2>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={modelData} layout={barLayout}>
                <CartesianGrid stroke={t.grid} vertical={isMobile} horizontal={!isMobile} />
                {isMobile ? (
                  <XAxis type="number" stroke={t.axis} tick={axisTick} />
                ) : (
                  <XAxis dataKey="model" stroke={t.axis} tick={axisTick} />
                )}
                {isMobile ? (
                  <YAxis
                    type="category"
                    dataKey="model"
                    width={132}
                    stroke={t.axis}
                    tick={axisTick}
                  />
                ) : (
                  <YAxis stroke={t.axis} tick={axisTick} />
                )}
                <Tooltip contentStyle={t.tooltip} />
                <Bar dataKey="spend" name="Spend">
                  {modelData.map((entry, index) => (
                    <Cell key={entry.model} fill={t.series[index % t.series.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <section className="anomaly-board">
        <h2>Top anomalies</h2>
        {anomalies.map(([feature, signal, cause]) => (
          <div className="anomaly-row" key={feature}>
            <strong>{feature}</strong>
            <span>{signal}</span>
            <p>{cause}</p>
          </div>
        ))}
      </section>
    </section>
  );
}
