"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { analyzeBambu, type PrintAnalysis } from "@/lib/bambu-parser";
import { issueAnalysisTicket, readAnalysisTicket } from "@/lib/analysis-ticket";

export type AnalysisState = { error?: string; data?: PrintAnalysis; ticket?: string };
const text = (form: FormData, name: string) => { const v = form.get(name); return typeof v === "string" ? v.trim() : ""; };
const slugify = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const skuValid = (s: string) => /^[A-Z0-9][A-Z0-9_-]{2,49}$/.test(s);
const priceFrom = (gramsCenti: number, rate: number) => Math.round(gramsCenti * rate / 100);
const numeric = (value: string, min: number, max: number) => /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) >= min && Number(value) <= max ? Number(value) : null;
function returnError(message: string): never { redirect(`/admin/impresion?error=${encodeURIComponent(message)}`); }

export async function analyzePrint(_prev: AnalysisState, form: FormData): Promise<AnalysisState> {
  await requireAdmin();
  const file = form.get("file");
  if (!(file instanceof File)) return { error: "Selecciona un archivo." };
  try {
    const data = await analyzeBambu(file);
    const weightCentigrams = Math.round(data.totalGrams * 100);
    if (!Number.isSafeInteger(weightCentigrams) || weightCentigrams <= 0) return { error: "Peso no válido." };
    const mats = [...new Set(data.colors.map(f => f.material.toUpperCase()))];
    const material = mats.length === 1 && ["PLA","PETG","TPU"].includes(mats[0]) ? mats[0] as "PLA" | "PETG" | "TPU" : "OTHER";
    const color = data.colors.map(c => c.color).join(" + ").slice(0,80);
    const ticket = issueAnalysisTicket({ weightCentigrams, seconds: data.durationSeconds, material, color, filename: data.filename.slice(0,255) });
    return { data, ticket };
  } catch (err) { return { error: err instanceof Error ? err.message : "No se pudo analizar el archivo." }; }
}

export async function applyToVariant(form: FormData) {
  await requireAdmin();
  let payload: ReturnType<typeof readAnalysisTicket>;
  try { payload = readAnalysisTicket(text(form,"ticket")); } catch (e) { returnError(e instanceof Error ? e.message : "Análisis inválido."); }
  const variantId = text(form,"variantId");
  const rate = numeric(text(form,"rate"),1,10000);
  if (!variantId || rate === null) returnError("Selecciona variante y tarifa.");
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId }, select: { productId: true } });
  if (!variant) returnError("La variante seleccionada ya no existe.");
  try {
    await prisma.productVariant.update({ where: {id:variantId}, data: {
      weightGrams: Math.ceil(payload.weightCentigrams / 100),
      weightCentigrams: payload.weightCentigrams,
      productionMins: Math.ceil(payload.seconds / 60),
      material:payload.material, color:payload.color.slice(0,60) || "Por determinar",
      priceCents: priceFrom(payload.weightCentigrams,rate),
    } });
  } catch { returnError("No se pudo actualizar la variante."); }
  revalidatePath(`/admin/productos/${variant.productId}`);
  revalidatePath("/admin/productos");
  redirect(`/admin/productos/${variant.productId}?ok=${encodeURIComponent("Datos del laminado aplicados a la variante.")}`);
}

export async function createFromAnalysis(form: FormData) {
  await requireAdmin();
  let payload: ReturnType<typeof readAnalysisTicket>;
  try { payload=readAnalysisTicket(text(form,"ticket")); } catch (e) { returnError(e instanceof Error ? e.message : "Análisis inválido."); }
  const name = text(form,"name").replace(/\s+/g," ");
  const description = text(form,"description");
  const categoryId = text(form,"categoryId");
  const sku = text(form,"sku").toUpperCase();
  const label = text(form,"label").replace(/\s+/g," ");
  const rate = numeric(text(form,"rate"),1,10000);
  if (name.length < 3 || name.length > 120 || description.length < 10 || description.length > 5000 || label.length < 2 || label.length > 100 || !skuValid(sku) || rate === null) returnError("Comprueba nombre, descripción, SKU, variante y tarifa.");
  if (!await prisma.category.findUnique({where:{id:categoryId},select:{id:true}})) returnError("Selecciona una categoría válida.");
  const base=slugify(name);
  if (!base) returnError("El nombre no permite crear una URL.");
  try {
    await prisma.$transaction(async tx => {
      let slug=base;
      for (let i=2; i<=30; i++) { if (!await tx.product.findUnique({where:{slug},select:{id:true}})) break; slug=`${base}-${i}`; }
      await tx.product.create({ data: { name,slug,description,categoryId,status:"DRAFT",saleMode:"DIRECT",variants:{create:{
        sku,label, material:payload.material,color:payload.color.slice(0,60)||"Por determinar",
        weightGrams:Math.ceil(payload.weightCentigrams/100),weightCentigrams:payload.weightCentigrams,
        productionMins:Math.ceil(payload.seconds/60),priceCents:priceFrom(payload.weightCentigrams,rate)
      }}} });
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code==="P2002") returnError("El SKU o el nombre de producto ya existen.");
    console.error("createFromAnalysis",err);returnError("No se pudo crear el producto.");
  }
  revalidatePath("/admin/productos");revalidatePath("/admin");
  redirect(`/admin/productos?ok=${encodeURIComponent("Producto creado como borrador desde Bambu Studio.")}`);
}
