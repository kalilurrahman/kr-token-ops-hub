import { test } from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { RELEASE_LABEL, RELEASE_VERSION } from "./release";
import { compareVersions, parseChangelog, RELEASE_PLACEHOLDER } from "./release-notes";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const changelog = parseChangelog(read("../../CHANGELOG.md"));

test("release version is valid semver and labelled vX.Y.Z", () => {
  assert.match(RELEASE_VERSION, /^\d+\.\d+\.\d+$/);
  assert.equal(RELEASE_LABEL, `v${RELEASE_VERSION}`);
});

test("package.json version matches the newest CHANGELOG entry", () => {
  assert.equal(
    changelog[0]?.version,
    RELEASE_VERSION,
    'Bump package.json "version" and add a matching CHANGELOG.md entry together (npm run release).',
  );
});

test("package-lock.json carries the same version as package.json", () => {
  const lock = JSON.parse(read("../../package-lock.json")) as {
    version: string;
    packages: Record<string, { version?: string }>;
  };
  assert.equal(lock.version, RELEASE_VERSION, "package-lock.json top-level version");
  assert.equal(lock.packages[""]?.version, RELEASE_VERSION, 'package-lock.json packages[""]');
});

test("CHANGELOG versions are unique and newest first", () => {
  const versions = changelog.map((entry) => entry.version);
  assert.equal(new Set(versions).size, versions.length, `duplicate versions: ${versions}`);
  for (let i = 1; i < changelog.length; i += 1) {
    assert.ok(
      compareVersions(changelog[i - 1].version, changelog[i].version) > 0,
      `${changelog[i - 1].version} must be newer than the entry below it (${changelog[i].version})`,
    );
    assert.ok(
      changelog[i - 1].date >= changelog[i].date,
      `${changelog[i - 1].version} is dated before ${changelog[i].version}`,
    );
  }
});

test("the newest CHANGELOG entry has release notes", () => {
  const body = changelog[0]?.body ?? "";
  assert.match(body, /^- \S/m, "the newest entry needs at least one bullet");
  assert.ok(!body.includes(RELEASE_PLACEHOLDER), "replace the placeholder left by npm run release");
});

test("the build writes /version.json with the same version, before vite build", async () => {
  // @ts-expect-error plain ESM build script without type declarations
  const { releaseInfo, versionJson } = await import("../../scripts/write-version.mjs");
  const info = releaseInfo({ RELEASE_COMMIT: "ABCDEF1234567", RELEASE_DATE: "2026-11-27" });
  assert.deepEqual(info, { version: RELEASE_VERSION, commit: "abcdef1", date: "2026-11-27" });
  assert.deepEqual(JSON.parse(versionJson(info)), info);
  const pkg = JSON.parse(read("../../package.json")) as { scripts: Record<string, string> };
  assert.match(pkg.scripts.build, /^node scripts\/write-version\.mjs && vite build$/);
  assert.match(
    read("../../.gitignore"),
    /^\/public\/version\.json$/m,
    "version.json is generated, never committed",
  );
});

test('every page names its release in <meta name="version">', () => {
  const root = read("../routes/__root.tsx");
  assert.match(root, /\{ name: "version", content: RELEASE_VERSION \}/);
});
