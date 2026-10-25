import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { requireAdmin } from '@/lib/require-admin';
import { prisma } from '@/lib/prisma';
import { createProduct } from '../actions';
import PricePreview from './PricePreview';

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const [categories, params] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    searchParams,
  ]);
  const input =
    'mt-2 w-full rounded-lg border border-white/15 bg-[#101319] px-4 py-3 text-white outline-none focus:border-[#B5FF67]';
  return (
    <main className='min-h-screen bg-[#101319] px-4 py-12 text-white'>
      <div className='mx-auto max-w-3xl'>
        <Link
          href='/admin/productos'
          className='mb-8 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white'
        >
          <ArrowLeft size={16} /> Volver a productos
        </Link>
        <p className='text-sm font-bold text-[#B5FF67]'>P&N · CATÁLOGO</p>
        <h1 className='font-display text-3xl font-extrabold'>NUEVO PRODUCTO</h1>
        <p className='mb-8 mt-2 text-sm text-neutral-400'>
          El producto se guarda como borrador con una variante inicial.
        </p>
        {params.error && (
          <p
            role='alert'
            className='mb-5 rounded-lg border border-red-700 bg-red-950/40 p-4 text-sm text-red-200'
          >
            {params.error.slice(0, 180)}
          </p>
        )}
        {categories.length === 0 ? (
          <p>
            Primero crea una categoría:{' '}
            <Link href='/admin/categorias' className='text-[#B5FF67] underline'>
              Ir a categorías
            </Link>
          </p>
        ) : (
          <form action={createProduct} className='space-y-6'>
            <section className='space-y-4 rounded-xl border border-white/10 bg-[#1a211e] p-6'>
              <h2 className='font-display text-xl font-bold'>
                INFORMACIÓN DEL PRODUCTO
              </h2>
              <label className='block text-sm'>
                Nombre
                <input
                  name='name'
                  minLength={3}
                  maxLength={120}
                  required
                  placeholder='Panda gruñón'
                  className={input}
                />
              </label>
              <label className='block text-sm'>
                Descripción
                <textarea
                  name='description'
                  minLength={10}
                  maxLength={5000}
                  required
                  rows={4}
                  className={input}
                />
              </label>
              <div className='grid gap-4 sm:grid-cols-2'>
                <label className='block text-sm'>
                  Categoría
                  <select
                    name='categoryId'
                    required
                    defaultValue=''
                    className={input}
                  >
                    <option value='' disabled>
                      Selecciona una categoría
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className='block text-sm'>
                  Modalidad
                  <select
                    name='saleMode'
                    defaultValue='DIRECT'
                    className={input}
                  >
                    <option value='DIRECT'>Venta directa</option>
                    <option value='QUOTE'>Bajo presupuesto</option>
                  </select>
                </label>
              </div>
            </section>
            <section className='space-y-4 rounded-xl border border-white/10 bg-[#1a211e] p-6'>
              <h2 className='font-display text-xl font-bold'>
                PRIMERA VARIANTE
              </h2>
              <div className='grid gap-4 sm:grid-cols-2'>
                <label className='block text-sm'>
                  SKU único
                  <input
                    name='sku'
                    required
                    minLength={3}
                    maxLength={50}
                    placeholder='PANDA-PLA-01'
                    className={input}
                  />
                </label>
                <label className='block text-sm'>
                  Nombre de variante
                  <input
                    name='label'
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder='Blanco y negro'
                    className={input}
                  />
                </label>
                <label className='block text-sm'>
                  Material
                  <select name='material' defaultValue='PLA' className={input}>
                    <option value='PLA'>PLA</option>
                    <option value='PETG'>PETG</option>
                    <option value='TPU'>TPU</option>
                    <option value='OTHER'>Otro</option>
                  </select>
                </label>
                <label className='block text-sm'>
                  Color / combinación
                  <input
                    name='color'
                    required
                    minLength={2}
                    maxLength={60}
                    placeholder='Blanco y negro'
                    className={input}
                  />
                </label>
                <label className='block text-sm'>
                  Tiempo (min, opcional)
                  <input
                    name='productionMins'
                    type='number'
                    min='1'
                    max='100000'
                    className={input}
                  />
                </label>
              </div>
              <PricePreview />
            </section>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <p className='text-sm text-amber-200'>Estado: BORRADOR</p>
              <button
                type='submit'
                className='inline-flex items-center gap-2 rounded-lg bg-[#B5FF67] px-6 py-3 font-bold text-[#101319]'
              >
                <Save size={18} /> Guardar producto
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
