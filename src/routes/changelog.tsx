import { createFileRoute } from "@tanstack/react-router";
import { renderMarkdown } from "@/lib/markdown";
import { parseChangelog, releaseAnchor } from "@/lib/changelog";
import { RELEASE_VERSION } from "@/lib/release";
import changelogRaw from "../../CHANGELOG.md?raw";

// CHANGELOG.md is the repository's own file (trusted), so the long-form renderer is used.
const releases = parseChangelog(changelogRaw).entries.map((entry) => ({
  ...entry,
  anchor: releaseAnchor(entry.version),
  html: renderMarkdown(entry.body),
}));

const TITLE = "Release notes — TokenOps Atlas";
const DESCRIPTION =
  "Every release of TokenOps Atlas, newest first: what changed, what was fixed and what was removed. The version in the site footer links here.";
const PAGE_URL = "https://tokenops.kalilurrahman.com/changelog";

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));

export const Route = createFileRoute("/changelog")({
  component: ChangelogPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: PAGE_URL },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
});

function ChangelogPage() {
  return (
    <section className="stack">
      <div className="page-heading">
        <p className="eyebrow">Release notes</p>
        <h1>What&apos;s new in TokenOps Atlas</h1>
        <p>
          Every release of the site, newest first. The version in the footer (currently{" "}
          <span className="font-mono tabular-nums">v{RELEASE_VERSION}</span>) links to its entry.
        </p>
      </div>
      <article className="guide changelog-list" aria-label="Releases">
        {releases.map((release) => {
          const current = release.version === RELEASE_VERSION;
          return (
            <section
              key={release.version}
              id={release.anchor}
              className="changelog-release"
              aria-labelledby={`${release.anchor}-title`}
            >
              <h2 id={`${release.anchor}-title`}>
                <span className="font-mono tabular-nums">v{release.version}</span> — {release.title}
              </h2>
              <p className="changelog-meta">
                <time className="font-mono tabular-nums" dateTime={release.date}>
                  {formatDate(release.date)}
                </time>
                {current && <span className="changelog-current">Current release</span>}
              </p>
              <div dangerouslySetInnerHTML={{ __html: release.html }} />
            </section>
          );
        })}
      </article>
    </section>
  );
}
