import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { saveCustomerProfile } from './profile-actions';
import ProfileLogout from './ProfileLogout';
export const dynamic = 'force-dynamic';
const css =
  'mt-1 w-full rounded-lg border border-white/20 bg-[#101319] px-3 py-2.5 text-white outline-none focus:border-[#B5FF67]';
export default async function Account({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/mi-cuenta/acceso?next=%2Fmi-cuenta');
  const [profile, quotes, query] = await Promise.all([
    prisma.customerProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.quoteRequest.count({ where: { userId: session.user.id } }),
    searchParams,
  ]);
  const row = (
    name: string,
    label: string,
    value: string | undefined | null,
    required = false,
  ) => (
    <label key={name} className='block text-sm text-neutral-300'>
      {label}
      <input
        className={css}
        name={name}
        defaultValue={value ?? ''}
        maxLength={250}
        required={required}
      />
    </label>
  );
  return (
    <main className='mx-auto max-w-5xl px-5 py-12 text-white'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <p className='text-sm font-bold text-[#B5FF67]'>P&N · ÁREA PRIVADA</p>
          <h1 className='mt-2 text-3xl font-black'>
            Hola, {session.user.name}
          </h1>
          <p className='mt-1 text-sm text-white/60'>{session.user.email}</p>
        </div>
        <ProfileLogout />
      </div>
      <div className='mt-8 grid gap-4 sm:grid-cols-2'>
        <Link
          href='/mi-cuenta/mis-presupuestos'
          className='rounded-xl border border-white/15 bg-[#1a211e] p-5 hover:border-[#B5FF67]'
        >
          <h2 className='font-bold'>Mis presupuestos</h2>
          <p className='mt-2 text-2xl font-black text-[#B5FF67]'>{quotes}</p>
          <p className='text-xs text-white/60'>
            Consulta solicitudes y estados
          </p>
        </Link>
        <Link
          href='/mi-cuenta/mis-pedidos'
          className='rounded-xl border border-white/15 bg-[#1a211e] p-5 transition hover:border-[#B5FF67]'
        >
          <h2 className='font-bold'>Mis pedidos</h2>

          <p className='mt-2 text-sm text-white/60'>
            Consulta tus compras, su estado de fabricación y el seguimiento de
            los envíos.
          </p>

          <span className='mt-4 inline-block text-sm font-semibold text-[#B5FF67]'>
            Ver mis pedidos →
          </span>
        </Link>
      </div>
      {query.ok && (
        <p
          role='status'
          className='mt-6 rounded-lg border border-[#B5FF67]/40 p-3 text-[#B5FF67]'
        >
          Datos guardados correctamente.
        </p>
      )}
      {query.error && (
        <p
          role='alert'
          className='mt-6 rounded-lg border border-red-500/40 p-3 text-red-200'
        >
          {query.error}
        </p>
      )}
      <form action={saveCustomerProfile} className='mt-8 space-y-7'>
        <section className='rounded-xl border border-white/10 bg-[#1a211e] p-6'>
          <h2 className='mb-4 font-display text-xl font-bold'>
            Datos personales
          </h2>
          <div className='grid gap-4 sm:grid-cols-2'>
            {row('name', 'Nombre visible', session.user.name, true)}
            {row('phone', 'Teléfono', profile?.phone)}
            {row('firstName', 'Nombre', profile?.firstName)}
            {row('lastName', 'Apellidos', profile?.lastName)}
            {row('taxId', 'NIF / NIE (opcional)', profile?.taxId)}
          </div>
          <p className='mt-3 text-xs text-white/50'>
            El correo de acceso es {session.user.email}. No se modifica desde
            este formulario.
          </p>
        </section>
        <section className='rounded-xl border border-white/10 bg-[#1a211e] p-6'>
          <h2 className='mb-4 font-display text-xl font-bold'>
            Dirección de envío
          </h2>
          <div className='grid gap-4 sm:grid-cols-2'>
            {row(
              'shippingAddress',
              'Dirección y número',
              profile?.shippingAddress,
            )}
            {row(
              'shippingPostalCode',
              'Código postal',
              profile?.shippingPostalCode,
            )}
            {row('shippingCity', 'Población', profile?.shippingCity)}
            {row('shippingProvince', 'Provincia', profile?.shippingProvince)}
            {row(
              'shippingCountry',
              'País',
              profile?.shippingCountry || 'España',
            )}
          </div>
        </section>
        <section className='rounded-xl border border-white/10 bg-[#1a211e] p-6'>
          <h2 className='mb-4 font-display text-xl font-bold'>
            Dirección de facturación
          </h2>
          <p className='mb-4 text-xs text-white/60'>
            Si coincide con envío, puedes dejar estos campos vacíos de momento.
          </p>
          <div className='grid gap-4 sm:grid-cols-2'>
            {row(
              'billingAddress',
              'Dirección y número',
              profile?.billingAddress,
            )}
            {row(
              'billingPostalCode',
              'Código postal',
              profile?.billingPostalCode,
            )}
            {row('billingCity', 'Población', profile?.billingCity)}
            {row('billingProvince', 'Provincia', profile?.billingProvince)}
            {row('billingCountry', 'País', profile?.billingCountry || 'España')}
          </div>
        </section>
        <button className='rounded-lg bg-[#B5FF67] px-6 py-3 font-bold text-[#101319]'>
          Guardar mis datos
        </button>
      </form>
    </main>
  );
}
