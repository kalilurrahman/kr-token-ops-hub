import { test } from "node:test";
import { strict as assert } from "node:assert";
import { buildEmailRedirect, readAuthLinkError, safeRedirect } from "./auth-redirect";

test("safeRedirect keeps same-site paths with their query and fragment", () => {
  assert.equal(safeRedirect("/library"), "/library");
  assert.equal(
    safeRedirect("/read/library/techniques/llm-wiki-maintained-knowledge.md"),
    "/read/library/techniques/llm-wiki-maintained-knowledge.md",
  );
  assert.equal(safeRedirect("/training?course=a&module=b#top"), "/training?course=a&module=b#top");
});

test("safeRedirect falls back to / for anything that could leave the site or loop", () => {
  for (const value of [
    undefined,
    null,
    42,
    "",
    "library",
    "https://evil.test/",
    "//evil.test",
    "/\\evil.test",
    "/lib\nrary",
    "/x\u0000y",
    "/x\u007fy",
    "/auth",
    "/auth?redirect=/library",
    "/auth/callback",
    "/auth#x",
  ]) {
    assert.equal(safeRedirect(value), "/", `expected / for ${JSON.stringify(value)}`);
  }
  assert.equal(safeRedirect("/authors"), "/authors");
  assert.equal(safeRedirect("  /library\n"), "/library", "surrounding whitespace is trimmed");
});

test("buildEmailRedirect returns to /auth on the same origin with an encoded target", () => {
  const origin = "https://tokenops.kalilurrahman.com";
  assert.equal(buildEmailRedirect(origin, undefined), `${origin}/auth`);
  assert.equal(buildEmailRedirect(origin, "/"), `${origin}/auth`);
  assert.equal(
    buildEmailRedirect(origin, "/read/library/a.md?x=1"),
    `${origin}/auth?redirect=%2Fread%2Flibrary%2Fa.md%3Fx%3D1`,
  );
  assert.equal(buildEmailRedirect(origin, "//evil.test"), `${origin}/auth`);
});

test("readAuthLinkError maps Supabase link errors to fixed text and ignores other fragments", () => {
  assert.equal(readAuthLinkError(""), null);
  assert.equal(readAuthLinkError("#reader-top"), null);
  assert.equal(readAuthLinkError("#access_token=abc&type=magiclink"), null);
  assert.match(
    readAuthLinkError(
      "#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid",
    ) ?? "",
    /expired or was already used/,
  );
  const other = readAuthLinkError("#error=server_error&error_description=<b>injected</b>");
  assert.equal(other, "That sign-in link could not be used. Request a new one below.");
});
