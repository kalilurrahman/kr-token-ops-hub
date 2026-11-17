/**
 * CHANGELOG.md as data, for the /changelog release notes page and the release checks in
 * src/lib/release.test.ts. Pure and browser-safe.
 *
 * Every release is a level-2 heading `## x.y.z — Title (YYYY-MM-DD)`, newest first. The footer
 * watermark (`v` + package.json "version") links to that release's entry on /changelog.
 */

export interface ReleaseEntry {
  version: string;
  title: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  /** Markdown under the heading, up to the next release. */
  body: string;
}

export interface ParsedChangelog {
  entries: ReleaseEntry[];
  /** `## ` lines that are not in the release heading format. */
  problems: string[];
}

const HEADING = /^## (\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?) — (.+) \((\d{4}-\d{2}-\d{2})\)\s*$/;

export function parseChangelog(markdown: string): ParsedChangelog {
  const entries: ReleaseEntry[] = [];
  const problems: string[] = [];
  let current: (ReleaseEntry & { lines: string[] }) | null = null;
  const flush = () => {
    if (!current) return;
    const { lines, ...entry } = current;
    entries.push({ ...entry, body: lines.join("\n").trim() });
  };
  for (const line of markdown.split(/\r?\n/)) {
    if (line.startsWith("## ")) {
      flush();
      current = null;
      const match = HEADING.exec(line);
      if (match) {
        current = { version: match[1]!, title: match[2]!, date: match[3]!, body: "", lines: [] };
      } else {
        problems.push(line);
      }
    } else if (current) {
      current.lines.push(line);
    }
  }
  flush();
  return { entries, problems };
}

/** The element id for a release on /changelog: "2.3.4" → "v2-3-4". */
export function releaseAnchor(version: string): string {
  return `v${version.replace(/[^0-9A-Za-z-]/g, "-")}`;
}

/** Semver order: negative when a is older than b. A prerelease sorts before its release. */
export function compareVersions(a: string, b: string): number {
  const [coreA = "", preA] = a.split("-", 2);
  const [coreB = "", preB] = b.split("-", 2);
  const partsA = coreA.split(".").map(Number);
  const partsB = coreB.split(".").map(Number);
  for (let index = 0; index < 3; index += 1) {
    const diff = (partsA[index] ?? 0) - (partsB[index] ?? 0);
    if (diff !== 0) return diff;
  }
  if (preA === preB) return 0;
  if (preA === undefined) return 1;
  if (preB === undefined) return -1;
  return preA < preB ? -1 : 1;
}
