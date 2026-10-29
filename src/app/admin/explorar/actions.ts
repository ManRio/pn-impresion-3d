"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { getMakerWorldModel } from "@/lib/makerworld";

function back(message: string, kind: "ok" | "error" = "error"): never {
  redirect(`/admin/explorar?${kind}=${encodeURIComponent(message)}`);
}

export async function importSelectedModels(formData: FormData) {
  await requireAdmin();
  const categoryId = formData.get("categoryId");
  if (typeof categoryId !== "string" || !categoryId || categoryId.length > 100) {
    back("Selecciona una categoría.");
  }
  const raw = formData.getAll("modelId");
  if (raw.length === 0 || raw.length > 10) {
    back("Selecciona entre 1 y 10 modelos por operación.");
  }
  if (raw.some(v => typeof v !== "string" || !/^\d{1,12}$/.test(v))) {
    back("Se recibió un identificador de modelo no válido.");
  }
  const ids = [...new Set(raw as string[])];
  if (ids.length !== raw.length) back("Hay modelos duplicados en la selección.");
  const category = await prisma.category.findUnique({
    where: { id: categoryId }, select: { id: true },
  });
  if (!category) back("La categoría ya no existe.");

  let imported = 0;
  let existing = 0;
  let failed = 0;
  for (const id of ids) {
    try {
      const already = await prisma.product.findFirst({
        where: { sourcePlatform: "MAKERWORLD", sourceModelId: id },
        select: { id: true },
      });
      if (already) { existing++; continue; }
      // Revalidamos en el servidor cada ficha: no confiamos en sus campos del navegador.
      const model = await getMakerWorldModel(`https://makerworld.com/es/models/${id}`);
      if (String(model.id) !== id || !model.title.trim()) { failed++; continue; }
      await prisma.product.create({
        data: {
          name: model.title.trim().slice(0, 120),
          slug: `makerworld-${id}`,
          description: `Diseño de ${model.designer || "autor no identificado"} obtenido de MakerWorld. Pendiente de comprobar derechos, descripción y datos de fabricación.`,
          status: "DRAFT",
          saleMode: "QUOTE",
          categoryId: category.id,
          sourcePlatform: "MAKERWORLD",
          sourceModelId: id,
          sourceUrl: `https://makerworld.com/es/models/${id}`,
          sourceDesigner: model.designer.slice(0, 200),
          sourceLicense: model.license.slice(0, 200),
          commercialPermission: false,
        },
      });
      imported++;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        existing++;
      } else {
        failed++;
        console.error("Error importación MakerWorld", id, err);
      }
    }
  }
  revalidatePath("/admin/productos");
  revalidatePath("/admin");
  revalidatePath("/admin/explorar");
  back(`${imported} borradores creados, ${existing} repetidos, ${failed} fallidos. Ninguno está publicado.`, "ok");
}
