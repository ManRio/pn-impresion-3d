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
  if (!p) return {title:'Producto no disponible',robots:{index:false,follow:false}};
  const path = `/tienda/${encodeURIComponent(p.slug)}`;
  const base = 'https://pn3d.es';
  const socialImage = p.socialImageUrl || p.images[0]?.url;
  return {
    title: p.seoTitle || p.name,
    description: p.seoDescription || p.shortDescription || p.description.slice(0,155),
    alternates: {canonical:`${base}${path}`},
    openGraph: {
      type:'website', title:p.socialTitle || p.seoTitle || p.name,
      description:p.socialDescription || p.seoDescription || p.shortDescription || p.description.slice(0,155),
      ...(base?{url:`${base}${path}`}:{ } ),
      ...(socialImage?{images:[{url:socialImage,alt:p.images[0]?.alt||p.name}]}:{}),
    },
    twitter: {card:socialImage?'summary_large_image':'summary',title:p.socialTitle || p.seoTitle || p.name,
      description:p.socialDescription || p.seoDescription || p.shortDescription || p.description.slice(0,155),
      ...(socialImage?{images:[socialImage]}:{})},
  };
}
export default async function ProductPage({ params }: Props) {
  const p = await product((await params).slug);
  if (!p) notFound();
  const price = p.variants
    .filter((v) => v.priceCents > 0)
    .map((v) => v.priceCents)
    .sort((a, b) => a - b)[0];
  const structuredProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.seoDescription || p.shortDescription || p.description,
    url: `https://pn3d.es/tienda/${encodeURIComponent(p.slug)}`,
    ...(p.images.length ? { image: p.images.map(i => i.url) } : {}),
    ...(p.variants[0]?.sku ? { sku: p.variants[0].sku } : {}),
    ...(p.saleMode === 'DIRECT' && price !== undefined ? {
      offers: {
        '@type': 'Offer',
        url: `https://pn3d.es/tienda/${encodeURIComponent(p.slug)}`,
        priceCurrency: 'EUR',
        price: (price / 100).toFixed(2),
        seller: { '@type': 'Organization', name: 'P&N Impresión 3D' },
      },
    } : {}),
  };
  return (
    <main className='mx-auto max-w-7xl px-5 py-12 lg:px-8'>
      <script type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredProduct).replace(/</g, '\\u003c') }} />
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
          {p.shortDescription && <p className='mt-4 text-lg text-white/85'>{p.shortDescription}</p>}
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
            Los productos de venta directa se abonan mediante Stripe al confirmar el pedido.
            Los encargos personalizados se presupuestan previamente.
          </p>
        </section>
      </div>
    </main>
  );
}
