/**
 * sitemap.xml. Static pages are listed by hand with their crawl hints; every document the
 * library reader can open (`/read/library/…`, `/read/template/…`) is added from content.json,
 * so new documents reach the sitemap without editing this file. `src/lib/sitemap.test.ts` checks
 * the list against the site navigation, the route tree and the reader's documents.
 */
import content from "../tokenops/content.json";

export const SITE_URL = "https://tokenops.kalilurrahman.com";

export type ChangeFreq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

export interface SitemapEntry {
  path: string;
  changefreq?: ChangeFreq;
  priority?: string;
}

export const STATIC_PAGES: readonly SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/guide", changefreq: "monthly", priority: "0.9" },
  { path: "/sample-chapter", changefreq: "monthly", priority: "0.9" },
  { path: "/roadmap", changefreq: "monthly", priority: "0.8" },
  { path: "/optimize", changefreq: "weekly", priority: "0.9" },
  { path: "/techniques", changefreq: "weekly", priority: "0.9" },
  { path: "/tool-guides", changefreq: "weekly", priority: "0.9" },
  { path: "/caveman", changefreq: "monthly", priority: "0.7" },
  { path: "/prompt-templates", changefreq: "monthly", priority: "0.7" },
  { path: "/patterns", changefreq: "monthly", priority: "0.7" },
  { path: "/models", changefreq: "weekly", priority: "0.8" },
  { path: "/toolkit", changefreq: "monthly", priority: "0.7" },
  { path: "/calculator", changefreq: "monthly", priority: "0.7" },
  { path: "/dashboard", changefreq: "monthly", priority: "0.6" },
  { path: "/hub", changefreq: "monthly", priority: "0.7" },
  { path: "/glossary", changefreq: "monthly", priority: "0.6" },
  { path: "/library", changefreq: "weekly", priority: "0.8" },
  { path: "/reading-lists", changefreq: "monthly", priority: "0.3" },
  { path: "/training", changefreq: "weekly", priority: "0.8" },
  { path: "/resources", changefreq: "monthly", priority: "0.7" },
  { path: "/templates", changefreq: "monthly", priority: "0.7" },
  { path: "/sources", changefreq: "monthly", priority: "0.4" },
  { path: "/changelog", changefreq: "weekly", priority: "0.4" },
];

interface ReaderItem {
  file?: string;
  format?: string;
}

interface ReaderContent {
  library: ReaderItem[];
  resources: ReaderItem[];
  templates: ReaderItem[];
}

/** Reader URLs for every document, by the same rule `src/routes/read.$.tsx` lists them. */
export function readerPaths(source: ReaderContent): string[] {
  const paths = [
    ...source.library.filter((item) => item.file).map((item) => `/read/library/${item.file}`),
    ...[...source.resources, ...source.templates]
      .filter((item) => item.file && item.format !== "PDF")
      .map((item) => `/read/template/${item.file}`),
  ];
  return [...new Set(paths)];
}

export function sitemapEntries(): SitemapEntry[] {
  return [
    ...STATIC_PAGES,
    ...readerPaths(content as ReaderContent).map((path): SitemapEntry => ({
      path,
      changefreq: "monthly",
      priority: "0.6",
    })),
  ];
}

const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};
const escapeXml = (text: string) => text.replace(/[&<>"']/g, (char) => XML_ESCAPES[char]);

export function sitemapXml(entries: readonly SitemapEntry[], base = SITE_URL): string {
  const urls = entries.map((entry) =>
    [
      `  <url>`,
      `    <loc>${escapeXml(base + encodeURI(entry.path))}</loc>`,
      entry.changefreq ? `    <changefreq>${entry.changefreq}</changefreq>` : null,
      entry.priority ? `    <priority>${entry.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}
