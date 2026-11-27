#!/usr/bin/env node
/**
 * Writes public/version.json before `vite build` (the "build" script runs it first), so every
 * deployed build answers /version.json with the release it carries:
 *
 *   {"version": "2.13.2", "commit": "abc1234", "date": "2026-11-27"}
 *
 * version: package.json "version" (the same value as the footer watermark, src/lib/release.ts).
 * commit:  RELEASE_COMMIT if set, else git's HEAD, shortened to 7 characters; "" when unknown.
 * date:    RELEASE_DATE if set, else the commit's date (YYYY-MM-DD); "" when unknown.
 * Both come from the commit, not the clock, so building the same commit twice writes the same file.
 *
 * A build step, not a Vite plugin (CLAUDE.md: no custom Vite plugins). The file is generated and
 * git-ignored. This script never fails the build: on any error it warns and exits 0.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const root = new URL("../", import.meta.url);

function git(args) {
  try {
    return execFileSync("git", args, {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 5000,
    })
      .toString()
      .trim();
  } catch {
    return "";
  }
}

export function releaseInfo(env = process.env) {
  const { version } = JSON.parse(readFileSync(new URL("package.json", root), "utf8"));
  const sha = (env.RELEASE_COMMIT || git(["rev-parse", "HEAD"])).trim();
  const commit = /^[0-9a-f]{7,40}$/i.test(sha) ? sha.slice(0, 7).toLowerCase() : "";
  const date = (env.RELEASE_DATE || git(["log", "-1", "--format=%cs"])).trim();
  return { version: String(version), commit, date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "" };
}

/** The body of /version.json. */
export function versionJson(info) {
  return `${JSON.stringify(info, null, 2)}\n`;
}

// Run only when invoked as a script (the build), not when a test imports releaseInfo.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const info = releaseInfo();
    mkdirSync(new URL("public/", root), { recursive: true });
    writeFileSync(new URL("public/version.json", root), versionJson(info));
    console.log(`version.json: ${info.version}${info.commit ? `+${info.commit}` : ""}`);
  } catch (error) {
    console.warn(`version.json not written: ${error instanceof Error ? error.message : error}`);
  }
}
