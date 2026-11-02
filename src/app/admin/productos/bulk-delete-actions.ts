'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';
import { publicIdFromProductUrl, removeProductImage } from '@/lib/cloudinary';

type Result = { deleted: number; deletedIds: string[]; skipped: string[]; message: string };

export async function deleteSelectedProducts(ids: string[], confirmation: string, preserveHistory = false): Promise<Result> {
  await requireAdmin();

  const unique = [...new Set(ids)];
  if (unique.length === 0 || unique.length > 200 || unique.some(id => !/^[a-z0-9_-]{10,60}$/i.test(id))) {
    return { deleted: 0, deletedIds: [], skipped: [], message: 'Selección inválida (máximo 200 productos).' };
  }
  const expected = preserveHistory ? `DESVINCULAR Y ELIMINAR ${unique.length}` : `ELIMINAR ${unique.length}`;
  if (confirmation !== expected) {
    return { deleted: 0, deletedIds: [], skipped: [], message: `Escribe exactamente ${expected} para confirmar.` };
  }

  let deleted = 0;
  const deletedIds: string[] = [];
  const skipped: string[] = [];
  for (const id of unique) {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true, images: { select: { url: true } },
        variants: { select: { id: true } }, _count: { select: { quoteRequests: true } } },
    });
    if (!product) { skipped.push(`${id}: ya no existe`); continue; }
    if (!preserveHistory && product._count.quoteRequests > 0) { skipped.push(`${product.name}: tiene presupuestos asociados`); continue; }

    const variantIds = product.variants.map(v => v.id);
    if (!preserveHistory && variantIds.length && await prisma.orderItem.count({ where: { variantId: { in: variantIds } } }) > 0) {
      skipped.push(`${product.name}: figura en un pedido`);
      continue;
    }

    const imageIds = product.images.map(img => publicIdFromProductUrl(img.url, product.id));
    if (imageIds.some(x => x === null)) {
      skipped.push(`${product.name}: hay imágenes que no se pueden identificar con seguridad`);
      continue;
    }

    try {
      // Si Cloudinary no confirma la limpieza, conservamos la ficha de Neon.
      for (const imageId of imageIds) if (imageId) await removeProductImage(imageId);
      if (preserveHistory) {
        // El historial conserva sus precios, artículos y notas. Solo se desvincula la ficha eliminada.
        await prisma.$transaction(async (tx) => {
          await tx.quoteRequest.updateMany({ where: { productId: product.id }, data: { productId: null } });
          await tx.product.delete({ where: { id: product.id } });
        });
      } else {
        await prisma.product.delete({ where: { id: product.id } });
      }
      deleted++;
      deletedIds.push(product.id);
      revalidatePath(`/tienda/${product.slug}`);
    } catch (error) {
      console.error('Error eliminando producto seleccionado:', product.id, error);
      skipped.push(`${product.name}: error al eliminar imágenes o ficha`);
    }
  }
  revalidatePath('/admin/productos');
  revalidatePath('/admin');
  revalidatePath('/tienda');
  return { deleted, deletedIds, skipped, message: `${deleted} producto(s) eliminado(s); ${skipped.length} pendiente(s).` };
}
