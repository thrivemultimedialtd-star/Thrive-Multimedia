import type { NextConfig } from "next";

// Brochure and brand images keep their file names when they change, so they are cached for a
// day and refreshed in the background rather than marked immutable.
const assetCache = [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }];

const security = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    return [
      { source: "/:path*", headers: security },
      { source: "/brochure/:path*", headers: assetCache },
      { source: "/brand/:path*", headers: assetCache },
    ];
  },
};

export default nextConfig;
