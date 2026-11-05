'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { OrderStatus } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';

const statuses: OrderStatus[] = ['RECEIVED', 'MANUFACTURING', 'FINISHED', 'SHIPPED'];
const field = (form: FormData, key: string) => {
  const value = form.get(key);
  return typeof value === 'string' ? value.trim() : '';
};

const statusLabels: Record<OrderStatus, string> = {
  RECEIVED: 'Pedido recibido',
  MANUFACTURING: 'En fabricación',
  FINISHED: 'Pedido terminado',
  SHIPPED: 'Pedido enviado',
};

type UpdateResult = { ok: true } | { ok: false; error: string };

export async function updateOrder(form: FormData) {
  const admin = await requireAdmin();
  const id = field(form, 'id');
  const rawStatus = field(form, 'status');
  const note = field(form, 'note');
  const carrier = field(form, 'carrier');
  const tracking = field(form, 'tracking');
  const visible = field(form, 'publicMessage');

  if (!id || !statuses.includes(rawStatus as OrderStatus)) {
    redirect('/admin/pedidos?error=Estado%20o%20pedido%20no%20valido');
  }
  if (note.length > 4000 || visible.length > 500 ||
      carrier.length > 100 || tracking.length > 150) {
    redirect('/admin/pedidos?error=Campo%20demasiado%20largo');
  }

  const status = rawStatus as OrderStatus;
  if (status === 'SHIPPED' && (!carrier || !tracking)) {
    redirect('/admin/pedidos?error=Indica%20transportista%20y%20seguimiento');
  }

  // La comprobación del pago y el cambio de estado se ejecutan en la misma
  // transacción. updateMany comprueba paymentStatus justo al escribir.
  const result: UpdateResult = await prisma.$transaction(async (tx) => {
    const previous = await tx.order.findUnique({
      where: { id },
      select: {
        status: true,
        paymentStatus: true,
        carrier: true,
        trackingNumber: true,
      },
    });
    if (!previous) return { ok: false, error: 'Pedido no encontrado' };

    // Solo RECEIVED está permitido sin pago. También permite devolver un pedido
    // antiguo sin pagar a RECEIVED para corregirlo sin seguir tramitándolo.
    if (status !== 'RECEIVED' && previous.paymentStatus !== 'PAID') {
      return { ok: false, error: 'No se puede tramitar un pedido sin pago confirmado' };
    }

    const shippingUpdate = status === 'SHIPPED' && (
      previous.carrier !== carrier || previous.trackingNumber !== tracking
    );
    const statusChanged = previous.status !== status;
    const changed = statusChanged || shippingUpdate;
    if (!changed && !note && !visible) {
      return { ok: false, error: 'Sin cambios' };
    }

    // Esta condición evita que otra operación invalide nuestro dato leído.
    const changedRows = await tx.order.updateMany({
      where: {
        id,
        status: previous.status,
        ...(status !== 'RECEIVED' ? { paymentStatus: 'PAID' } : {}),
      },
      data: {
        status,
        ...(status === 'SHIPPED' ? { carrier, trackingNumber: tracking } : {}),
      },
    });
    if (changedRows.count !== 1) {
      return { ok: false, error: 'El pedido ha cambiado; recarga y vuelve a intentarlo' };
    }

    await tx.orderHistory.create({
      data: {
        orderId: id,
        authorId: admin.id,
        authorName: admin.name,
        previousStatus: previous.status,
        newStatus: status,
        internalNote: note || null,
        publicMessage: visible || (statusChanged ? statusLabels[status] : null),
      },
    });
    return { ok: true };
  });

  if (!result.ok) {
    redirect(`/admin/pedidos?error=${encodeURIComponent(result.error)}#pedido-${encodeURIComponent(id)}`);
  }

  revalidatePath('/admin/pedidos');
  revalidatePath('/mi-cuenta/mis-pedidos');
  redirect(`/admin/pedidos?ok=1#pedido-${encodeURIComponent(id)}`);
}
