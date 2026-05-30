import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "";

interface SitemapEntry {
  path: string;
  changefreq?: "weekly" | "monthly" | "daily";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/dashboard", changefreq: "weekly", priority: "0.8" },
          { path: "/projets", changefreq: "weekly", priority: "0.8" },
          { path: "/lots", changefreq: "weekly", priority: "0.7" },
          { path: "/taches", changefreq: "weekly", priority: "0.7" },
          { path: "/budget", changefreq: "weekly", priority: "0.7" },
          { path: "/artisans", changefreq: "weekly", priority: "0.6" },
          { path: "/documents", changefreq: "weekly", priority: "0.6" },
          { path: "/notes", changefreq: "weekly", priority: "0.6" },
          { path: "/copilote", changefreq: "weekly", priority: "0.6" },
        ];

        const urls = entries
          .map((e) =>
            [
              `  <url>`,
              `    <loc>${BASE_URL}${e.path}</loc>`,
              e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
              e.priority ? `    <priority>${e.priority}</priority>` : null,
              `  </url>`,
            ]
              .filter(Boolean)
              .join("\n"),
          )
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

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
