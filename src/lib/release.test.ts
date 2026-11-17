import { test } from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { RELEASE_LABEL, RELEASE_VERSION } from "./release";
import { compareVersions, parseChangelog } from "./changelog";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const changelog = parseChangelog(read("../../CHANGELOG.md"));

test("release version is valid semver and labelled vX.Y.Z", () => {
  assert.match(RELEASE_VERSION, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
  assert.equal(RELEASE_LABEL, `v${RELEASE_VERSION}`);
});

test("package.json version matches the newest CHANGELOG entry", () => {
  assert.equal(
    changelog.entries[0]?.version,
    RELEASE_VERSION,
    'Bump package.json "version" and add a matching CHANGELOG.md entry together.',
  );
});

test("package-lock.json carries the same version as package.json", () => {
  const lock = JSON.parse(read("../../package-lock.json")) as {
    version?: string;
    packages?: Record<string, { version?: string }>;
  };
  assert.equal(lock.version, RELEASE_VERSION, "package-lock.json top-level version");
  assert.equal(lock.packages?.[""]?.version, RELEASE_VERSION, 'package-lock.json packages[""]');
});

test('every CHANGELOG release heading reads "## x.y.z — Title (YYYY-MM-DD)"', () => {
  assert.deepEqual(changelog.problems, [], "fix or remove these headings");
  assert.ok(changelog.entries.length > 0);
  for (const { version, date } of changelog.entries) {
    const parsed = new Date(`${date}T00:00:00Z`);
    assert.ok(
      !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(date),
      `${version}: invalid date ${date}`,
    );
  }
});

test("CHANGELOG versions are unique and newest first, with dates that never go forward", () => {
  const { entries } = changelog;
  for (let index = 1; index < entries.length; index += 1) {
    const newer = entries[index - 1]!;
    const older = entries[index]!;
    assert.ok(
      compareVersions(newer.version, older.version) > 0,
      `${newer.version} must be newer than the entry below it (${older.version}); two branches ` +
        "may have released the same number: take the next free version",
    );
    assert.ok(newer.date >= older.date, `${newer.version} is dated before ${older.version}`);
  }
});
