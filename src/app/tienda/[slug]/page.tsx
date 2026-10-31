import ProductLightbox from '@/components/ProductLightbox';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { euro } from '@/lib/store-products';
import AddToCart from '@/components/AddToCart';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };
async function product(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: 'ACTIVE' },
    include: {
      category: true,
      images: { orderBy: { position: 'asc' } },
      variants: { where: { active: true }, orderBy: { priceCents: 'asc' } },
    },
  });
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await product((await params).slug);
  return p
    ? { title: p.name, description: p.description.slice(0, 155) }
    : { title: 'Producto no disponible' };
}
export default async function ProductPage({ params }: Props) {
  const p = await product((await params).slug);
  if (!p) notFound();
  const price = p.variants
    .filter((v) => v.priceCents > 0)
    .map((v) => v.priceCents)
    .sort((a, b) => a - b)[0];
  return (
    <main className='mx-auto max-w-7xl px-5 py-12 lg:px-8'>
      <Link href='/tienda' className='text-sm text-[#B5FF67]'>
        ← Volver a la tienda
      </Link>
      <div className='mt-8 grid items-start gap-10 lg:grid-cols-2'>
        <ProductLightbox images={p.images} name={p.name} />
        <section>
          <p className='text-sm font-bold uppercase tracking-wider text-[#B5FF67]'>
            {p.category.name}
          </p>
          <h1 className='mt-3 text-4xl font-black'>{p.name}</h1>
          <p className='mt-5 whitespace-pre-line leading-8 text-white/70'>
            {p.description}
          </p>
          <p className='mt-7 text-2xl font-extrabold text-[#B5FF67]'>
            {p.saleMode === 'QUOTE'
              ? 'Precio bajo presupuesto'
              : price !== undefined
                ? `Desde ${euro(price)}`
                : 'Consultar disponibilidad'}
          </p>
          {p.variants.length > 0 && (
            <div className='mt-7'>
              <h2 className='text-lg font-semibold'>Opciones disponibles</h2>
              <div className='mt-3 space-y-2'>
                {p.variants.map((v) => (
                  <div
                    key={v.id}
                    className='flex justify-between gap-4 rounded-lg border border-white/10 p-3 text-sm'
                  >
                    <span>
                      {v.label} · {v.material} · {v.color}
                    </span>
                    <strong>
                      {p.saleMode === 'DIRECT'
                        ? euro(v.priceCents)
                        : 'A consultar'}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Producto bajo presupuesto */}
          {p.saleMode === 'QUOTE' && (
            <Link
              href={`/presupuesto?producto=${encodeURIComponent(p.slug)}`}
              className='mt-8 inline-flex rounded-lg bg-[#B5FF67] px-6 py-3 font-bold text-[#101319]'
            >
              Solicitar presupuesto
            </Link>
          )}

          {/* Producto de venta directa */}
          {p.saleMode === 'DIRECT' && (
            <AddToCart
              variants={p.variants
                .filter((v) => v.priceCents > 0)
                .map((v) => ({
                  id: v.id,
                  label: v.label,
                  color: v.color,
                  priceCents: v.priceCents,
                }))}
            />
          )}

          <p className='mt-3 text-xs text-white/50'>
            Los pedidos se registran sin cobro online. El pago se gestionará
            posteriormente.
          </p>
        </section>
      </div>
    </main>
  );
}
