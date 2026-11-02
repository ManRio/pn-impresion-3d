import Link from 'next/link';
import { requireAdmin } from '@/lib/require-admin';
import { prisma } from '@/lib/prisma';
import { categoryGroups } from '@/lib/category-tree';
import { createCategory, renameCategory, deleteCategory } from './actions';
export const dynamic = 'force-dynamic';
type Props = { searchParams: Promise<{ ok?: string; error?: string }> };
const control =
  'w-full rounded-lg border border-white/20 bg-[#101319] p-3 text-white';
export default async function CategoriesPage({ searchParams }: Props) {
  await requireAdmin();
  const [categories, params] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { products: true, children: true } } },
      orderBy: { name: 'asc' },
    }),
    searchParams,
  ]);
  const roots = categories.filter((c) => !c.parentId);
  const groups = categoryGroups(categories);
  return (
    <main className='mx-auto max-w-5xl px-5 py-12 text-white'>
      <Link href='/admin' className='text-[#B5FF67]'>
        ← Panel
      </Link>
      <h1 className='mt-5 text-3xl font-bold'>Categorías y subcategorías</h1>
      <p className='mt-2 text-sm text-white/60'>
        Dos niveles. No se borran categorías con productos o subcategorías.
      </p>
      {params.error && (
        <p
          role='alert'
          className='my-4 rounded border border-red-500 p-3 text-red-300'
        >
          {params.error.slice(0, 200)}
        </p>
      )}
      {params.ok && (
        <p
          role='status'
          className='my-4 rounded border border-[#B5FF67] p-3 text-[#B5FF67]'
        >
          {params.ok.slice(0, 200)}
        </p>
      )}
      <form
        action={createCategory}
        className='mt-6 grid gap-3 rounded-xl border border-white/15 bg-[#1a211e] p-5 sm:grid-cols-[1fr_1fr_auto]'
      >
        <label className='text-sm'>
          Nombre
          <input
            name='name'
            minLength={2}
            maxLength={80}
            required
            className={control}
          />
        </label>
        <label className='text-sm'>
          Ubicación
          <select name='parentId' defaultValue='' className={control}>
            <option value=''>Categoría principal</option>
            {roots.map((r) => (
              <option key={r.id} value={r.id}>
                Dentro de {r.name}
              </option>
            ))}
          </select>
        </label>
        <button className='self-end rounded-lg bg-[#B5FF67] p-3 font-bold text-[#101319]'>
          Crear
        </button>
      </form>
      <div className='mt-8 space-y-5'>
        {groups.map((g) => (
          <section
            key={g.root.id}
            className='rounded-xl border border-white/10 bg-[#1a211e] p-5'
          >
            <h2 className='mb-3 text-xl font-bold'>
              {g.root.name}{' '}
              <span className='text-xs font-normal text-white/50'>
                {g.children.length} subcategorías
              </span>
            </h2>
            {[g.root, ...g.children].map((c) => (
              <div
                key={c.id}
                className={`mb-3 rounded-lg border border-white/10 p-3 ${c.parentId ? 'ml-5 bg-[#101319]' : 'bg-[#18241d]'}`}
              >
                <div className='mb-2 text-xs text-white/50'>
                  {c.parentId ? '↳ Subcategoría' : 'Principal'} ·{' '}
                  {c._count.products} productos · /tienda?categoria={c.slug}
                </div>
                <form
                  action={renameCategory}
                  className='grid gap-2 sm:grid-cols-[1fr_1fr_auto]'
                >
                  <input type='hidden' name='id' value={c.id} />
                  <input
                    aria-label={`Nombre de ${c.name}`}
                    name='name'
                    defaultValue={c.name}
                    minLength={2}
                    maxLength={80}
                    required
                    className={control}
                  />
                  <select
                    aria-label={`Categoría padre de ${c.name}`}
                    name='parentId'
                    defaultValue={c.parentId ?? ''}
                    className={control}
                  >
                    <option value=''>Principal</option>
                    {roots
                      .filter((r) => r.id !== c.id)
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          Dentro de {r.name}
                        </option>
                      ))}
                  </select>
                  <button className='rounded border border-white/30 px-3 py-2 text-sm'>
                    Guardar
                  </button>
                </form>
                {c._count.products === 0 && c._count.children === 0 && (
                  <form action={deleteCategory} className='mt-2'>
                    <input type='hidden' name='id' value={c.id} />
                    <button className='text-xs text-red-300'>
                      Eliminar categoría vacía
                    </button>
                  </form>
                )}
              </div>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
