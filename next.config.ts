import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    //Avatar Images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.gravatar.com",
      },
    ],
  },
};

export default nextConfig;
