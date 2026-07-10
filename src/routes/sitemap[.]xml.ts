import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://tokenops.kalilurrahman.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/about", changefreq: "monthly", priority: "0.6" },
          { path: "/guide", changefreq: "monthly", priority: "0.9" },
          { path: "/roadmap", changefreq: "monthly", priority: "0.8" },
          { path: "/optimize", changefreq: "weekly", priority: "0.9" },
          { path: "/techniques", changefreq: "weekly", priority: "0.9" },
          { path: "/tool-guides", changefreq: "weekly", priority: "0.9" },
          { path: "/caveman", changefreq: "monthly", priority: "0.7" },
          { path: "/prompt-templates", changefreq: "monthly", priority: "0.7" },
          { path: "/patterns", changefreq: "monthly", priority: "0.7" },
          { path: "/toolkit", changefreq: "monthly", priority: "0.7" },
          { path: "/calculator", changefreq: "monthly", priority: "0.7" },
          { path: "/dashboard", changefreq: "monthly", priority: "0.6" },
          { path: "/hub", changefreq: "monthly", priority: "0.7" },
          { path: "/glossary", changefreq: "monthly", priority: "0.6" },
          { path: "/library", changefreq: "weekly", priority: "0.8" },
          { path: "/resources", changefreq: "monthly", priority: "0.7" },
          { path: "/templates", changefreq: "monthly", priority: "0.7" },
          { path: "/sources", changefreq: "monthly", priority: "0.4" },
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});