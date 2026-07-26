# 03 — License & Entitlement Architecture on Cloudflare

**What this document decides.** This is the technical blueprint for gating TokenOps Pro on the existing Cloudflare Workers deployment: where premium content physically lives so it stops leaking (server-only module + R2, never `/public`, never the client bundle), how a license key becomes a session (Polar.sh as the license authority behind a single `LicenseService` interface, with a Gumroad adapter as the secondary storefront per the decision in 02-pricing-and-platforms.md), how refunds revoke access (signed webhooks confirmed against the verify API, KV denylist), how PDF/EPUB downloads get per-buyer watermarks stamped in the Worker, and how to gate without destroying SEO. It ends with a file-by-file change list for this repo, a rollout order whose step zero is the Lovable-pipeline bindings spike, and effort estimates. Product/tier contents are fixed in 01-product-and-packaging.md; platform economics in 02-pricing-and-platforms.md; the SEO transition plan and launch sequencing in 04-marketing-and-launch.md; support/refund operations in 05-operations-legal-sustainability.md.

---

## 1. Why a UI paywall protects nothing today

There is currently **zero gating infrastructure** — no auth, no server functions, no KV/D1/R2 bindings (verified against `wrangler.jsonc` and a grep of `src/`). Worse, the premium-candidate content is exposed through three independent channels, each sufficient on its own, plus active advertisement of all of it:

1. **World-readable static files.** Everything under `public/library/**` (46 documents, ~74k words — the entire `trends/`, `playbooks/`, `advanced/` packs) and `public/templates/**` (~1.1 MB including the current `TokenOps_Guide.pdf`) is served verbatim as static assets. `curl https://tokenops.kalilurrahman.com/library/playbooks/rag-cost-optimization-playbook.md` returns full text, no questions asked. `public/library/INTEGRATION.md` even ships internal build instructions publicly (delete it — D6 housekeeping).
2. **The client JS bundle carries the entire corpus.** `src/routes/read.$.tsx:5` does `import documents from "@/tokenops/documents.json"` — all **663 KiB** (46 library docs + 10 templates, full raw text) is compiled into the browser bundle and shipped to every visitor. The in-browser reader resolves content from this in-memory store; there is no server fetch. Locking down `/public` alone changes nothing — anyone can extract the corpus from the JS. (`src/routes/guide.tsx:4` similarly bundles `guide.md?raw`, but the guide stays free per the canonical split, so that one is fine.)
3. **Direct download links.** `downloadLibraryFile()` (`src/tokenops/data.ts:256–263`) and `downloadTemplate()` (`src/tokenops/data.ts:118–125`) just set `a.href = "/library/..."` / `"/templates/..."` — the site's own UI documents the raw URLs.
4. **Discovery is actively encouraged.** `robots.txt` is allow-all, `sitemap[.]xml.ts` enumerates the routes, and `public/llms.txt` advertises the site to AI crawlers as "the open reference" — a positioning that must be rewritten alongside gating (messaging handled in 04-marketing-and-launch.md).

Any client-side "lock" over this is decorative. And one honest conclusion follows (this is the locked rationale behind decision D5): the current library is **already leaked** — world-readable, in web archives, and embedded in every cached copy of the JS bundle. Gating retroactively protects almost nothing. The paid product's value is the **corrected, unified, and new material plus the freshness stream** (monthly briefings, living pricing dataset, edition updates), and the architecture below exists to protect that *forward* stream: new premium docs never touch `/public` or the client bundle, and binary artifacts are stamped per buyer at download time.

---

## 2. Where premium content lives

Three candidate stores were evaluated; each is matched to its strength:

