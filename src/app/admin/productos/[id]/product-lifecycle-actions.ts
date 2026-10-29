"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { publicIdFromProductUrl, removeProductImage } from "@/lib/cloudinary";

const field = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
};

function feedback(id: string, kind: "ok" | "error", message: string): never {
  redirect(`/admin/productos/${encodeURIComponent(id)}?${kind}=${encodeURIComponent(message)}`);
}

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidatePath("/tienda");
}

export async function setProductInactive(form: FormData) {
  await requireAdmin();
  const id = field(form, "productId");
  const product = await prisma.product.findUnique({ where: { id }, select: { id: true, slug: true, status: true } });
  if (!product) redirect("/admin/productos");
  if (product.status !== "ACTIVE") feedback(id, "error", "Solo se pueden despublicar productos activos.");
  await prisma.product.update({ where: { id }, data: { status: "DRAFT" } });
  refresh();
  revalidatePath(`/tienda/${product.slug}`);
  feedback(id, "ok", "Producto retirado de la tienda. Conserva todas sus fotografías y variantes.");
}

export async function archiveProduct(form: FormData) {
  await requireAdmin();
  const id = field(form, "productId");
  const product = await prisma.product.findUnique({ where: { id }, select: { id: true, slug: true } });
  if (!product) redirect("/admin/productos");
  await prisma.product.update({ where: { id }, data: { status: "ARCHIVED" } });
  refresh();
  revalidatePath(`/tienda/${product.slug}`);
  feedback(id, "ok", "Producto archivado. Sus datos y fotografías se han conservado.");
}

export async function deleteProductPermanently(form: FormData) {
  await requireAdmin();
  const id = field(form, "productId");
  const confirmation = field(form, "confirmSlug");
  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true, slug: true, status: true, images: { select: { url: true } } },
  });
  if (!product) redirect("/admin/productos?ok=El%20producto%20ya%20no%20existe");
  if (confirmation !== product.slug) feedback(id, "error", "Debes escribir exactamente la URL corta del producto para eliminarlo.");
  if (product.status === "ACTIVE") feedback(id, "error", "Retira primero el producto de la tienda antes de eliminarlo.");

  // Prisma elimina automáticamente ProductImage y ProductVariant (onDelete: Cascade).
  // Eliminamos primero sus fotos remotas: si falla Cloudinary, no borramos el producto.
  const ids = product.images.map(image => publicIdFromProductUrl(image.url, product.id));
  if (ids.some(id => id === null)) {
    feedback(id, "error", "Hay fotografías que no podemos identificar de forma segura en Cloudinary. El producto se conserva.");
  }
  try {
    for (const publicId of ids) {
      if (publicId) await removeProductImage(publicId);
    }
  } catch (error) {
    console.error("No se completó la limpieza de Cloudinary", error);
    feedback(id, "error", "No se pudieron eliminar todas las fotografías de Cloudinary. Producto conservado; revisa la galería antes de reintentar.");
  }

  try {
    await prisma.product.delete({ where: { id } });
  } catch (error) {
    console.error("Error eliminando producto", error);
    feedback(id, "error", "No se pudo eliminar el producto de Neon. Consulta el registro del servidor.");
  }
  refresh();
  revalidatePath(`/tienda/${product.slug}`);
  redirect("/admin/productos?ok=Producto%20eliminado%20definitivamente");
}
