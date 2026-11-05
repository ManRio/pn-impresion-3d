import 'server-only';

export type MailItem = { productName: string; variantLabel: string; quantity: number; lineTotalCents: number };
export type MailOrder = {
  id: string;
  customerName: string;
  customerEmail: string;
  totalCents: number;
  subtotalCents: number | null;
  shippingCents: number | null;
  vatCents: number | null;
  vatRatePercent: number | null;
  deliveryMethod: string | null;
  carrier: string | null;
  trackingNumber: string | null;
  items: MailItem[];
};
export type MailPayload = { recipient: string; subject: string; html: string };

const eur = (cents: number) => (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const ref = (order: MailOrder) => order.id.slice(-8).toUpperCase();
const baseUrl = () => process.env.BETTER_AUTH_URL?.replace(/\/$/, '') ?? 'https://pn3d.es';
const link = (path: string) => `${baseUrl()}${path}`;
const layout = (title: string, body: string) => `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;padding:28px;background:#101715;font-family:Arial,sans-serif;color:#f1f5f1"><div style="max-width:620px;margin:auto;background:#1a211e;border:1px solid #35433b;border-radius:16px;padding:28px"><p style="font-size:20px;color:#b5ff67;font-weight:bold">P&amp;N Impresión 3D</p><h1 style="font-size:23px">${escapeHtml(title)}</h1>${body}<hr style="border:0;border-top:1px solid #35433b;margin:28px 0"><p style="font-size:12px;color:#c3cdc5">Este correo es una comunicación relacionada con tu pedido. Puedes responder a info@pn3d.es.</p></div></body></html>`;
const items = (order: MailOrder) => `<ul>${order.items.map(i => `<li>${i.quantity} × ${escapeHtml(i.productName)} (${escapeHtml(i.variantLabel)}): ${eur(i.lineTotalCents)}</li>`).join('')}</ul>`;
const delivery = (order: MailOrder) => order.deliveryMethod === 'PICKUP' ? 'Recogida presencial gratuita' : 'Envío con Correos';

export function paidCustomerEmail(order: MailOrder): MailPayload {
  const subject = `Pago confirmado · Pedido #${ref(order)} · P&N Impresión 3D`;
  const subtotal = order.subtotalCents ?? order.items.reduce((n, i) => n + i.lineTotalCents, 0);
  const body = `<p>Hola ${escapeHtml(order.customerName)},</p><p>Hemos confirmado el pago de tu pedido <b>#${ref(order)}</b>. Gracias por tu compra.</p>${items(order)}<p>Productos: <b>${eur(subtotal)}</b><br>Envío: <b>${eur(order.shippingCents ?? 0)}</b><br>IVA incluido${order.vatRatePercent ? ` (${order.vatRatePercent} %)` : ''}: <b>${order.vatCents == null ? 'Pendiente de desglose' : eur(order.vatCents)}</b><br>Total pagado: <b>${eur(order.totalCents)}</b></p><p>Entrega: ${escapeHtml(delivery(order))}.</p><p>Consulta el estado en <a style="color:#b5ff67" href="${escapeHtml(link('/mi-cuenta/mis-pedidos'))}">Mis pedidos</a>.</p><p>Esta confirmación no sustituye la factura.</p>`;
  return { recipient: order.customerEmail, subject, html: layout('Pago confirmado', body) };
}
export function paidAdminEmail(order: MailOrder, recipient: string): MailPayload {
  const subject = `Nuevo pedido pagado #${ref(order)} · ${eur(order.totalCents)}`;
  const body = `<p>Nuevo pedido pagado en P&amp;N Impresión 3D.</p><p><b>Referencia:</b> #${ref(order)}<br><b>Cliente:</b> ${escapeHtml(order.customerName)}<br><b>Email:</b> ${escapeHtml(order.customerEmail)}<br><b>Entrega:</b> ${escapeHtml(delivery(order))}<br><b>Total:</b> ${eur(order.totalCents)}</p>${items(order)}<p><a style="color:#b5ff67" href="${escapeHtml(link('/admin/pedidos'))}">Abrir el panel de pedidos</a></p>`;
  return { recipient, subject, html: layout('Nuevo pedido pagado', body) };
}
export function orderStatusEmail(order: MailOrder, status: 'FINISHED' | 'SHIPPED'): MailPayload {
  const pickup = order.deliveryMethod === 'PICKUP';
  const title = status === 'SHIPPED' ? 'Tu pedido se ha enviado' : pickup ? 'Tu pedido está listo para recoger' : 'Tu pedido está terminado';
  const tracking = status === 'SHIPPED' && order.trackingNumber ? `<p>Transportista: ${escapeHtml(order.carrier ?? 'No indicado')}<br>Número de seguimiento: ${escapeHtml(order.trackingNumber)}</p>` : '';
  const text = status === 'SHIPPED' ? 'Ya hemos entregado tu pedido al transportista.' : pickup ? 'Tu pedido está preparado para recogida. Contacta con nosotros antes de desplazarte para acordar la entrega.' : 'La fabricación de tu pedido ha finalizado. Te avisaremos de los siguientes pasos de entrega.';
  const body = `<p>Hola ${escapeHtml(order.customerName)},</p><p>${escapeHtml(text)}</p><p>Pedido <b>#${ref(order)}</b>.</p>${tracking}<p><a style="color:#b5ff67" href="${escapeHtml(link('/mi-cuenta/mis-pedidos'))}">Consultar pedido</a></p>`;
  return { recipient: order.customerEmail, subject: `${title} · #${ref(order)} · P&N Impresión 3D`, html: layout(title, body) };
}
