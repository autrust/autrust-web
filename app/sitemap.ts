import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // revalider le sitemap toutes les heures

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/listings`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/listings?mode=sale`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/listings?mode=rent`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const listings = await prisma.listing
    .findMany({
      where: { status: "ACTIVE" },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    })
    .catch(() => []);

  const listingUrls: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${base}/listings/${l.id}`,
    lastModified: l.updatedAt ?? new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...listingUrls];
}
