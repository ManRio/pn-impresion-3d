import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { storeProducts } from '@/lib/store-products';
import StoreCard from '@/components/StoreCard';
import { categoryGroups } from '@/lib/category-tree';
export const metadata: Metadata = {
  title: 'Tienda',
  description: 'Compra figuras, regalos, decoración y piezas impresas en 3D. Productos bajo demanda y personalizados en P&N Impresión 3D.',
  alternates: { canonical: '/tienda' },
};
export const dynamic = 'force-dynamic';
export default async function Tienda({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const [products, categories] = await Promise.all([
    storeProducts(categoria),
    prisma.category.findMany({
      select: { id: true, name: true, slug: true, parentId: true },
      orderBy: { name: 'asc' },
    }),
  ]);
  const groups = categoryGroups(categories);
  const selected = categories.find((c) => c.slug === categoria);
  const activeGroup = selected?.parentId
    ? groups.find((g) => g.root.id === selected.parentId)
    : groups.find((g) => g.root.id === selected?.id);
  return (
    <main className='mx-auto min-h-[70vh] max-w-7xl px-5 py-14 text-white lg:px-8'>
      <p className='text-sm font-bold uppercase tracking-widest text-[#B5FF67]'>
        P&N IMPRESIÓN 3D
      </p>
      <h1 className='mt-3 text-4xl font-black'>TIENDA</h1>
      <p className='mt-3 text-white/60'>
        Piezas impresas en 3D y proyectos personalizados.
      </p>
      <nav
        aria-label='Categorías principales'
        className='my-7 flex flex-wrap gap-2'
      >
        <Link
          href='/tienda'
          className={`rounded-lg border px-4 py-2 text-sm ${!categoria ? 'border-[#B5FF67] text-[#B5FF67]' : 'border-white/20'}`}
        >
          Todas
        </Link>
        {groups.map((g) => (
          <Link
            key={g.root.id}
            href={`/tienda?categoria=${encodeURIComponent(g.root.slug)}`}
            className={`rounded-lg border px-4 py-2 text-sm ${activeGroup?.root.id === g.root.id ? 'border-[#B5FF67] text-[#B5FF67]' : 'border-white/20'}`}
          >
            {g.root.name}
          </Link>
        ))}
      </nav>
      {activeGroup && activeGroup.children.length > 0 && (
        <nav
          aria-label='Subcategorías'
          className='mb-8 flex flex-wrap gap-2 rounded-lg border border-white/10 bg-[#1a211e] p-4'
        >
          <Link
            href={`/tienda?categoria=${encodeURIComponent(activeGroup.root.slug)}`}
            className={`rounded-lg px-3 py-2 text-sm ${selected?.id === activeGroup.root.id ? 'bg-[#B5FF67] text-black' : 'bg-white/10'}`}
          >
            Todo en {activeGroup.root.name}
          </Link>
          {activeGroup.children.map((c) => (
            <Link
              key={c.id}
              href={`/tienda?categoria=${encodeURIComponent(c.slug)}`}
              className={`rounded-lg px-3 py-2 text-sm ${selected?.id === c.id ? 'bg-[#B5FF67] text-black' : 'bg-white/10'}`}
            >
              {c.name}
            </Link>
          ))}
        </nav>
      )}
      {products.length ? (
        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {products.map((p) => (
            <StoreCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className='rounded-xl border border-white/10 bg-[#1a211e] p-9'>
          <p>No hay productos publicados en esta categoría.</p>
          <Link
            href='/presupuesto'
            className='mt-5 inline-block text-[#B5FF67]'
          >
            Solicitar presupuesto →
          </Link>
        </div>
      )}
    </main>
  );
}
