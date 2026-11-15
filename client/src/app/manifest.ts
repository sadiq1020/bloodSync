import type { MetadataRoute } from "next";

/**
 * PWA manifest — name, theme and background from our design tokens.
 * icon.svg must exist in /public. See next.config.ts for the icon path.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BloodSync",
    short_name: "BloodSync",
    description: "Blood donor matching platform for Bangladesh",
    start_url: "/",
    display: "standalone",
    // Dark wine background (#130b0d) and blood primary (#d92d43)
    background_color: "#130b0d",
    theme_color: "#d92d43",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}

