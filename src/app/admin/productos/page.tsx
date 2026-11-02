import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';
import BulkProductSelection from './BulkProductSelection';

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireAdmin();
  const [products, params] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
        variants: { take: 1, orderBy: { createdAt: 'asc' } },
      },
    }),
    searchParams,
  ]);
  return <main className="min-h-screen bg-[#101319] px-4 py-12 text-white">
    <div className="mx-auto max-w-6xl">
      <Link href="/admin" className="mb-8 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white"><ArrowLeft size={16}/> Volver al panel</Link>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-sm font-bold text-[#B5FF67]">P&N · CATÁLOGO</p><h1 className="font-display text-3xl font-extrabold">PRODUCTOS</h1><p className="mt-2 text-sm text-neutral-400">Catálogo real en Neon · Eliminación múltiple con confirmación</p></div>
        <Link href="/admin/productos/nuevo" className="inline-flex items-center gap-2 rounded-lg bg-[#B5FF67] px-5 py-3 font-bold text-[#101319]"><Plus size={18}/> Nuevo producto</Link>
      </header>
      {params.ok && <p role="status" className="mb-5 rounded-lg border border-[#B5FF67]/30 bg-[#B5FF67]/10 px-4 py-3 text-sm text-[#D8FFC0]">{params.ok.slice(0, 140)}</p>}
      <BulkProductSelection products={products.map(p => ({ id: p.id, name: p.name, slug: p.slug, category: p.category.name, saleMode: p.saleMode, priceCents: p.variants[0]?.priceCents ?? null, status: p.status }))}/>
    </div>
  </main>;
}
