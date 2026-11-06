'use server';

import { headers } from 'next/headers';
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
import { checkoutBaseUrl, checkoutEnabled, getStripe, getStripeMode, checkoutSessionPrefix } from '@/lib/stripe';

type Input = {
  lines: { variantId: string; quantity: number }[];
  notes: string;
  checkoutKey: string;
  deliveryMethod: DeliveryMethod;
  termsAccepted: boolean;
};

type Result = { ok: true; url: string } | { ok: false; error: string };
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function startStripeCheckout(input: Input): Promise<Result> {
  if (!checkoutEnabled()) {
    return { ok: false, error: 'Los pagos no están habilitados para el entorno configurado.' };
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { ok: false, error: 'Inicia sesión antes de pagar.' };
  if (!input || typeof input.checkoutKey !== 'string' || !uuidPattern.test(input.checkoutKey)) {
    return { ok: false, error: 'Identificador del pedido inválido.' };
  }
  if (input.termsAccepted !== true) {
    return { ok: false, error: 'Debes aceptar las condiciones de compra antes de pagar.' };
  }
  if (!isDeliveryMethod(input.deliveryMethod)) {
    return { ok: false, error: 'Selecciona envío o recogida presencial.' };
  }
  if (!Array.isArray(input.lines) || !input.lines.length || input.lines.length > 30 ||
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
  if ([...quantities.values()].some(qty => qty > 20)) {
    return { ok: false, error: 'Máximo 20 unidades por variante.' };
  }

  let order = await prisma.order.findUnique({
    where: { checkoutKey: input.checkoutKey },
    include: { items: true },
  });
  if (order && order.userId !== session.user.id) {
    return { ok: false, error: 'No se pudo validar el pedido.' };
  }
  if (order?.paymentStatus === 'PAID') {
    return { ok: false, error: 'Este pedido ya está pagado. Consúltalo en Mi cuenta.' };
  }

  if (order) {
    // No aceptar una clave antigua si el navegador cambió productos, notas o entrega.
    // Esto evita cobrar un pedido distinto al carrito que muestra la interfaz.
    const sameItems = order.items.length === quantities.size &&
      order.items.every(item => quantities.get(item.variantId) === item.quantity);
    if (!sameItems || order.customerNotes !== input.notes ||
        order.deliveryMethod !== input.deliveryMethod) {
      return { ok: false, error: 'El carrito cambió desde que se inició este pago. Vuelve a preparar tu pedido.' };
    }
  }

  if (!order) {
    const profile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) return { ok: false, error: 'Completa tus datos en Mi cuenta.' };

    const shippingRequired = input.deliveryMethod === 'SHIPPING';
    if (shippingRequired && (
      !profile.shippingAddress.trim() || !profile.shippingCity.trim() ||
      !profile.shippingProvince.trim() ||
      !isSupportedShippingAddress(profile.shippingPostalCode, profile.shippingCountry)
    )) {
      return { ok: false, error: 'Indica una dirección de Península o Baleares.' };
    }

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
        id: { in: [...quantities.keys()] }, active: true, priceCents: { gt: 0 },
        product: { status: 'ACTIVE', saleMode: 'DIRECT' },
      },
      include: { product: { select: { name: true } } },
    });
    if (variants.length !== quantities.size) {
      return { ok: false, error: 'Algún producto ya no está disponible.' };
    }

    const subtotal = variants.reduce(
      (sum, v) => sum + v.priceCents * quantities.get(v.id)!, 0,
    );
    const shipping = shippingCentsFor(input.deliveryMethod);
    const total = subtotal + shipping;
    if (!Number.isSafeInteger(subtotal) || subtotal <= 0 ||
        !Number.isSafeInteger(total) || total > 100000000) {
      return { ok: false, error: 'Total no válido.' };
    }
    const tax = splitIncludedVat(total);
    try {
      order = await prisma.order.create({
        data: {
          checkoutKey: input.checkoutKey,
          userId: session.user.id,
          customerName: session.user.name,
          customerEmail: session.user.email,
          customerPhone: profile.phone,
          shippingAddress: shippingRequired
            ? [profile.shippingAddress, profile.shippingPostalCode,
               profile.shippingCity, profile.shippingProvince,
               profile.shippingCountry].join(' | ')
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
          paymentStatus: 'PENDING',
          items: {
            create: variants.map(v => ({
              variantId: v.id,
              productName: v.product.name,
              variantLabel: v.label,
              sku: v.sku, material: v.material,
              color: v.color,
              unitPriceCents: v.priceCents,
              quantity: quantities.get(v.id)!,
              lineTotalCents: v.priceCents * quantities.get(v.id)!,
            })),
          },
          history: {
            create: {
              authorName: 'Sistema',
              previousStatus: null,
              newStatus: 'RECEIVED',
              publicMessage: 'Pedido creado · pago pendiente',
              internalNote: 'Condiciones de compra y envíos/devoluciones aceptadas en checkout (versión 2026-11-06).',
            },
          },
        },
        include: { items: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        order = await prisma.order.findUnique({
          where: { checkoutKey: input.checkoutKey },
          include: { items: true },
        });
        if (!order || order.userId !== session.user.id) {
          return { ok: false, error: 'No se pudo recuperar el pedido.' };
        }
        const sameItems = order.items.length === quantities.size &&
          order.items.every(item => quantities.get(item.variantId) === item.quantity);
        if (!sameItems || order.customerNotes !== input.notes ||
            order.deliveryMethod !== input.deliveryMethod) {
          return { ok: false, error: 'El carrito ya no coincide con el pedido anterior.' };
        }
      } else {
        console.error('Error creando pedido:', error);
        return { ok: false, error: 'No se pudo registrar el pedido.' };
      }
    }
  }

  if (order.paymentStatus === 'PAID') {
    return { ok: false, error: 'El pedido ya está pagado.' };
  }

  try {
    const stripe = getStripe();
    if (order.stripeCheckoutSessionId) {
      // Nunca consultar una sesión histórica de otro modo con la clave activa.
      if (!order.stripeCheckoutSessionId.startsWith(checkoutSessionPrefix())) {
        return { ok: false, error: 'Este pedido pertenece a otro entorno de pago. Consulta tus pedidos antes de volver a pagar.' };
      }
      const existing = await stripe.checkout.sessions.retrieve(order.stripeCheckoutSessionId);
      if (existing.status === 'open' && existing.url) {
        return { ok: true, url: existing.url };
      }
      // No generar una sesión nueva a ciegas: un evento de pago puede estar aún en tránsito.
      return { ok: false, error: 'La sesión de pago ha terminado. Consulta el estado del pedido antes de volver a pagar.' };
    }

    const items = order.items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: { name: `${item.productName} · ${item.variantLabel}`.slice(0, 127) },
        unit_amount: item.unitPriceCents,
      },
      quantity: item.quantity,
    }));
    if ((order.shippingCents ?? 0) > 0) {
      items.push({
        price_data: {
          currency: 'eur',
          product_data: { name: 'Envío con Correos' },
          unit_amount: order.shippingCents!,
        },
        quantity: 1,
      });
    }

    const baseUrl = checkoutBaseUrl();
    const stripeSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: order.customerEmail,
      client_reference_id: order.id,
      metadata: { orderId: order.id },
      payment_intent_data: { metadata: { orderId: order.id } },
      line_items: items,
      success_url: `${baseUrl}/pago/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/carrito?stripe_cancel=1`,
    }, { idempotencyKey: `pn3d-${getStripeMode()}-order-${order.id}` });

    if (!stripeSession.url) return { ok: false, error: 'Stripe no devolvió una URL de pago.' };
    await prisma.order.updateMany({
      where: { id: order.id, stripeCheckoutSessionId: null, paymentStatus: 'PENDING' },
      data: { stripeCheckoutSessionId: stripeSession.id },
    });
    return { ok: true, url: stripeSession.url };
  } catch (error) {
    console.error('No se pudo iniciar Stripe Checkout:', error);
    return { ok: false, error: 'No se pudo abrir el pago. Reinténtalo; no se ha cobrado nada.' };
  }
}
