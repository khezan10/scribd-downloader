import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core', 'puppeteer-extra', 'puppeteer-extra-plugin-stealth'],
  outputFileTracingIncludes: {
    '/api/fetch-doc': ['./node_modules/@sparticuz/chromium/bin/**'],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
