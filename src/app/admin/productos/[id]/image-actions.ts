"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { uploadProductImage, removeProductImage, publicIdFromProductUrl } from "@/lib/cloudinary";

const val = (form: FormData, key: string) => {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
};
function toProduct(id: string, kind: "ok" | "error", message: string): never {
  redirect(`/admin/productos/${encodeURIComponent(id)}?${kind}=${encodeURIComponent(message)}`);
}
function imageType(bytes: Buffer): string | null {
  if (bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return "image/jpeg";
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}

export async function addProductImage(form: FormData) {
  await requireAdmin();
  const id = val(form, "productId");
  const alt = val(form, "alt").replace(/\s+/g, " ");
  const file = form.get("file");
  if (!await prisma.product.findUnique({ where: { id }, select: { id: true } })) redirect("/admin/productos");
  if (alt.length < 8 || alt.length > 180) toProduct(id, "error", "ALT: entre 8 y 180 caracteres.");
  if (!(file instanceof File) || file.size === 0 || file.size > 5 * 1024 * 1024) {
    toProduct(id, "error", "Selecciona una imagen JPG, PNG o WebP de hasta 5 MB.");
  }
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    toProduct(id, "error", "Formato no permitido. Usa JPG, PNG o WebP.");
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  if (imageType(bytes) !== file.type) toProduct(id, "error", "El archivo no corresponde al tipo de imagen declarado.");
  const count = await prisma.productImage.count({ where: { productId: id } });
  if (count >= 8) toProduct(id, "error", "Máximo 8 fotografías por producto.");
  let uploaded: Awaited<ReturnType<typeof uploadProductImage>>;
  try {
    uploaded = await uploadProductImage(bytes, id);
  } catch (error) {
    console.error("Cloudinary upload", error);
    toProduct(id, "error", "No se pudo subir la fotografía. Revisa la configuración de Cloudinary.");
  }
  try {
    const last = await prisma.productImage.aggregate({ where: { productId: id }, _max: { position: true } });
    await prisma.productImage.create({
      data: { productId: id, url: uploaded.secure_url, alt, position: (last._max.position ?? -1) + 1 },
    });
  } catch (error) {
    console.error("Save ProductImage", error);
    await removeProductImage(uploaded.public_id).catch(err => console.error("Cleanup Cloudinary", err));
    toProduct(id, "error", "Imagen subida, pero no se pudo guardar en Neon.");
  }
  revalidatePath(`/admin/productos/${id}`);
  toProduct(id, "ok", "Fotografía añadida.");
}

export async function updateProductImageAlt(form: FormData) {
  await requireAdmin();
  const id = val(form, "productId");
  const imageId = val(form, "imageId");
  const alt = val(form, "alt").replace(/\s+/g, " ");
  if (alt.length < 8 || alt.length > 180) toProduct(id, "error", "ALT: entre 8 y 180 caracteres.");
  const result = await prisma.productImage.updateMany({ where: { id: imageId, productId: id }, data: { alt } });
  if (!result.count) toProduct(id, "error", "Imagen no encontrada.");
  revalidatePath(`/admin/productos/${id}`);
  toProduct(id, "ok", "Texto alternativo actualizado.");
}

export async function setMainProductImage(form: FormData) {
  await requireAdmin();
  const id = val(form, "productId");
  const imageId = val(form, "imageId");
  const images = await prisma.productImage.findMany({ where: { productId: id }, orderBy: [{position:"asc"},{id:"asc"}], select: { id: true } });
  if (!images.some(img => img.id === imageId)) toProduct(id, "error", "Imagen no encontrada.");
  const reordered = [imageId, ...images.filter(img => img.id !== imageId).map(img => img.id)];
  await prisma.$transaction(reordered.map((imgId, position) =>
    prisma.productImage.update({ where: { id: imgId }, data: { position } })
  ));
  revalidatePath(`/admin/productos/${id}`);
  toProduct(id, "ok", "Portada principal actualizada.");
}

export async function deleteProductImage(form: FormData) {
  await requireAdmin();
  const id = val(form, "productId");
  const imageId = val(form, "imageId");
  const image = await prisma.productImage.findFirst({ where: { id: imageId, productId: id }, select: { url: true } });
  if (!image) toProduct(id, "error", "Imagen no encontrada.");
  const publicId = publicIdFromProductUrl(image.url, id);
  if (!publicId) toProduct(id, "error", "Esta imagen no fue subida con este gestor; no se eliminará automáticamente.");
  try { await removeProductImage(publicId); }
  catch (error) { console.error("Cloudinary destroy", error); toProduct(id, "error", "No se pudo eliminar en Cloudinary."); }
  await prisma.productImage.deleteMany({ where: { id: imageId, productId: id } });
  revalidatePath(`/admin/productos/${id}`);
  toProduct(id, "ok", "Fotografía eliminada.");
}