**Server-only module (chosen for premium markdown).** Split the generated content into `free-documents.json` (stays client-importable, powers today's reader for free docs) and `premium-documents.json`, imported **only** by a server-only module (`src/tokenops/premium.server.ts`) that is itself only imported inside `createServerFn` handlers and `server.handlers`. The [Cloudflare Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/) builds the worker (SSR) bundle separately from the client bundle, so content reachable only from server code lands only in the worker script, never in browser JS. Premium markdown sources move from `public/library/**` to `content/premium/**` — outside `public/`, so they are simply never emitted as static assets. Benefits: zero new infrastructure for the reading path, atomic deploys (content versioned with the code that renders it), SSR renders teaser and full content in one pass, works unchanged in `vite dev`.

**R2 (chosen for binary artifacts).** The Handbook PDF/EPUB, the `.xlsx` cost model, `.pptx` deck, `.docx` templates, and benchmark reports go in an R2 bucket (`tokenops-premium`), streamed through an auth-checked download route. R2 is the right store for binaries: unlimited size, zero bundle impact, no egress fees, ranged reads — and the download route is where per-buyer watermarking happens (§7).

**KV (reserved for license state only).** Verify cache, denylist, rate-limit counters, grace markers.

Two rejections, explicitly:

- **KV for content — rejected.** Eventual consistency (up to ~60 s propagation), per-read latency and read-unit billing, content no longer atomically versioned with the rendering code, and a sync script whose failure mode is "site deployed, content missing."
- **R2 for markdown — rejected.** A second deploy artifact to keep in sync with git for what is currently ~663 KiB of text; the server-only bundle gives the same protection with no sync surface. R2 earns its place only where files are large and binary.

**Worker size sanity check.** Workers script limits are 3 MB gzipped (free plan) / 10 MB (paid). The full corpus is 663 KiB raw; markdown/JSON gzips roughly 3–4×, so the premium pack adds ~200 KiB gzipped to the worker. Even if the 2026–27 edition triples the premium corpus, the worker stays comfortably inside the free-plan limit — and an order of magnitude inside the paid one. No architectural cliff here.

**Build script.** `scripts/build-content.mjs` regenerates both JSONs from the markdown trees (`content/premium/**` + the remaining free files) on every build — the repo already generates `documents.json` from `public/library`, so this is a refactor, not an invention. The same script emits pandoc inputs for the artifact pipeline (§7) and fails the build if a `premium: true` item in `content.json` still resolves to a file under `public/`.

**Leak regression test (non-negotiable).** After the split ships, grep the built client assets for a premium-only sentinel phrase; wire that grep into CI so a future refactor can never silently re-bundle premium text.

---

## 3. The `LicenseService` abstraction

One interface, two adapters, per D2. All platform contact is isolated here so that a fallback migration (Stripe Managed Payments + Keygen, or Paddle + Keygen — see 02-pricing-and-platforms.md) touches exactly one file.

Why Polar carries the primary load ([platform research, verdict (b)](https://polar.sh/docs/features/benefits/license-keys)): license keys are a product **benefit** — auto-generated, brandable prefix, optional expiry, **enforced activation (device) limits**, metadata conditions (up to 50 key-value pairs); [`POST /v1/customer-portal/license-keys/activate`](https://polar.sh/docs/api-reference/customer-portal/license-keys/activate), `/validate`, `/deactivate` are public-safe (no secret needed; params `key`, `organization_id`, `label`); customers self-manage device activations in Polar's hosted portal; and keys are **automatically revoked when the benefit is revoked** — refund, cancellation — with no code on our side ([benefit docs](https://polar.apidocumentation.com/documentation/features/benefits/license-keys), [polar-js SDK](https://github.com/polarsource/polar-js/blob/main/docs/sdks/licensekeys/README.md)). Gumroad, by contrast, gives a raw `uses` counter that Gumroad **never enforces** and keys that **keep verifying after refunds** — you must check `purchase.refunded`/`chargebacked` yourself and maintain your own denylist ([Gumroad license keys](https://gumroad.com/help/article/76-license-keys), [verify API walkthrough](https://dev.to/zsevic/license-key-verification-with-gumroad-api-58f9), [LicenseSeat analysis](https://licenseseat.com/alternative-to-gumroad)). The adapter pattern absorbs that asymmetry: Polar's platform-enforced behavior and Gumroad's client-side workarounds present the same `LicenseResult` to the rest of the app.

Adapter routing is by key shape: Polar keys carry the brandable prefix (e.g. `TOKENOPS-…`); Gumroad keys are `XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX`.

```ts
// src/lib/license.server.ts  (server-only; imported dynamically from server fns)
import { env } from "cloudflare:workers";
import { sha256Hex } from "./session.server";

export type Tier = "handbook" | "pro" | "team";
export type Entitlement =
  | "handbook"      // stamped PDF/EPUB downloads, 2026–27 edition
  | "toolkit"       // .xlsx / .pptx / .docx / companion repo
  | "web"           // premium reading: trends archive, playbooks, advanced, operating templates
  | "calculators"   // scenario save/compare/CSV export
  | "dataset";      // living pricing JSON + changelog feed

export interface LicenseIdentity {
  platform: "polar" | "gumroad";
  keyHash: string;              // sha256(raw key) — raw key is never persisted
  email: string;                // purchaser email, needed for watermarking
  tier: Tier;
  entitlements: Entitlement[];
  activationId?: string;        // Polar activation instance; absent on Gumroad
}

export type LicenseResult =
  | { ok: true; identity: LicenseIdentity }
  | { ok: false; reason: "invalid" | "revoked" | "activation_cap" | "upstream_down" };

export interface LicenseService {
  /** First unlock on a new browser/device — consumes an activation. */
  activate(key: string, label: string): Promise<LicenseResult>;
  /** Routine re-verification — must NEVER consume an activation. */
  verify(key: string, activationId?: string): Promise<LicenseResult>;
  /** Free a seat (support flow / customer request). */
  deactivate(key: string, activationId: string): Promise<void>;
}

const TIER_ENTITLEMENTS: Record<Tier, Entitlement[]> = {
  handbook: ["handbook"],
  pro: ["handbook", "toolkit", "web", "calculators", "dataset"],
  team: ["handbook", "toolkit", "web", "calculators", "dataset"],
};

export function adapterFor(key: string): LicenseService {
  return key.startsWith("TOKENOPS-") ? polarAdapter : gumroadAdapter;
}
```

### 3.1 PolarAdapter

```ts
const POLAR = "https://api.polar.sh/v1/customer-portal/license-keys";

async function polarCall(path: string, body: Record<string, unknown>) {
  return fetch(`${POLAR}/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ organization_id: env.POLAR_ORGANIZATION_ID, ...body }),
  });
}

/** Product/benefit → tier map, configured once per Polar product. */
function polarTier(productId: string): Tier {
  const map = JSON.parse(env.POLAR_PRODUCT_TIERS) as Record<string, Tier>; // {"prod_...":"pro",...}
  return map[productId] ?? "handbook";
}

