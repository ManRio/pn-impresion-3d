'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
const links = [
  ['/tienda', 'Tienda'],
  ['/personalizados', 'Personalizados'],
  ['/presupuesto', 'Presupuesto'],
  ['/contacto', 'Contacto'],
];
export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className='top-strip'>
        <span>IMPRESIÓN 3D BAJO DEMANDA</span>
        <span className='hidden sm:inline'>
          Ideas únicas · Fabricación personalizada · Envíos en España
        </span>
        <span>P&N · 3D</span>
      </div>
      <header className='site-header'>
        <div className='header-inner'>
          <Link href='/' className='brand' aria-label='PN Impresión 3D, inicio'>
            <Image
              src='/images/pn-header.png'
              width={2172}
              height={724}
              sizes='(max-width: 720px) 150px, 205px'
              alt='P&N Impresión 3D'
              priority
              className='brand-wordmark'
            />
          </Link>
          <nav className='desktop-nav' aria-label='Navegación principal'>
            {links.map(([href, label]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
          <div className='header-actions'>
            <Link className='header-cta' href='/presupuesto'>
              Tu idea en 3D <ArrowUpRight size={15} />
            </Link>
            <button
              type='button'
              className='mobile-trigger'
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav className='mobile-nav' aria-label='Navegación móvil'>
            {links.map(([href, label]) => (
              <Link onClick={() => setOpen(false)} key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
