"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

function fail(message: string): never {
  redirect(`/admin/biblioteca?error=${encodeURIComponent(message)}`);
}

export async function createProductsFromLibrary(form: FormData) {
  await requireAdmin();
  const rawIds = form.getAll("designId");
  const categoryId = form.get("categoryId");
  if (!rawIds.length || rawIds.length > 24 ||
      rawIds.some(value => typeof value !== "string" || !/^[a-z0-9]{10,40}$/.test(value)) ||
      new Set(rawIds).size !== rawIds.length) {
    fail("Selecciona entre 1 y 24 referencias válidas.");
  }
  if (typeof categoryId !== "string" || !categoryId) {
    fail("Selecciona una categoría para crear los productos.");
  }
  const category = await prisma.category.findUnique({
    where: { id: categoryId }, select: { id: true },
  });
  if (!category) fail("La categoría seleccionada no existe.");

  const ids = rawIds as string[];
  const designs = await prisma.savedDesign.findMany({
    where: { id: { in: ids }, platform: "MAKERWORLD" },
    select: {
      id: true, externalId: true, title: true, designer: true,
      license: true, sourceUrl: true, status: true,
    },
  });
  if (designs.length !== ids.length) {
    fail("La selección contiene referencias inexistentes o no compatibles.");
  }
  let created = 0;
  let repeated = 0;
  let failed = 0;
  for (const design of designs) {
    try {
      const existing = await prisma.product.findUnique({
        where: {
          sourcePlatform_sourceModelId: {
            sourcePlatform: "MAKERWORLD",
            sourceModelId: design.externalId,
          },
        },
        select: { id: true },
      });
      if (existing) { repeated++; continue; }
      await prisma.product.create({
        data: {
          name: design.title.trim().slice(0, 120) || `MakerWorld ${design.externalId}`,
          slug: `makerworld-${design.externalId}`,
          description: `Referencia de MakerWorld creada desde la biblioteca. Autor: ${design.designer || "No indicado"}. Licencia declarada: ${design.license || "No indicada"}. Pendiente de verificar autorización comercial, medidas, materiales y precio.`,
          status: "DRAFT",
          saleMode: "QUOTE",
          categoryId: category.id,
          sourcePlatform: "MAKERWORLD",
          sourceModelId: design.externalId,
          sourceUrl: design.sourceUrl,
          sourceDesigner: design.designer,
          sourceLicense: design.license,
          commercialPermission: false,
        },
      });
      created++;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        repeated++;
      } else {
        failed++;
        console.error("Error convirtiendo SavedDesign en Product:", design.id, error);
      }
    }
  }
  revalidatePath("/admin/productos");
  revalidatePath("/admin/biblioteca");
  redirect(`/admin/biblioteca?ok=${encodeURIComponent(
    `${created} borradores creados; ${repeated} duplicados; ${failed} fallidos. Ninguno se ha publicado.`
  )}`);
}
