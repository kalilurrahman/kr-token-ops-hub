import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { sitemapEntries, sitemapXml } from "@/lib/sitemap";

// Pages and every library/template document; see src/lib/sitemap.ts.
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () =>
        new Response(sitemapXml(sitemapEntries()), {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
