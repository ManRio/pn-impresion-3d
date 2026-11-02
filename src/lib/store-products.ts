import 'server-only';

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';

export async function storeProducts(category?: string) {
  const where: Prisma.ProductWhereInput = {
    status: 'ACTIVE',
  };

  if (category) {
    const selected = await prisma.category.findUnique({
      where: { slug: category },
      select: {
        id: true,
        children: {
          select: { id: true },
        },
      },
    });

    if (!selected) return [];

    where.categoryId = {
      in: [selected.id, ...selected.children.map((child) => child.id)],
    };
  }

  return prisma.product.findMany({
    where,
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: { position: 'asc' },
      },
      variants: {
        where: { active: true },
        orderBy: { priceCents: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 120,
  });
}

export const euro = (cents: number) =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
