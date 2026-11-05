import 'server-only';
import type { Prisma } from '@/generated/prisma/client';
import { paidAdminEmail, paidCustomerEmail, orderStatusEmail, type MailOrder, type MailPayload } from './templates';

export const mailOrderSelect = {
  id: true, customerName: true, customerEmail: true, totalCents: true,
  subtotalCents: true, shippingCents: true, vatCents: true, vatRatePercent: true,
  deliveryMethod: true, carrier: true, trackingNumber: true,
  items: { select: { productName: true, variantLabel: true, quantity: true, lineTotalCents: true } },
} as const;

type DbTx = Prisma.TransactionClient;

function notificationsEnabled() {
  return process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true';
}

function payloadRow(orderId: string, dedupeKey: string, kind: string, payload: MailPayload) {
  return { id: crypto.randomUUID(), orderId, dedupeKey, kind, recipient: payload.recipient, subject: payload.subject, html: payload.html };
}

export async function queuePaidEmails(tx: DbTx, orderId: string): Promise<void> {
  if (!notificationsEnabled()) return;
  const order = await tx.order.findUnique({ where: { id: orderId }, select: { ...mailOrderSelect, paymentStatus: true } });
  if (!order || order.paymentStatus !== 'PAID') return;
  const adminTo = process.env.EMAIL_ADMIN_TO?.trim();
  const rows = [payloadRow(order.id, `paid-customer:${order.id}`, 'PAID_CUSTOMER', paidCustomerEmail(order as MailOrder))];
  if (adminTo) rows.push(payloadRow(order.id, `paid-admin:${order.id}`, 'PAID_ADMIN', paidAdminEmail(order as MailOrder, adminTo)));
  await tx.emailNotification.createMany({ data: rows, skipDuplicates: true });
}

export async function queueStatusEmail(tx: DbTx, orderId: string, status: 'FINISHED' | 'SHIPPED', historyId: string): Promise<void> {
  if (!notificationsEnabled()) return;
  const order = await tx.order.findUnique({ where: { id: orderId }, select: { ...mailOrderSelect, paymentStatus: true } });
  if (!order || order.paymentStatus !== 'PAID') return;
  const payload = orderStatusEmail(order as MailOrder, status);
  await tx.emailNotification.createMany({ data: [payloadRow(order.id, `status:${historyId}`, `STATUS_${status}`, payload)], skipDuplicates: true });
}
