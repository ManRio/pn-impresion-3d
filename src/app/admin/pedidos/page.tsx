import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';
import { updateOrder } from './actions';

export const dynamic = 'force-dynamic';

const states = ['RECEIVED', 'MANUFACTURING', 'FINISHED', 'SHIPPED'] as const;
const labels: Record<string, string> = {
  RECEIVED: 'Recibido',
  MANUFACTURING: 'En fabricación',
  FINISHED: 'Terminado',
  SHIPPED: 'Enviado',
};
const input = 'mt-1 w-full rounded-lg border border-white/20 bg-[#101319] p-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-45';
const eur = (cents: number) => (cents / 100).toLocaleString('es-ES', {
  style: 'currency', currency: 'EUR',
});

type SearchParams = Promise<{ ok?: string; error?: string }>;

export default async function OrdersAdmin({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const [orders, query] = await Promise.all([
    prisma.order.findMany({
      include: { items: true, history: { orderBy: { createdAt: 'desc' }, take: 100 } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    searchParams,
  ]);

  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <Link href="/admin" className="text-[#B5FF67]">← Administrador</Link>
      <h1 className="mt-4 text-3xl font-black">Gestión de pedidos</h1>
      <p className="mt-2 text-sm text-white/60">
        Últimos 100 pedidos · Stripe en modo de pruebas. Solo los pedidos con pago
        confirmado pueden avanzar a fabricación, terminado o enviado.
      </p>
      {query.error && (
        <p role="alert" className="mt-4 rounded-lg border border-red-400/30 p-3 text-red-300">
          {query.error}
        </p>
      )}
      {query.ok && <p role="status" className="mt-4 text-[#B5FF67]">Pedido actualizado</p>}

      <div className="mt-6 space-y-7">
        {orders.length === 0 && <p>No hay pedidos.</p>}
        {orders.map((order) => {
          const paid = order.paymentStatus === 'PAID';
          const productSubtotal = order.subtotalCents ?? order.items.reduce(
            (sum, item) => sum + item.lineTotalCents, 0,
          );

          return (
            <article
              id={`pedido-${order.id}`}
              key={order.id}
              className="scroll-mt-24 rounded-xl border border-white/15 bg-[#1a211e] p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold">
                    #{order.id.slice(-8).toUpperCase()} · {order.customerName}
                  </h2>
                  <p className="text-xs text-white/60">
                    {order.createdAt.toLocaleString('es-ES')} · {order.customerEmail}
                  </p>
                  <p className={`mt-2 text-sm font-semibold ${paid ? 'text-[#B5FF67]' : 'text-amber-200'}`}>
                    {paid ? 'Pago de prueba confirmado' :
                      order.paymentStatus === 'PENDING' ? 'Pago pendiente' :
                        `Pago: ${order.paymentStatus}`}
                  </p>
                </div>
                <span className="text-[#B5FF67]">{labels[order.status] ?? order.status}</span>
              </div>

              <p className="mt-4 text-sm">
                Entrega: {order.deliveryMethod === 'PICKUP' ? 'Recogida presencial' :
                  order.deliveryMethod === 'SHIPPING' ? 'Correos' : 'Sin clasificar'}
              </p>
              <p className="mt-1 text-sm">Dirección / recogida: {order.shippingAddress}</p>
              {order.customerPhone && <p className="text-sm">Teléfono: {order.customerPhone}</p>}
              <ul className="mt-4 space-y-1">
                {order.items.map((item) => (
                  <li key={item.id} className="text-sm">
                    {item.quantity} × {item.productName} · {item.variantLabel} — {eur(item.lineTotalCents)}
                  </li>
                ))}
              </ul>
              <div className="mt-3 space-y-1 text-sm">
                <p>Productos: {eur(productSubtotal)}</p>
                <p>Transporte: {order.shippingCents == null ? 'No desglosado' :
                  order.shippingCents === 0 ? 'Gratis' : eur(order.shippingCents)}</p>
                <p className="font-bold">Total del pedido: {eur(order.totalCents)}</p>
              </div>
              {order.customerNotes && (
                <p className="mt-3 rounded-lg bg-[#101319] p-3 text-sm">
                  Nota del cliente: {order.customerNotes}
                </p>
              )}
              {order.trackingNumber && (
                <p className="mt-3 text-sm">{order.carrier}: {order.trackingNumber}</p>
              )}

              <div className="mt-5 grid gap-6 md:grid-cols-2">
                <section>
                  <h3 className="font-bold">Historial interno</h3>
                  <ol className="mt-3 space-y-3">
                    {order.history.map((history) => (
                      <li key={history.id} className="rounded-lg border border-white/10 p-3 text-sm">
                        <p className="text-xs text-white/50">
                          {history.authorName} · {history.createdAt.toLocaleString('es-ES')} ·{' '}
                          {labels[history.newStatus] ?? history.newStatus}
                        </p>
                        {history.internalNote && (
                          <p className="mt-2 whitespace-pre-wrap">{history.internalNote}</p>
                        )}
                        {history.publicMessage && (
                          <p className="mt-1 text-[#B5FF67]">Cliente: {history.publicMessage}</p>
                        )}
                      </li>
                    ))}
                  </ol>
                </section>

                <form action={updateOrder} className="space-y-3 rounded-lg bg-[#101319] p-4">
                  <input type="hidden" name="id" value={order.id} />
                  {!paid && (
                    <p className="rounded-lg border border-amber-300/30 p-3 text-sm text-amber-200">
                      Pago sin confirmar: solo puedes conservar el estado Recibido y añadir notas.
                      No se permite iniciar fabricación ni enviar este pedido.
                    </p>
                  )}
                  <label className="block text-sm">
                    Estado
                    <select className={input} name="status" defaultValue={order.status}>
                      {states.map((state) => (
                        <option
                          key={state}
                          value={state}
                          disabled={!paid && state !== 'RECEIVED'}
                        >
                          {labels[state]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="text-xs text-white/60">
                    Para pasar a Enviado, indica transportista y seguimiento.
                  </p>
                  <label className="block text-sm">
                    Transportista
                    <input
                      name="carrier"
                      maxLength={100}
                      className={input}
                      defaultValue={order.carrier ?? ''}
                    />
                  </label>
                  <label className="block text-sm">
                    Número de seguimiento
                    <input
                      name="tracking"
                      maxLength={150}
                      className={input}
                      defaultValue={order.trackingNumber ?? ''}
                    />
                  </label>
                  <label className="block text-sm">
                    Nota interna
                    <textarea
                      name="note"
                      rows={3}
                      maxLength={4000}
                      className={input}
                      placeholder="Producción, incidencias, observaciones..."
                    />
                  </label>
                  <label className="block text-sm">
                    Mensaje visible al cliente (opcional)
                    <textarea
                      name="publicMessage"
                      rows={2}
                      maxLength={500}
                      className={input}
                    />
                  </label>
                  <button className="rounded-lg bg-[#B5FF67] px-5 py-3 font-bold text-[#101319]">
                    Guardar gestión
                  </button>
                </form>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