export const polarAdapter: LicenseService = {
  async activate(key, label) {
    let res: Response;
    try {
      res = await polarCall("activate", { key, label }); // label e.g. "web-2026-07-26"
    } catch { return { ok: false, reason: "upstream_down" }; }
    if (res.status >= 500) return { ok: false, reason: "upstream_down" };
    if (res.status === 403) return { ok: false, reason: "activation_cap" }; // platform-enforced limit
    if (!res.ok) return { ok: false, reason: "invalid" };  // unknown, expired, or auto-revoked key
    const data = await res.json() as {
      id: string;                                          // activation instance id
      license_key: { key: string; product_id: string; customer: { email: string } };
    };
    const tier = polarTier(data.license_key.product_id);
    return { ok: true, identity: {
      platform: "polar", keyHash: await sha256Hex(key),
      email: data.license_key.customer.email, tier,
      entitlements: TIER_ENTITLEMENTS[tier], activationId: data.id,
    }};
  },

  async verify(key, activationId) {
    let res: Response;
    try {
      res = await polarCall("validate", { key, activation_id: activationId });
    } catch { return { ok: false, reason: "upstream_down" }; }
    if (res.status >= 500) return { ok: false, reason: "upstream_down" };
    // Polar auto-revokes keys on refund/benefit revocation → validate fails; that IS our revocation signal.
    if (!res.ok) return { ok: false, reason: "revoked" };
    const data = await res.json() as {
      key: string; product_id: string; customer: { email: string };
    };
    const tier = polarTier(data.product_id);
    return { ok: true, identity: {
      platform: "polar", keyHash: await sha256Hex(key),
      email: data.customer.email, tier,
      entitlements: TIER_ENTITLEMENTS[tier], activationId,
    }};
  },

  async deactivate(key, activationId) {
    await polarCall("deactivate", { key, activation_id: activationId });
  },
};
```

Notes: activation limits (5 for individual tiers, **10 for Team** per D3) are configured on the Polar benefit and **enforced platform-side** — the adapter merely translates the rejection. Exact response field names should be pinned against the [API reference](https://polar.sh/docs/api-reference/customer-portal/license-keys/activate) during implementation (API version 2026-04); the shapes above follow the documented schema but this is the one place drift is possible.

### 3.2 GumroadAdapter (secondary storefront)

Gumroad's [`POST /v2/licenses/verify`](https://gumroad.com/help/article/76-license-keys) is form-urlencoded, needs no OAuth, and has one famous foot-gun: **`increment_uses_count` defaults to `"true"`** — every verify call bumps the counter unless you explicitly pass `"false"`. Activation on Gumroad is therefore *modeled*, not enforced: increment only on `/unlock` (a genuine new device), send `false` on every re-verify, and reject in code when `uses` exceeds the cap. Refunds never kill the key upstream — a refunded key still verifies `success: true` — so the adapter checks the `refunded` / `chargebacked` / `disputed && !dispute_won` / `subscription_*_at` flags and writes the denylist itself.

```ts
const GUMROAD_VERIFY = "https://api.gumroad.com/v2/licenses/verify";

interface GumroadVerify {
  success: boolean; uses: number;
  purchase?: {
    email: string; product_id: string; refunded: boolean; disputed: boolean;
    dispute_won: boolean; chargebacked?: boolean;
    subscription_ended_at: string | null; subscription_cancelled_at: string | null;
    subscription_failed_at: string | null;
  };
}

async function gumroadVerify(key: string, productId: string, increment: boolean) {
  return fetch(GUMROAD_VERIFY, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      product_id: productId,
      license_key: key,
      increment_uses_count: increment ? "true" : "false", // default is TRUE — always be explicit
    }),
  });
}

async function gumroadCheck(key: string, increment: boolean): Promise<LicenseResult> {
  const products = JSON.parse(env.GUMROAD_PRODUCT_TIERS) as Record<string, Tier>; // {"prod_id":"pro",...}
  const kh = await sha256Hex(key);
  for (const [productId, tier] of Object.entries(products)) {
    let res: Response;
    try { res = await gumroadVerify(key, productId, increment); }
    catch { return { ok: false, reason: "upstream_down" }; }
    if (res.status >= 500) return { ok: false, reason: "upstream_down" };
    const data = await res.json() as GumroadVerify;   // wrong product / bad key → 404 + success:false
    if (!data.success || !data.purchase) continue;    // try the next configured product

    const p = data.purchase;
    const dead = p.refunded || p.chargebacked || (p.disputed && !p.dispute_won) ||
      p.subscription_ended_at || p.subscription_cancelled_at || p.subscription_failed_at;
    if (dead) {
      await env.LICENSE_KV.put(`deny:${kh}`, "revoked");   // Gumroad never blocks keys — we do
      return { ok: false, reason: "revoked" };
    }
    if (increment && data.uses > Number(env.ACTIVATION_CAP))
      return { ok: false, reason: "activation_cap" };      // uses-counter-as-soft-cap
    return { ok: true, identity: {
      platform: "gumroad", keyHash: kh, email: p.email, tier,
      entitlements: TIER_ENTITLEMENTS[tier],
    }};
  }
  return { ok: false, reason: "invalid" };
}

