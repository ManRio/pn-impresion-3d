'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { Prisma } from '@/generated/prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { splitIncludedVat } from '@/lib/tax-config';
import {
  isDeliveryMethod,
  isSupportedShippingAddress,
  PICKUP_ADDRESS,
  shippingCentsFor,
  type DeliveryMethod,
} from '@/lib/checkout-config';

type Input = {
  lines: { variantId: string; quantity: number }[];
  notes: string;
  checkoutKey: string;
  deliveryMethod: DeliveryMethod;
};

type Result = { ok: true; reference: string } | { ok: false; error: string };

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function placeOrder(input: Input): Promise<Result> {
  // No crear pedidos anónimos ni fiarse de importes proporcionados por el cliente.
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { ok: false, error: 'Inicia sesión en Mi cuenta antes de confirmar el pedido.' };
  }

  if (!input || typeof input.checkoutKey !== 'string' || !uuidPattern.test(input.checkoutKey)) {
    return { ok: false, error: 'Identificador de pedido inválido.' };
  }

  // Primero idempotencia: una respuesta perdida debe devolver el pedido previo.
  const previousOrder = await prisma.order.findUnique({
    where: { checkoutKey: input.checkoutKey },
    select: { id: true, userId: true },
  });
  if (previousOrder) {
    return previousOrder.userId === session.user.id
      ? { ok: true, reference: previousOrder.id.slice(-8).toUpperCase() }
      : { ok: false, error: 'No se pudo validar este pedido.' };
  }

  if (!isDeliveryMethod(input.deliveryMethod)) {
    return { ok: false, error: 'Selecciona envío o recogida presencial.' };
  }

  if (!Array.isArray(input.lines) || input.lines.length === 0 || input.lines.length > 30 ||
      typeof input.notes !== 'string' || input.notes.length > 2000) {
    return { ok: false, error: 'Carrito no válido.' };
  }

  const quantities = new Map<string, number>();
  for (const line of input.lines) {
    if (!line || typeof line.variantId !== 'string' || !line.variantId ||
        !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 20) {
      return { ok: false, error: 'Cantidad no válida.' };
    }
    quantities.set(line.variantId, (quantities.get(line.variantId) ?? 0) + line.quantity);
  }
  if ([...quantities.values()].some(quantity => quantity > 20)) {
    return { ok: false, error: 'Máximo 20 unidades por variante.' };
  }

  const profile = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) {
    return { ok: false, error: 'Completa tus datos de cliente en Mi cuenta.' };
  }

  const shippingRequired = input.deliveryMethod === 'SHIPPING';
  if (shippingRequired && (
    !profile.shippingAddress.trim() || !profile.shippingCity.trim() ||
    !profile.shippingProvince.trim() ||
    !isSupportedShippingAddress(profile.shippingPostalCode, profile.shippingCountry)
  )) {
    return { ok: false, error: 'Completa una dirección de envío válida en Península o Baleares.' };
  }

  // Solo usar datos de envío como sustitutos de facturación cuando existen.
  // La recogida permite prescindir de dirección de envío, pero exige facturación completa.
  const billingParts = [
    profile.billingAddress || profile.shippingAddress,
    profile.billingPostalCode || profile.shippingPostalCode,
    profile.billingCity || profile.shippingCity,
    profile.billingProvince || profile.shippingProvince,
    profile.billingCountry || profile.shippingCountry,
  ];
  if (billingParts.some(part => !part.trim())) {
    return { ok: false, error: 'Completa la dirección de facturación en Mi cuenta.' };
  }

  const variants = await prisma.productVariant.findMany({
    where: {
      id: { in: [...quantities.keys()] },
      active: true,
      priceCents: { gt: 0 },
      product: { status: 'ACTIVE', saleMode: 'DIRECT' },
    },
    include: { product: { select: { name: true } } },
  });
  if (variants.length !== quantities.size) {
    return { ok: false, error: 'Algún producto ya no está disponible. Revisa tu carrito.' };
  }

  const subtotal = variants.reduce(
    (sum, variant) => sum + variant.priceCents * quantities.get(variant.id)!, 0,
  );
  const shipping = shippingCentsFor(input.deliveryMethod);
  const total = subtotal + shipping;
  const tax = splitIncludedVat(total);
  if (!Number.isSafeInteger(subtotal) || subtotal <= 0 ||
      !Number.isSafeInteger(total) || total > 100000000) {
    return { ok: false, error: 'Total no válido.' };
  }

  let order: { id: string };
  try {
    order = await prisma.order.create({
      data: {
        checkoutKey: input.checkoutKey,
        userId: session.user.id,
        customerName: session.user.name,
        customerEmail: session.user.email,
        customerPhone: profile.phone,
        shippingAddress: shippingRequired
          ? [profile.shippingAddress, profile.shippingPostalCode, profile.shippingCity,
              profile.shippingProvince, profile.shippingCountry].join(' | ')
          : `Recogida presencial | ${PICKUP_ADDRESS}`,
        billingAddress: billingParts.join(' | '),
        customerNotes: input.notes,
        subtotalCents: subtotal,
        shippingCents: shipping,
        deliveryMethod: input.deliveryMethod,
        totalCents: total,
        taxableBaseCents: tax.baseCents,
        vatCents: tax.vatCents,
        vatRatePercent: tax.vatRatePercent,
        carrier: shippingRequired ? 'Correos' : null,
        items: {
          create: variants.map(variant => ({
            variantId: variant.id,
            productName: variant.product.name,
            variantLabel: variant.label,
            sku: variant.sku,
            material: variant.material,
            color: variant.color,
            unitPriceCents: variant.priceCents,
            quantity: quantities.get(variant.id)!,
            lineTotalCents: variant.priceCents * quantities.get(variant.id)!,
          })),
        },
        history: {
          create: {
            authorName: 'Sistema',
            publicMessage: shippingRequired
              ? 'Pedido recibido · envío con Correos'
              : 'Pedido recibido · recogida presencial',
            previousStatus: null,
            newStatus: 'RECEIVED',
          },
        },
      },
      select: { id: true },
    });
  } catch (error) {
    // Restricción UNIQUE checkoutKey: protege también reintentos simultáneos.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const existing = await prisma.order.findUnique({
        where: { checkoutKey: input.checkoutKey },
        select: { id: true, userId: true },
      });
      if (existing?.userId === session.user.id) {
        return { ok: true, reference: existing.id.slice(-8).toUpperCase() };
      }
    }
    console.error('Error registrando pedido:', error);
    return { ok: false, error: 'No se pudo registrar el pedido.' };
  }

  revalidatePath('/admin/pedidos');
  revalidatePath('/mi-cuenta/mis-pedidos');
  return { ok: true, reference: order.id.slice(-8).toUpperCase() };
}
