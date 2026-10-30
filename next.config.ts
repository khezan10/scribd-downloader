import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core', 'puppeteer-extra', 'puppeteer-extra-plugin-stealth'],
  outputFileTracingIncludes: {
    '/api/fetch-doc': [
      './node_modules/@sparticuz/chromium/bin/**',
      './node_modules/puppeteer-extra/**',
      './node_modules/puppeteer-extra-plugin-stealth/**',
      './node_modules/puppeteer-extra-plugin/**',
      './node_modules/merge-deep/**',
      './node_modules/clone-deep/**',
      './node_modules/is-plain-object/**',
      './node_modules/kind-of/**',
      './node_modules/shallow-clone/**',
      './node_modules/for-own/**',
      './node_modules/for-in/**',
    ],
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
