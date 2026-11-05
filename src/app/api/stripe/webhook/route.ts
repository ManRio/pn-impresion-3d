import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';
import { queuePaidEmails } from '@/lib/email/queue';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret?.startsWith('whsec_')) {
    return NextResponse.json({ error: 'Configuración incompleta' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const payload = await request.text();
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
    const result = await prisma.$transaction(async tx => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: { id: true, totalCents: true, stripeCheckoutSessionId: true },
      });
      if (!order || order.stripeCheckoutSessionId !== session.id ||
          order.totalCents !== session.amount_total) return 'mismatch';

      const intentId = typeof session.payment_intent === 'string'
        ? session.payment_intent : session.payment_intent?.id ?? null;

      const updated = await tx.order.updateMany({
        where: { id: order.id, paymentStatus: { not: 'PAID' },
          stripeCheckoutSessionId: session.id },
        data: { paymentStatus: 'PAID', paidAt: new Date(),
          stripePaymentIntentId: intentId },
      });
      if (updated.count === 1) {
        // La confirmación y las notificaciones pendientes se guardan de forma atómica.
        // Un fallo de Resend nunca deshace el cobro.
        await queuePaidEmails(tx, order.id);
      }
      return 'ok';
    });
    if (result === 'mismatch') return NextResponse.json({ error: 'Pedido o importe no coincidente' }, { status: 409 });
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error registrando el pago y sus notificaciones:', error);
    return NextResponse.json({ error: 'No se pudo procesar el pago' }, { status: 500 });
  }
}
