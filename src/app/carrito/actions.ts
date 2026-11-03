'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { Prisma } from '@/generated/prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Input = {
  lines: {
    variantId: string;
    quantity: number;
  }[];
  notes: string;
  checkoutKey: string;
};

type Result = { ok: true; reference: string } | { ok: false; error: string };

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function placeOrder(input: Input): Promise<Result> {
  // 1. Comprobar sesión.
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      ok: false,
      error: 'Inicia sesión en Mi cuenta antes de confirmar el pedido.',
    };
  }

  // 2. Validar la clave de idempotencia.
  if (
    !input ||
    typeof input.checkoutKey !== 'string' ||
    !uuidPattern.test(input.checkoutKey)
  ) {
    return {
      ok: false,
      error: 'Identificador de pedido inválido.',
    };
  }

  // 3. Comprobar si este intento ya generó un pedido.
  const previousOrder = await prisma.order.findUnique({
    where: { checkoutKey: input.checkoutKey },
    select: { id: true, userId: true },
  });

  if (previousOrder) {
    if (previousOrder.userId !== session.user.id) {
      return {
        ok: false,
        error: 'No se pudo validar este pedido.',
      };
    }

    return {
      ok: true,
      reference: previousOrder.id.slice(-8).toUpperCase(),
    };
  }

  // 4. Validar el carrito.
  if (
    !Array.isArray(input.lines) ||
    input.lines.length === 0 ||
    input.lines.length > 30 ||
    typeof input.notes !== 'string' ||
    input.notes.length > 2000
  ) {
    return {
      ok: false,
      error: 'Carrito no válido.',
    };
  }

  const quantities = new Map<string, number>();

  for (const line of input.lines) {
    if (
      !line ||
      typeof line.variantId !== 'string' ||
      !line.variantId ||
      !Number.isInteger(line.quantity) ||
      line.quantity < 1 ||
      line.quantity > 20
    ) {
      return {
        ok: false,
        error: 'Cantidad no válida.',
      };
    }

    quantities.set(
      line.variantId,
      (quantities.get(line.variantId) ?? 0) + line.quantity,
    );
  }

  if ([...quantities.values()].some((quantity) => quantity > 20)) {
    return {
      ok: false,
      error: 'Máximo 20 unidades por variante.',
    };
  }

  // 5. Comprobar dirección de envío.
  const profile = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (
    !profile ||
    !profile.shippingAddress.trim() ||
    !profile.shippingPostalCode.trim() ||
    !profile.shippingCity.trim() ||
    !profile.shippingProvince.trim() ||
    !profile.shippingCountry.trim()
  ) {
    return {
      ok: false,
      error: 'Completa primero tu dirección de envío en Mi cuenta.',
    };
  }

  // 6. Consultar productos y precios reales en Neon.
  const variants = await prisma.productVariant.findMany({
    where: {
      id: { in: [...quantities.keys()] },
      active: true,
      priceCents: { gt: 0 },
      product: {
        status: 'ACTIVE',
        saleMode: 'DIRECT',
      },
    },
    include: {
      product: {
        select: { name: true },
      },
    },
  });

  if (variants.length !== quantities.size) {
    return {
      ok: false,
      error: 'Algún producto ya no está disponible. Revisa tu carrito.',
    };
  }

  const total = variants.reduce(
    (sum, variant) => sum + variant.priceCents * quantities.get(variant.id)!,
    0,
  );

  if (!Number.isSafeInteger(total) || total <= 0 || total > 100000000) {
    return {
      ok: false,
      error: 'Total no válido.',
    };
  }

  // 7. Crear pedido con clave única.
  let order: { id: string };

  try {
    order = await prisma.order.create({
      data: {
        checkoutKey: input.checkoutKey,
        userId: session.user.id,
        customerName: session.user.name,
        customerEmail: session.user.email,
        customerPhone: profile.phone,

        shippingAddress: [
          profile.shippingAddress,
          profile.shippingPostalCode,
          profile.shippingCity,
          profile.shippingProvince,
          profile.shippingCountry,
        ].join(' | '),

        billingAddress: [
          profile.billingAddress || profile.shippingAddress,
          profile.billingPostalCode || profile.shippingPostalCode,
          profile.billingCity || profile.shippingCity,
          profile.billingProvince || profile.shippingProvince,
          profile.billingCountry || profile.shippingCountry,
        ].join(' | '),

        customerNotes: input.notes,
        totalCents: total,

        items: {
          create: variants.map((variant) => ({
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
            publicMessage: 'Pedido recibido',
            previousStatus: null,
            newStatus: 'RECEIVED',
          },
        },
      },
      select: {
        id: true,
      },
    });
  } catch (error) {
    // Dos peticiones simultáneas pueden intentar crear el
    // mismo pedido. La restricción UNIQUE de checkoutKey
    // garantiza que únicamente se inserte uno.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const existing = await prisma.order.findUnique({
        where: { checkoutKey: input.checkoutKey },
        select: { id: true, userId: true },
      });

      if (existing?.userId === session.user.id) {
        return {
          ok: true,
          reference: existing.id.slice(-8).toUpperCase(),
        };
      }
    }

    console.error('Error registrando pedido:', error);

    return {
      ok: false,
      error: 'No se pudo registrar el pedido.',
    };
  }

  // 8. Actualizar vistas relacionadas.
  revalidatePath('/admin/pedidos');
  revalidatePath('/mi-cuenta/mis-pedidos');

  // 9. Devolver referencia del pedido creado.
  return {
    ok: true,
    reference: order.id.slice(-8).toUpperCase(),
  };
}
