/**
 * URL de base du site pour sitemap, robots, canonical et JSON-LD.
 * En production, définir APP_URL ou NEXT_PUBLIC_APP_URL dans .env.
 */
export function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : null) ||
    "http://localhost:3000";
  return url.replace(/\/$/, "");
}
