import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

// @next/bundle-analyzer only works with the webpack build (--no-turbo).
// Run: npm run analyze  (sets ANALYZE=true and uses webpack)
const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";

// Security headers added to every route.
// No Content-Security-Policy — as instructed, leave that to the deployment layer.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // Hide the "X-Powered-By: Next.js" response header
  poweredByHeader: false,

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  // Tree-shake large icon and animation packages in the client bundle
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react", "motion"],
  },

  async headers() {
    return [
      {
        // Apply to every route
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default withAnalyzer(nextConfig);
