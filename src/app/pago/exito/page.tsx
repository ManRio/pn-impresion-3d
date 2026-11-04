import Link from 'next/link';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ConfirmPaidCart from './ConfirmPaidCart';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Estado del pago',
  robots: { index: false, follow: false },
};

export default async function PaymentResult({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { session_id } = await searchParams;
  const order =
    session && session_id?.startsWith('cs_test_')
      ? await prisma.order.findFirst({
          where: {
            userId: session.user.id,
            stripeCheckoutSessionId: session_id,
          },
          select: { id: true, checkoutKey: true, paymentStatus: true },
        })
      : null;
  const paid = order?.paymentStatus === 'PAID';
  return (
    <main className='mx-auto max-w-3xl px-5 py-16 text-white'>
      <h1 className='text-3xl font-black'>
        {paid ? 'Pago confirmado' : 'Estado del pago'}
      </h1>
      {paid ? (
        <>
          <ConfirmPaidCart checkoutKey={order.checkoutKey} />
          <p className='mt-4 text-white/75'>
            Tu pago de prueba está confirmado y el pedido figura como pagado.
          </p>
          <p className='mt-3'>
            Referencia: #{order.id.slice(-8).toUpperCase()}
          </p>
        </>
      ) : (
        <>
          <p className='mt-4 text-white/75'>
            El pago todavía no aparece confirmado en el servidor. Puede que
            Stripe esté procesando la notificación. No vuelvas a pagar sin
            comprobar primero tus pedidos.
          </p>
        </>
      )}
      <div className='mt-6 flex flex-wrap gap-4'>
        <Link
          className='text-[#B5FF67] underline'
          href='/mi-cuenta/mis-pedidos'
        >
          Mis pedidos
        </Link>
        <Link
          className='text-[#B5FF67] underline'
          href={`/pago/exito?session_id=${encodeURIComponent(session_id ?? '')}`}
        >
          Comprobar de nuevo
        </Link>
      </div>
    </main>
  );
}
