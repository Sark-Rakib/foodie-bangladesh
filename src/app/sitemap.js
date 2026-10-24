import { CATALOG, DIVISIONS_GEO, DISTRICTS_GEO } from "@/data/catalog";
import { STORIES } from "@/data/stories";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap() {
  const now = new Date("2026-01-01");

  const staticRoutes = ["", "/explore", "/map", "/divisions", "/my-journey", "/stories", "/about", "/share"].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: path === "" ? 1 : 0.8,
    }),
  );

  const divisions = DIVISIONS_GEO.map((d) => ({
    url: `${SITE_URL}/divisions/${d.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const districts = DISTRICTS_GEO.map((d) => ({
    url: `${SITE_URL}/districts/${d.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const foods = CATALOG.map((f) => ({
    url: `${SITE_URL}/foods/${f.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const stories = STORIES.map((s) => ({
    url: `${SITE_URL}/stories/${s.slug}`,
    lastModified: new Date(s.date),
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...divisions, ...districts, ...foods, ...stories];
}
