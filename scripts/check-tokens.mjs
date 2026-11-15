#!/usr/bin/env node
/**
 * Design System v2 guardrail — runs as part of `npm run lint`.
 *
 * Fails when src/**\/*.{css,tsx} contains, outside the token files:
 *   - a hex colour (#rgb … #rrggbbaa)            → use a --to-* token or a semantic utility
 *   - `!important` in CSS                         → raise specificity or fix the cascade instead
 *   - a Tailwind palette utility (emerald-500 …)  → use text-saving / bg-money-fill / border-risk …
 *   - a removed font family (Inter, DM Sans, Cormorant Garamond)
 *
 * Allowed hex: src/styles.css (the token file), src/components/TokenOpsLogo.tsx (brand mark
 * geometry) and src/lib/chart-theme.ts (SSR fallbacks; .ts so not scanned). Hex inside an
 * attribute selector such as [stroke='#ccc'] is allowed: it matches third-party output and
 * never paints a colour of ours.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SRC = path.join(ROOT, "src");
const HEX_ALLOW = new Set([
  "src/styles.css",
  "src/components/TokenOpsLogo.tsx",
  "src/lib/chart-theme.ts",
]);
const IMPORTANT_ALLOW = new Set(["src/styles.css"]); // reduced-motion reset only

const PALETTE =
  /\b(?:[a-z-]+:)*(?:bg|text|border|from|via|to|ring|fill|stroke|outline|decoration|divide|shadow|accent|caret|placeholder)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g;
const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const ATTR_SELECTOR_HEX = /\[[a-z-]+=['"]#[0-9a-fA-F]{3,8}['"]\]/g;
const REMOVED_FONTS = /\b(?:Inter|DM Sans|Cormorant Garamond)\b/g;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(css|tsx)$/.test(entry.name) ? [full] : [];
  });
}

const problems = [];
for (const file of walk(SRC)) {
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  let source = fs.readFileSync(file, "utf8");
  // Blank out CSS comments (keeping line breaks) so prose about a rule isn't flagged.
  if (rel.endsWith(".css"))
    source = source.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "));
  const lines = source.split("\n");
  lines.forEach((line, i) => {
    const at = `${rel}:${i + 1}`;
    if (!HEX_ALLOW.has(rel)) {
      const scrubbed = line.replace(ATTR_SELECTOR_HEX, "");
      for (const m of scrubbed.match(HEX) ?? []) {
        problems.push(`${at}  hex colour ${m} — use a --to-* token`);
      }
    }
    if (rel.endsWith(".css") && !IMPORTANT_ALLOW.has(rel) && /!important/.test(line)) {
      problems.push(`${at}  !important — fix the cascade instead`);
    }
    for (const m of line.match(PALETTE) ?? []) {
      problems.push(
        `${at}  palette utility ${m} — use a semantic utility (text-saving, bg-money-fill …)`,
      );
    }
    if (/font-family|fontFamily|font:/.test(line)) {
      for (const m of line.match(REMOVED_FONTS) ?? []) problems.push(`${at}  removed font ${m}`);
    }
  });
}

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`\ncheck-tokens: ${problems.length} problem(s)`);
  process.exit(1);
}
console.log(
  "check-tokens: OK — no hex, !important, palette utilities or removed fonts outside token files",
);
