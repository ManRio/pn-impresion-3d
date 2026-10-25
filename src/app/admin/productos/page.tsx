import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  await requireAdmin();
  const [products, params] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
        variants: { take: 1, orderBy: { createdAt: 'asc' } },
      },
    }),
    searchParams,
  ]);
  const money = (cents: number) =>
    (cents / 100).toLocaleString('es-ES', {
      style: 'currency',
      currency: 'EUR',
    });
  return (
    <main className='min-h-screen bg-[#101319] px-4 py-12 text-white'>
      <div className='mx-auto max-w-6xl'>
        <Link
          href='/admin'
          className='mb-8 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white'
        >
          <ArrowLeft size={16} /> Volver al panel
        </Link>
        <header className='mb-8 flex flex-wrap items-center justify-between gap-4'>
          <div>
            <p className='text-sm font-bold text-[#B5FF67]'>P&N · CATÁLOGO</p>
            <h1 className='font-display text-3xl font-extrabold'>PRODUCTOS</h1>
            <p className='mt-2 text-sm text-neutral-400'>
              Catálogo real en Neon
            </p>
          </div>
          <Link
            href='/admin/productos/nuevo'
            className='inline-flex items-center gap-2 rounded-lg bg-[#B5FF67] px-5 py-3 font-bold text-[#101319]'
          >
            <Plus size={18} /> Nuevo producto
          </Link>
        </header>
        {params.ok && (
          <p
            role='status'
            className='mb-5 rounded-lg border border-[#B5FF67]/30 bg-[#B5FF67]/10 px-4 py-3 text-sm text-[#D8FFC0]'
          >
            {params.ok.slice(0, 140)}
          </p>
        )}
        <div className='overflow-x-auto rounded-xl border border-white/10 bg-[#1a211e]'>
          {products.length === 0 ? (
            <p className='p-8 text-neutral-300'>
              Todavía no hay productos. Crea el primero.
            </p>
          ) : (
            <table className='w-full min-w-160 text-left text-sm'>
              <thead className='border-b border-white/10 text-neutral-400'>
                <tr>
                  <th className='p-4'>Producto</th>
                  <th className='p-4'>Categoría</th>
                  <th className='p-4'>Modalidad</th>
                  <th className='p-4'>Precio inicial</th>
                  <th className='p-4'>Estado</th>
                  <th className='p-4'>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className='border-b border-white/10'>
                    <td className='p-4'>
                      <p className='font-semibold'>{p.name}</p>
                      <p className='text-xs text-neutral-400'>{p.slug}</p>
                    </td>
                    <td className='p-4'>{p.category.name}</td>
                    <td className='p-4'>
                      {p.saleMode === 'DIRECT'
                        ? 'Venta directa'
                        : 'Presupuesto'}
                    </td>
                    <td className='p-4'>
                      {p.variants[0] ? money(p.variants[0].priceCents) : '—'}
                    </td>
                    <td className='p-4'>
                      {p.status === 'DRAFT'
                        ? 'Borrador'
                        : p.status === 'ACTIVE'
                          ? 'Activo'
                          : 'Archivado'}
                    </td>
                    <td className='px-5 py-4'>
                      <Link
                        href={`/admin/productos/${p.id}`}
                        className='inline-flex rounded-lg border border-white/20 px-3 py-2 text-sm hover:border-[#B5FF67]'
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
