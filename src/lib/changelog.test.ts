import { test } from "node:test";
import { strict as assert } from "node:assert";
import { compareVersions, parseChangelog, releaseAnchor } from "./changelog";

const SAMPLE = [
  "# Changelog",
  "",
  "## 2.4.0 — Release notes page (2026-11-17)",
  "",
  "### Added",
  "",
  "- A page.",
  "",
  "## 2.3.4 — Cleanup (2026-11-17)",
  "",
  "- Removed things.",
].join("\n");

test("parses each release heading with its version, title, date and body", () => {
  const { entries, problems } = parseChangelog(SAMPLE);
  assert.deepEqual(problems, []);
  assert.equal(entries.length, 2);
  assert.deepEqual(entries[0], {
    version: "2.4.0",
    title: "Release notes page",
    date: "2026-11-17",
    body: "### Added\n\n- A page.",
  });
  assert.equal(entries[1]?.body, "- Removed things.");
});

test("reports level-2 headings that are not in the release format", () => {
  const { entries, problems } = parseChangelog(
    "## 2.4.0 - Hyphen not dash (2026-11-17)\n## Unreleased\n## 2.3.4 — No date\n",
  );
  assert.equal(entries.length, 0);
  assert.equal(problems.length, 3);
});

test("release anchors are id-safe", () => {
  assert.equal(releaseAnchor("2.3.4"), "v2-3-4");
  assert.equal(releaseAnchor("3.0.0-beta.1"), "v3-0-0-beta-1");
});

test("versions compare in semver order", () => {
  assert.ok(compareVersions("2.3.4", "2.4.0") < 0);
  assert.ok(compareVersions("2.10.0", "2.9.9") > 0);
  assert.ok(compareVersions("3.0.0-beta.1", "3.0.0") < 0);
  assert.equal(compareVersions("2.3.4", "2.3.4"), 0);
});
