"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { extractMakerWorldId, getMakerWorldModel } from "@/lib/makerworld";

function errorRedirect(message: string): never {
  redirect(`/admin/importar?error=${encodeURIComponent(message)}`);
}

export async function importMakerWorldDraft(form: FormData) {
  await requireAdmin();
  const rawUrl = form.get("url");
  const rawCategoryId = form.get("categoryId");
  if (typeof rawUrl !== "string" || typeof rawCategoryId !== "string") {
    errorRedirect("Faltan el enlace o la categoría.");
  }
  const id = extractMakerWorldId(rawUrl);
  if (!id) errorRedirect("La dirección de MakerWorld no es válida.");
  if (!rawCategoryId || rawCategoryId.length > 100) errorRedirect("Selecciona una categoría válida.");

  const category = await prisma.category.findUnique({
    where: { id: rawCategoryId }, select: { id: true },
  });
  if (!category) errorRedirect("La categoría seleccionada no existe.");

  const existing = await prisma.product.findFirst({
    where: { sourcePlatform: "MAKERWORLD", sourceModelId: id },
    select: { id: true },
  });
  if (existing) errorRedirect("Este modelo de MakerWorld ya está importado.");

  // Volvemos a consultar el proveedor desde el servidor: no confiamos en
  // nombres, diseñadores ni licencias enviados desde el navegador.
  let model: Awaited<ReturnType<typeof getMakerWorldModel>>;
  try {
    model = await getMakerWorldModel(rawUrl);
  } catch {
    errorRedirect("No se pudieron verificar los datos de MakerWorld. Prueba de nuevo.");
  }
  if (!model.title.trim()) errorRedirect("El modelo no tiene un nombre válido.");

  // Usamos un slug estable e identificable, evitando colisiones por nombres repetidos.
  const slug = `makerworld-${id}`;
  const canonicalUrl = `https://makerworld.com/es/models/${id}`;
  try {
    await prisma.product.create({
      data: {
        name: model.title.trim().slice(0, 120),
        slug,
        description: `Diseño de ${model.designer || "autor no identificado"} procedente de MakerWorld. Revisar descripción, licencia y datos de impresión antes de publicar.`,
        categoryId: category.id,
        status: "DRAFT",
        saleMode: "QUOTE",
        sourcePlatform: "MAKERWORLD",
        sourceModelId: id,
        sourceUrl: canonicalUrl,
        sourceDesigner: model.designer.slice(0, 200),
        sourceLicense: model.license.slice(0, 200),
        commercialPermission: false,
        // Sin variantes ni imágenes: sus valores deben verificarse por separado.
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      errorRedirect("El modelo ya existe en el catálogo. No se ha duplicado.");
    }
    console.error("Error importando MakerWorld", err);
    errorRedirect("No se pudo guardar el borrador en Neon.");
  }
  revalidatePath("/admin/productos");
  revalidatePath("/admin");
  redirect(`/admin/productos?ok=${encodeURIComponent("Modelo importado como borrador. Completa sus variantes desde Bambu Studio.")}`);
}
