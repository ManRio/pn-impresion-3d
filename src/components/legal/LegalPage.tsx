import Link from 'next/link';
import type { ReactNode } from 'react';

export function LegalPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <main id="contenido-principal" tabIndex={-1} className="mx-auto min-h-[70vh] max-w-4xl px-5 py-12 text-white sm:py-16">
      <nav aria-label="Ruta de navegación" className="mb-7 text-sm text-neutral-400">
        <Link href="/" className="underline-offset-4 hover:text-[#B5FF67] hover:underline">Inicio</Link>
        <span aria-hidden="true" className="mx-2">/</span><span aria-current="page">{title}</span>
      </nav>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#B5FF67]">Información legal</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold sm:text-5xl">{title}</h1>
      <p className="mt-5 max-w-3xl text-base leading-8 text-neutral-300">{intro}</p>
      <div role="note" className="mt-8 rounded-xl border border-amber-300/50 bg-amber-300/10 p-5 text-sm leading-7 text-amber-100">
        <strong>Borrador pendiente de revisión.</strong> Este documento debe completarse con los datos reales del vendedor y validarse antes de aceptar compras o abrir la tienda al público. Los campos entre corchetes no son datos reales.
      </div>
      <div className="mt-10 space-y-9 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_p]:leading-8 [&_p]:text-neutral-300 [&_li]:leading-8 [&_li]:text-neutral-300 [&_ul]:list-disc [&_ul]:pl-6">{children}</div>
    </main>
  );
}
