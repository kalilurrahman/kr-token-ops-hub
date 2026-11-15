import { test } from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { RELEASE_LABEL, RELEASE_VERSION } from "./release";

test("release version is valid semver and labelled vX.Y.Z", () => {
  assert.match(RELEASE_VERSION, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
  assert.equal(RELEASE_LABEL, `v${RELEASE_VERSION}`);
});

test("package.json version matches the newest CHANGELOG entry", () => {
  const changelog = readFileSync(new URL("../../CHANGELOG.md", import.meta.url), "utf8");
  const latest = changelog.match(/^## (\d+\.\d+\.\d+\S*)/m)?.[1];
  assert.equal(
    latest,
    RELEASE_VERSION,
    'Bump package.json "version" and add a matching CHANGELOG.md entry together.',
  );
});
