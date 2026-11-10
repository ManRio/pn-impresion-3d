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
  // Solo incluir categorías que contengan productos activos.
  const activeCategories = await prisma.category.findMany({
    where: { products: { some: { status: 'ACTIVE' } } },
    select: { id: true, slug: true, parentId: true },
  });
  const ids = [...new Set(activeCategories.flatMap(c => [c.id, ...(c.parentId ? [c.parentId] : [])]))];
  const categories = ids.length ? await prisma.category.findMany({
    where: { id: { in: ids } },
    select: { slug: true },
  }) : [];
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/tienda`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/impresion-3d-sevilla`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/personalizados`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/presupuesto`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contacto`, changeFrequency: 'monthly', priority: 0.5 },
  ];
  return [
    ...staticPages,
    ...categories.map(c => ({
      url: `${base}/categoria/${encodeURIComponent(c.slug)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...products.map(p => ({
      url: `${base}/tienda/${encodeURIComponent(p.slug)}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
