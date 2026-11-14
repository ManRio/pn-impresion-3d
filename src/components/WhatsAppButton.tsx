'use client';

import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

const message = 'Hola, he visto vuestra web pn3d.es y me gustaría hacer una consulta.';
const whatsappUrl = `https://wa.me/34684710115?text=${encodeURIComponent(message)}`;

export default function WhatsAppButton() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <a
      href={whatsappUrl}
      target='_blank'
      rel='noopener noreferrer'
      aria-label='Contactar con P&N Impresión 3D por WhatsApp (abre una nueva pestaña)'
      className='fixed bottom-5 right-4 z-50 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-bold text-[#073d1d] shadow-[0_8px_30px_rgba(0,0,0,.35)] transition hover:scale-105 hover:bg-[#42e880] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6'
    >
      <MessageCircle size={22} aria-hidden='true' />
      <span className='hidden sm:inline'>WhatsApp</span>
    </a>
  );
}
