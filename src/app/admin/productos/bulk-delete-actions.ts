'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';
import { publicIdFromProductUrl, removeProductImage } from '@/lib/cloudinary';

type Result = {
  deleted: number;
  deletedIds: string[];
  skipped: string[];
  message: string;
};

export async function deleteSelectedProducts(
  ids: string[],
  confirmation: string,
  preserveHistory = false,
): Promise<Result> {
  await requireAdmin();

  const unique = [...new Set(ids)];

  if (
    unique.length === 0 ||
    unique.length > 200 ||
    unique.some((id) => !/^[a-z0-9_-]{10,60}$/i.test(id))
  ) {
    return {
      deleted: 0,
      deletedIds: [],
      skipped: [],
      message: 'Selección inválida (máximo 200 productos).',
    };
  }

  const expected = preserveHistory
    ? `DESVINCULAR Y ELIMINAR ${unique.length}`
    : `ELIMINAR ${unique.length}`;

  if (confirmation !== expected) {
    return {
      deleted: 0,
      deletedIds: [],
      skipped: [],
      message: `Escribe exactamente ${expected} para confirmar.`,
    };
  }

  let deleted = 0;
  let pendingImages = 0;

  const deletedIds: string[] = [];
  const skipped: string[] = [];

  for (const id of unique) {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          slug: true,
          images: {
            select: { url: true },
          },
          variants: {
            select: { id: true },
          },
          _count: {
            select: { quoteRequests: true },
          },
        },
      });

      if (!product) {
        skipped.push(`${id}: ya no existe`);
        continue;
      }

      // No borrar productos vinculados a presupuestos
      // salvo confirmación de desvinculación histórica.
      if (!preserveHistory && product._count.quoteRequests > 0) {
        skipped.push(`${product.name}: tiene presupuestos asociados`);
        continue;
      }

      const variantIds = product.variants.map((variant) => variant.id);

      // Conservar la protección sobre pedidos históricos.
      if (!preserveHistory && variantIds.length > 0) {
        const orderItems = await prisma.orderItem.count({
          where: {
            variantId: { in: variantIds },
          },
        });

        if (orderItems > 0) {
          skipped.push(`${product.name}: figura en un pedido`);
          continue;
        }
      }

      // Resolver las referencias antes de borrar la ficha.
      const imageIds = product.images.map((image) =>
        publicIdFromProductUrl(image.url, product.id),
      );

      if (imageIds.some((imageId) => imageId === null)) {
        skipped.push(
          `${product.name}: hay imágenes que no se pueden identificar con seguridad`,
        );
        continue;
      }

      // Primero: eliminar en Neon.
      // Si falla, las fotografías siguen en Cloudinary.
      if (preserveHistory) {
        await prisma.$transaction(async (tx) => {
          await tx.quoteRequest.updateMany({
            where: { productId: product.id },
            data: { productId: null },
          });

          await tx.product.delete({
            where: { id: product.id },
          });
        });
      } else {
        await prisma.product.delete({
          where: { id: product.id },
        });
      }

      deleted++;
      deletedIds.push(product.id);

      revalidatePath(`/tienda/${product.slug}`);

      // Segundo: limpiar Cloudinary.
      // Un fallo aquí NO revierte el borrado de Neon.
      for (const imageId of imageIds) {
        if (!imageId) continue;

        try {
          await removeProductImage(imageId);
        } catch (error) {
          pendingImages++;

          console.error('Limpieza pendiente en Cloudinary:', {
            productId: product.id,
            publicId: imageId,
            error,
          });
        }
      }
    } catch (error) {
      console.error('Error eliminando producto seleccionado:', id, error);

      skipped.push(`${id}: no se pudo completar el borrado en Neon`);
    }
  }

  revalidatePath('/admin/productos');
  revalidatePath('/admin');
  revalidatePath('/tienda');
  revalidatePath('/api/productos');

  const warning =
    pendingImages > 0
      ? ` Atención: ${pendingImages} imagen(es) requieren limpieza manual en Cloudinary; consulta el registro del servidor.`
      : '';

  return {
    deleted,
    deletedIds,
    skipped,
    message:
      `${deleted} producto(s) eliminado(s); ` +
      `${skipped.length} omitido(s).` +
      warning,
  };
}
