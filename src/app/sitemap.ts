import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
const base = 'https://pn3d.es';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/tienda`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/personalizados`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/presupuesto`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contacto`, changeFrequency: 'monthly', priority: 0.5 },
  ];
  return [
    ...staticPages,
    ...products.map(p => ({
      url: `${base}/tienda/${encodeURIComponent(p.slug)}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
