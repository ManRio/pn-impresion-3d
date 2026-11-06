import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  Layers3,
  Palette,
  PackageCheck,
  Sparkles,
  WandSparkles,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { euro } from '@/lib/store-products';
import FeaturedProductSlider from '@/components/home/FeaturedProductSlider';

export const dynamic = 'force-dynamic';

const description =
  'Descubre figuras, decoración, regalos y piezas impresas en 3D. En P&N Impresión 3D fabricamos bajo demanda y estudiamos tus proyectos personalizados.';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');

export const metadata: Metadata = {
  title: {
    absolute: 'P&N Impresión 3D | Regalos y piezas personalizadas',
  },
  description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'P&N Impresión 3D',
    title: 'P&N Impresión 3D | Tus ideas toman forma',
    description,
    ...(siteUrl ? { url: siteUrl } : {}),
  },
  twitter: {
    card: 'summary',
    title: 'P&N Impresión 3D',
    description,
  },
};

export default async function Home() {
  const [products, categories, featuredProducts] = await Promise.all([
    prisma.product.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        saleMode: true,
        category: {
          select: { name: true },
        },
        images: {
          orderBy: { position: 'asc' },
          take: 1,
          select: { url: true, alt: true },
        },
        variants: {
          where: {
            active: true,
            priceCents: { gt: 0 },
          },
          orderBy: { priceCents: 'asc' },
          take: 1,
          select: { priceCents: true },
        },
      },
    }),
    prisma.category.findMany({
      where: { parentId: null },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
      take: 6,
    }),
    prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        images: {
          some: {},
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        category: {
          select: {
            name: true,
          },
        },
        images: {
          orderBy: {
            position: 'asc',
          },
          take: 1,
          select: {
            url: true,
            alt: true,
          },
        },
      },
    }),
  ]);

  const slides = featuredProducts.flatMap((product) => {
    const image = product.images[0];

    if (!image) return [];

    return [
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category.name,
        imageUrl: image.url,
        imageAlt: image.alt || product.name,
      },
    ];
  });

  return (
    <main id='contenido-principal' className='overflow-hidden'>
      <script type='application/ld+json' dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'P&N Impresión 3D',
          url: 'https://pn3d.es',
          logo: 'https://pn3d.es/LogoPN.png',
          email: 'info@pn3d.es',
        }).replace(/</g, '\\u003c'),
      }} />
      {/* HERO */}
      <section
        aria-labelledby='home-title'
        className='relative isolate overflow-hidden border-b border-white/10 bg-[#101610]'
      >
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_30%,rgba(181,255,103,0.13),transparent_52%)]'
        />

        <div className='relative mx-auto grid w-full min-w-0 max-w-7xl grid-cols-1 items-center gap-10 px-5 py-12 sm:py-16 lg:min-h-160 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24'>
          <div className='min-w-0'>
            <p className='mb-6 inline-flex items-center gap-2 rounded-full border border-[#B5FF67]/30 bg-[#B5FF67]/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#B5FF67]'>
              <Sparkles size={15} aria-hidden='true' />
              Impresión 3D bajo demanda
            </p>

            <h1
              id='home-title'
              className='max-w-2xl min-w-0 font-display text-[clamp(1.85rem,8.3vw,3rem)] font-extrabold leading-[1.08] tracking-tight [overflow-wrap:break-word] sm:text-[clamp(2.8rem,6vw,5.5rem)] sm:leading-[1.04]'
            >
              TUS IDEAS.
              <span className='mt-2 block text-[#B5FF67]'>
                EN OTRA DIMENSIÓN.
              </span>
            </h1>

            <p className='mt-7 max-w-xl text-base leading-8 text-neutral-300 sm:text-lg'>
              Figuras, regalos, decoración y piezas personalizadas impresas en
              3D. Descubre nuestro catálogo o cuéntanos esa idea que todavía no
              has encontrado en ninguna tienda.
            </p>

            <div className='mt-9 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap'>
              <Link
                href='/tienda'
                className='inline-flex min-h-12 w-full min-w-0 items-center justify-center gap-3 rounded-xl bg-[#B5FF67] px-6 py-3 font-bold text-[#101319] sm:w-auto transition hover:bg-[#d2ffab] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B5FF67]'
              >
                Explorar productos
                <ArrowUpRight size={20} aria-hidden='true' />
              </Link>

              <Link
                href='/presupuesto'
                className='inline-flex min-h-12 w-full min-w-0 items-center justify-center gap-3 rounded-xl border border-white/30 px-6 py-3 font-bold text-white sm:w-auto transition hover:border-[#B5FF67] hover:text-[#B5FF67] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B5FF67]'
              >
                Personalizar una idea
                <ArrowRight size={19} aria-hidden='true' />
              </Link>
            </div>

            <div className='mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-neutral-300'>
              <span className='flex items-center gap-2'>
                <Layers3
                  size={17}
                  className='text-[#B5FF67]'
                  aria-hidden='true'
                />
                Fabricación bajo demanda
              </span>
              <span className='flex items-center gap-2'>
                <Palette
                  size={17}
                  className='text-[#B5FF67]'
                  aria-hidden='true'
                />
                Opciones multicolor
              </span>
            </div>
          </div>

          {/* Slider de productos destacados */}
          <div className='relative mx-auto w-full min-w-0 max-w-lg'>
            <div
              aria-hidden='true'
              className='absolute -inset-4 rounded-[2rem] border border-[#B5FF67]/10'
            />

            {slides.length > 0 ? (
              <FeaturedProductSlider products={slides} />
            ) : (
              <div className='flex aspect-square items-center justify-center rounded-[1.5rem] border border-white/15 bg-[#1a241b] p-10'>
                <Image
                  src='/images/pn-hero.png'
                  alt='Logotipo de P&N Impresión 3D'
                  width={500}
                  height={500}
                  priority
                  sizes='(max-width: 1024px) 80vw, 450px'
                  className='h-auto w-full max-w-md object-contain'
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      {categories.length > 0 && (
        <section
          aria-labelledby='categories-title'
          className='mx-auto max-w-7xl px-5 py-16 lg:px-8'
        >
          <div className='mb-7'>
            <p className='text-xs font-bold uppercase tracking-widest text-[#B5FF67]'>
              Descubre P&N
            </p>
            <h2
              id='categories-title'
              className='mt-3 text-3xl font-extrabold sm:text-4xl'
            >
              Encuentra algo que encaje contigo
            </h2>
          </div>

          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/categoria/${encodeURIComponent(category.slug)}`}
                className='group flex min-h-28 items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#1a211e] p-6 transition hover:border-[#B5FF67]/60 hover:bg-[#222c21] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B5FF67]'
              >
                <span className='flex items-center gap-4'>
                  <span
                    aria-hidden='true'
                    className='text-sm font-bold text-[#B5FF67]'
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className='text-lg font-bold'>{category.name}</span>
                </span>
                <ArrowUpRight
                  size={20}
                  aria-hidden='true'
                  className='shrink-0 text-[#B5FF67] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1'
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* PRODUCTOS */}
      <section
        aria-labelledby='products-title'
        className='border-y border-white/10 bg-[#151b16] py-20'
      >
        <div className='mx-auto max-w-7xl px-5 lg:px-8'>
          <div className='mb-10 flex flex-wrap items-end justify-between gap-6'>
            <div>
              <p className='text-xs font-bold uppercase tracking-widest text-[#B5FF67]'>
                Nuestro catálogo
              </p>
              <h2
                id='products-title'
                className='mt-3 text-3xl font-extrabold sm:text-4xl'
              >
                Piezas que toman forma
              </h2>
              <p className='mt-3 max-w-xl leading-7 text-neutral-400'>
                Explora algunas de las creaciones disponibles en nuestra tienda.
              </p>
            </div>

            <Link
              href='/tienda'
              className='inline-flex min-h-11 items-center gap-2 font-bold text-[#B5FF67] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4'
            >
              Ver catálogo completo
              <ArrowUpRight size={18} aria-hidden='true' />
            </Link>
          </div>

          {products.length > 0 ? (
            <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
              {products.map((product) => {
                const image = product.images[0];
                const price = product.variants[0]?.priceCents;

                return (
                  <article
                    key={product.id}
                    className='group overflow-hidden rounded-2xl border border-white/10 bg-[#1a211e] transition hover:border-[#B5FF67]/50'
                  >
                    <Link
                      href={`/tienda/${encodeURIComponent(product.slug)}`}
                      aria-label={`Ver ${product.name}`}
                      className='block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B5FF67]'
                    >
                      <div className='relative aspect-4/3 overflow-hidden bg-[#273128]'>
                        {image ? (
                          <Image
                            src={image.url}
                            alt={image.alt || product.name}
                            fill
                            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                            className='object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none'
                          />
                        ) : (
                          <div className='flex h-full items-center justify-center gap-3 text-neutral-400'>
                            <Box aria-hidden='true' size={35} />
                            <span>Fotografía pendiente</span>
                          </div>
                        )}
                      </div>

                      <div className='p-6'>
                        <p className='text-xs font-bold uppercase tracking-wider text-[#B5FF67]'>
                          {product.category.name}
                        </p>

                        <h3 className='mt-2 text-xl font-bold text-white'>
                          {product.name}
                        </h3>

                        {product.shortDescription && (
                          <p className='mt-3 line-clamp-2 text-sm leading-6 text-neutral-400'>
                            {product.shortDescription}
                          </p>
                        )}

                        <div className='mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4'>
                          <span className='font-bold text-white'>
                            {product.saleMode === 'QUOTE'
                              ? 'Bajo presupuesto'
                              : price !== undefined
                                ? `Desde ${euro(price)}`
                                : 'Consultar precio'}
                          </span>
                          <ArrowUpRight
                            className='text-[#B5FF67]'
                            aria-hidden='true'
                          />
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className='rounded-2xl border border-dashed border-white/20 p-10 text-center'>
              <PackageCheck
                size={36}
                aria-hidden='true'
                className='mx-auto mb-4 text-[#B5FF67]'
              />
              <p className='text-lg font-bold'>
                Estamos preparando el catálogo
              </p>
              <p className='mt-2 text-neutral-400'>
                Mientras tanto, puedes consultarnos tu idea personalizada.
              </p>
              <Link
                href='/presupuesto'
                className='mt-5 inline-flex min-h-11 items-center font-bold text-[#B5FF67] underline'
              >
                Solicitar presupuesto
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* PERSONALIZADOS */}
      <section
        aria-labelledby='custom-title'
        className='mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-28'
      >
        <div>
          <p className='text-xs font-bold uppercase tracking-widest text-[#B5FF67]'>
            Hecho para ti
          </p>
          <h2
            id='custom-title'
            className='mt-4 text-4xl font-extrabold leading-tight sm:text-5xl'
          >
            ¿TIENES UNA IDEA?
            <span className='mt-2 block text-[#B5FF67]'>
              VAMOS A DARLE FORMA.
            </span>
          </h2>
          <p className='mt-6 max-w-xl leading-8 text-neutral-300'>
            Desde un regalo especial hasta una pieza para un proyecto personal.
            Cuéntanos qué necesitas y estudiaremos contigo las posibilidades de
            fabricación, materiales y presupuesto.
          </p>

          <Link
            href='/presupuesto'
            className='mt-8 inline-flex min-h-12 items-center gap-3 rounded-xl bg-[#B5FF67] px-6 py-3 font-bold text-[#101319] hover:bg-[#d2ffab] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B5FF67]'
          >
            Cuéntanos tu proyecto
            <ArrowRight size={19} aria-hidden='true' />
          </Link>
        </div>

        <ol className='space-y-4'>
          {[
            {
              title: 'Cuéntanos qué imaginas',
              text: 'Descríbenos la pieza y qué uso quieres darle.',
              icon: WandSparkles,
            },
            {
              title: 'Estudiamos las opciones',
              text: 'Valoramos materiales, colores y presupuesto.',
              icon: Palette,
            },
            {
              title: 'Fabricamos bajo demanda',
              text: 'Una vez acordado el encargo, preparamos la impresión.',
              icon: Layers3,
            },
          ].map((step, index) => {
            const Icon = step.icon;

            return (
              <li
                key={step.title}
                className='flex items-start gap-5 rounded-2xl border border-white/10 bg-[#1a211e] p-6'
              >
                <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#B5FF67]/10 text-[#B5FF67]'>
                  <Icon aria-hidden='true' />
                </div>
                <div>
                  <p className='text-xs font-bold text-[#B5FF67]'>
                    PASO {index + 1}
                  </p>
                  <h3 className='mt-1 text-lg font-bold'>{step.title}</h3>
                  <p className='mt-2 text-sm leading-6 text-neutral-400'>
                    {step.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
