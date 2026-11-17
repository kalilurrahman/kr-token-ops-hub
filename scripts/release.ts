#!/usr/bin/env tsx
/**
 * Cut a release: bump the version everywhere the footer watermark and npm read it, and open a
 * dated CHANGELOG entry.
 *
 *   npm run release -- patch "Fix calculator rounding"
 *   npm run release -- minor "Release notes page"
 *   npm run release -- 3.0.0 "New design"          # explicit, must be higher
 *   npm run release -- patch "Title" --dry-run     # print the plan, change nothing
 *
 * Writes package.json "version", package-lock.json (top level and packages[""]) and a new
 * `## x.y.z — Title (YYYY-MM-DD)` entry with a placeholder at the top of CHANGELOG.md.
 * Replace the placeholder with the release notes; `npm test` fails until you do.
 * bun.lock does not record the project's own version, so it needs no change.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { addReleaseEntry, nextVersion } from "../src/lib/release-notes";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const [bump, ...titleWords] = args.filter((arg) => arg !== "--dry-run");
const title = titleWords.join(" ").trim();

if (!bump || !title) {
  console.error('Usage: npm run release -- <patch|minor|major|x.y.z> "Release title" [--dry-run]');
  process.exit(1);
}

const root = new URL("../", import.meta.url);
const readJson = (file: string) => JSON.parse(readFileSync(new URL(file, root), "utf8"));
const writeJson = (file: string, value: unknown) =>
  writeFileSync(new URL(file, root), `${JSON.stringify(value, null, 2)}\n`);

try {
  const pkg = readJson("package.json");
  const lock = readJson("package-lock.json");
  const current: string = pkg.version;
  const version = nextVersion(current, bump);
  const date = new Date().toISOString().slice(0, 10);
  const changelog = addReleaseEntry(readFileSync(new URL("CHANGELOG.md", root), "utf8"), {
    version,
    title,
    date,
  });

  console.log(`${current} → ${version}  "${title}" (${date})${dryRun ? "  [dry run]" : ""}`);
  if (dryRun) process.exit(0);

  pkg.version = version;
  lock.version = version;
  lock.packages[""].version = version;
  writeJson("package.json", pkg);
  writeJson("package-lock.json", lock);
  writeFileSync(new URL("CHANGELOG.md", root), changelog);
  console.log("Updated package.json, package-lock.json and CHANGELOG.md.");
  console.log("Next: replace the TODO in the new CHANGELOG.md entry, then run npm test.");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
