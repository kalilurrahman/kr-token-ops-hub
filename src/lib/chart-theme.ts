/**
 * src/lib/chart-theme.ts — Recharts theme bound to design tokens.
 * Reads CSS variables at render time so charts follow the active palette.
 * Usage in dashboard.tsx (data arrays unchanged):
 *   const t = useChartTheme();
 *   <CartesianGrid stroke={t.grid} vertical={false} />
 *   <XAxis stroke={t.axis} tick={{ fontFamily: t.mono, fontSize: 12 }} />
 *   <Area dataKey="baseline" stroke={t.baseline} fill={t.baselineFill} />
 *   <Area dataKey="optimized" stroke={t.saving} fill={t.savingFill} />
 *   <Line dataKey="yieldRate" stroke={t.money} strokeWidth={2.5} dot={false} />
 *   <Bar> {rows.map((r,i) => <Cell key={r.team} fill={t.series[i % t.series.length]} />)} </Bar>
 *   <Tooltip contentStyle={t.tooltip} />
 */
import { useEffect, useState } from "react";

const read = (name: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
};

export type ChartTheme = ReturnType<typeof buildTheme>;

function buildTheme() {
  const series = [1, 2, 3, 4, 5, 6].map((i) => read(`--to-chart-${i}`, "#E8B964"));
  return {
    series,
    money: read("--to-chart-1", "#E8B964"),
    saving: read("--to-saving", "#4DD8C4"),
    savingFill: read("--to-saving-fill", "rgba(77,216,196,.12)"),
    baseline: read("--to-chart-6", "#8A8476"),
    baselineFill: "color-mix(in srgb, " + read("--to-chart-6", "#8A8476") + " 12%, transparent)",
    risk: read("--to-risk", "#F1734F"),
    grid: read("--to-chart-grid", "rgba(232,185,100,.08)"),
    axis: read("--to-chart-axis", "#8A8476"),
    mono: "IBM Plex Mono, ui-monospace, monospace",
    tooltip: {
      background: read("--to-bg-1", "#0B0F17"),
      border: `1px solid ${read("--to-line-2", "rgba(232,185,100,.2)")}`,
      borderRadius: 10,
      color: read("--to-ink", "#F3EFE6"),
      fontFamily: "IBM Plex Mono, ui-monospace, monospace",
      fontSize: 12,
      boxShadow: read("--to-shadow-2", "none"),
    },
  };
}

export function useChartTheme(): ChartTheme {
  const [theme, setTheme] = useState(buildTheme);
  useEffect(() => {
    const update = () => setTheme(buildTheme());
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-palette", "class"],
    });
    return () => obs.disconnect();
  }, []);
  return theme;
}
