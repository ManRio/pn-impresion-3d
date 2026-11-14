import type { Metadata } from 'next';
import Link from 'next/link';

import TrabajosRealesSevilla from '@/components/TrabajosRealesSevilla';

import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Package,
  Palette,
  Printer,
  Truck,
} from 'lucide-react';

const url = 'https://pn3d.es/impresion-3d-sevilla';
const description =
  'Impresión 3D en Sevilla y provincia. Figuras, regalos, decoración y piezas personalizadas fabricadas bajo demanda. Solicita presupuesto en P&N Impresión 3D.';

export const metadata: Metadata = {
  title: 'Impresión 3D en Sevilla | Piezas personalizadas',
  description,
  alternates: { canonical: '/impresion-3d-sevilla' },
  openGraph: {
    title: 'Impresión 3D en Sevilla | P&N Impresión 3D',
    description,
    url,
    type: 'website',
    locale: 'es_ES',
  },
};

const services = [
  {
    title: 'Figuras y decoración',
    description:
      'Objetos decorativos, figuras y detalles originales para regalar o dar personalidad a un espacio.',
    icon: Package,
  },
  {
    title: 'Regalos personalizados',
    description:
      'Llaveros, nombres, toppers y otras ideas adaptadas a cada ocasión, según la viabilidad del proyecto.',
    icon: Palette,
  },
  {
    title: 'Piezas bajo presupuesto',
    description:
      '¿Necesitas una pieza concreta? Explícanos qué buscas, las medidas y el uso previsto para estudiar la fabricación.',
    icon: Printer,
  },
];

const steps = [
  {
    title: 'Cuéntanos tu idea',
    description:
      'Indícanos qué necesitas, cantidad aproximada, medidas, colores y cualquier referencia que tengas.',
  },
  {
    title: 'Estudiamos el proyecto',
    description:
      'Revisamos si podemos fabricarlo, las opciones disponibles y el presupuesto antes de confirmar el encargo.',
  },
  {
    title: 'Fabricamos y entregamos',
    description:
      'Preparamos el pedido y organizamos el envío o la recogida concertada cuando esté listo.',
  },
];

const questions = [
  {
    question: '¿Dónde estáis?',
    answer:
      'Trabajamos desde Castilblanco de los Arroyos, en la provincia de Sevilla. Atendemos encargos de Sevilla capital y de otras localidades, y ofrecemos recogida concertada.',
  },
  {
    question: '¿Puedo solicitar una pieza personalizada?',
    answer:
      'Sí. Cuéntanos el uso, las dimensiones y, si tienes, una imagen o referencia. Estudiaremos su viabilidad y te facilitaremos un presupuesto sin compromiso de compra.',
  },
  {
    question: '¿Cuánto tarda un pedido?',
    answer:
      'La fabricación habitual se estima entre 48 y 72 horas desde la confirmación del pago, según la carga de trabajo. El transporte por Correos suele estimarse entre 24 y 72 horas adicionales, dependiendo del destino y las fechas. Los encargos especiales pueden necesitar más tiempo.',
  },
  {
    question: '¿Hacéis envíos fuera de Sevilla?',
    answer:
      'Sí. Enviamos a España peninsular y Baleares. También ofrecemos recogida presencial gratuita, siempre previa coordinación.',
  },
  {
    question: '¿Cuál es el precio de una impresión 3D?',
    answer:
      'Depende del tamaño, consumo de material, complejidad y características de la pieza. Puedes consultar precios de los artículos del catálogo o solicitar una valoración individual.',
  },
];

