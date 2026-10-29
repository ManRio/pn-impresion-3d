"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function bulkUpdateDesigns(form: FormData) {
  await requireAdmin();
  const raw = form.getAll("designId");
  const status = form.get("status");
  const allowed = ["TO_REVIEW", "SHORTLIST", "DISCARDED"] as const;
  if (typeof status !== "string" || !allowed.some(v => v === status)) {
    redirect("/admin/biblioteca?error=Estado%20no%20válido");
  }
  if (raw.length < 1 || raw.length > 50 ||
      raw.some(v => typeof v !== "string" || v.length > 100 || !/^[a-z0-9]+$/.test(v))) {
    redirect("/admin/biblioteca?error=Selecciona%20de%201%20a%2050%20diseños");
  }
  const ids = [...new Set(raw as string[])];
  if (ids.length !== raw.length) {
    redirect("/admin/biblioteca?error=Selección%20duplicada");
  }
  const result = await prisma.savedDesign.updateMany({
    where: { id: { in: ids } },
    data: { status: status as (typeof allowed)[number] },
  });
  revalidatePath("/admin/biblioteca");
  redirect(`/admin/biblioteca?ok=${encodeURIComponent(`${result.count} diseños actualizados.`)}`);
}
