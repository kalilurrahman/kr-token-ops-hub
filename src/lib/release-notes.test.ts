import { test } from "node:test";
import { strict as assert } from "node:assert";
import {
  addReleaseEntry,
  compareVersions,
  nextVersion,
  parseChangelog,
  RELEASE_PLACEHOLDER,
} from "./release-notes";

const sample = `# Changelog

## 1.2.0 — Second (2026-11-02)

### Added

- Thing two.

## 1.1.0 — First (2026-11-01)

- Thing one.
`;

test("parses releases newest first with their bodies", () => {
  const entries = parseChangelog(sample);
  assert.deepEqual(
    entries.map((entry) => [entry.version, entry.title, entry.date]),
    [
      ["1.2.0", "Second", "2026-11-02"],
      ["1.1.0", "First", "2026-11-01"],
    ],
  );
  assert.equal(entries[0].body, "### Added\n\n- Thing two.");
});

test("rejects a malformed release heading", () => {
  assert.throws(() => parseChangelog("# Changelog\n\n## 1.0 — No date\n"), /heading/);
});

test("compares versions numerically", () => {
  assert.ok(compareVersions("2.10.0", "2.9.9") > 0);
  assert.equal(compareVersions("1.2.3", "1.2.3"), 0);
  assert.ok(compareVersions("1.2.3", "1.3.0") < 0);
});

test("bumps patch, minor, major or takes a higher explicit version", () => {
  assert.equal(nextVersion("2.3.4", "patch"), "2.3.5");
  assert.equal(nextVersion("2.3.4", "minor"), "2.4.0");
  assert.equal(nextVersion("2.3.4", "major"), "3.0.0");
  assert.equal(nextVersion("2.3.4", "2.5.0"), "2.5.0");
  assert.throws(() => nextVersion("2.3.4", "2.3.4"), /not higher/);
  assert.throws(() => nextVersion("2.3.4", "huge"), /Unknown bump/);
});

test("adds a placeholder entry at the top and refuses duplicates or empty titles", () => {
  const next = addReleaseEntry(sample, { version: "1.3.0", title: "Third", date: "2026-11-03" });
  assert.match(next, /^# Changelog\n\n## 1\.3\.0 — Third \(2026-11-03\)\n\n### Changed\n\n- TODO/);
  assert.equal(parseChangelog(next)[0].body, `### Changed\n\n- ${RELEASE_PLACEHOLDER}`);
  assert.equal(parseChangelog(next)[1].version, "1.2.0");
  assert.throws(
    () => addReleaseEntry(sample, { version: "1.2.0", title: "Again", date: "2026-11-03" }),
    /already has an entry/,
  );
  assert.throws(
    () => addReleaseEntry(sample, { version: "1.3.0", title: "  ", date: "2026-11-03" }),
    /title/,
  );
});
