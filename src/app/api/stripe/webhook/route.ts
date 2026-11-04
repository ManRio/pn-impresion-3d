import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret?.startsWith('whsec_')) {
    return NextResponse.json({ error: 'Configuración incompleta' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const payload = await request.text(); // El cuerpo original es obligatorio.
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: 'Firma no válida' }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed' &&
      event.type !== 'checkout.session.async_payment_succeeded') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (event.livemode || session.livemode || session.mode !== 'payment' ||
      session.payment_status !== 'paid' || session.currency?.toLowerCase() !== 'eur') {
    return NextResponse.json({ received: true });
  }

  const orderId = session.metadata?.orderId;
  if (!orderId || !Number.isSafeInteger(session.amount_total) || !session.id.startsWith('cs_test_')) {
    return NextResponse.json({ error: 'Sesión incorrecta' }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, totalCents: true, paymentStatus: true,
        stripeCheckoutSessionId: true },
    });
    if (!order || order.stripeCheckoutSessionId !== session.id ||
        order.totalCents !== session.amount_total) {
      return NextResponse.json({ error: 'Pedido o importe no coincidente' }, { status: 409 });
    }

    const intentId = typeof session.payment_intent === 'string'
      ? session.payment_intent : session.payment_intent?.id ?? null;

    // La condición garantiza que los reintentos de Stripe no duplican el efecto.
    await prisma.order.updateMany({
      where: { id: order.id, paymentStatus: { not: 'PAID' },
        stripeCheckoutSessionId: session.id },
      data: { paymentStatus: 'PAID', paidAt: new Date(),
        stripePaymentIntentId: intentId },
    });
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error persistiendo pago de Stripe:', error);
    return NextResponse.json({ error: 'No se pudo actualizar el pedido' }, { status: 500 });
  }
}
