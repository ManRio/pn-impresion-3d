"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { getMakerWorldModel } from "@/lib/makerworld";

function go(message: string, key: "ok" | "error" = "ok"): never {
  redirect(`/admin/biblioteca?${key}=${encodeURIComponent(message)}`);
}
const text = (data: FormData, key: string) => {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
};

export async function saveDesign(form: FormData) {
  await requireAdmin();
  const raw = text(form, "model");
  let inputId: string | null = null;
  if (/^\d{1,12}$/.test(raw)) {
    inputId = raw;
  } else {
    try {
      const url = new URL(raw);
      if (url.protocol === "https:" &&
        ["makerworld.com", "www.makerworld.com"].includes(url.hostname)) {
        const match = url.pathname.match(/^\/(?:[a-z]{2}\/)?models\/(\d{1,12})(?:[-\/]|$)/i);
        inputId = match?.[1] ?? null;
      }
    } catch {
      // No era una URL válida.
    }
  }
  if (!inputId) go("Introduce un ID o URL válida de MakerWorld.", "error");
  // URL canónica: eliminamos el slug y el fragmento #profileId.
  const url = `https://makerworld.com/es/models/${inputId}`;
  let model: Awaited<ReturnType<typeof getMakerWorldModel>>;
  try {
    model = await getMakerWorldModel(url);
  } catch (error) {
    console.error("Error al consultar MakerWorld para biblioteca:", error);
    go("No se pudo consultar el diseño en MakerWorld. Revisa el registro del servidor.", "error");
  }
  const id = String(model.id);
  if (!/^\d{1,12}$/.test(id)) go("ID del modelo no válido.", "error");
  const exists = await prisma.savedDesign.findUnique({
    where: { platform_externalId: { platform: "MAKERWORLD", externalId: id } },
    select: { id: true },
  });
  if (exists) go("Este diseño ya estaba guardado en la biblioteca.");
  try {
    await prisma.savedDesign.create({
      data: {
        platform: "MAKERWORLD",
        externalId: id,
        title: model.title.slice(0, 200),
        designer: model.designer.slice(0, 200),
        license: model.license.slice(0, 200),
        sourceUrl: `https://makerworld.com/es/models/${id}`,
        // No guardamos imágenes ajenas; se consultan solo en el explorador.
        status: "TO_REVIEW",
      },
    });
  } catch {
    go("No se pudo guardar el diseño o ya existía.", "error");
  }
  revalidatePath("/admin/biblioteca");
  go("Diseño guardado para revisión. No se ha creado ningún producto.");
}

export async function updateDesignStatus(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const status = text(form, "status");
  if (!id || !["TO_REVIEW", "SHORTLIST", "DISCARDED"].includes(status)) {
    go("Estado no válido.", "error");
  }
  const exists = await prisma.savedDesign.findUnique({ where: { id }, select: { id: true } });
  if (!exists) go("Diseño no encontrado.", "error");
  await prisma.savedDesign.update({
    where: { id },
    data: { status: status as "TO_REVIEW" | "SHORTLIST" | "DISCARDED" },
  });
  revalidatePath("/admin/biblioteca");
  go("Estado actualizado.");
}
