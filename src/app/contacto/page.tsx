import type { Metadata } from 'next';
import Link from 'next/link';
import ContactChannels from '@/components/ContactChannels';
import {
  ArrowRight,
  ArrowUpRight,
  HelpCircle,
  MessageSquareText,
  Package,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Contacta con P&N Impresión 3D. Consulta nuestros productos, solicita información sobre encargos personalizados y encuentra respuestas a preguntas frecuentes.',
};

const questions = [
  {
    question: '¿Puedo solicitar una pieza personalizada?',
    answer:
      'Sí. Puedes describir tu idea mediante el formulario de presupuestos. Estudiaremos las posibilidades de fabricación antes de confirmar el encargo.',
  },
  {
    question: '¿Puedo elegir colores y materiales?',
    answer:
      'Depende de las características de la pieza. Indica tus preferencias al solicitar el presupuesto para que podamos valorar las opciones disponibles.',
  },
  {
    question: '¿Cómo puedo consultar un pedido?',
    answer:
      'Si tienes una cuenta, puedes consultar tus pedidos desde el apartado Mi cuenta. Los estados disponibles muestran el progreso de cada pedido registrado.',
  },
  {
    question: '¿Cuánto tarda un pedido?',
    answer:
      'El tiempo de fabricación depende del producto, la cantidad y sus características. Los plazos concretos se confirmarán según las condiciones de cada pedido.',
  },
];

export default function ContactPage() {
  return (
    <main
      id='contenido-principal'
      tabIndex={-1}
      className='min-h-screen bg-[#101319] text-white'
    >
      <section
        aria-labelledby='contact-title'
        className='relative overflow-hidden border-b border-white/10 bg-[#141c16]'
      >
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(181,255,103,0.12),transparent_55%)]'
        />

        <div className='relative mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-8'>
          <p className='mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#B5FF67]'>
            <Sparkles size={16} aria-hidden='true' />
            Estamos para ayudarte
          </p>

          <h1
            id='contact-title'
            className='max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl'
          >
            ¿HABLAMOS?
            <span className='mt-2 block text-[#B5FF67]'>
              TU IDEA EMPIEZA AQUÍ.
            </span>
          </h1>

          <p className='mt-6 max-w-2xl text-base leading-8 text-neutral-300 sm:text-lg'>
            ¿Tienes alguna pregunta sobre nuestros productos o quieres fabricar
            algo especial? Encuentra la mejor forma de hacernos llegar tu
            consulta.
          </p>
        </div>
      </section>

      <section
        aria-labelledby='contact-options-title'
        className='mx-auto max-w-7xl px-5 py-16 lg:px-8'
      >
        <div className='mb-8'>
          <p className='text-xs font-bold uppercase tracking-widest text-[#B5FF67]'>
            Contacta con P&N
          </p>

          <h2
            id='contact-options-title'
            className='mt-3 text-3xl font-extrabold'
          >
            ¿En qué podemos ayudarte?
          </h2>
        </div>

        <div className='grid gap-5 md:grid-cols-2'>
          <article className='flex flex-col rounded-2xl border border-[#B5FF67]/30 bg-[#1a241b] p-7'>
            <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-[#B5FF67]/10 text-[#B5FF67]'>
              <MessageSquareText size={27} aria-hidden='true' />
            </div>

            <h3 className='mt-6 text-xl font-bold'>
              Presupuestos personalizados
            </h3>

            <p className='mt-3 flex-1 text-sm leading-7 text-neutral-300'>
              Cuéntanos qué quieres fabricar, sus características y los detalles
              que consideres importantes. Revisaremos tu solicitud para valorar
              las posibilidades.
            </p>

            <Link
              href='/presupuesto'
              className='mt-7 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#B5FF67] px-5 py-3 font-bold text-[#101319] transition hover:bg-[#d0ff9c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B5FF67]'
            >
              Solicitar presupuesto
              <ArrowUpRight size={19} aria-hidden='true' />
            </Link>
          </article>

          <article className='flex flex-col rounded-2xl border border-white/10 bg-[#1a211e] p-7'>
            <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 text-[#B5FF67]'>
              <Package size={27} aria-hidden='true' />
            </div>

            <h3 className='mt-6 text-xl font-bold'>Consultar mis pedidos</h3>

            <p className='mt-3 flex-1 text-sm leading-7 text-neutral-300'>
              Si ya has realizado un pedido desde tu cuenta, puedes consultar su
              estado y los detalles registrados desde tu área personal.
            </p>

            <Link
              href='/mi-cuenta/mis-pedidos'
              className='mt-7 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-white/25 px-5 py-3 font-bold text-white transition hover:border-[#B5FF67] hover:text-[#B5FF67] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B5FF67]'
            >
              Ver mis pedidos
              <ArrowRight size={19} aria-hidden='true' />
            </Link>
          </article>
        </div>

        <ContactChannels />
      </section>

      <section
        aria-labelledby='faq-title'
        className='border-y border-white/10 bg-[#151b16] py-16'
      >
        <div className='mx-auto max-w-4xl px-5 lg:px-8'>
          <div className='mb-9 text-center'>
            <HelpCircle
              size={30}
              aria-hidden='true'
              className='mx-auto text-[#B5FF67]'
            />

            <h2
              id='faq-title'
              className='mt-4 text-3xl font-extrabold sm:text-4xl'
            >
              Preguntas frecuentes
            </h2>

            <p className='mt-3 text-neutral-400'>
              Algunas respuestas antes de empezar tu proyecto.
            </p>
          </div>

          <div className='space-y-3'>
            {questions.map((item) => (
              <details
                key={item.question}
                className='group rounded-xl border border-white/10 bg-[#1a211e] p-5'
              >
                <summary className='cursor-pointer rounded-md font-bold text-white marker:text-[#B5FF67] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B5FF67]'>
                  {item.question}
                </summary>

                <p className='mt-4 border-t border-white/10 pt-4 text-sm leading-7 text-neutral-300'>
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby='contact-final-title'
        className='mx-auto max-w-5xl px-5 py-20 text-center'
      >
        <div className='mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#B5FF67]/10 text-[#B5FF67]'>
          <ShieldCheck size={27} aria-hidden='true' />
        </div>

        <h2
          id='contact-final-title'
          className='text-3xl font-extrabold sm:text-4xl'
        >
          CADA IDEA ES DIFERENTE.
        </h2>

        <p className='mx-auto mt-5 max-w-xl leading-8 text-neutral-300'>
          Si tienes un proyecto en mente, estaremos encantados de estudiar sus
          características y las opciones para hacerlo realidad.
        </p>

        <Link
          href='/presupuesto'
          className='mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#B5FF67] px-6 py-3 font-bold text-[#101319] transition hover:bg-[#d0ff9c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B5FF67]'
        >
          Cuéntanos tu idea
          <ArrowRight size={19} aria-hidden='true' />
        </Link>
      </section>
    </main>
  );
}
