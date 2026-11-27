# Spec: shared Lead API

One place where every kept site sends its leads, so you see all demand in one list.

## Where it lives

On VERITRAIL (`veritrail.kalilurrahman.com`). It already serves HTML from the server (TanStack Start) and has an admin console, so it can host a server route. Store leads in the project's existing database (Lovable Cloud). If the project has no database yet, enable it first and say so in the PR.

If, when you look, VERITRAIL cannot run a server route, stop and write down why in PROGRESS.md. The fallback is a small service on Railway beside course-forge, with the same contract.

## Contract

`POST /api/leads`

Request body (JSON):

| field | type | required | notes |
|---|---|---|---|
| site | string | yes | host name without protocol, e.g. `pharma.kalilurrahman.com` |
| sourcePage | string | yes | path the form was on |
| name | string | yes | 1 to 120 characters |
| email | string | yes | valid address; reject free-mail only if a form asks for "work email" and you choose to |
| company | string | no | up to 160 characters |
| role | string | no | up to 120 characters |
| gccLocation | string | no | city or country |
| interest | string | yes | one of the values below |
| consentText | string | yes | the exact sentence shown next to the button |
| utm | object | no | `source`, `medium`, `campaign`, `content` |
| honeypot | string | yes | hidden field; must be empty |

`interest` values: `briefing`, `baseline`, `fractional`, `assurance`, `ai-ready-gcc`, `playbook-download`, `board-pack`, `assessment-report`, `ai-literacy-training`, `test-packs`, `kr-library`, `speaking`, `training`, `other`.

Responses: `201 {id}` on success; `400` with the field errors; `429` when rate limited; `204` silently for a filled honeypot (do not tell bots they were caught).

## Rules

- **CORS allow-list.** Answer `OPTIONS` and send `Access-Control-Allow-Origin` only for: `https://kalilurrahman.com`, `https://veritrail.kalilurrahman.com`, `https://gcc-compass.kalilurrahman.com`, `https://gcc-playbook.kalilurrahman.com`, `https://pharma.kalilurrahman.com`, `https://healthcare.kalilurrahman.com`, `https://kr-library.kalilurrahman.com` and `https://kr-products.kalilurrahman.com` (the KR Library's new names), `https://industrybizcapability.kalilurrahman.com` (its old name, kept while it moves), `https://tokenops.kalilurrahman.com`, and the Lovable preview domains of those projects while testing.
- **Rate limit.** 5 requests per IP per 10 minutes. Store a hash of the IP, not the IP.
- **Consent.** Store `consentText` and `consentAt` (server time). Suggested sentence: "I agree that Kalilur Rahman may contact me about this request. I can ask for my details to be deleted at any time." Make the contact person and entity match the contracting entity you decide on.
- **Data kept.** Only the fields above plus `createdAt`, `ipHash`, `userAgent` (first 200 characters). No cookies or tracking pixels added by this feature.
- **Retention.** 24 months, then delete. Delete any lead on request (admin action).
- **Notification.** Optional: email a one-line alert per lead to the inbox you name. Do not include the lead's details in the subject line.

## Table

```sql
create table leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  site text not null,
  source_page text not null,
  name text not null,
  email text not null,
  company text,
  role text,
  gcc_location text,
  interest text not null,
  consent_text text not null,
  consent_at timestamptz not null default now(),
  utm jsonb,
  ip_hash text,
  user_agent text,
  status text not null default 'new'   -- new, contacted, qualified, closed
);
```

Only the admin role can read the table. Inserts happen only through the server route, never from the browser straight to the database.

## Admin view

A "Leads" page in the existing admin console: newest first, filters by site, interest and status, a status dropdown per row, CSV export, delete.

## Client snippet (for the other sites)

```ts
export async function sendLead(input: {
  name: string; email: string; company?: string; role?: string; gccLocation?: string;
  interest: string; consentText: string; honeypot: string;
}) {
  const u = new URL(window.location.href);
  const utm = Object.fromEntries(["source", "medium", "campaign", "content"]
    .map(k => [k, u.searchParams.get(`utm_${k}`)]).filter(([, v]) => v));
  const res = await fetch("https://veritrail.kalilurrahman.com/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ site: u.host, sourcePage: u.pathname, utm, ...input }),
  });
  if (res.status === 201 || res.status === 204) return true;
  throw new Error(`Lead not saved (${res.status})`);
}
```

## Done when

```bash
# allowed origin: 201 and an Access-Control-Allow-Origin header
curl -si -X POST https://veritrail.kalilurrahman.com/api/leads \
  -H 'Origin: https://pharma.kalilurrahman.com' -H 'Content-Type: application/json' \
  -d '{"site":"pharma.kalilurrahman.com","sourcePage":"/test","name":"Test","email":"test@example.com","interest":"other","consentText":"test","honeypot":""}'
# disallowed origin: no Access-Control-Allow-Origin header
curl -si -X OPTIONS https://veritrail.kalilurrahman.com/api/leads -H 'Origin: https://example.org' -H 'Access-Control-Request-Method: POST'
```

Then delete the test lead in the admin view.
