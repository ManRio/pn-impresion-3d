import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Gift,
  KeyRound,
  Layers3,
  MessageCircle,
  PackageCheck,
  Palette,
  Sparkles,
  WandSparkles,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Impresión 3D personalizada en Sevilla',
  description:
    'Convierte tus ideas en piezas impresas en 3D. Regalos, figuras, llaveros, decoración y encargos personalizados desde Sevilla. Solicita presupuesto.',
  alternates: {
    canonical: '/personalizados',
  },
};

const categories = [
  {
    title: 'Regalos personalizados',
    description:
      'Detalles originales para cumpleaños, celebraciones y ocasiones especiales.',
    icon: Gift,
  },
  {
    title: 'Llaveros y accesorios',
    description: 'Llaveros con nombres, diseños y combinaciones de colores.',
    icon: KeyRound,
  },
  {
    title: 'Figuras y decoración',
    description:
      'Figuras decorativas y objetos que aportan un toque diferente a cualquier espacio.',
    icon: Sparkles,
  },
  {
    title: 'Piezas a medida',
    description:
      'Estudiamos tu idea y valoramos si podemos fabricarla mediante impresión 3D.',
    icon: Layers3,
  },
];

const steps = [
  {
    number: '01',
    title: 'Cuéntanos tu idea',
    description:
      'Explícanos qué necesitas. Puedes aportar medidas, referencias o imágenes.',
  },
  {
    number: '02',
    title: 'Recibe tu presupuesto',
    description:
      'Estudiamos la viabilidad y te informamos del precio antes de fabricar.',
  },
  {
    number: '03',
    title: 'Hacemos tu pieza realidad',
    description:
      'Fabricamos tu encargo y coordinamos el envío o la recogida presencial.',
  },
];