export default function Impresion3DSevillaPage() {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://pn3d.es/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Impresión 3D en Sevilla',
        item: url,
      },
    ],
  };

  return (
    <main id='contenido-principal' className='text-white'>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumb).replace(/</g, '\\u003c'),
        }}
      />

      <section className='relative overflow-hidden border-b border-white/10 bg-[#101610]'>
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_20%,rgba(181,255,103,0.14),transparent_55%)]'
        />
        <div className='relative mx-auto max-w-7xl px-5 py-16 sm:py-24 lg:px-8'>
          <nav
            aria-label='Ruta de navegación'
            className='mb-8 text-sm text-white/65'
          >
            <Link href='/' className='hover:text-[#B5FF67]'>
              Inicio
            </Link>
            <span aria-hidden='true' className='mx-2'>
              /
            </span>
            <span aria-current='page'>Impresión 3D Sevilla</span>
          </nav>

          <div className='max-w-4xl'>
            <p className='inline-flex items-center gap-2 rounded-full border border-[#B5FF67]/30 bg-[#B5FF67]/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#B5FF67]'>
              <MapPin size={15} aria-hidden='true' />
              Castilblanco de los Arroyos · Sevilla
            </p>
            <h1 className='mt-7 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl'>
              Impresión 3D en{' '}
              <span className='text-[#B5FF67]'>Sevilla y provincia</span>
            </h1>
            <p className='mt-7 max-w-3xl text-lg leading-8 text-neutral-300'>
              Convertimos ideas en objetos reales: figuras, regalos, decoración
              y piezas personalizadas fabricadas bajo demanda. Trabajamos desde
              Castilblanco de los Arroyos y atendemos encargos de toda la
              provincia de Sevilla.
            </p>
            <div className='mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap'>
              <Link
                href='/presupuesto'
                className='inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#B5FF67] px-6 py-3 font-bold text-[#101319] transition hover:bg-[#d2ffab] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B5FF67]'
              >
                Solicitar presupuesto{' '}
                <ArrowRight size={19} aria-hidden='true' />
              </Link>
              <Link
                href='/tienda'
                className='inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-white/30 px-6 py-3 font-bold text-white transition hover:border-[#B5FF67] hover:text-[#B5FF67]'
              >
                Ver productos de la tienda
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby='servicios-title'
        className='mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24'
      >
        <p className='text-xs font-bold uppercase tracking-widest text-[#B5FF67]'>
          Qué podemos fabricar
        </p>
        <h2
          id='servicios-title'
          className='mt-3 text-3xl font-extrabold sm:text-4xl'
        >
          Impresión 3D para tus proyectos
        </h2>
        <p className='mt-4 max-w-3xl leading-8 text-neutral-300'>
          Tanto si buscas un producto ya disponible como si tienes una idea
          propia, te ayudamos a elegir la opción adecuada. Los encargos
          especiales se valoran individualmente antes de aceptarlos.
        </p>
        <div className='mt-9 grid gap-5 md:grid-cols-3'>
          {services.map(({ title, description: text, icon: Icon }) => (
            <article
              key={title}
              className='rounded-2xl border border-white/10 bg-[#1a211e] p-7'
            >
              <Icon size={29} className='text-[#B5FF67]' aria-hidden='true' />
              <h3 className='mt-5 text-xl font-bold'>{title}</h3>
              <p className='mt-3 leading-7 text-neutral-300'>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby='proceso-title'
        className='border-y border-white/10 bg-[#151b16]'
      >
        <div className='mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24'>
          <p className='text-xs font-bold uppercase tracking-widest text-[#B5FF67]'>
            De la idea a la pieza
          </p>
          <h2
            id='proceso-title'
            className='mt-3 text-3xl font-extrabold sm:text-4xl'
          >
            Cómo pedir una impresión 3D en Sevilla
          </h2>
          <ol className='mt-10 grid gap-5 md:grid-cols-3'>
            {steps.map((step, index) => (
              <li
                key={step.title}
                className='rounded-2xl border border-white/10 bg-[#1a211e] p-7'
              >
                <span className='font-display text-4xl font-black text-[#B5FF67]'>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className='mt-4 text-xl font-bold'>{step.title}</h3>
                <p className='mt-3 leading-7 text-neutral-300'>
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby='local-title'
        className='mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24'
      >
        <div>
          <p className='text-xs font-bold uppercase tracking-widest text-[#B5FF67]'>
            Fabricación de proximidad
          </p>
          <h2
            id='local-title'
            className='mt-3 text-3xl font-extrabold sm:text-4xl'
          >
            Desde Castilblanco de los Arroyos, para Sevilla
          </h2>
          <p className='mt-5 leading-8 text-neutral-300'>
            No tenemos una sede en Sevilla capital: fabricamos desde
            Castilblanco de los Arroyos. Puedes encargarnos productos desde
            Sevilla o cualquier otra localidad de la provincia.
          </p>
          <p className='mt-4 leading-8 text-neutral-300'>
            La recogida presencial es gratuita y se realiza con cita cuando el
            pedido está listo. Si prefieres recibirlo en casa, enviamos mediante
            Correos a España peninsular y Baleares.
          </p>
          <Link
            href='/envios-devoluciones'
            className='mt-5 inline-flex items-center gap-2 font-bold text-[#B5FF67] underline-offset-4 hover:underline'
          >
            Consultar envíos y recogidas{' '}
            <ArrowRight size={17} aria-hidden='true' />
          </Link>
        </div>
        <div className='space-y-5 rounded-2xl border border-[#B5FF67]/20 bg-[#1a211e] p-7 sm:p-9'>
          <div className='flex items-start gap-4'>
            <MapPin
              className='mt-1 shrink-0 text-[#B5FF67]'
              aria-hidden='true'
            />
            <div>
              <h3 className='font-bold'>Taller en Sevilla provincia</h3>
              <p className='mt-1 text-neutral-300'>
                Castilblanco de los Arroyos · recogida concertada
              </p>
            </div>
          </div>
          <div className='flex items-start gap-4'>
            <ClipboardList
              className='mt-1 shrink-0 text-[#B5FF67]'
              aria-hidden='true'
            />
            <div>
              <h3 className='font-bold'>Presupuesto antes de fabricar</h3>
              <p className='mt-1 text-neutral-300'>
                Estudiamos cada encargo personalizado y te comunicamos las
                opciones.
              </p>
            </div>
          </div>
          <div className='flex items-start gap-4'>
            <Truck
              className='mt-1 shrink-0 text-[#B5FF67]'
              aria-hidden='true'
            />
            <div>
              <h3 className='font-bold'>Envíos por Correos</h3>
              <p className='mt-1 text-neutral-300'>
                Preparación habitual de 48–72 h más transporte estimado de 24–72
                h, según el pedido y el destino.
              </p>
            </div>
          </div>
          <div className='flex items-start gap-4'>
            <CheckCircle2
              className='mt-1 shrink-0 text-[#B5FF67]'
              aria-hidden='true'
            />
            <div>
              <h3 className='font-bold'>Compra online segura</h3>
              <p className='mt-1 text-neutral-300'>
                Puedes comprar productos del catálogo y pagar mediante Stripe.
              </p>
            </div>
          </div>
        </div>
      </section>
      <TrabajosRealesSevilla />
      <section
        aria-labelledby='faq-title'
        className='border-t border-white/10 bg-[#151b16]'
      >
        <div className='mx-auto max-w-4xl px-5 py-16 lg:px-8 lg:py-24'>
          <h2 id='faq-title' className='text-3xl font-extrabold sm:text-4xl'>
            Preguntas frecuentes sobre impresión 3D
          </h2>
          <div className='mt-8 space-y-3'>
            {questions.map(({ question, answer }) => (
              <details
                key={question}
                className='group rounded-xl border border-white/10 bg-[#1a211e] p-5'
              >
                <summary className='cursor-pointer font-bold text-white marker:text-[#B5FF67]'>
                  {question}
                </summary>
                <p className='mt-4 leading-7 text-neutral-300'>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby='cta-title'
        className='mx-auto max-w-7xl px-5 py-16 text-center lg:px-8 lg:py-24'
      >
        <h2
          id='cta-title'
          className='font-display text-3xl font-extrabold sm:text-5xl'
        >
          Tu idea puede tomar forma
        </h2>
        <p className='mx-auto mt-5 max-w-2xl leading-8 text-neutral-300'>
          Cuéntanos qué necesitas y te orientaremos sobre las posibilidades de
          impresión 3D para tu proyecto.
        </p>
        <Link
          href='/presupuesto'
          className='mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#B5FF67] px-7 py-3 font-bold text-[#101319] hover:bg-[#d2ffab]'
        >
          Pedir presupuesto <ArrowRight size={19} aria-hidden='true' />
        </Link>
        <p className='mt-5 text-sm text-neutral-400'>
          O escríbenos a{' '}
          <a className='text-[#B5FF67] underline' href='mailto:info@pn3d.es'>
            info@pn3d.es
          </a>
        </p>
      </section>
    </main>
  );
}
