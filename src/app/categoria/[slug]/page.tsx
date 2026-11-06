import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { storeProducts } from '@/lib/store-products';
import StoreCard from '@/components/StoreCard';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };
const base = 'https://pn3d.es';

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, parentId: true,
      parent: { select: { name: true, slug: true } },
      children: { select: { id: true, name: true, slug: true }, orderBy: { name: 'asc' } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: 'Categoría no disponible', robots: { index: false, follow: false } };
  const products = await storeProducts(slug);
  const description = `Descubre ${category.name.toLocaleLowerCase('es-ES')} impresos en 3D por P&N. Consulta nuestro catálogo y solicita piezas personalizadas.`;
  const path = `/categoria/${encodeURIComponent(category.slug)}`;
  if (!products.length) return {
    title: `${category.name} | P&N Impresión 3D`,
    description,
    robots: { index: false, follow: true },
  };
  return {
    title: `${category.name} en impresión 3D`,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'website', title: `${category.name} | P&N Impresión 3D`, description, url: `${base}${path}` },
    twitter: { card: 'summary', title: `${category.name} | P&N Impresión 3D`, description },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();
  const products = await storeProducts(slug);
  const description = `Explora ${category.name.toLocaleLowerCase('es-ES')} de nuestro catálogo. Fabricamos piezas impresas en 3D bajo demanda y estudiamos encargos personalizados.`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} | P&N Impresión 3D`,
    description,
    url: `${base}/categoria/${encodeURIComponent(category.slug)}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.map((p, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: p.name,
        url: `${base}/tienda/${encodeURIComponent(p.slug)}`,
      })),
    },
  };
  return (
    <main className='mx-auto min-h-[65vh] max-w-7xl px-5 py-12 text-white lg:px-8'>
      {products.length > 0 && (
        <script type='application/ld+json' dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }} />
      )}
      <nav aria-label='Ruta de navegación' className='flex flex-wrap items-center gap-2 text-sm text-white/70'>
        <Link href='/tienda' className='text-[#B5FF67] hover:underline'>Tienda</Link>
        {category.parent && <>
          <span aria-hidden='true'>/</span>
          <Link href={`/categoria/${encodeURIComponent(category.parent.slug)}`} className='text-[#B5FF67] hover:underline'>{category.parent.name}</Link>
        </>}
        <span aria-hidden='true'>/</span>
        <span aria-current='page'>{category.name}</span>
      </nav>
      <h1 className='mt-6 text-3xl font-extrabold sm:text-4xl'>{category.name}</h1>
      <p className='mt-3 max-w-3xl leading-7 text-white/70'>{description}</p>
      {category.children.length > 0 && (
        <nav aria-label='Subcategorías' className='mt-7 flex flex-wrap gap-2'>
          {category.children.map(child => (
            <Link key={child.id} href={`/categoria/${encodeURIComponent(child.slug)}`}
              className='rounded-lg border border-white/20 px-4 py-2 text-sm hover:border-[#B5FF67]'>
              {child.name}
            </Link>
          ))}
        </nav>
      )}
      {products.length > 0 ? (
        <section aria-label={`Productos de ${category.name}`} className='mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {products.map(product => <StoreCard key={product.id} product={product} />)}
        </section>
      ) : (
        <div className='mt-10 rounded-xl border border-white/15 bg-[#1a211e] p-6'>
          <p>Por ahora no hay artículos publicados en esta categoría.</p>
          <Link href='/presupuesto' className='mt-3 inline-block font-semibold text-[#B5FF67] hover:underline'>Solicitar un presupuesto</Link>
        </div>
      )}
    </main>
  );
}
