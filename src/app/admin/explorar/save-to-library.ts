"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { getMakerWorldModel } from "@/lib/makerworld";

export async function saveSelectedToLibrary(form: FormData) {
  await requireAdmin();
  const ids = form.getAll("modelId");
  const valid = ids.length >= 1 && ids.length <= 10 &&
    ids.every(id => typeof id === "string" && /^\d{1,12}$/.test(id));
  if (!valid || new Set(ids).size !== ids.length) {
    redirect("/admin/explorar?error=" + encodeURIComponent("Selecciona de 1 a 10 modelos válidos."));
  }
  let created = 0;
  let repeated = 0;
  let failed = 0;
  for (const value of ids) {
    const id = String(value);
    try {
      const exists = await prisma.savedDesign.findUnique({
        where: { platform_externalId: { platform: "MAKERWORLD", externalId: id } },
        select: { id: true },
      });
      if (exists) { repeated++; continue; }
      const model = await getMakerWorldModel(`https://makerworld.com/es/models/${id}`);
      if (String(model.id) !== id || !model.title.trim()) { failed++; continue; }
      await prisma.savedDesign.create({
        data: {
          platform: "MAKERWORLD", externalId: id,
          title: model.title.trim().slice(0, 200),
          designer: (model.designer || "").slice(0, 200),
          license: (model.license || "").slice(0, 200),
          sourceUrl: `https://makerworld.com/es/models/${id}`,
          status: "TO_REVIEW",
        },
      });
      created++;
    } catch (error) {
      const existing = await prisma.savedDesign.findUnique({
        where: { platform_externalId: { platform: "MAKERWORLD", externalId: id } },
        select: { id: true },
      }).catch(() => null);
      if (existing) repeated++;
      else { failed++; console.error("Error guardando referencia MakerWorld:", id, error); }
    }
  }
  revalidatePath("/admin/biblioteca");
  revalidatePath("/admin/explorar");
  redirect("/admin/biblioteca?ok=" + encodeURIComponent(
    `${created} guardados, ${repeated} repetidos y ${failed} fallidos. No se ha creado ningún producto.`
  ));
}
