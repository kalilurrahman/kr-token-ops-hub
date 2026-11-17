import { createFileRoute } from "@tanstack/react-router";
import changelogSource from "../../CHANGELOG.md?raw";
import { renderMarkdown } from "@/lib/markdown";
import { RELEASE_LABEL } from "@/lib/release";
import { parseChangelog } from "@/lib/release-notes";

const PAGE_TITLE = "Release notes — TokenOps Atlas";
const PAGE_DESCRIPTION =
  "What changed in each version of TokenOps Atlas: new features, fixes and accessibility work.";
const PAGE_URL = "https://tokenops.kalilurrahman.com/changelog";

// CHANGELOG.md is the single source: the footer watermark links here and `npm test` keeps the
// newest entry in step with package.json.
const releases = parseChangelog(changelogSource);
const formatDate = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" });

export const Route = createFileRoute("/changelog")({
  component: ChangelogPage,
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESCRIPTION },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESCRIPTION },
      { property: "og:type", content: "website" },
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
        <p className="to-eyebrow">What&apos;s new</p>
        <h1>Release notes</h1>
        <p>
          What changed in each version of TokenOps Atlas. This site is running{" "}
          <span className="to-release">{RELEASE_LABEL}</span>, shown in the footer of every page.
        </p>
      </div>
      <ol className="release-list">
        {releases.map((release, index) => (
          <li key={release.version} id={`v${release.version}`} className="release-entry">
            <header className="release-entry-header">
              <h2>
                <span className="to-release">v{release.version}</span> {release.title}
              </h2>
              <p className="release-entry-meta">
                <time className="font-mono tabular-nums" dateTime={release.date}>
                  {formatDate.format(new Date(`${release.date}T00:00:00Z`))}
                </time>
                {index === 0 && <span className="release-entry-current">Current</span>}
              </p>
            </header>
            <div
              className="reader-article release-entry-body"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(release.body) }}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}
