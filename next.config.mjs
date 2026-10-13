import fs from 'node:fs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'yt3.ggpht.com' },
      { protocol: 'https', hostname: 'static.wikia.nocookie.net' },
    ],
  },
  webpack: (config) => {
    try {
      fs.mkdirSync('.next/server/pages', { recursive: true });
    } catch {}
    return config;
  },
};

export default nextConfig;
