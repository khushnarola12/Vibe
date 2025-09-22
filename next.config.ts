import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    // Ignore .d.ts files so Webpack doesn't try to parse them as JS
    config.module.rules.push({
      test: /\.d\.ts$/,
      use: 'ignore-loader',
    });

    return config;
  },
};

export default nextConfig;
