import Link from 'next/link';
export default function Footer() {
  return (
    <footer className='border-t border-white/10 px-5 py-10 text-sm text-white/50'>
      <div className='mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row'>
        <span>
          © {new Date().getFullYear()} PN Impresión 3D · Desarrollo by
          ManRio.dev
        </span>
        <div className='flex gap-5'>
          <Link href='/tienda'>Tienda</Link>
          <Link href='/presupuesto'>Presupuestos</Link>
          <Link href='/contacto'>Contacto</Link>
        </div>
      </div>
    </footer>
  );
}
