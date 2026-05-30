import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "getit-sju.s3.ap-northeast-2.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