export default function Page() {
  return (
    <main id='contenido-principal' className='overflow-hidden text-white'>
      {/* HERO */}
      <section className='relative isolate overflow-hidden border-b border-white/10 bg-[#101610]'>
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_25%,rgba(181,255,103,0.14),transparent_55%)]'
        />

        <div className='relative mx-auto max-w-7xl px-5 py-16 sm:py-24 lg:px-8 lg:py-28'>
          <div className='max-w-4xl'>
            <p className='inline-flex items-center gap-2 rounded-full border border-[#B5FF67]/30 bg-[#B5FF67]/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#B5FF67]'>
              <WandSparkles size={16} aria-hidden='true' />
              Impresión 3D a tu manera
            </p>

            <h1 className='mt-8 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl'>
              TU IDEA.
              <span className='mt-2 block text-[#B5FF67]'>
                HECHA REALIDAD EN 3D.
              </span>
            </h1>

            <p className='mt-8 max-w-2xl text-base leading-8 text-neutral-300 sm:text-lg'>
              ¿Tienes en mente un regalo, una figura o una pieza especial? En
              P&N Impresión 3D estudiamos tu propuesta y la transformamos en un
              proyecto de fabricación personalizado.
            </p>

            <p className='mt-4 max-w-2xl leading-7 text-neutral-400'>
              Trabajamos desde Castilblanco de los Arroyos, Sevilla, con
              encargos bajo presupuesto y opciones de envío o recogida
              presencial concertada.
            </p>

            <div className='mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap'>
              <Link
                href='/presupuesto'
                className='inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#B5FF67] px-6 py-3 font-bold text-[#101319] transition hover:bg-[#d2ffab] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B5FF67]'
              >
                Solicitar presupuesto
                <ArrowUpRight size={19} aria-hidden='true' />
              </Link>

              <Link
                href='/tienda'
                className='inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-white/30 px-6 py-3 font-bold transition hover:border-[#B5FF67] hover:text-[#B5FF67]'
              >
                Explorar la tienda
                <ArrowRight size={19} aria-hidden='true' />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className='mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-8'>
        <div className='max-w-3xl'>
          <p className='text-xs font-bold uppercase tracking-widest text-[#B5FF67]'>
            Posibilidades de personalización
          </p>

          <h2 className='mt-3 text-3xl font-extrabold sm:text-4xl'>
            ¿Qué podemos crear para ti?
          </h2>

          <p className='mt-5 leading-7 text-neutral-400'>
            Cada proyecto es diferente. Estas son algunas ideas que podemos
            estudiar y adaptar a tus necesidades.
          </p>
        </div>

        <div className='mt-10 grid gap-5 sm:grid-cols-2'>
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <article
                key={category.title}
                className='group rounded-2xl border border-white/10 bg-[#1a211e] p-7 transition hover:border-[#B5FF67]/50'
              >
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-[#B5FF67]/10 text-[#B5FF67]'>
                  <Icon size={25} aria-hidden='true' />
                </div>

                <h3 className='mt-6 text-xl font-bold'>{category.title}</h3>

                <p className='mt-3 leading-7 text-neutral-400'>
                  {category.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* PROCESO */}
      <section className='border-y border-white/10 bg-[#151b16] py-16 sm:py-20'>
        <div className='mx-auto max-w-7xl px-5 lg:px-8'>
          <p className='text-xs font-bold uppercase tracking-widest text-[#B5FF67]'>
            Así trabajamos
          </p>

          <h2 className='mt-3 text-3xl font-extrabold sm:text-4xl'>
            De tu idea a una pieza real
          </h2>

          <div className='mt-10 grid gap-5 md:grid-cols-3'>
            {steps.map((step) => (
              <article
                key={step.number}
                className='rounded-2xl border border-white/10 bg-[#1a211e] p-7'
              >
                <span className='text-4xl font-black text-[#B5FF67]'>
                  {step.number}
                </span>

                <h3 className='mt-6 text-xl font-bold'>{step.title}</h3>

                <p className='mt-3 leading-7 text-neutral-400'>
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* VENTAJAS */}
      <section className='mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:px-8'>
        <div>
          <p className='text-xs font-bold uppercase tracking-widest text-[#B5FF67]'>
            Fabricación bajo demanda
          </p>

          <h2 className='mt-3 text-3xl font-extrabold sm:text-4xl'>
            Cada detalle cuenta
          </h2>

          <p className='mt-6 leading-8 text-neutral-300'>
            No todas las ideas necesitan convertirse en productos fabricados en
            serie. La impresión 3D nos permite estudiar encargos individuales y
            valorar distintas posibilidades de personalización.
          </p>

          <div className='mt-8 space-y-5'>
            {[
              'Presupuesto antes de comenzar la fabricación.',
              'Posibilidad de elegir colores según el proyecto.',
              'Valoración de medidas y características de cada pieza.',
              'Recogida concertada o envío a las zonas disponibles.',
            ].map((item) => (
              <div key={item} className='flex items-start gap-3'>
                <CheckCircle2
                  size={21}
                  className='mt-1 shrink-0 text-[#B5FF67]'
                  aria-hidden='true'
                />
                <p className='leading-7 text-neutral-300'>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className='rounded-3xl border border-[#B5FF67]/20 bg-[#1a241b] p-8 sm:p-10'>
          <div className='grid grid-cols-2 gap-5'>
            {[
              { icon: Palette, label: 'Colores y acabados' },
              { icon: Layers3, label: 'Impresión por capas' },
              { icon: PackageCheck, label: 'Fabricación bajo pedido' },
              { icon: MessageCircle, label: 'Trato directo' },
            ].map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.label}
                  className='flex min-h-36 flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-[#101610] p-4 text-center'
                >
                  <Icon
                    size={30}
                    className='text-[#B5FF67]'
                    aria-hidden='true'
                  />
                  <span className='text-sm font-semibold'>{feature.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className='border-t border-white/10 bg-[#151b16] py-16 sm:py-20'>
        <div className='mx-auto max-w-4xl px-5 text-center'>
          <p className='text-xs font-bold uppercase tracking-widest text-[#B5FF67]'>
            Tu próximo proyecto
          </p>

          <h2 className='mt-4 text-3xl font-extrabold sm:text-5xl'>
            ¿TIENES UNA IDEA?
            <span className='mt-2 block text-[#B5FF67]'>
              VAMOS A DARLE FORMA.
            </span>
          </h2>

          <p className='mx-auto mt-6 max-w-2xl leading-8 text-neutral-300'>
            Cuéntanos qué quieres crear y estudiaremos las posibilidades de
            fabricación. Sin compromiso de compra.
          </p>

          <div className='mt-9 flex flex-col justify-center gap-3 sm:flex-row'>
            <Link
              href='/presupuesto'
              className='inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#B5FF67] px-7 py-3 font-bold text-black transition hover:bg-[#d2ffab]'
            >
              Pedir presupuesto
              <ArrowUpRight size={19} aria-hidden='true' />
            </Link>

            <a
              href='https://wa.me/34684710115?text=Hola%2C%20me%20gustar%C3%ADa%20consultar%20un%20proyecto%20de%20impresi%C3%B3n%203D%20personalizado.'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-white/30 px-7 py-3 font-bold transition hover:border-[#B5FF67] hover:text-[#B5FF67]'
            >
              <MessageCircle size={19} aria-hidden='true' />
              Consultar por WhatsApp
            </a>
          </div>

          <p className='mt-7 text-sm text-neutral-500'>
            P&N Impresión 3D · Castilblanco de los Arroyos, Sevilla
          </p>
        </div>
      </section>
    </main>
  );
}
