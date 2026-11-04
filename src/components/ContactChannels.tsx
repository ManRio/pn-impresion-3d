import { Instagram, Mail, MessageCircle, Phone, ArrowUpRight } from 'lucide-react';

const cards = [
  { name: 'Instagram', description: '@pn_impresion_3d_', href: 'https://www.instagram.com/pn_impresion_3d_/', icon: Instagram, external: true },
  { name: 'Correo electrónico', description: 'info@pn3d.es', href: 'mailto:info@pn3d.es', icon: Mail, external: false },
  { name: 'WhatsApp', description: '684 710 115', href: 'https://wa.me/34684710115', icon: MessageCircle, external: true },
  { name: 'Teléfono', description: '684 710 115', href: 'tel:+34684710115', icon: Phone, external: false },
];
export default function ContactChannels() {
  return <section aria-labelledby="channels-title" className="mt-10">
    <h2 id="channels-title" className="mb-5 text-2xl font-extrabold">Nuestros canales de contacto</h2>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(card => {
        const Icon = card.icon;
        return <a key={card.name} href={card.href} {...(card.external ? {target:'_blank',rel:'noopener noreferrer'} : {})}
          aria-label={`${card.name}: ${card.description}${card.external ? ' (abre otra pestaña)' : ''}`}
          className="flex min-h-44 flex-col rounded-2xl border border-white/10 bg-[#1a211e] p-6 transition hover:border-[#B5FF67]/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B5FF67]">
          <Icon size={25} aria-hidden="true" className="text-[#B5FF67]"/>
          <span className="mt-4 block text-lg font-bold text-white">{card.name}</span>
          <span className="mt-2 block break-words text-sm text-neutral-300">{card.description}</span>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#B5FF67]">Contactar <ArrowUpRight size={17} aria-hidden="true"/></span>
        </a>;
      })}
    </div>
  </section>;
}
