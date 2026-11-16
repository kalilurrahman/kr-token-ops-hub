import { test } from "node:test";
import { strict as assert } from "node:assert";
import {
  isLikelyEmail,
  linkErrorFromUrl,
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
