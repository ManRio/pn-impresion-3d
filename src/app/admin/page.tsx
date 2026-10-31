import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';
import LogoutButton from './LogoutButton';
import {
  Package,
  Tags,
  ClipboardList,
  ExternalLink,
  BookOpen,
  Search,
  FileUp,
} from 'lucide-react';
export const dynamic = 'force-dynamic';
export default async function AdminPage() {
  const user = await requireAdmin();
  const [total, active, draft, categories, quotes] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.product.count({ where: { status: 'DRAFT' } }),
    prisma.category.count(),
    prisma.quoteRequest.count(),
  ]);
  const links = [
    {
      label: 'Productos',
      desc: 'Crear, editar y publicar',
      href: '/admin/productos',
      icon: Package,
    },
    {
      label: 'Categorías',
      desc: 'Organizar el catálogo',
      href: '/admin/categorias',
      icon: Tags,
    },
    {
      label: 'Presupuestos',
      desc: 'Ver solicitudes recibidas',
      href: '/admin/presupuestos',
      icon: ClipboardList,
    },
    {
      label: 'Pedidos',
      desc: 'Fabricación, envíos y notas internas',
      href: '/admin/pedidos',
      icon: Package,
    },
    {
      label: 'Ver tienda',
      desc: 'Comprobar escaparate público',
      href: '/tienda',
      icon: ExternalLink,
    },
  ];
  return (
    <main className='min-h-screen bg-[#101319] px-5 py-12 text-white'>
      <div className='mx-auto max-w-6xl'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <p className='text-sm font-bold text-[#B5FF67]'>
              P&N · ADMINISTRACIÓN
            </p>
            <h1 className='mt-2 text-3xl font-black'>PANEL DE CONTROL</h1>
            <p className='mt-2 text-white/60'>
              Hola, {user.name}. Gestiona tu tienda desde aquí.
            </p>
          </div>
          <LogoutButton />
        </div>
        <div className='mt-8 grid gap-3 sm:grid-cols-3'>
          {[
            { label: 'Productos', value: total },
            { label: 'Publicados', value: active },
            { label: 'Borradores', value: draft },
          ].map((s) => (
            <div
              key={s.label}
              className='rounded-xl border border-white/10 bg-[#1a211e] p-5'
            >
              <p className='text-sm text-white/60'>{s.label}</p>
              <p className='mt-2 text-3xl font-bold'>{s.value}</p>
            </div>
          ))}
        </div>
        <div className='mt-8 grid gap-4 sm:grid-cols-2'>
          {links.map((x) => (
            <Link
              key={x.href}
              href={x.href}
              className='rounded-xl border border-white/10 bg-[#1a211e] p-6 transition hover:border-[#B5FF67]/60'
            >
              <x.icon className='text-[#B5FF67]' size={26} />
              <h2 className='mt-4 text-xl font-bold'>{x.label}</h2>
              <p className='mt-1 text-sm text-white/60'>
                {x.desc}
                {x.href === '/admin/categorias'
                  ? ` · ${categories} categorías`
                  : x.href === '/admin/presupuestos'
                    ? ` · ${quotes} solicitudes`
                    : ''}
              </p>
            </Link>
          ))}
        </div>
        <details className='mt-8 rounded-xl border border-white/10 bg-[#1a211e] p-5'>
          <summary className='cursor-pointer font-semibold'>
            Herramientas avanzadas (MakerWorld e importaciones)
          </summary>
          <div className='mt-4 flex flex-wrap gap-4 text-sm text-[#B5FF67]'>
            <Link href='/admin/biblioteca'>
              <BookOpen size={16} className='inline' /> Biblioteca
            </Link>
            <Link href='/admin/explorar'>
              <Search size={16} className='inline' /> Explorar
            </Link>
            <Link href='/admin/importar'>
              <FileUp size={16} className='inline' /> Importar
            </Link>
          </div>
        </details>
      </div>
    </main>
  );
}
