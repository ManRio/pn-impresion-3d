import Link from 'next/link';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { submitQuote } from './actions';
import PrivacyNotice from '@/components/legal/PrivacyNotice';

export const metadata: Metadata = { title: 'Solicitar presupuesto' };
type Props = {
  searchParams: Promise<{ producto?: string; error?: string; ok?: string }>;
};
const field =
  'mt-2 w-full rounded-lg border border-white/20 bg-[#101319] p-3 text-white outline-none focus:border-[#B5FF67]';
export default async function BudgetPage({ searchParams }: Props) {
  const query = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  const p = query.producto
    ? await prisma.product.findFirst({
        where: { slug: query.producto, status: 'ACTIVE', saleMode: 'QUOTE' },
        select: { id: true, name: true, slug: true },
      })
    : null;
  return (
    <main className='mx-auto max-w-3xl px-5 py-14 text-white'>
      <p className='text-sm font-bold text-[#B5FF67]'>P&N · IMPRESIÓN 3D</p>
      <h1 className='mt-2 text-4xl font-black'>Solicitar presupuesto</h1>
      <p className='mt-3 text-white/60'>
        Cuéntanos qué necesitas y revisaremos tu solicitud.
      </p>
      {query.ok === '1' ? (
        <section
          role='status'
          className='mt-8 rounded-xl border border-[#B5FF67]/40 bg-[#B5FF67]/10 p-6'
        >
          <h2 className='font-bold text-[#B5FF67]'>Solicitud recibida</h2>
          <p className='mt-2 text-sm'>La hemos registrado correctamente.</p>
          {session && (
            <Link
              className='mt-3 inline-block text-[#B5FF67] underline'
              href='/mi-cuenta/mis-presupuestos'
            >
              Ver mis presupuestos
            </Link>
          )}
        </section>
      ) : (
        <>
          {query.error && (
            <p
              role='alert'
              className='mt-5 rounded-lg border border-red-500/40 p-3 text-sm text-red-200'
            >
              {query.error.slice(0, 160)}
            </p>
          )}
          {p && (
            <div className='mt-6 rounded-xl border border-[#B5FF67]/40 bg-[#B5FF67]/10 p-4'>
              <strong>Presupuesto para: {p.name}</strong>
              <p className='mt-1 text-xs text-white/60'>
                Producto identificado automáticamente. No necesitas repetirlo.
              </p>
            </div>
          )}
          {query.producto && !p && (
            <p
              role='alert'
              className='mt-5 rounded-lg border border-amber-400/40 p-3 text-amber-200'
            >
              El producto solicitado no está disponible para presupuestos.
              Puedes realizar una consulta general.
            </p>
          )}
          <form
            action={submitQuote}
            className='mt-7 space-y-5 rounded-xl border border-white/10 bg-[#1a211e] p-6'
          >
            <input type='hidden' name='productId' value={p?.id ?? ''} />
            <div className='hidden' aria-hidden='true'>
              <label>
                Deja este campo vacío
                <input tabIndex={-1} autoComplete='off' name='website' />
              </label>
            </div>
            <label className='block text-sm'>
              Nombre y apellidos
              <input
                className={field}
                name='customerName'
                defaultValue={session?.user.name ?? ''}
                required
                minLength={2}
                maxLength={120}
              />
            </label>
            <label className='block text-sm'>
              Correo electrónico
              <input
                className={field}
                name='email'
                type='email'
                defaultValue={session?.user.email ?? ''}
                required
                maxLength={254}
              />
            </label>
            <label className='block text-sm'>
              Describe tu proyecto
              <textarea
                className={field}
                name='notes'
                rows={6}
                required
                minLength={15}
                maxLength={5000}
                placeholder='Medidas, material, colores, cantidad, detalles...'
              />
            </label>
            <p className='text-xs text-white/60'>
              {session
                ? 'Tu solicitud quedará vinculada a tu cuenta.'
                : 'Puedes enviarla como invitado. Para consultar nuevas solicitudes desde tu cuenta, inicia sesión antes de enviarlas.'}
            </p>
            <PrivacyNotice context='quote' />
            <button className='rounded-lg bg-[#B5FF67] px-6 py-3 font-bold text-[#101319]'>
              Enviar solicitud
            </button>
          </form>
        </>
      )}
    </main>
  );
}
