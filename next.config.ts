
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/*/image/upload/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '1mb',
    },
  },
};

export default nextConfig;
