/**
 * CHANGELOG.md as data. Used by the release notes page (`/changelog`), the release script
 * (`npm run release`) and `src/lib/release.test.ts`. Pure string functions, no Node or DOM APIs.
 *
 * Every release heading has the form `## x.y.z — Title (YYYY-MM-DD)`.
 */

export type ReleaseEntry = { version: string; title: string; date: string; body: string };

export const RELEASE_HEADING = /^## (\d+\.\d+\.\d+) — (.+) \((\d{4}-\d{2}-\d{2})\)$/;

/** Marker the release script writes; `npm test` fails while it is still in the newest entry. */
export const RELEASE_PLACEHOLDER = "TODO: describe this release.";

/** Releases newest first. Lines starting `## ` that don't match the heading form are rejected. */
export function parseChangelog(markdown: string): ReleaseEntry[] {
  const entries: ReleaseEntry[] = [];
  let current: ReleaseEntry | null = null;
  let body: string[] = [];
  const flush = () => {
    if (current) entries.push({ ...current, body: body.join("\n").trim() });
  };
  for (const line of markdown.split("\n")) {
    if (line.startsWith("## ")) {
      const match = RELEASE_HEADING.exec(line.trimEnd());
      if (!match)
        throw new Error(`CHANGELOG heading is not "## x.y.z — Title (YYYY-MM-DD)": ${line}`);
      flush();
      current = { version: match[1], title: match[2], date: match[3], body: "" };
      body = [];
    } else if (current) {
      body.push(line);
    }
  }
  flush();
  return entries;
}

/** Numeric x.y.z comparison: negative when a < b, 0 when equal, positive when a > b. */
export function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i += 1) if (pa[i] !== pb[i]) return pa[i] - pb[i];
  return 0;
}

/** The next version for a bump keyword, or an explicit x.y.z that must be higher. */
export function nextVersion(current: string, bump: string): string {
  const [major, minor, patch] = current.split(".").map(Number);
  if (bump === "patch") return `${major}.${minor}.${patch + 1}`;
  if (bump === "minor") return `${major}.${minor + 1}.0`;
  if (bump === "major") return `${major + 1}.0.0`;
  if (/^\d+\.\d+\.\d+$/.test(bump)) {
    if (compareVersions(bump, current) <= 0) {
      throw new Error(`${bump} is not higher than the current version ${current}.`);
    }
    return bump;
  }
  throw new Error(`Unknown bump "${bump}": use patch, minor, major or an explicit x.y.z.`);
}

/** CHANGELOG.md with a new top entry (heading plus a placeholder to replace). */
export function addReleaseEntry(
  markdown: string,
  release: { version: string; title: string; date: string },
): string {
  const title = release.title.trim();
  if (!title) throw new Error("A release needs a title.");
  if (parseChangelog(markdown).some((entry) => entry.version === release.version)) {
    throw new Error(`CHANGELOG.md already has an entry for ${release.version}.`);
  }
  const heading = `## ${release.version} — ${title} (${release.date})`;
  if (!RELEASE_HEADING.test(heading)) throw new Error(`Invalid release heading: ${heading}`);
  const entry = `${heading}\n\n### Changed\n\n- ${RELEASE_PLACEHOLDER}\n\n`;
  const intro = /^# Changelog\n+/.exec(markdown);
  if (!intro) throw new Error('CHANGELOG.md must start with "# Changelog".');
  return markdown.slice(0, intro[0].length) + entry + markdown.slice(intro[0].length);
}
