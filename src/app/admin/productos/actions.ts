"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

function val(data: FormData, key: string) {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}
function fail(message: string): never {
  redirect(`/admin/productos/nuevo?error=${encodeURIComponent(message)}`);
}
function slugify(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function integer(s: string, min: number, max: number): number | null {
  if (!/^\d+$/.test(s)) return null;
  const value = Number(s);
  return Number.isSafeInteger(value) && value >= min && value <= max ? value : null;
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const name = val(formData, "name").replace(/\s+/g, " ");
  const description = val(formData, "description");
  const categoryId = val(formData, "categoryId");
  const saleMode = val(formData, "saleMode");
  const sku = val(formData, "sku").toUpperCase();
  const label = val(formData, "label");
  const color = val(formData, "color");
  const material = val(formData, "material");
  const grams = integer(val(formData, "weightGrams"), 1, 100000);
  const rate = integer(val(formData, "rateCents"), 1, 10000);
  const override = val(formData, "priceCents");
  const minutesRaw = val(formData, "productionMins");
  const minutes = minutesRaw ? integer(minutesRaw, 1, 100000) : null;
  if (name.length < 3 || name.length > 120) fail("Nombre: entre 3 y 120 caracteres.");
  if (description.length < 10 || description.length > 5000) fail("Descripción: entre 10 y 5000 caracteres.");
  if (!categoryId) fail("Selecciona una categoría.");
  if (saleMode !== "DIRECT" && saleMode !== "QUOTE") fail("Modalidad no válida.");
  if (!/^[A-Z0-9][A-Z0-9_-]{2,49}$/.test(sku)) fail("SKU inválido: usa de 3 a 50 letras, números y guiones.");
  if (label.length < 2 || label.length > 100 || color.length < 2 || color.length > 60) fail("Revisa el nombre y color de la variante.");
  if (!(["PLA", "PETG", "TPU", "OTHER"] as string[]).includes(material)) fail("Material no válido.");
  if (grams === null || rate === null) fail("Peso y tarifa deben ser positivos.");
  if (minutesRaw && minutes === null) fail("Tiempo no válido.");
  const priceCents = override ? integer(override, 0, 100000000) : grams * rate;
  if (priceCents === null || priceCents > 100000000) fail("Precio inválido.");
  if (saleMode === "DIRECT" && priceCents === 0) fail("El precio debe ser mayor que cero.");
  const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
  if (!category) fail("La categoría no existe.");
  const baseSlug = slugify(name);
  if (!baseSlug) fail("El nombre no permite generar una URL.");
  try {
    let slug = baseSlug;
    for (let n = 2; n <= 100; n++) {
      if (!await prisma.product.findUnique({ where: { slug }, select: { id: true } })) break;
      slug = `${baseSlug}-${n}`;
    }
    await prisma.product.create({
      data: {
        name, description, categoryId, slug, status: "DRAFT",
        saleMode: saleMode as "DIRECT" | "QUOTE",
        variants: { create: {
          sku, label, color, material: material as "PLA" | "PETG" | "TPU" | "OTHER",
          weightGrams: grams, priceCents, productionMins: minutes,
        } },
      },
    });
  } catch (error) {
    console.error("No se pudo crear el producto", error);
    fail("No se pudo crear. Revisa que el SKU y el nombre no estén duplicados.");
  }
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  redirect("/admin/productos?ok=Producto%20creado%20como%20borrador");
}
