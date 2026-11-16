#!/usr/bin/env node
/**
 * TokenOps Atlas — smoke + content-parity test.
 *
 *   node scripts/smoke.mjs --baseline   # run ONCE on main before any UI change
 *   node scripts/smoke.mjs              # run after every phase
 *
 * BASE_URL defaults to http://localhost:4173 (`npm run smoke` builds, previews and sets it).
 * CHROMIUM_PATH (optional) points Playwright at an existing Chromium binary.
 * SMOKE_IGNORE_CONSOLE (optional regex) downgrades matching console errors to warnings.
 * Checks, for every route × viewport (390, 834, 1440):
 *   1. HTTP 200 and no uncaught page errors / console errors
 *   2. No horizontal overflow (scrollWidth <= innerWidth + 1, and no element escaping the
 *      viewport outside a scroll/clip container — html/body clip would otherwise hide it)
 *   3. Content parity: normalized visible text of <main> equals the baseline
 *      (read with CSS text-transform neutralised and chart axis ticks hidden, so casing
 *      styles and font-dependent tick collisions are not counted as content)
 *      (the uplift must not add, drop or reword content)
 *   4. Every interactive element in <main> is >= 40px tall on mobile (warn; disabled controls
 *      and links inside a sentence are exempt), and every visible text field is >= 16px on
 *      mobile (fail; smaller fields make iOS zoom on focus)
 *   5. axe-core WCAG 2 A/AA audit per palette (warn only; report in .smoke/axe.json)
 * Screenshots go to .smoke/shots/<viewport>/<route>.png for visual review.
 */
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:4173";
const BASELINE = process.argv.includes("--baseline");
// Opt-in only: a regex of console errors to downgrade to warnings, for sandboxes
// whose network policy blocks third-party APIs (e.g. ERR_TUNNEL_CONNECTION_FAILED).
const IGNORE_CONSOLE = process.env.SMOKE_IGNORE_CONSOLE
  ? new RegExp(process.env.SMOKE_IGNORE_CONSOLE)
  : null;
