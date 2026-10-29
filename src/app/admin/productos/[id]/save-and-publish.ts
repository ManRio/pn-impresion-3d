'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';
import { publicationFailures } from '@/lib/publication-checks';
const val = (d: FormData, k: string) => String(d.get(k) || '').trim();
function fail(id: string, message: string): never {
  redirect(
    `/admin/productos/${encodeURIComponent(id)}?error=${encodeURIComponent(message)}`,
  );
}
const integer = (s: string, min: number, max: number) =>
  /^\d+$/.test(s) &&
  Number.isSafeInteger(Number(s)) &&
  Number(s) >= min &&
  Number(s) <= max
    ? Number(s)
    : null;
export async function saveAndPublish(data: FormData) {
  await requireAdmin();
  const id = val(data, 'productId');
  const name = val(data, 'name').replace(/\s+/g, ' ');
  const description = val(data, 'description');
  const categoryId = val(data, 'categoryId');
  const saleMode = val(data, 'saleMode');
  if (
    name.length < 3 ||
    name.length > 120 ||
    description.length < 10 ||
    description.length > 5000
  )
    fail(id, 'Revisa el nombre y descripción.');
  if (!['DIRECT', 'QUOTE'].includes(saleMode))
    fail(id, 'Modalidad incorrecta.');
  const ids = data
    .getAll('variantIds')
    .filter((v): v is string => typeof v === 'string');
  if (new Set(ids).size !== ids.length) fail(id, 'Variantes repetidas.');
  const variantData: {
    variantId: string;
    label: string;
    color: string;
    material: 'PLA' | 'PETG' | 'TPU' | 'OTHER';
    weightGrams: number;
    priceCents: number;
    productionMins: number | null;
    active: boolean;
  }[] = [];
  for (const variantId of ids) {
    const prefix = `variant.${variantId}.`;
    const label = val(data, prefix + 'label');
    const color = val(data, prefix + 'color');
    const material = val(data, prefix + 'material');
    const weightGrams = integer(val(data, prefix + 'weightGrams'), 1, 100000);
    const priceCents = integer(val(data, prefix + 'priceCents'), 0, 100000000);
    const mins = val(data, prefix + 'productionMins');
    const productionMins = mins ? integer(mins, 1, 100000) : null;
    const active = val(data, prefix + 'active') === 'on';
    if (
      label.length < 2 ||
      label.length > 100 ||
      color.length < 2 ||
      color.length > 60 ||
      !['PLA', 'PETG', 'TPU', 'OTHER'].includes(material) ||
      weightGrams === null ||
      priceCents === null ||
      (mins && productionMins === null)
    )
      fail(id, 'Revisa los datos de las variantes.');
    variantData.push({
      variantId,
      label,
      color,
      material: material as 'PLA' | 'PETG' | 'TPU' | 'OTHER',
      weightGrams,
      priceCents,
      productionMins,
      active,
    });
  }
  let issue: string | undefined;
  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.product.findUnique({
        where: { id },
        include: { variants: true, images: true, category: true },
      });
      if (!existing) {
        issue = 'Producto inexistente.';
        return;
      }
      const category = await tx.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        issue = 'Categoría inexistente.';
        return;
      }
      if (
        existing.variants.length !== ids.length ||
        existing.variants.some((v) => !ids.includes(v.id))
      ) {
        issue = 'La lista de variantes cambió. Recarga la página.';
        return;
      }
      const candidate = {
        ...existing,
        name,
        description,
        categoryId,
        category,
        saleMode: saleMode as 'DIRECT' | 'QUOTE',
        variants: existing.variants.map((v) => {
          const next = variantData.find((x) => x.variantId === v.id)!;
          return { ...v, ...next };
        }),
      };
      const problems = publicationFailures(candidate);
      if (problems.length) {
        issue = problems.join(' ').slice(0, 400);
        return;
      }
      await tx.product.update({
        where: { id },
        data: {
          name,
          description,
          categoryId,
          saleMode: saleMode as 'DIRECT' | 'QUOTE',
        },
      });
      for (const v of variantData)
        await tx.productVariant.update({
          where: { id: v.variantId },
          data: {
            label: v.label,
            color: v.color,
            material: v.material,
            weightGrams: v.weightGrams,
            priceCents: v.priceCents,
            productionMins: v.productionMins,
            active: v.active,
          },
        });
      await tx.product.update({ where: { id }, data: { status: 'ACTIVE' } });
    });
  } catch (e) {
    console.error('saveAndPublish', e);
    fail(id, 'No se pudo guardar y publicar.');
  }
  if (issue) fail(id, issue);
  for (const path of [
    '/admin/productos',
    `/admin/productos/${id}`,
    '/tienda',
    '/api/productos',
  ])
    revalidatePath(path);
  redirect(
    `/admin/productos/${encodeURIComponent(id)}?ok=${encodeURIComponent('Cambios guardados y producto publicado.')}`,
  );
}
