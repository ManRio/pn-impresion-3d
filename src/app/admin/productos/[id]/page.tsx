import PublicationPanel from './PublicationPanel';
import ProductSEOFields from '@/components/admin/ProductSEOFields';
import CategorySelector from '@/components/admin/CategorySelector';
import ProductImagesPanel from './ProductImagesPanel';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';
import {
  addVariant,
  deleteVariant,
  updateProduct,
  updateVariant,
} from '../edit-actions';
import ProductLifecyclePanel from './ProductLifecyclePanel';

const field =
  'w-full min-w-0 rounded-lg border border-white/15 bg-[#101319] px-3 py-2.5 text-white outline-none focus:border-[#B5FF67]';
const caption = 'mb-1 block text-sm text-neutral-300';
const materials = ['PLA', 'PETG', 'TPU', 'OTHER'] as const;

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
};
export default async function EditProductPage({ params, searchParams }: Props) {
  await requireAdmin();
  const [{ id }, feedback] = await Promise.all([params, searchParams]);
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        variants: { orderBy: { createdAt: 'asc' } },
        images: { orderBy: [{ position: 'asc' }, { id: 'asc' }] },
      },
    }),
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        parentId: true,
      },
      orderBy: { name: 'asc' },
    }),
  ]);
  if (!product) notFound();
  const publicationProduct = await prisma.product.findUnique({
    where: { id: product.id },
    include: { images: true, variants: true, category: true },
  });
  const money = (cents: number) =>
    (cents / 100).toLocaleString('es-ES', {
      style: 'currency',
      currency: 'EUR',
    });
  const message = feedback.error || feedback.ok;
  return (
    <main className='min-h-screen bg-[#101319] px-4 py-12 text-white'>
      <div className='mx-auto max-w-4xl'>
        <Link
          href='/admin/productos'
          className='mb-7 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white'
        >
          <ArrowLeft size={16} /> Volver a productos
        </Link>
        <p className='text-sm font-bold text-[#B5FF67]'>P&N · CATÁLOGO</p>
        <h1 className='font-display text-3xl font-extrabold'>
          EDITAR PRODUCTO
        </h1>
        <p className='mt-2 mb-8 text-sm text-neutral-400'>
          {product.slug} · Estado: {product.status}. Publicación sujeta a
          validaciones del servidor.
        </p>
        {message && (
          <p
            role={feedback.error ? 'alert' : 'status'}
            className={`mb-6 rounded-lg border p-4 text-sm ${feedback.error ? 'border-red-700 bg-red-950/40 text-red-200' : 'border-[#B5FF67]/30 bg-[#B5FF67]/10 text-[#D8FFC0]'}`}
          >
            {message.slice(0, 180)}
          </p>
        )}
        <form
          data-product-general='true'
          action={updateProduct}
          className='mb-8 space-y-4 rounded-xl border border-white/10 bg-[#1a211e] p-6'
        >
          <input type='hidden' name='productId' value={product.id} />
          <h2 className='font-display text-xl font-bold'>
            INFORMACIÓN GENERAL
          </h2>
          <div>
            <label htmlFor='name' className={caption}>
              Nombre
            </label>
            <input
              id='name'
              name='name'
              defaultValue={product.name}
              minLength={3}
              maxLength={120}
              required
              className={field}
            />
          </div>
          <div>
            <label htmlFor='description' className={caption}>
              Descripción
            </label>
            <textarea
              id='description'
              name='description'
              defaultValue={product.description}
              minLength={10}
              maxLength={5000}
              rows={4}
              required
              className={field}
            />
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-4'>
              <CategorySelector
                categories={categories}
                defaultValue={product.categoryId}
              />
            </div>
            <div>
              <label htmlFor='saleMode' className={caption}>
                Venta
              </label>
              <select
                id='saleMode'
                name='saleMode'
                defaultValue={product.saleMode}
                className={field}
              >
                <option value='DIRECT'>Venta directa</option>
                <option value='QUOTE'>Presupuesto</option>
              </select>
            </div>
          </div>
          <ProductSEOFields initial={product} />
          <button
            className='inline-flex items-center gap-2 rounded-lg bg-[#B5FF67] px-4 py-3 font-bold text-[#101319]'
            type='submit'
          >
            <Save size={17} /> Guardar producto
          </button>
        </form>
        <ProductImagesPanel productId={product.id} images={product.images} />
        <section className='mb-8 space-y-5'>
          <h2 className='font-display text-2xl font-bold'>
            VARIANTES ({product.variants.length})
          </h2>
          {product.variants.map((v) => (
            <div
              key={v.id}
              className='rounded-xl border border-white/10 bg-[#1a211e] p-6'
            >
              <p className='mb-4 font-mono text-sm text-[#B5FF67]'>
                {v.sku} · {money(v.priceCents)}
              </p>
              <form
                data-product-variant='true'
                action={updateVariant}
                className='grid gap-4 sm:grid-cols-2'
              >
                <input type='hidden' name='productId' value={product.id} />
                <input type='hidden' name='variantId' value={v.id} />
                <div>
                  <label className={caption} htmlFor={`label-${v.id}`}>
                    Variante
                  </label>
                  <input
                    id={`label-${v.id}`}
                    name='label'
                    defaultValue={v.label}
                    minLength={2}
                    maxLength={100}
                    required
                    className={field}
                  />
                </div>
                <div>
                  <label className={caption} htmlFor={`color-${v.id}`}>
                    Color
                  </label>
                  <input
                    id={`color-${v.id}`}
                    name='color'
                    defaultValue={v.color}
                    minLength={2}
                    maxLength={60}
                    required
                    className={field}
                  />
                </div>
                <div>
                  <label className={caption} htmlFor={`material-${v.id}`}>
                    Material
                  </label>
                  <select
                    id={`material-${v.id}`}
                    name='material'
                    defaultValue={v.material}
                    className={field}
                  >
                    {materials.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={caption} htmlFor={`grams-${v.id}`}>
                    Filamento total (g)
                  </label>
                  <input
                    id={`grams-${v.id}`}
                    name='weightGrams'
                    type='number'
                    defaultValue={v.weightGrams}
                    min={1}
                    max={100000}
                    required
                    className={field}
                  />
                </div>
                <div>
                  <label className={caption} htmlFor={`price-${v.id}`}>
                    Precio final (céntimos)
                  </label>
                  <input
                    id={`price-${v.id}`}
                    name='priceCents'
                    type='number'
                    defaultValue={v.priceCents}
                    min={0}
                    max={100000000}
                    required
                    className={field}
                  />
                  <p className='mt-1 text-xs text-neutral-400'>
                    Ej. 1020 = 10,20 €
                  </p>
                </div>
                <div>
                  <label className={caption} htmlFor={`mins-${v.id}`}>
                    Tiempo (minutos, opcional)
                  </label>
                  <input
                    id={`mins-${v.id}`}
                    name='productionMins'
                    type='number'
                    defaultValue={v.productionMins ?? ''}
                    min={1}
                    max={100000}
                    className={field}
                  />
                </div>
                <label className='flex items-center gap-2 text-sm'>
                  <input
                    type='checkbox'
                    name='active'
                    defaultChecked={v.active}
                  />{' '}
                  Variante activa
                </label>
                <div className='sm:col-span-2'>
                  <button
                    type='submit'
                    className='inline-flex items-center gap-2 rounded-lg bg-[#B5FF67] px-4 py-2.5 font-bold text-[#101319]'
                  >
                    <Save size={16} /> Guardar variante
                  </button>
                </div>
              </form>
              {product.variants.length > 1 && (
                <form
                  action={deleteVariant}
                  className='mt-4 border-t border-white/10 pt-4'
                >
                  <input type='hidden' name='productId' value={product.id} />
                  <input type='hidden' name='variantId' value={v.id} />
                  <button
                    type='submit'
                    className='inline-flex items-center gap-2 text-sm text-red-300 hover:text-red-200'
                  >
                    <Trash2 size={16} /> Eliminar esta variante
                  </button>
                </form>
              )}
            </div>
          ))}
        </section>
        <form
          action={addVariant}
          className='space-y-4 rounded-xl border border-[#B5FF67]/25 bg-[#1a211e] p-6'
        >
          <input type='hidden' name='productId' value={product.id} />
          <h2 className='flex items-center gap-2 font-display text-xl font-bold'>
            <Plus size={20} className='text-[#B5FF67]' /> AÑADIR VARIANTE
          </h2>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div>
              <label htmlFor='new-sku' className={caption}>
                SKU único
              </label>
              <input
                id='new-sku'
                name='sku'
                required
                minLength={3}
                maxLength={50}
                placeholder='PANDA-PLA-002'
                className={field}
              />
            </div>
            <div>
              <label htmlFor='new-label' className={caption}>
                Nombre
              </label>
              <input
                id='new-label'
                name='label'
                required
                minLength={2}
                maxLength={100}
                placeholder='Panda azul'
                className={field}
              />
            </div>
            <div>
              <label htmlFor='new-color' className={caption}>
                Color
              </label>
              <input
                id='new-color'
                name='color'
                required
                minLength={2}
                maxLength={60}
                placeholder='Azul y blanco'
                className={field}
              />
            </div>
            <div>
              <label htmlFor='new-material' className={caption}>
                Material
              </label>
              <select id='new-material' name='material' className={field}>
                {materials.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor='new-grams' className={caption}>
                Filamento total (g)
              </label>
              <input
                id='new-grams'
                name='weightGrams'
                type='number'
                required
                min={1}
                max={100000}
                placeholder='85'
                className={field}
              />
            </div>
            <div>
              <label htmlFor='new-rate' className={caption}>
                Tarifa por gramo
              </label>
              <select
                id='new-rate'
                name='rateCents'
                defaultValue='12'
                className={field}
              >
                <option value='10'>0,10 €/g</option>
                <option value='12'>0,12 €/g</option>
              </select>
            </div>
            <div>
              <label htmlFor='new-price' className={caption}>
                Precio final (céntimos, opcional)
              </label>
              <input
                id='new-price'
                name='priceCents'
                type='number'
                min={0}
                max={100000000}
                placeholder='Vacío = cálculo automático'
                className={field}
              />
            </div>
            <div>
              <label htmlFor='new-mins' className={caption}>
                Tiempo (minutos, opcional)
              </label>
              <input
                id='new-mins'
                name='productionMins'
                type='number'
                min={1}
                max={100000}
                className={field}
              />
            </div>
          </div>
          <button
            className='inline-flex items-center gap-2 rounded-lg bg-[#B5FF67] px-5 py-3 font-bold text-[#101319]'
            type='submit'
          >
            <Plus size={18} /> Añadir variante
          </button>
        </form>
        <div className='mt-12'>
          {publicationProduct && (
            <PublicationPanel product={publicationProduct} />
          )}
          <ProductLifecyclePanel
            productId={product.id}
            slug={product.slug}
            status={product.status}
          />
        </div>
      </div>
    </main>
  );
}
