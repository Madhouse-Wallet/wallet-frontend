/** @type {import('next').NextConfig} */
import webpack from "webpack";
const nextConfig = {
  reactStrictMode: true,
  webpack(config, { isServer }) {
    // Configures webpack to handle SVG files with SVGR. SVGR optimizes and transforms SVG files
    // into React components. See https://react-svgr.com/docs/next/

    // Grab the existing rule that handles SVG imports
    // @ts-ignore - rules is a private property that is not typed
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg")
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ["@svgr/webpack"],
      }
    );


    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;
    // Add fallback for browser polyfills
   

     // Add fallback for browser polyfills
     config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      buffer: "buffer",
      process: "process/browser",
      path: "path-browserify",
      zlib: "browserify-zlib",
      util: "util",
      assert: "assert",
      http: "stream-http",
      net: false, // Node.js-only module
      tls: false, // Node.js-only module
      fs: false,  // Node.js-only module
    };

    // Add plugins
    config.plugins.push(
      new webpack.ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      })
    );

    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
