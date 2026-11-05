import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';
import DetailToggle from '@/components/admin/DetailToggle';
import { updateOrder } from './actions';

export const dynamic = 'force-dynamic';

const states = ['RECEIVED', 'MANUFACTURING', 'FINISHED', 'SHIPPED'] as const;
const labels: Record<string, string> = {
  RECEIVED: 'Recibido', MANUFACTURING: 'En fabricación', FINISHED: 'Terminado', SHIPPED: 'Enviado',
};
const input = 'mt-1 w-full rounded-lg border border-white/20 bg-[#101319] p-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-45';
const eur = (cents: number) => (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
const PAGE_SIZE = 25;
type Query = { ok?: string; error?: string; q?: string; payment?: string; status?: string; page?: string };
type Props = { searchParams: Promise<Query> };

function listUrl(query: Query, page: number) {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.payment && query.payment !== 'ALL') params.set('payment', query.payment);
  if (query.status && query.status !== 'ALL') params.set('status', query.status);
  params.set('page', String(page));
  return `/admin/pedidos?${params.toString()}`;
}

export default async function OrdersAdmin({ searchParams }: Props) {
  await requireAdmin();
  const query = await searchParams;
  const search = (query.q ?? '').trim().slice(0, 100);
  const payment = ['ALL', 'PAID', 'PENDING'].includes(query.payment ?? '') ? query.payment! : 'ALL';
  const status = states.includes(query.status as (typeof states)[number]) ? query.status! : 'ALL';
  const requestedPage = Number(query.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const where = {
    ...(payment !== 'ALL' ? { paymentStatus: payment } : {}),
    ...(status !== 'ALL' ? { status: status as (typeof states)[number] } : {}),
    ...(search ? { OR: [
      { id: { contains: search, mode: 'insensitive' as const } },
      { customerName: { contains: search, mode: 'insensitive' as const } },
      { customerEmail: { contains: search, mode: 'insensitive' as const } },
    ] } : {}),
  };
  const total = await prisma.order.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const orders = await prisma.order.findMany({
    where,
    include: { items: true, history: { orderBy: { createdAt: 'desc' }, take: 100 } },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 text-white sm:px-6">
      <Link href="/admin" className="text-sm text-[#B5FF67]">← Administrador</Link>
      <h1 className="mt-4 text-3xl font-black">Gestión de pedidos</h1>
      <p className="mt-2 text-sm text-white/60">Listado de pedidos · pagos Stripe en pruebas. Abre cada fila para consultar y gestionar sus datos.</p>
      {query.error && <p role="alert" className="mt-4 rounded-lg border border-red-400/30 p-3 text-red-300">{query.error.slice(0, 200)}</p>}
      {query.ok && <p role="status" className="mt-4 text-[#B5FF67]">Pedido actualizado</p>}

      <form method="GET" className="mt-7 flex flex-wrap items-end gap-3 rounded-xl border border-white/15 bg-[#1a211e] p-4">
        <label className="min-w-48 flex-1 text-xs text-white/70">Buscar pedido, cliente o email
          <input type="search" name="q" maxLength={100} defaultValue={search} placeholder="Referencia, nombre o email" className={input} />
        </label>
        <label className="text-xs text-white/70">Pago
          <select name="payment" defaultValue={payment} className={input}>
            <option value="ALL">Todos</option><option value="PAID">Pagados</option><option value="PENDING">Pendientes</option>
          </select>
        </label>
        <label className="text-xs text-white/70">Producción
          <select name="status" defaultValue={status} className={input}>
            <option value="ALL">Todos</option>{states.map(s => <option key={s} value={s}>{labels[s]}</option>)}
          </select>
        </label>
        <button type="submit" className="rounded-lg bg-[#B5FF67] px-5 py-3 text-sm font-bold text-[#101319]">Filtrar</button>
        <Link href="/admin/pedidos" className="rounded-lg border border-white/20 px-4 py-3 text-sm">Limpiar</Link>
      </form>
      <p className="mt-4 text-sm text-white/60">{total} {total === 1 ? 'pedido' : 'pedidos'} · Página {currentPage} de {totalPages}</p>

      <div className="mt-3 overflow-x-auto rounded-xl border border-white/15 bg-[#1a211e]">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-[#101715] text-xs uppercase tracking-wide text-white/60">
            <tr><th scope="col" className="px-4 py-4">Pedido / fecha</th><th scope="col" className="px-4 py-4">Cliente</th><th scope="col" className="px-4 py-4">Pago</th><th scope="col" className="px-4 py-4">Estado</th><th scope="col" className="px-4 py-4">Entrega</th><th scope="col" className="px-4 py-4 text-right">Total</th><th scope="col" className="px-4 py-4 text-right">Detalle</th></tr>
          </thead>
          {orders.map(order => {
            const paid = order.paymentStatus === 'PAID';
            const subtotal = order.subtotalCents ?? order.items.reduce((sum, item) => sum + item.lineTotalCents, 0);
            return (
              <tbody key={order.id} id={`pedido-${order.id}`} className="border-t border-white/10">
                <tr className="align-middle hover:bg-white/[0.03]">
                  <td className="px-4 py-3"><span className="font-semibold">#{order.id.slice(-8).toUpperCase()}</span><span className="mt-1 block text-xs text-white/50">{order.createdAt.toLocaleDateString('es-ES')}</span></td>
                  <td className="px-4 py-3"><span className="font-medium">{order.customerName}</span><span className="mt-1 block max-w-56 truncate text-xs text-white/50" title={order.customerEmail}>{order.customerEmail}</span></td>
                  <td className="px-4 py-3"><span className={paid ? 'font-semibold text-[#B5FF67]' : 'font-semibold text-amber-200'}>{paid ? 'Pagado' : order.paymentStatus === 'PENDING' ? 'Pendiente' : order.paymentStatus}</span></td>
                  <td className="px-4 py-3">{labels[order.status] ?? order.status}</td>
                  <td className="px-4 py-3">{order.deliveryMethod === 'PICKUP' ? 'Recogida' : order.deliveryMethod === 'SHIPPING' ? 'Correos' : 'Sin clasificar'}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{eur(order.totalCents)}</td>
                  <td className="px-4 py-3 text-right"><DetailToggle detailId={`detalle-${order.id}`} /></td>
                </tr>
                <tr><td colSpan={7} className="p-0"><details id={`detalle-${order.id}`} className="group border-t border-white/10 bg-[#121a16]">
                  <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-[#B5FF67] hover:bg-white/5">Abrir / cerrar ficha del pedido #{order.id.slice(-8).toUpperCase()} <span className="inline-block transition-transform group-open:rotate-180">⌄</span></summary>
                  <div className="space-y-5 border-t border-white/10 p-5">
                    <div className="flex flex-wrap justify-between gap-4"><div><h2 className="text-xl font-bold">Pedido #{order.id.slice(-8).toUpperCase()}</h2><p className="mt-1 text-sm text-white/60">{order.createdAt.toLocaleString('es-ES')} · {order.customerName} · {order.customerEmail}</p></div><p className={paid ? 'font-semibold text-[#B5FF67]' : 'font-semibold text-amber-200'}>{paid ? 'Pago de prueba confirmado' : 'Pago sin confirmar'}</p></div>
                    <div className="grid gap-2 text-sm sm:grid-cols-2"><p>Entrega: {order.deliveryMethod === 'PICKUP' ? 'Recogida presencial' : order.deliveryMethod === 'SHIPPING' ? 'Correos' : 'Sin clasificar'}</p><p>Teléfono: {order.customerPhone || 'No indicado'}</p><p className="break-words">Dirección / recogida: {order.shippingAddress}</p><p className="break-words">Facturación: {order.billingAddress}</p></div>
                    <div><h3 className="font-bold">Artículos</h3><ul className="mt-2 space-y-2">{order.items.map(item => <li key={item.id} className="flex flex-wrap justify-between gap-2 border-b border-white/10 pb-2 text-sm"><span>{item.quantity} × {item.productName} · {item.variantLabel} ({item.sku})</span><span>{eur(item.lineTotalCents)}</span></li>)}</ul><div className="mt-3 space-y-1 text-sm"><p>Productos: {eur(subtotal)}</p><p>Transporte: {order.shippingCents == null ? 'No desglosado' : order.shippingCents === 0 ? 'Gratis' : eur(order.shippingCents)}</p>{order.vatCents != null && <p>IVA incluido ({order.vatRatePercent ?? 21} %): {eur(order.vatCents)}</p>}<p className="font-bold">Total: {eur(order.totalCents)}</p></div></div>
                    {order.customerNotes && <p className="rounded-lg bg-[#101319] p-3 text-sm">Nota del cliente: {order.customerNotes}</p>}
                    {order.trackingNumber && <p className="text-sm">Seguimiento: {order.carrier} · {order.trackingNumber}</p>}
                    <div className="grid gap-6 lg:grid-cols-2">
                      <section><h3 className="font-bold">Historial interno</h3><ol className="mt-3 space-y-3">{order.history.map(history => <li key={history.id} className="rounded-lg border border-white/10 p-3 text-sm"><p className="text-xs text-white/50">{history.authorName} · {history.createdAt.toLocaleString('es-ES')} · {labels[history.newStatus] ?? history.newStatus}</p>{history.internalNote && <p className="mt-2 whitespace-pre-wrap break-words">{history.internalNote}</p>}{history.publicMessage && <p className="mt-1 text-[#B5FF67]">Cliente: {history.publicMessage}</p>}</li>)}</ol></section>
                      <form action={updateOrder} className="space-y-3 rounded-lg bg-[#101319] p-4"><h3 className="font-bold">Gestionar pedido</h3><input type="hidden" name="id" value={order.id}/>{!paid && <p className="rounded-lg border border-amber-300/30 p-3 text-sm text-amber-200">Pago sin confirmar: solo puedes conservar el estado Recibido y añadir notas.</p>}
                        <label className="block text-sm">Estado<select className={input} name="status" defaultValue={order.status}>{states.map(state => <option key={state} value={state} disabled={!paid && state !== 'RECEIVED'}>{labels[state]}</option>)}</select></label>
                        <p className="text-xs text-white/60">Para pasar a Enviado, indica transportista y seguimiento.</p>
                        <label className="block text-sm">Transportista<input name="carrier" maxLength={100} className={input} defaultValue={order.carrier ?? ''}/></label>
                        <label className="block text-sm">Número de seguimiento<input name="tracking" maxLength={150} className={input} defaultValue={order.trackingNumber ?? ''}/></label>
                        <label className="block text-sm">Nota interna<textarea name="note" rows={3} maxLength={4000} className={input} placeholder="Producción, incidencias, observaciones..."/></label>
                        <label className="block text-sm">Mensaje visible al cliente (opcional)<textarea name="publicMessage" rows={2} maxLength={500} className={input}/></label>
                        <button className="rounded-lg bg-[#B5FF67] px-5 py-3 font-bold text-[#101319]">Guardar gestión</button>
                      </form>
                    </div>
                  </div>
                </details></td></tr>
              </tbody>
            );
          })}
          {orders.length === 0 && <tbody><tr><td colSpan={7} className="px-4 py-10 text-center text-white/60">No hay pedidos con estos filtros.</td></tr></tbody>}
        </table>
      </div>
      <nav aria-label="Paginación de pedidos" className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm"><span className="text-white/60">Mostrando {orders.length} de {total} pedidos</span><div className="flex gap-2">{currentPage > 1 && <Link href={listUrl(query, currentPage - 1)} className="rounded-lg border border-white/20 px-4 py-2">← Anterior</Link>}{currentPage < totalPages && <Link href={listUrl(query, currentPage + 1)} className="rounded-lg border border-white/20 px-4 py-2">Siguiente →</Link>}</div></nav>
    </main>
  );
}