export const gumroadAdapter: LicenseService = {
  activate: (key, _label) => gumroadCheck(key, true),
  verify:   (key)         => gumroadCheck(key, false),
  // Freeing a "seat" = PUT /v2/licenses/decrement_uses_count (requires GUMROAD_ACCESS_TOKEN);
  // wired into the support flow (05-operations-legal-sustainability.md), not self-service.
  deactivate: async () => { /* support-driven via authenticated decrement endpoint */ },
};
```

Gumroad rate limits are unpublished — cache defensively (§4) so Gumroad sees at most ~1 call per key per day in steady state. Polar's license endpoints are public-safe with standard limits; the same cache keeps us far below any ceiling (Lemon Squeezy's comparable license API allows 60 req/min, a useful mental budget even though we are not building on LS per D2).

---

## 4. Session design: key → cookie → guarded content

Verifying against the platform on every page view would be slow, rate-limit-hostile, and fragile. Instead: verify once at `/unlock`, then carry an **HMAC-SHA256-signed, HttpOnly cookie** — `HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000` — with a **30-day hard expiry** and a **7-day soft re-verify** horizon. The payload stores the SHA-256 hash of the key (never the raw key), the purchaser email (needed for watermarking), tier + entitlements, and the Polar activation id. Web Crypto only; a JWT library is overkill for a single-issuer, single-audience token.

```ts
// src/lib/session.server.ts
import { env } from "cloudflare:workers";
import type { Entitlement, Tier } from "./license.server";

export interface LicenseSession {
  v: 1;
  kh: string;            // sha256(licenseKey) hex
  em: string;            // purchaser email (watermarking)
  tr: Tier;
  en: Entitlement[];
  pf: "polar" | "gumroad";
  ai?: string;           // Polar activation id
  iat: number;           // issued (s)
  exp: number;           // hard expiry: iat + 30d
  rv: number;            // soft re-verify due: iat + 7d
}

const enc = new TextEncoder();
const b64u = (b: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(b))).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");

