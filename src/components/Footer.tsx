import Link from 'next/link';
import { Instagram, Mail, Phone } from 'lucide-react';
const groups = [
  { title: 'Explorar', links: [ ['/tienda', 'Tienda'], ['/personalizados', 'Personalizados'], ['/presupuesto', 'Solicitar presupuesto'] ] },
  { title: 'Ayuda', links: [ ['/contacto', 'Contacto'], ['/mi-cuenta/mis-pedidos', 'Mis pedidos'], ['/envios-devoluciones', 'Envíos y devoluciones'] ] },
  { title: 'Información legal', links: [ ['/aviso-legal', 'Aviso legal'], ['/privacidad', 'Privacidad'], ['/cookies', 'Cookies'], ['/condiciones-compra', 'Condiciones de compra'] ] },
];
export default function Footer() {
  return <footer className="border-t border-white/10 bg-[#101610] px-5 py-12 text-sm text-neutral-300">
    <div className="mx-auto grid max-w-7xl gap-9 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
      <div><p className="font-display text-xl font-extrabold text-white">P&N <span className="text-[#B5FF67]">Impresión 3D</span></p>
        <p className="mt-3 max-w-xs leading-7 text-neutral-400">Figuras, regalos y proyectos impresos en 3D bajo demanda.</p>
        <a className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md text-[#B5FF67] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2" href="https://www.instagram.com/pn_impresion_3d_/" target="_blank" rel="noopener noreferrer" aria-label="Instagram de P&N Impresión 3D (abre en otra pestaña)"><Instagram size={19} aria-hidden="true"/> Instagram</a>
        <div className="mt-3 flex flex-col gap-2"><a className="text-[#B5FF67] hover:underline" href="mailto:info@pn3d.es"><Mail className="mr-2 inline" size={16} aria-hidden="true"/>info@pn3d.es</a><a className="text-[#B5FF67] hover:underline" href="tel:+34684710115"><Phone className="mr-2 inline" size={16} aria-hidden="true"/>684 710 115</a></div>
      </div>
      {groups.map(group=><nav key={group.title} aria-label={group.title}><h2 className="font-display text-base font-bold text-white">{group.title}</h2><ul className="mt-4 space-y-3">{group.links.map(([href,label])=><li key={href}><Link href={href} className="rounded-sm underline-offset-4 hover:text-[#B5FF67] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2">{label}</Link></li>)}</ul></nav>)}
    </div>
    <div className="mx-auto mt-10 flex max-w-7xl flex-wrap justify-between gap-3 border-t border-white/10 pt-6 text-xs text-neutral-400"><p>© {new Date().getFullYear()} P&N Impresión 3D · Luis Miguel Rodriguez Gutierrez</p><p>Información legal en preparación · Sitio en desarrollo</p></div>
  </footer>;
}
