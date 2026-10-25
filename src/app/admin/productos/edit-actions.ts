"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const value = (data: FormData, key: string) => {
  const input = data.get(key);
  return typeof input === "string" ? input.trim() : "";
};
const clean = (text: string) => text.replace(/\s+/g, " ");
const int = (text: string, min: number, max: number) => /^\d+$/.test(text) && Number.isSafeInteger(Number(text)) && Number(text) >= min && Number(text) <= max ? Number(text) : null;
function send(id: string, kind: "ok" | "error", message: string): never {
  redirect(`/admin/productos/${encodeURIComponent(id)}?${kind}=${encodeURIComponent(message)}`);
}
function errorMessage(err: unknown): string {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return "SKU o URL duplicados.";
  return "No se pudieron guardar los cambios.";
}

export async function updateProduct(form: FormData) {
  await requireAdmin();
  const id = value(form, "productId");
  const product = await prisma.product.findUnique({ where: { id }, select: { id: true, slug: true } });
  if (!product) redirect("/admin/productos");
  const name = clean(value(form, "name"));
  const description = value(form, "description");
  const categoryId = value(form, "categoryId");
  const saleMode = value(form, "saleMode");
  if (name.length < 3 || name.length > 120) send(id, "error", "Nombre: entre 3 y 120 caracteres.");
  if (description.length < 10 || description.length > 5000) send(id, "error", "Descripción: entre 10 y 5000 caracteres.");
  if (!["DIRECT", "QUOTE"].includes(saleMode)) send(id, "error", "Modalidad incorrecta.");
  if (!await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } })) send(id, "error", "Categoría inexistente.");
  // Mantener el slug al renombrar protege enlaces existentes y evita colisiones.
  try {
    await prisma.product.update({ where: { id }, data: { name, description, categoryId, saleMode: saleMode as "DIRECT" | "QUOTE" } });
  } catch (err) { console.error("updateProduct", err); send(id, "error", errorMessage(err)); }
  revalidatePath("/admin/productos"); revalidatePath("/admin"); revalidatePath(`/admin/productos/${id}`);
  send(id, "ok", "Información del producto actualizada.");
}

export async function addVariant(form: FormData) {
  await requireAdmin();
  const id = value(form, "productId");
  if (!await prisma.product.findUnique({ where: { id }, select: { id: true } })) redirect("/admin/productos");
  const sku = value(form, "sku").toUpperCase();
  const label = clean(value(form, "label"));
  const color = clean(value(form, "color"));
  const material = value(form, "material");
  const weightGrams = int(value(form, "weightGrams"), 1, 100000);
  const rateCents = int(value(form, "rateCents"), 1, 10000);
  const productionRaw = value(form, "productionMins");
  const productionMins = productionRaw ? int(productionRaw, 1, 100000) : null;
  const priceRaw = value(form, "priceCents");
  if (!/^[A-Z0-9][A-Z0-9_-]{2,49}$/.test(sku)) send(id, "error", "SKU inválido: 3-50 caracteres, letras, números, guiones.");
  if (label.length < 2 || label.length > 100 || color.length < 2 || color.length > 60) send(id, "error", "Revisa el nombre de variante y el color.");
  if (!["PLA", "PETG", "TPU", "OTHER"].includes(material)) send(id, "error", "Material inválido.");
  if (weightGrams === null || rateCents === null || (productionRaw && productionMins === null)) send(id, "error", "Peso, tarifa o tiempo no válidos.");
  const priceCents = priceRaw === "" ? weightGrams * rateCents : int(priceRaw, 0, 100000000);
  if (priceCents === null || priceCents > 100000000) send(id, "error", "Precio inválido.");
  try {
    await prisma.productVariant.create({ data: { productId: id, sku, label, color, material: material as "PLA" | "PETG" | "TPU" | "OTHER", weightGrams, productionMins, priceCents } });
  } catch (err) { console.error("addVariant", err); send(id, "error", errorMessage(err)); }
  revalidatePath("/admin/productos"); revalidatePath(`/admin/productos/${id}`);
  send(id, "ok", "Variante añadida.");
}

export async function updateVariant(form: FormData) {
  await requireAdmin();
  const id = value(form, "productId");
  const variantId = value(form, "variantId");
  const existing = await prisma.productVariant.findFirst({ where: { id: variantId, productId: id }, select: { id: true } });
  if (!existing) redirect("/admin/productos");
  const label = clean(value(form, "label"));
  const color = clean(value(form, "color"));
  const material = value(form, "material");
  const weightGrams = int(value(form, "weightGrams"), 1, 100000);
  const priceCents = int(value(form, "priceCents"), 0, 100000000);
  const productionRaw = value(form, "productionMins");
  const productionMins = productionRaw ? int(productionRaw, 1, 100000) : null;
  const active = value(form, "active") === "on";
  if (label.length < 2 || label.length > 100 || color.length < 2 || color.length > 60) send(id, "error", "Revisa nombre y color.");
  if (!["PLA", "PETG", "TPU", "OTHER"].includes(material) || weightGrams === null || priceCents === null || (productionRaw && productionMins === null)) send(id, "error", "Valores de variante inválidos.");
  try {
    await prisma.productVariant.update({ where: { id: variantId }, data: { label, color, material: material as "PLA" | "PETG" | "TPU" | "OTHER", weightGrams, priceCents, productionMins, active } });
  } catch (err) { console.error("updateVariant", err); send(id, "error", errorMessage(err)); }
  revalidatePath("/admin/productos"); revalidatePath(`/admin/productos/${id}`);
  send(id, "ok", "Variante actualizada.");
}

export async function deleteVariant(form: FormData) {
  await requireAdmin();
  const id = value(form, "productId");
  const variantId = value(form, "variantId");
  try {
    await prisma.$transaction(async (tx) => {
      // Una variante pertenece a un producto concreto. Bloquear borrado de la última.
      // Una transacción por sí sola no serializa dos borrados simultáneos;
      // esta protección cubre el flujo administrativo ordinario.
      const count = await tx.productVariant.count({ where: { productId: id } });
      if (count <= 1) throw new Error("LAST_VARIANT");
      const deleted = await tx.productVariant.deleteMany({ where: { id: variantId, productId: id } });
      if (deleted.count !== 1) throw new Error("MISSING_VARIANT");
    });
  } catch (err) {
    if (err instanceof Error && err.message === "LAST_VARIANT") send(id, "error", "No puedes eliminar la última variante.");
    send(id, "error", "No se pudo eliminar esa variante.");
  }
  revalidatePath("/admin/productos"); revalidatePath(`/admin/productos/${id}`);
  send(id, "ok", "Variante eliminada.");
}
