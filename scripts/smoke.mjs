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
 *   2. No horizontal overflow (scrollWidth <= innerWidth + 1)
 *   3. Content parity: normalized visible text of <main> equals the baseline
 *      (the uplift must not add, drop or reword content)
 *   4. Every interactive element in <main> is >= 40px tall on mobile (warn) / 44px tab bar
 * Screenshots go to .smoke/shots/<viewport>/<route>.png for visual review.
 */
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

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

    const { overflow, text, smallTargets } = await page.evaluate(() => {
      const main = document.querySelector("main") ?? document.body;
      const small = [...main.querySelectorAll("a,button,input,select,textarea")].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.height < 40;
      }).length;
      return {
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        text: main.innerText,
        smallTargets: small,
      };
    });
    if (overflow > 1) failures.push(`${tag} horizontal overflow ${overflow}px`);
    if (vp.name === "mobile" && smallTargets > 0)
      warnings.push(`${tag} ${smallTargets} tap targets < 40px`);

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
