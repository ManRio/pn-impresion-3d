"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

function normalizeName(input: FormDataEntryValue | null) {
  if (typeof input !== "string") return "";
  return input.trim().replace(/\s+/g, " ");
}

function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function result(kind: "ok" | "error", message: string): never {
  redirect(`/admin/categorias?${kind}=${encodeURIComponent(message)}`);
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const name = normalizeName(formData.get("name"));
  if (name.length < 2 || name.length > 80) result("error", "El nombre debe tener entre 2 y 80 caracteres.");
  const slug = toSlug(name);
  if (slug.length < 2) result("error", "Utiliza un nombre con letras o números.");

  const exists = await prisma.category.findUnique({ where: { slug }, select: { id: true } });
  if (exists) result("error", "Ya existe una categoría con ese nombre o URL.");
  try {
    await prisma.category.create({ data: { name, slug } });
  } catch {
    result("error", "No se pudo crear la categoría. Comprueba que no exista otra igual.");
  }
  revalidatePath("/admin/categorias");
  result("ok", "Categoría creada correctamente.");
}

export async function renameCategory(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  const name = normalizeName(formData.get("name"));
  if (typeof id !== "string" || !id) result("error", "Identificador inválido.");
  if (name.length < 2 || name.length > 80) result("error", "El nombre debe tener entre 2 y 80 caracteres.");
  const slug = toSlug(name);
  if (slug.length < 2) result("error", "Utiliza un nombre con letras o números.");
  const existing = await prisma.category.findUnique({ where: { id }, select: { id: true } });
  if (!existing) result("error", "Esa categoría ya no existe.");
  const collision = await prisma.category.findUnique({ where: { slug }, select: { id: true } });
  if (collision && collision.id !== id) result("error", "Otra categoría ya utiliza esa URL.");
  try {
    await prisma.category.update({ where: { id }, data: { name, slug } });
  } catch {
    result("error", "No se pudo guardar la categoría.");
  }
  revalidatePath("/admin/categorias");
  revalidatePath("/tienda");
  result("ok", "Categoría actualizada.");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) result("error", "Identificador inválido.");
  // Comprobación de negocio: no borrar categorías con productos vinculados.
  const category = await prisma.category.findUnique({ where: { id }, select: { _count: { select: { products: true } } } });
  if (!category) result("error", "Esa categoría ya no existe.");
  if (category._count.products > 0) result("error", "No puedes eliminar una categoría con productos.");
  try {
    await prisma.category.delete({ where: { id } });
  } catch {
    result("error", "No se pudo eliminar; puede haber productos vinculados.");
  }
  revalidatePath("/admin/categorias");
  result("ok", "Categoría eliminada.");
}
