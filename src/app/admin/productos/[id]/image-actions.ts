'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';
import {
  removeProductImage,
  publicIdFromProductUrl,
  inspectDirectProductImage,
} from '@/lib/cloudinary';

const val = (form: FormData, key: string) => {
  const value = form.get(key);
  return typeof value === 'string' ? value.trim() : '';
};
function toProduct(id: string, kind: 'ok' | 'error', message: string): never {
  redirect(
    `/admin/productos/${encodeURIComponent(id)}?${kind}=${encodeURIComponent(message)}`,
  );
}
/** Register only a real asset in this product folder, verified via Cloudinary Admin API. */
export async function registerDirectProductImage(
  productId: string,
  publicId: string,
  alt: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  const safeAlt = alt.trim().replace(/\s+/g, ' ');
  if (!/^[a-z0-9_-]{10,60}$/i.test(productId) ||
      !new RegExp(`^pn-impresion-3d/productos/${productId}/[a-f0-9-]{36}$`, 'i').test(publicId)) {
    return { ok: false, error: 'Referencia de imagen incorrecta.' };
  }
  if (safeAlt.length < 8 || safeAlt.length > 180) {
    return { ok: false, error: 'El ALT debe tener entre 8 y 180 caracteres.' };
  }
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) return { ok: false, error: 'Producto inexistente.' };
  let asset: Awaited<ReturnType<typeof inspectDirectProductImage>>;
  try { asset = await inspectDirectProductImage(publicId); }
  catch { return { ok: false, error: 'No se pudo verificar la imagen en Cloudinary.' }; }
  if (asset.publicId !== publicId || asset.resourceType !== 'image' ||
      asset.bytes <= 0 || asset.bytes > 5 * 1024 * 1024 ||
      !['jpg','jpeg','png','webp'].includes(asset.format) ||
      !asset.secureUrl.startsWith('https://res.cloudinary.com/') ||
      publicIdFromProductUrl(asset.secureUrl, productId) !== publicId) {
    return { ok: false, error: 'La imagen no cumple las condiciones de seguridad.' };
  }
  try {
    await prisma.$transaction(async (tx) => {
      const images = await tx.productImage.findMany({
        where: { productId }, select: { url: true, position: true }, orderBy: { position: 'desc' },
      });
      if (images.length >= 8) throw new Error('LIMIT');
      if (images.some(img => img.url === asset.secureUrl)) throw new Error('DUPLICATE');
      await tx.productImage.create({
        data: { productId, url: asset.secureUrl, alt: safeAlt, position: (images[0]?.position ?? -1) + 1 },
      });
    });
  } catch (error) {
    return { ok: false, error: error instanceof Error && error.message === 'LIMIT'
      ? 'Máximo 8 fotografías.' : 'No se pudo guardar la imagen en Neon.' };
  }
  revalidatePath(`/admin/productos/${productId}`);
  revalidatePath('/tienda');
  return { ok: true };
}

export async function updateProductImageAlt(form: FormData) {
  await requireAdmin();
  const id = val(form, 'productId');
  const imageId = val(form, 'imageId');
  const alt = val(form, 'alt').replace(/\s+/g, ' ');
  if (alt.length < 8 || alt.length > 180)
    toProduct(id, 'error', 'ALT: entre 8 y 180 caracteres.');
  const result = await prisma.productImage.updateMany({
    where: { id: imageId, productId: id },
    data: { alt },
  });
  if (!result.count) toProduct(id, 'error', 'Imagen no encontrada.');
  revalidatePath(`/admin/productos/${id}`);
  toProduct(id, 'ok', 'Texto alternativo actualizado.');
}

export async function setMainProductImage(form: FormData) {
  await requireAdmin();
  const id = val(form, 'productId');
  const imageId = val(form, 'imageId');
  const images = await prisma.productImage.findMany({
    where: { productId: id },
    orderBy: [{ position: 'asc' }, { id: 'asc' }],
    select: { id: true },
  });
  if (!images.some((img) => img.id === imageId))
    toProduct(id, 'error', 'Imagen no encontrada.');
  const reordered = [
    imageId,
    ...images.filter((img) => img.id !== imageId).map((img) => img.id),
  ];
  await prisma.$transaction(
    reordered.map((imgId, position) =>
      prisma.productImage.update({ where: { id: imgId }, data: { position } }),
    ),
  );
  revalidatePath(`/admin/productos/${id}`);
  toProduct(id, 'ok', 'Portada principal actualizada.');
}

export async function deleteProductImage(form: FormData) {
  await requireAdmin();

  const id = val(form, 'productId');
  const imageId = val(form, 'imageId');

  const image = await prisma.productImage.findFirst({
    where: {
      id: imageId,
      productId: id,
    },
    select: {
      id: true,
      url: true,
    },
  });

  if (!image) {
    toProduct(id, 'error', 'Imagen no encontrada.');
  }

  const publicId = publicIdFromProductUrl(image.url, id);

  if (!publicId) {
    toProduct(
      id,
      'error',
      'Esta imagen no fue subida con este gestor; no se eliminará automáticamente.',
    );
  }

  // 1. Eliminar primero la relación en Neon.
  try {
    const result = await prisma.productImage.deleteMany({
      where: {
        id: imageId,
        productId: id,
      },
    });

    if (result.count !== 1) {
      toProduct(id, 'error', 'Imagen no encontrada.');
    }
  } catch (error) {
    console.error('Error eliminando imagen en Neon:', error);

    toProduct(
      id,
      'error',
      'No se pudo eliminar la imagen de la base de datos.',
    );
  }

  // 2. Eliminar el archivo en Cloudinary
  // únicamente después de confirmar el borrado en Neon.
  let cleanupPending = false;

  try {
    await removeProductImage(publicId);
  } catch (error) {
    cleanupPending = true;

    console.error('Limpieza pendiente en Cloudinary:', {
      productId: id,
      imageId,
      publicId,
      error,
    });
  }

  revalidatePath(`/admin/productos/${id}`);
  revalidatePath('/tienda');
  revalidatePath('/api/productos');

  if (cleanupPending) {
    toProduct(
      id,
      'ok',
      'Imagen retirada del producto. Queda pendiente eliminar el archivo de Cloudinary; revisa el registro del servidor.',
    );
  }

  toProduct(id, 'ok', 'Fotografía eliminada correctamente.');
}
