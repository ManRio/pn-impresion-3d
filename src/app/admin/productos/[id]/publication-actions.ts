"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { publicationFailures } from "@/lib/publication-checks";

function feedback(id: string, kind: "ok" | "error", message: string): never {
  redirect(`/admin/productos/${encodeURIComponent(id)}?${kind}=${encodeURIComponent(message)}`);
}

function field(data: FormData, key: string) {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateDesignOrigin(form: FormData) {
  await requireAdmin();
  const id = field(form, "productId");
  const origin = field(form, "designOrigin");
  if (!["OWN", "CUSTOM", "THIRD_PARTY"].includes(origin)) feedback(id, "error", "Procedencia incorrecta.");
  const product = await prisma.product.findUnique({ where: { id }, select: { id: true, sourcePlatform: true, designOrigin: true, status: true } });
  if (!product) redirect("/admin/productos");
  if (product.sourcePlatform && origin !== "THIRD_PARTY") feedback(id, "error", "Los modelos importados deben conservar su procedencia de terceros.");
  if (product.status === "ACTIVE" && product.designOrigin !== origin) {
    feedback(id, "error", "Retira primero el producto de la venta para cambiar su procedencia.");
  }
  await prisma.product.update({
    where: { id },
    data: {
      designOrigin: origin as "OWN" | "CUSTOM" | "THIRD_PARTY",
      ...(origin === "THIRD_PARTY" && product.designOrigin !== "THIRD_PARTY"
        ? { commercialPermission: false, rightsEvidence: null, rightsReviewedAt: null }
        : {}),
    },
  });
  revalidatePath(`/admin/productos/${id}`);
  feedback(id, "ok", "Procedencia actualizada.");
}

export async function registerCommercialRights(form: FormData) {
  await requireAdmin();
  const id = field(form, "productId");
  const evidence = field(form, "rightsEvidence");
  const confirmed = field(form, "confirmed") === "on";
  const product = await prisma.product.findUnique({ where: { id }, select: { id: true, sourcePlatform: true, designOrigin: true } });
  if (!product) redirect("/admin/productos");
  if (!(product.sourcePlatform || product.designOrigin === "THIRD_PARTY")) feedback(id, "error", "No necesitas documentar derechos de un diseño propio.");
  if (!confirmed || evidence.length < 15 || evidence.length > 2000)
    feedback(id, "error", "Marca la declaración e indica la autorización verificable (15-2000 caracteres).");

  await prisma.product.update({
    where: { id },
    data: { commercialPermission: true, rightsEvidence: evidence, rightsReviewedAt: new Date() },
  });
  revalidatePath(`/admin/productos/${id}`);
  feedback(id, "ok", "Declaración de derechos registrada. Conserva los justificantes originales.");
}

export async function revokeCommercialRights(form: FormData) {
  await requireAdmin();
  const id = field(form, "productId");
  const result = await prisma.product.updateMany({
    where: { id },
    data: { commercialPermission: false, rightsEvidence: null, rightsReviewedAt: null, status: "DRAFT" },
  });
  if (!result.count) redirect("/admin/productos");
  revalidatePath("/api/productos");
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${id}`);
  feedback(id, "ok", "Permiso retirado. Producto devuelto a borrador.");
}

export async function publishProduct(form: FormData) {
  await requireAdmin();
  const id = field(form, "productId");
  const confirmed = field(form, "confirmPublish") === "on";
  if (!confirmed) feedback(id, "error", "Debes confirmar expresamente la publicación.");
  let failures: string[] = [];
  try {
    await prisma.$transaction(async tx => {
      const product = await tx.product.findUnique({
        where: { id }, include: { images: true, variants: true, category: true },
      });
      if (!product) { failures = ["Producto inexistente."]; return; }
      failures = publicationFailures(product);
      if (failures.length) return;
      await tx.product.update({ where: { id }, data: { status: "ACTIVE" } });
    });
  } catch (error) {
    console.error("Publicación fallida", id, error);
    feedback(id, "error", "Error de base de datos al publicar.");
  }
  if (failures.length) feedback(id, "error", failures.join(" ").slice(0, 400));
  revalidatePath("/api/productos");
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${id}`);
  feedback(id, "ok", "Producto publicado. Comprueba su aparición en la API pública.");
}

export async function unpublishProduct(form: FormData) {
  await requireAdmin();
  const id = field(form, "productId");
  const result = await prisma.product.updateMany({
    where: { id }, data: { status: "DRAFT" },
  });
  if (!result.count) redirect("/admin/productos");
  revalidatePath("/api/productos");
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${id}`);
  feedback(id, "ok", "Producto retirado y devuelto a borrador.");
}
