import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 写真を置くサイトのドメインをここに追加します
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
};

export default nextConfig;
