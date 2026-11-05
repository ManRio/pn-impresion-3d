import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const statusLabels: Record<string, string> = {
  RECEIVED: 'Recibido',
  MANUFACTURING: 'En fabricación',
  FINISHED: 'Terminado',
  SHIPPED: 'Enviado',
};

const euros = (cents: number) =>
  (cents / 100).toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
  });

// El texto histórico sigue intacto en Neon. Solo evitamos mostrar
// «pago pendiente» como si fuera el estado actual de un pedido pagado.
function visibleHistoryMessage(message: string, paid: boolean): string {
  if (
    paid &&
    /^Pedido creado\s*[·–-]\s*pago pendiente$/i.test(message.trim())
  ) {
    return 'Pedido registrado';
  }
  return message;
}

export default async function MyOrders() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect('/mi-cuenta/acceso?next=%2Fmi-cuenta%2Fmis-pedidos');
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: true,
      history: {
        where: { publicMessage: { not: null } },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <main className='mx-auto max-w-5xl px-5 py-14'>
      <h1 className='text-3xl font-bold'>Mis pedidos</h1>
      <p className='mt-2 text-sm text-white/60'>
        Consulta tus pedidos, el estado del pago y su seguimiento. Actualmente
        los pagos online son únicamente de prueba.
      </p>

      <div className='mt-7 space-y-5'>
        {orders.length === 0 && (
          <p>
            Aún no tienes pedidos.{' '}
            <Link href='/tienda' className='text-[#B5FF67] underline'>
              Ver tienda
            </Link>
          </p>
        )}

        {orders.map((order) => {
          const paid = order.paymentStatus === 'PAID';
          const paymentText = paid
            ? 'Pago de prueba confirmado'
            : order.paymentStatus === 'PENDING'
              ? 'Pago pendiente'
              : `Estado del pago: ${order.paymentStatus}`;

          return (
            <article
              key={order.id}
              className='rounded-xl border border-white/15 bg-[#1a211e] p-5'
            >
              <div className='flex flex-wrap justify-between gap-2'>
                <h2 className='font-bold'>
                  Pedido #{order.id.slice(-8).toUpperCase()}
                </h2>
                <span className='text-[#B5FF67]'>
                  {statusLabels[order.status] ?? order.status}
                </span>
              </div>

              <p className='mt-1 text-xs text-white/60'>
                {order.createdAt.toLocaleString('es-ES')} ·{' '}
                <span className={paid ? 'text-[#B5FF67]' : 'text-amber-200'}>
                  {paymentText}
                </span>
              </p>

              <ul className='mt-4 space-y-2'>
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className='flex justify-between gap-3 text-sm'
                  >
                    <span>
                      {item.quantity} × {item.productName} — {item.variantLabel}
                    </span>
                    <span>{euros(item.lineTotalCents)}</span>
                  </li>
                ))}
              </ul>

              <div className='mt-4 space-y-1 border-t border-white/10 pt-3 text-sm'>
                <div className='flex justify-between gap-3'>
                  <span>Productos</span>
                  <span>
                    {euros(
                      order.subtotalCents ??
                        order.items.reduce(
                          (sum, item) => sum + item.lineTotalCents,
                          0,
                        ),
                    )}
                  </span>
                </div>
                <div className='flex justify-between gap-3'>
                  <span>
                    {order.deliveryMethod === 'PICKUP'
                      ? 'Recogida presencial'
                      : 'Envío'}
                  </span>
                  <span>
                    {order.shippingCents == null
                      ? 'No desglosado'
                      : order.shippingCents === 0
                        ? 'Gratis'
                        : euros(order.shippingCents)}
                  </span>
                </div>
                <div className='flex justify-between gap-3 pt-2 font-bold'>
                  <span>Total del pedido</span>
                  <span>{euros(order.totalCents)}</span>
                </div>
              </div>

              {order.customerNotes && (
                <p className='mt-3 whitespace-pre-wrap text-sm text-white/70'>
                  Tu nota: {order.customerNotes}
                </p>
              )}

              {order.status === 'SHIPPED' && (
                <div className='mt-4 rounded-lg border border-[#B5FF67]/30 p-3 text-sm'>
                  Transportista: {order.carrier || 'Pendiente'} · Seguimiento:{' '}
                  {order.trackingNumber || 'Pendiente'}
                </div>
              )}

              <h3 className='mt-5 text-sm font-semibold'>Seguimiento</h3>
              <ol className='mt-2 space-y-1 text-xs text-white/65'>
                {order.history.map((entry) => (
                  <li key={entry.id}>
                    {entry.createdAt.toLocaleString('es-ES')}:{' '}
                    {visibleHistoryMessage(entry.publicMessage ?? '', paid)}
                  </li>
                ))}
              </ol>
            </article>
          );
        })}
      </div>
    </main>
  );
}
