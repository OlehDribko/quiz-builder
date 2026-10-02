import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev indicator defaults to bottom-left, where toasts are shown.
  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
