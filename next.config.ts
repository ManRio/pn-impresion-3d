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

  async redirects() {
    return [
      {
        source: '/tienda/lampara-infantil-con-letras-a-iluminadas',
        destination: '/tienda/lampara-infantil-conos-iluminados-siluetas',
        statusCode: 301,
      },
    ];
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '1mb',
    },
  },
};

export default nextConfig;
