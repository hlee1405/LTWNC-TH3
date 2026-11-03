import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images if needed
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;

