import Link from 'next/link';
import { Package, Layers, Calculator, ClipboardList } from 'lucide-react';

import { requireAdmin } from '@/lib/require-admin';
import { prisma } from '@/lib/prisma';
import LogoutButton from './LogoutButton';

export default async function AdminPage() {
  const user = await requireAdmin();

  const [products, categories, quotes] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.quoteRequest.count(),
  ]);

  const stats = [
    { label: 'Productos', value: products, icon: Package },
    { label: 'Categorías', value: categories, icon: Layers },
    { label: 'Presupuestos', value: quotes, icon: ClipboardList },
  ];

  return (
    <main className='min-h-screen bg-[#101319] px-5 py-12 text-white'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-10 flex flex-wrap items-start justify-between gap-5'>
          <div>
            <p className='mb-2 font-display text-sm font-semibold text-[#B5FF67]'>
              P&N · ADMINISTRACIÓN
            </p>

            <h1 className='font-display text-3xl font-extrabold'>
              PANEL DE CONTROL
            </h1>

            <p className='mt-3 text-neutral-400'>Bienvenido, {user.name}.</p>
          </div>

          <LogoutButton />
        </div>

        <div className='grid gap-5 md:grid-cols-3'>
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className='rounded-xl border border-white/10 bg-[#1a211e] p-6'
            >
              <Icon className='mb-5 text-[#B5FF67]' size={27} />

              <p className='text-sm text-neutral-400'>{label}</p>

              <p className='mt-2 font-display text-4xl font-bold'>{value}</p>
            </div>
          ))}
        </div>

        <section className='mt-10 rounded-xl border border-white/10 bg-[#1a211e] p-7'>
          <h2 className='font-display text-xl font-bold'>
            GESTIÓN DE LA TIENDA
          </h2>

          <p className='mt-3 text-sm text-neutral-400'>
            La autenticación ya está integrada. El módulo de gestión de
            productos será nuestro siguiente desarrollo.
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <span className='rounded-lg bg-[#B5FF67]/10 px-4 py-3 text-sm font-semibold text-[#B5FF67]'>
              Productos · Próximamente
            </span>

            <span className='rounded-lg bg-white/5 px-4 py-3 text-sm text-neutral-300'>
              Categorías · Próximamente
            </span>

            <span className='flex items-center gap-2 rounded-lg bg-white/5 px-4 py-3 text-sm text-neutral-300'>
              <Calculator size={17} />
              Configuración de precios
            </span>
          </div>
        </section>

        <Link
          href='/'
          className='mt-8 inline-block text-sm text-neutral-400 hover:text-white'
        >
          ← Volver a la tienda
        </Link>
      </div>
    </main>
  );
}
