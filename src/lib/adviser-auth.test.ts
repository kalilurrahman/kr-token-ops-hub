import { test } from "node:test";
import { strict as assert } from "node:assert";
import {
  decodeReturnPath,
  encodeReturnPath,
  hasEmailLinkResult,
  isLikelyEmail,
  linkErrorFromUrl,
  RETURN_PATH_TTL_MS,
  safeReturnPath,
  sendLinkErrorMessage,
  signInRedirectUrl,
} from "./adviser-auth";

const page = "https://tokenops.kalilurrahman.com/read/library/techniques/llm-wiki.md";

test("redirect URL is the current page without hash or auth parameters", () => {
  assert.equal(signInRedirectUrl(page), page);
  assert.equal(signInRedirectUrl(`${page}#access_token=abc&type=magiclink`), page);
  assert.equal(signInRedirectUrl(`${page}?code=123&error=x&tab=notes`), `${page}?tab=notes`);
});

test("email shape check accepts normal addresses and rejects obvious typos", () => {
  for (const ok of ["a@b.co", "first.last+tag@example.org", "  spaced@example.com  "]) {
    assert.equal(isLikelyEmail(ok), true, ok);
  }
  for (const bad of ["", "plain", "no-at.example.com", "a@b", "a@.com", "a b@c.com", "a@b..com"]) {
    assert.equal(isLikelyEmail(bad), false, bad);
  }
});

test("failed links are explained; normal pages are not", () => {
  assert.equal(linkErrorFromUrl(page), null);
  assert.match(
    linkErrorFromUrl(`${page}#error=access_denied&error_code=otp_expired`) ?? "",
    /expired/,
  );
  assert.match(linkErrorFromUrl(`${page}?error=server_error`) ?? "", /didn't work/);
});

test("rate limits get their own send-error message", () => {
  assert.match(sendLinkErrorMessage(429), /Too many/);
  assert.match(sendLinkErrorMessage(500), /could not be sent/);
  assert.match(sendLinkErrorMessage(undefined), /could not be sent/);
});

test("an emailed link's result is detected in the hash or query, other URLs are ignored", () => {
  const home = "https://tokenops.kalilurrahman.com/";
  assert.equal(hasEmailLinkResult(`${home}#access_token=abc&type=magiclink`), true);
  assert.equal(hasEmailLinkResult(`${home}#error=access_denied&error_code=otp_expired`), true);
  assert.equal(hasEmailLinkResult(`${home}?error_description=Email+link+is+invalid`), true);
  assert.equal(hasEmailLinkResult(home), false);
  assert.equal(hasEmailLinkResult(`${page}#reader-top`), false);
  assert.equal(hasEmailLinkResult(`${home}training?course=a&module=b`), false);
});

test("the return path keeps the briefing's path and query and drops auth leftovers", () => {
  const now = 1_700_000_000_000;
  const stored = encodeReturnPath(`${page}?tab=notes&code=1#access_token=x`, now);
  assert.equal(
    decodeReturnPath(stored, now + 1000),
    "/read/library/techniques/llm-wiki.md?tab=notes",
  );
});

test("a stale, future-dated, malformed or off-site return path is ignored", () => {
  const now = 1_700_000_000_000;
  const stored = encodeReturnPath(page, now);
  assert.equal(decodeReturnPath(stored, now + RETURN_PATH_TTL_MS + 1), null);
  assert.equal(decodeReturnPath(stored, now - 1), null);
  assert.equal(decodeReturnPath(null, now), null);
  assert.equal(decodeReturnPath("not json", now), null);
  assert.equal(decodeReturnPath(JSON.stringify({ path: "/x" }), now), null);
  for (const path of ["//evil.test/x", "/\\evil.test", "https://evil.test/", "x", "/a\nb"]) {
    assert.equal(decodeReturnPath(JSON.stringify({ path, at: now }), now), null, path);
    assert.equal(safeReturnPath(path), null, path);
  }
});