async function hmacKey() {
  return crypto.subtle.importKey("raw", enc.encode(env.SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function sha256Hex(s: string) {
  const d = await crypto.subtle.digest("SHA-256", enc.encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signSession(p: LicenseSession): Promise<string> {
  const body = b64u(enc.encode(JSON.stringify(p)));
  const mac = b64u(await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(body)));
  return `${body}.${mac}`;
}

export async function readSession(token: string | undefined): Promise<LicenseSession | null> {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const raw = Uint8Array.from(atob(mac.replaceAll("-", "+").replaceAll("_", "/")), (c) => c.charCodeAt(0));
  const ok = await crypto.subtle.verify("HMAC", await hmacKey(), raw, enc.encode(body)); // constant-time
  if (!ok) return null;
  try {
    const p = JSON.parse(atob(body.replaceAll("-", "+").replaceAll("_", "/"))) as LicenseSession;
    if (p.v !== 1 || p.exp * 1000 < Date.now()) return null;
    return p;
  } catch { return null; }
}
```

The full flow:

```
/unlock ── key + Turnstile token ──► activateLicense (server fn, POST)
                       │ 0. verify Turnstile token (siteverify)
                       │ 1. rate limit: KV counters rl:unlock:ip:<ip> and rl:unlock:key:<kh> (10/hour each)
                       │ 2. denylist check deny:<kh> ──► reject
                       │ 3. adapterFor(key).activate(key, label)   ← consumes one activation
                       │ 4. write verify:<kh> cache (24h TTL) + set signed cookie (30d/7d)
                       ▼
                licensed session
guarded loaders / server fns ──► readSession(cookie)
                       │ fresh (rv in future) → allow
                       │ stale (rv passed)    → verify:<kh> cache → hit: allow, rotate rv
                       │                        miss: adapter.verify(key-hash lookup impossible —
                       │                        re-verify uses activationId/platform from session)
                       │ denylisted kh        → clear cookie, 403
                       │ upstream 5xx         → GRACE: grace:<kh> marker (72h TTL), allow, retry lazily
                       ▼
platform webhook (refund / revocation) ──► confirm via verify API ──► deny:<kh> (no TTL) + purge verify:<kh>
```

Design points, in order of importance:

- **KV verify cache** (`verify:<kh>`, 24 h TTL) absorbs soft re-verify traffic. Steady state: each active key generates at most one upstream API call per day.
- **Denylist** (`deny:<kh>`, plus `deny:email:<sha256hex>` for multi-product buyers) is checked on every soft re-verify and on **every download** — downloads are the valuable exfiltration path; page reads can ride the 7-day soft window.
- **Grace on upstream 5xx:** a valid, unexpired cookie is honored when re-verification hits a 5xx — write `grace:<kh>` (72 h TTL) and retry lazily on subsequent requests. New activations during an outage get "try again shortly"; never issue a session you could not verify. The 30-day hard expiry bounds the damage of any stale allowance.
- **Rate-limited `/unlock`:** KV counters per IP and per key-hash (10/hour) prevent key brute-forcing and enumeration, and **Cloudflare Turnstile is pre-wired on the form from day one** — not "added if abuse appears" (critique #20). Turnstile is free, invisible for most humans, and removes the entire bot-enumeration class before it starts.
- **Dynamic imports of `.server` modules inside handlers.** TanStack Start has a known failure mode ([TanStack/router #6185](https://github.com/TanStack/router/issues/6185)) where `cloudflare:workers` imports reachable from middleware/route module graphs leak into the client build and break Rollup. Every server-only import above happens via `await import(...)` inside the handler body, keeping `cloudflare:workers` strictly in the worker graph.
- The privacy policy must disclose the license cookie (GDPR) — text and placement in 05-operations-legal-sustainability.md.

The guard (`requireLicense()` / `requireEntitlement("web")` in `src/fn/license.ts`) is what route loaders call; `getPremiumDoc` returns `{ licensed: true, markdown }` or `{ licensed: false, markdown: teaserOf(doc, 0.15..0.20) }` — the same honest teaser for everyone, crawlers included (§8).

---

## 5. Webhooks: refunds and revocations

Uniform trust model for both platforms: **a webhook is a hint, not a fact.** On any refund/revocation event, re-check the key against the platform's verify API and only denylist when the API confirms. A forged webhook then cannot deny service to a legitimate buyer, and a missed webhook self-heals within 7 days via the soft re-verify.

**Polar** does most of the work platform-side: refund or benefit revocation **automatically revokes the license key**, so `validate` starts failing with no code on our side ([benefit docs](https://polar.apidocumentation.com/documentation/features/benefits/license-keys)). The webhook's job is only to make revocation *immediate* rather than waiting out the 24 h verify cache and 7-day soft window: verify the signature (Polar webhooks are properly signed with your endpoint secret — pin the exact header/scheme against Polar's webhook docs at implementation time), then purge the cache and sync the denylist.

```ts
// src/routes/api/webhooks/polar.ts  (same unified-route idiom as src/routes/sitemap[.]xml.ts)
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/webhooks/polar")({
  server: { handlers: {
    POST: async ({ request }) => {
      const { env } = await import("cloudflare:workers");
      const { verifyPolarSignature } = await import("@/lib/webhooks.server"); // HMAC over raw body
      const { adapterFor } = await import("@/lib/license.server");
      const { sha256Hex } = await import("@/lib/session.server");

      const raw = await request.text();
      if (!(await verifyPolarSignature(raw, request.headers, env.POLAR_WEBHOOK_SECRET)))
        return new Response("bad signature", { status: 401 });

      const event = JSON.parse(raw) as { type: string; data: Record<string, unknown> };
      if (/refund|revoked|canceled/.test(event.type)) {
        const key = extractLicenseKey(event.data);          // defensive: shape may evolve
        if (key) {
          const check = await adapterFor(key).verify(key);  // confirm: hint → fact
          if (!check.ok && check.reason === "revoked") {
            const kh = await sha256Hex(key);
            await env.LICENSE_KV.put(`deny:${kh}`, event.type);   // no TTL — permanent
            await env.LICENSE_KV.delete(`verify:${kh}`);
          }
        }
      }
      return new Response("ok");
    },
  }},
});
```

**Gumroad** needs the full defensive treatment. Its Ping/resource-subscription payloads are form-urlencoded and their signing is inconsistently documented across sources — some report an HMAC `X-Gumroad-Signature`, others describe secret-URL-at-best authenticity — so regardless of what your account actually sends, treat the payload purely as a trigger. Register via [`PUT /v2/resource_subscriptions`](https://rollout.com/integration-guides/gumroad/quick-guide-to-implementing-webhooks-in-gumroad) (with `GUMROAD_ACCESS_TOKEN`) for `refund`, `dispute`, and `cancellation`, pointing at `.../api/webhooks/gumroad?s=<random secret>`; non-200 responses are retried roughly hourly for ~3 hours, so always return 200.

```ts
// src/routes/api/webhooks/gumroad.ts
POST: async ({ request }) => {
  const { env } = await import("cloudflare:workers");
  const { gumroadAdapter } = await import("@/lib/license.server");
  const { sha256Hex } = await import("@/lib/session.server");

  const url = new URL(request.url);
  if (url.searchParams.get("s") !== env.GUMROAD_WEBHOOK_SECRET)
    return new Response("nope", { status: 401 });     // weak-auth channel: secret URL + confirm below

  const form = await request.formData();               // Gumroad posts x-www-form-urlencoded
  const licenseKey = form.get("license_key")?.toString();
  const resource = form.get("resource_name")?.toString(); // refund | dispute | cancellation | ...
  const refunded = form.get("refunded")?.toString() === "true";

  if (licenseKey && (refunded || ["refund", "dispute", "cancellation"].includes(resource ?? ""))) {
    const check = await gumroadAdapter.verify(licenseKey);   // hint → fact via verify API
    if (!check.ok && (check.reason === "revoked" || check.reason === "invalid")) {
      const kh = await sha256Hex(licenseKey);
      await env.LICENSE_KV.put(`deny:${kh}`, resource ?? "refund");
      await env.LICENSE_KV.delete(`verify:${kh}`);
    }
  }
  return new Response("ok");                           // always 200: avoid retry storms
},
```

Note the asymmetry this buys you: on Polar a refund revokes access even if the webhook never arrives (validate fails at the next soft re-verify); on Gumroad a missed webhook is caught by the adapter's dead-flag check on the next re-verify. Either way the 30-day guarantee's refund path (policy in 05-operations-legal-sustainability.md) is enforced automatically.

---

## 6. Entitlements and tiers on Polar

Polar's decisive structural advantage ([license-key mechanics comparison](https://polar.sh/docs/features/benefits/license-keys)): **benefits decouple entitlement from key.** The key is a stable identifier; what it grants is a set of benefits that can change without regenerating the key.

| Tier (from 01-product-and-packaging.md) | Polar product | Benefits granted | Activation limit | Entitlements resolved |
|---|---|---|---|---|
| The Handbook — $59 (presale $39) | "TokenOps Handbook 2026" | license key + "Start here" PDF | 5 | `handbook` |
| TokenOps Pro — $149 (presale $99) | "TokenOps Pro" | license key + "Start here" PDF | 5 | `handbook, toolkit, web, calculators, dataset` |
| Team — $599 (presale $449) | "TokenOps Pro — Team" | license key + "Start here" PDF | **10** | same as Pro |

- **Team = one key, 10 activations** (D3). No per-seat key distribution problem: the buyer forwards one key; each teammate activates on their own browser; the platform enforces the cap; and **seat churn is self-service** — a departing teammate's activation is freed in Polar's hosted customer portal without a support email to you. License terms define Team as 10 named users (05-operations-legal-sustainability.md).
- **Tier resolution** is a one-line map (`POLAR_PRODUCT_TIERS` / `GUMROAD_PRODUCT_TIERS` vars) from product id to tier; key metadata (Polar supports up to 50 key-value pairs) can carry edition tags as a belt-and-suspenders signal.
- **Edition upgrades (D4) = a new benefit grant, key unchanged.** When the 2027–28 edition ships, owners buy the ~50%-off upgrade; Polar grants the new edition benefit to the same customer; the adapter starts resolving the extra entitlement (e.g. `edition-2027`) on the next verify; the buyer's key, cookie flow, and bookmarks are untouched. On Gumroad — which has no entitlement model, new product = new key — edition upgrades are sold as a discounted separate product; another reason it stays the secondary storefront.
- **Presale keys are just keys.** The 33%-off launch-window purchases produce identical benefits — no special-casing anywhere in this architecture.

---

## 7. Watermarked delivery: CI builds the base, the Worker stamps the buyer

Per-buyer watermarking is the single highest-leverage anti-sharing measure for a content product: it converts "forward the file" into "forward the file with your name and order number on every page." The pipeline keeps CI buyer-agnostic and stamps at download time:

**CI (GitHub Actions — the repo currently has none; this workflow is independent of the Lovable deploy pipeline).** On changes under `content/`:

```yaml
# .github/workflows/artifacts.yml (sketch)
on: { push: { paths: ["content/**"] } }
jobs:
  build-artifacts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: sudo apt-get install -y pandoc && curl -fsSL https://typst.community/install | sh
      - run: pandoc content/handbook/*.md --toc --pdf-engine=typst -o dist/tokenops-handbook-2026.pdf
      - run: pandoc content/handbook/*.md -o dist/tokenops-handbook-2026.epub --epub-cover-image=assets/cover.png
      - run: npx wrangler r2 object put tokenops-premium/artifacts/tokenops-handbook-2026.pdf --file dist/tokenops-handbook-2026.pdf
      # ... repeat for EPUB, .xlsx, .pptx, .docx, benchmark PDFs
```

`pandoc --pdf-engine=typst` is the current lightweight route to book-quality PDF without a TeX install (WeasyPrint if you'd rather style with CSS). Output: **un-stamped base artifacts in R2**, refreshed on every content change — which is what makes "always the latest edition" a real selling point rather than a re-upload chore.

**Download time (Worker).** `src/routes/api/download/$.ts` — auth-checked, entitlement-checked, stamped:

```ts
GET: async ({ request, params }) => {
  const session = await requireEntitlement("handbook");           // 403 if absent
  const kh = session.kh;
  if (await env.LICENSE_KV.get(`deny:${kh}`)) return new Response("revoked", { status: 403 });

  const obj = await env.PREMIUM_ASSETS.get(`artifacts/${safeName(params._splat)}`);
  if (!obj) return new Response("not found", { status: 404 });

  const pdf = await PDFDocument.load(await obj.arrayBuffer());    // pdf-lib: pure JS, Workers-safe
  for (const page of pdf.getPages())
    page.drawText(
      `Licensed to jane@example.com · Order #TO-48211 · tokenops.kalilurrahman.com`, // session.em + order ref
      { x: 36, y: 18, size: 7, opacity: 0.6 });
  pdf.setSubject(`license:${kh.slice(0, 12)}`);                   // XMP metadata: quiet, traceable
  await env.LICENSE_KV.put(`dl:${kh}:${Date.now()}`, safeName(params._splat),
    { expirationTtl: 90 * 86400 });                               // download log for abuse review
  return new Response(await pdf.save(), { headers: {
    "content-type": "application/pdf",
    "content-disposition": `attachment; filename="tokenops-handbook-2026.pdf"`,
  }});
},
```

(The footer string is built from `session.em` and the order reference — the literal above is illustrative; only fictional emails like `jane@example.com` appear in code, docs, and tests.) For EPUB, inject a colophon page plus `dc:identifier` into the zip with `fflate`. For `.xlsx`/`.pptx`/`.docx`, stamping is optional at v1 — embed the order reference in document properties; page-level watermarking of Office formats is not worth the complexity.

**Why platform-hosted file delivery loses**, on any platform: platform-hosted files cannot be per-buyer stamped, go stale the moment an edition updates (re-upload chore, old copies keep circulating), and bypass your denylist entirely — a refunded buyer keeps their download link. So **the checkout delivers only a small "Start here" PDF** containing the license key, the `/unlock` URL, and instructions; every real artifact comes from the site, freshly built, freshly stamped, denylist-checked. This also makes web, PDF, and EPUB provably consistent — one markdown source (D6's single source of truth).

---

## 8. SEO-safe gating

Gating must not read as cloaking, and must not vaporize the pages Google already indexed (critique #4; full transition plan and Search Console monitoring cadence in 04-marketing-and-launch.md). The rules:

- **Server-render an honest teaser for everyone.** Title, description, TOC, and the first **15–20%** of each premium doc, identical for anonymous humans, logged-out buyers, and Googlebot. Full content renders below only when the cookie validates. Because Google receives exactly what an anonymous human receives, this is *flexible sampling*, not cloaking. Never special-case crawler user-agents to receive full content — that **is** cloaking, and it leaks the content via Google's cache besides.
- **Paywall structured data.** Each gated page carries JSON-LD `Article`/`CreativeWork` with `"isAccessibleForFree": false` and `hasPart: { "@type": "WebPageElement", "isAccessibleForFree": false, "cssSelector": ".premium-body" }` — Google's documented mechanism for distinguishing paywall from cloaking.
- **301 the old raw `.md` URLs.** Once premium files leave `public/`, requests for `/library/advanced/llm-gateway-architecture.md` fall through to the Worker. Do not let them 404: a redirect map (in the `src/start.ts` request middleware or a catch-all route) 301s every previously-indexed raw file path to its teaser route (`/read/advanced/llm-gateway-architecture`). Raw URLs are almost certainly indexed; 301s preserve their equity, 404s burn it. Free docs' raw URLs 301 to their reader routes too, for consistency.
- **Sitemap and llms.txt rewrite.** Teaser routes stay in `sitemap.xml` (locked pages with paywall markup are legitimate index citizens); `public/llms.txt` is rewritten to point at teaser routes, drop raw `.md` links, fix the stale "29 guides" count (actual: 46 documents — D6), and carry the repositioned framing ("the reference stays free; the operator's edition is paid" — wording in 04-marketing-and-launch.md).
- **Monitor, don't guess.** Watch Search Console for the gated URLs' impressions/position for 8 weeks post-flip; expect some ranking loss on pages reduced to teasers and measure it rather than assume it (baseline and response plan in 04-marketing-and-launch.md, with Plausible funnel events — teaser view → unlock CTA → checkout → activation — per D11).

---

## 9. Anti-abuse: what is proportionate for a $59–$599 content product

**Worth doing** (all already designed above):

- **Activation caps** — enforced by Polar (5 individual / 10 Team), modeled via the uses counter on Gumroad. Caps mass sharing, tolerates a household's second laptop. That tolerance is deliberate.
- **Per-buyer watermarks + XMP metadata** on every download. The one measure that changes sharer behavior.
- **`/unlock` rate limits + Turnstile** — kills key enumeration and brute force at trivial cost.
- **Download logging** (`dl:` keys, 90-day TTL) — a key that pulls every artifact from 40 IPs in an hour gets flagged for manual review; the response is a support conversation or a denylist entry, not automation.

**Explicitly not worth doing**, because cost exceeds benefit at this price point:

- **DRM / encrypted EPUB** — hostile to legitimate buyers, trivially stripped, support-ticket generator.
- **Right-click/copy/paste blocking, canvas-rendered text, blur overlays** — breaks accessibility and screen readers, defeats nobody who can open DevTools, and screenshots exist.
- **Browser fingerprinting for device binding** — GDPR-fraught, brittle across browser updates, and redundant: the HttpOnly cookie *is* the device binding.
- **Chasing individual sharers.** Price fairly, watermark, accept residual leakage as marketing. The real moat — per D5's locked rationale — is that leaked copies go stale: the living pricing dataset, monthly briefings, and edition updates only flow to live keys. A lightweight DMCA-takedown routine for aggregator rips lives in 05-operations-legal-sustainability.md; it is an occasional email, not an architecture.

---

## 10. Implementation plan for this repo

### 10.1 Bindings and secrets

```jsonc
// wrangler.jsonc (today it has NO bindings at all)
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "tanstack-start-app",
  "compatibility_date": "2025-09-24",
  "compatibility_flags": ["nodejs_compat"],
  "main": "src/server.ts",
  "kv_namespaces": [{ "binding": "LICENSE_KV", "id": "<wrangler kv namespace create LICENSE_KV>" }],
  "r2_buckets": [{ "binding": "PREMIUM_ASSETS", "bucket_name": "tokenops-premium" }],
  "vars": {
    "POLAR_ORGANIZATION_ID": "<org id>",
    "POLAR_PRODUCT_TIERS": "{\"prod_handbook\":\"handbook\",\"prod_pro\":\"pro\",\"prod_team\":\"team\"}",
    "GUMROAD_PRODUCT_TIERS": "{\"<gumroad product id>\":\"pro\"}",
    "ACTIVATION_CAP": "5",
    "TURNSTILE_SITE_KEY": "<public site key>"
  }
}
```

Secrets via `wrangler secret put` (local dev: `.dev.vars`): `SESSION_SECRET` (32+ random bytes), `POLAR_WEBHOOK_SECRET`, `POLAR_ACCESS_TOKEN` (server-side `/v1/license-keys/*` management if needed), `GUMROAD_ACCESS_TOKEN` (resource-subscription registration + `decrement_uses_count`), `GUMROAD_WEBHOOK_SECRET` (random URL token), `TURNSTILE_SECRET_KEY`. KV alone suffices for v1; add D1 only if queryable download logs become worth it.

### 10.2 File-by-file change list

| Action | Path | Purpose |
|---|---|---|
| Move | `public/library/{trends*,playbooks,advanced,templates,checklists†}/**` → `content/premium/**` | Premium sources out of static assets, per the canonical D5 split (†: the free lead-magnet templates and free-tier docs stay; the 2 newest trend briefings are flagged free for their first 30 days) |
| Delete | `public/library/INTEGRATION.md` | Internal build instructions shipped publicly (D6) |
| Add | `scripts/build-content.mjs` | Emits `free-documents.json` + `premium-documents.json` + pandoc inputs from the markdown trees; `npm run build` prestep; fails on premium-in-public regressions |
| Add | `src/tokenops/premium.server.ts` | Sole importer of `premium-documents.json`; lookup + `teaserOf(doc, 0.15..0.20)` slicing. Server-only. |
| Add | `src/lib/session.server.ts` | HMAC cookie sign/verify (§4 sketch) |
| Add | `src/lib/license.server.ts` | `LicenseService` + PolarAdapter + GumroadAdapter + KV cache/denylist/rate-limit helpers (§3) |
| Add | `src/lib/webhooks.server.ts` | Polar signature verification over raw body |
| Add | `src/fn/license.ts` | `createServerFn`s: `activateLicense`, `getLicenseStatus`, `getPremiumDoc`; `requireLicense` / `requireEntitlement` guards; dynamic `.server` imports per [TanStack/router #6185](https://github.com/TanStack/router/issues/6185) |
| Add | `src/routes/unlock.tsx` | Key form + Turnstile widget + success/error states; links to the Polar checkout |
| Add | `src/routes/api/webhooks/polar.ts` | Signed webhook → confirm → denylist sync (§5) |
| Add | `src/routes/api/webhooks/gumroad.ts` | Secret-URL webhook → confirm via verify API → denylist (§5) |
| Add | `src/routes/api/download/$.ts` | Entitlement-checked, pdf-lib-stamped streaming from R2 (§7) |
| Change | `src/routes/read.$.tsx` | Loader calls `getPremiumDoc` for premium paths (teaser vs. full + JSON-LD paywall markup); free docs keep the client path via `free-documents.json`; kill the top-level `documents.json` import (line 5) |
| Change | `src/tokenops/data.ts` | `downloadLibraryFile`/`downloadTemplate` route premium files to `/api/download/…`; add `premium: boolean` to `LibraryItem` |
| Change | `src/routes/library.tsx` | Lock badge + "Unlock" CTA on premium cards (all 46 cards stay visible per D5); fix stale "29 guides" copy |
| Change | `src/tokenops/content.json` | `premium: true` flags per the D5 map |
| Change | `src/start.ts` | 301 redirect map: old raw `/library/**.md` + `/templates/**` URLs → teaser routes (§8) |
| Change | `wrangler.jsonc` | Bindings + vars above |
| Change | `public/llms.txt`, `src/routes/sitemap[.]xml.ts` | Teaser routes, `/unlock`, corrected counts, repositioned framing |
| Add (CI) | `.github/workflows/artifacts.yml` | pandoc/typst → base PDF/EPUB → `wrangler r2 object put` (§7) |
| Add (CI) | leak check in build workflow | grep built client assets for a premium-only sentinel phrase |

### 10.3 Rollout order and effort

**Step 0 — the week-1 blocker spike (before committing to anything above; critique #16).** Deploys currently run through Lovable's pipeline, and nothing confirms it passes `wrangler.jsonc` bindings and secrets through to the deployed Worker. Spike: create the KV namespace, add the binding plus one throwaway secret, deploy through the existing pipeline, and hit a temporary debug endpoint that reads both. If either fails to arrive, **move deploys to plain `wrangler deploy` in GitHub Actions** before writing any gating code — this spike can invalidate the deployment story for the whole architecture, which is why it is step zero, not a caveat. (~half a day, including the CI fallback if needed.)

| Step | Work | Ship gate | Effort |
|---|---|---|---|
| 0 | Lovable bindings spike (above) | Bindings + secrets readable in production | 0.5 day |
| 1 | Content split + build script; premium files out of `public/`; `read.$.tsx` on server loader for premium paths — everything still free-to-read; 301 map live | CI leak-grep passes; old raw URLs 301 | 1 day |
| 2 | KV binding + `LicenseService` + `/unlock` + session guard, all items still `premium: false`; test with a $0 Polar product's keys (and a $0 Gumroad product for the second adapter) | Activate/re-verify/deactivate round-trips on both platforms | 1–1.5 days |
| 3 | Webhook routes + registration; sandbox refund on each platform → denylist entry within minutes | Refund kills access on both paths | 0.5–1 day |
| 4 | Flip `premium: true` per the D5 map; llms.txt/sitemap/JSON-LD; Plausible funnel events; announce per 04-marketing-and-launch.md | Teasers render for anonymous; full content for licensed | 0.5 day |
| 5 | CI artifact pipeline + R2 + stamped downloads (independent track, can overlap 2–4) | Stamped PDF downloads for entitled sessions | 1–2 days |

Total: **roughly 5–6.5 focused days**, with step 5 parallelizable. New runtime dependencies: `pdf-lib` (plus `fflate` when EPUB stamping lands) — nothing else. Steps 1–4 must precede the presale window in 06-roadmap-90-days.md; step 5 must precede first paid delivery. Support flows this architecture creates (seat resets via Polar's portal or Gumroad's `decrement_uses_count`, failed activations, refund handling) are budgeted inside the ~4 hrs/week ops allowance in 05-operations-legal-sustainability.md.
