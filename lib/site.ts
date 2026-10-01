/** Arcway's public home. Every absolute link (share images, sitemap, feeds) is built from this. */
export const PRODUCTION_URL = "https://arcway.world";

/**
 * NEXT_PUBLIC_SITE_URL wins; production deployments use the domain; previews keep their own
 * address so their share images still load.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_ENV === "production" ? PRODUCTION_URL : "") ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000"
).replace(/\/$/, "");