const OUT = ".smoke";
const ROUTES = [
  "/",
  "/hub",
  "/guide",
  "/sample-chapter",
  "/optimize",
  "/techniques",
  "/models",
  "/reading-lists",
  "/tool-guides",
  "/caveman",
  "/prompt-templates",
  "/patterns",
  "/calculator",
  "/roadmap",
  "/glossary",
  "/dashboard",
  "/toolkit",
  "/resources",
  "/templates",
  "/library",
  "/training",
  "/sources",
  "/about",
  "/read/library/trends/prompt-caching-2026.md",
  // A Techniques briefing renders the AI workload adviser (signed-out: its email sign-in form).
  "/read/library/techniques/llm-wiki-maintained-knowledge.md",
];
const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 834, height: 1112 },
  { name: "laptop", width: 1440, height: 900 },
];
const slug = (r) => (r === "/" ? "home" : r.replace(/^\//, "").replace(/[^\w.-]+/g, "_"));
const norm = (t) => t.replace(/\s+/g, " ").trim();

const failures = [];
const warnings = [];
// CHROMIUM_PATH lets CI/sandboxes reuse a pre-installed Chromium when the
// project's Playwright build differs from the one on disk.
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  for (const route of ROUTES) {
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(`console: ${m.text()}`);
    });
    const res = await page.goto(BASE + route, { waitUntil: "networkidle" });
    const tag = `[${vp.name}] ${route}`;
    if (!res || res.status() !== 200) failures.push(`${tag} HTTP ${res?.status()}`);
    errors
      .filter((e) => !/favicon|manifest/.test(e))
      .forEach((e) =>
        IGNORE_CONSOLE && IGNORE_CONSOLE.test(e)
          ? warnings.push(`${tag} (ignored via SMOKE_IGNORE_CONSOLE) ${e}`)
          : failures.push(`${tag} ${e}`),
      );

    const { overflow, escaped, text, smallTargets, smallInputs } = await page.evaluate(() => {
      const main = document.querySelector("main") ?? document.body;
      // Disabled controls are not targets, and links inside a sentence are sized by its
      // line-height (WCAG 2.5.8 inline exception), so neither is counted.
      const inSentence = (el) =>
        getComputedStyle(el).display === "inline" &&
        [...el.parentElement.childNodes].some(
          (node) =>
            node !== el &&
            node.textContent.trim() &&
            (node.nodeType === Node.TEXT_NODE ||
              getComputedStyle(node).display.startsWith("inline")),
        );
      const small = [...main.querySelectorAll("a,button,input,select,textarea")].filter((el) => {
        if (el.disabled) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.height < 40 && !inSentence(el);
      }).length;
      // Text fields under 16px make iOS zoom in on focus.
      const smallInputs = [
        ...document.querySelectorAll(
          'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="hidden"]),select,textarea',
        ),
      ]
        .filter((el) => el.getBoundingClientRect().width > 0)
        .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16).length;
      const overflow = document.documentElement.scrollWidth - window.innerWidth;
      // html/body use overflow-x: clip, which hides overflow from scrollWidth. Also report
      // elements whose box escapes the viewport without a scroll/clip container to hold them.
      const clips = (el) => /auto|scroll|hidden|clip/.test(getComputedStyle(el).overflowX);
      const escaped = [];
      for (const el of document.body.querySelectorAll("*")) {
        const r = el.getBoundingClientRect();
        if (
          r.width === 0 ||
          r.right <= window.innerWidth + 1 ||
          getComputedStyle(el).position === "fixed"
        )
          continue;
        let parent = el.parentElement;
        let contained = false;
        while (parent && parent !== document.body) {
          if (clips(parent) && parent.getBoundingClientRect().right <= window.innerWidth + 1) {
            contained = true;
            break;
          }
          parent = parent.parentElement;
        }
        if (!contained)
          escaped.push(
            `${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : ""} +${Math.round(r.right - window.innerWidth)}px`,
          );
      }
      // Parity compares authored text, so presentation is neutralised while reading it:
      //  - innerText applies CSS text-transform (a restyled eyebrow would read as reworded);
      //    inline !important beats stylesheet !important, so set it per element.
      //  - Recharts drops colliding axis tick labels depending on font metrics; ticks are
      //    rendered graphics, not copy. Legends and tooltips still count.
      const restore = [];
      const force = (el, prop, value) => {
        restore.push([
          el,
          prop,
          el.style.getPropertyValue(prop),
          el.style.getPropertyPriority(prop),
        ]);
        el.style.setProperty(prop, value, "important");
      };
      for (const el of [main, ...main.querySelectorAll("*")]) force(el, "text-transform", "none");
      for (const el of main.querySelectorAll(".recharts-cartesian-axis-ticks")) {
        force(el, "visibility", "hidden");
      }
      const text = main.innerText;
      for (const [el, prop, value, priority] of restore.reverse()) {
        if (value) el.style.setProperty(prop, value, priority);
        else el.style.removeProperty(prop);
      }
      return { overflow, escaped: escaped.slice(0, 3), text, smallTargets: small, smallInputs };
    });
    if (overflow > 1) failures.push(`${tag} horizontal overflow ${overflow}px`);
    if (escaped.length) failures.push(`${tag} content escapes the viewport: ${escaped.join(", ")}`);
    if (vp.name === "mobile" && smallTargets > 0)
      warnings.push(`${tag} ${smallTargets} tap targets < 40px`);
    if (vp.name === "mobile" && smallInputs > 0)
      failures.push(`${tag} ${smallInputs} text field(s) under 16px (iOS zooms on focus)`);

    // Content parity is measured at laptop width only (mobile may collapse/abbreviate nav, not content).
    if (vp.name === "laptop") {
      const file = path.join(OUT, "baseline", `${slug(route)}.txt`);
      if (BASELINE) {
        await fs.mkdir(path.dirname(file), { recursive: true });
        await fs.writeFile(file, norm(text));
      } else {
        try {
          const before = await fs.readFile(file, "utf8");
          if (before !== norm(text)) {
            const a = before.split(" "),
              b = norm(text).split(" ");
            let i = 0;
            while (i < a.length && a[i] === b[i]) i++;
            failures.push(
              `${tag} content changed near: "…${a.slice(i, i + 12).join(" ")}…" → "…${b.slice(i, i + 12).join(" ")}…"`,
            );
          }
        } catch {
          warnings.push(`${tag} no baseline (run with --baseline on main first)`);
        }
      }
    }

    const shot = path.join(OUT, "shots", vp.name, `${slug(route)}.png`);
    await fs.mkdir(path.dirname(shot), { recursive: true });
    await page.screenshot({ path: shot, fullPage: true });
    await page.close();
  }
  await ctx.close();
}
// ---------- Accessibility (warning only) ----------
// axe-core at laptop width: full WCAG 2 A/AA in Ledger Dark, colour contrast in the two light
// palettes. Findings never fail the run; the full report is written to .smoke/axe.json.
// Set SMOKE_AXE=0 to skip.
if (process.env.SMOKE_AXE !== "0" && !BASELINE) {
  const PALETTES = [
    { name: "dark", rules: null },
    { name: "light", rules: ["color-contrast"] },
    { name: "bright", rules: ["color-contrast"] },
  ];
  const report = [];
  for (const palette of PALETTES) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript((theme) => {
      try {
        localStorage.setItem("tokenops-theme-v2", theme);
      } catch {
        /* storage blocked */
      }
    }, palette.name);
    for (const route of ROUTES) {
      const page = await ctx.newPage();
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      let builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]);
      if (palette.rules) builder = builder.withRules(palette.rules);
      const { violations } = await builder.analyze();
      for (const v of violations) {
        report.push({
          palette: palette.name,
          route,
          rule: v.id,
          impact: v.impact,
          nodes: v.nodes.length,
          targets: v.nodes.slice(0, 5).map((n) => n.target.join(" ")),
        });
      }
      await page.close();
    }
    await ctx.close();
  }
  await fs.mkdir(OUT, { recursive: true });
  await fs.writeFile(path.join(OUT, "axe.json"), JSON.stringify(report, null, 2));
  const byRule = new Map();
  for (const r of report) {
    const key = `${r.palette} ${r.rule} (${r.impact})`;
    const agg = byRule.get(key) ?? { nodes: 0, routes: new Set() };
    agg.nodes += r.nodes;
    agg.routes.add(r.route);
    byRule.set(key, agg);
  }
  if (byRule.size === 0) console.log("axe: no WCAG 2 A/AA violations found");
  for (const [key, agg] of byRule) {
    warnings.push(`axe ${key}: ${agg.nodes} node(s) on ${agg.routes.size} route(s)`);
  }
}

await browser.close();

warnings.forEach((w) => console.warn("WARN", w));
if (BASELINE) {
  console.log(`Baseline written for ${ROUTES.length} routes → ${OUT}/baseline`);
  process.exit(0);
}
if (failures.length) {
  failures.forEach((f) => console.error("FAIL", f));
  console.error(`\n${failures.length} failure(s)`);
  process.exit(1);
}
console.log(
  `Smoke OK — ${ROUTES.length} routes × ${VIEWPORTS.length} viewports. Screenshots in ${OUT}/shots`,
);
