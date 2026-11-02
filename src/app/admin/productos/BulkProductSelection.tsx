'use client';

import { useState } from 'react';
import Link from 'next/link';
import { deleteSelectedProducts } from './bulk-delete-actions';

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  saleMode: 'DIRECT' | 'QUOTE';
  priceCents: number | null;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
};

const euro = (cents: number) => (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

export default function BulkProductSelection({ products }: { products: ProductRow[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [typed, setTyped] = useState('');
  const [preserveHistory, setPreserveHistory] = useState(false);
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState<{ deleted: number; deletedIds: string[]; skipped: string[]; message: string } | null>(null);
  const [remaining, setRemaining] = useState(products);
  const all = remaining.length > 0 && selected.length === remaining.length;
  const confirmation = preserveHistory ? `DESVINCULAR Y ELIMINAR ${selected.length}` : `ELIMINAR ${selected.length}`;

  async function erase() {
    if (!selected.length || typed !== confirmation || working) return;
    setWorking(true);
    setResult(null);
    try {
      const outcome = await deleteSelectedProducts(selected, typed, preserveHistory);
      setResult(outcome);
      // Refrescamos la lista desde el servidor mediante una recarga explícita,
      // porque es una operación administrativa destructiva infrecuente.
      if (outcome.deleted > 0) setRemaining(prev => prev.filter(p => !outcome.deletedIds.includes(p.id)));
    } catch {
      setResult({ deleted: 0, deletedIds: [], skipped: [], message: 'Error de conexión. Comprueba el registro del servidor.' });
    } finally {
      setWorking(false);
      setTyped('');
      setSelected([]);
    }
  }

  return <div className="space-y-4">
    {result && <div role="status" className="rounded-lg border border-amber-400/40 bg-amber-950/20 p-4 text-sm">
      <p>{result.message}</p>
      {result.skipped.length > 0 && <ul className="mt-2 list-inside list-disc space-y-1">{result.skipped.map((reason, index) => <li key={index}>{reason}</li>)}</ul>}
    </div>}
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#1a211e] px-4 py-3">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={all} onChange={e => setSelected(e.target.checked ? remaining.map(p => p.id) : [])} />
        Seleccionar todos ({remaining.length})
      </label>
      <span className="text-sm text-neutral-400">{selected.length} seleccionados</span>
    </div>
    {selected.length > 0 && <section className="space-y-3 rounded-xl border border-red-500/50 bg-red-950/20 p-4">
      <h2 className="font-semibold text-red-200">Eliminar {selected.length} producto(s) definitivamente</h2>
      <p className="text-sm text-neutral-300">Se eliminarán sus variantes y fotografías. Por defecto, se protegen los productos vinculados a pedidos o presupuestos.</p>
      <label className="flex items-start gap-3 rounded-lg border border-amber-400/30 bg-amber-950/20 p-3 text-sm">
        <input type="checkbox" checked={preserveHistory} onChange={e => { setPreserveHistory(e.target.checked); setTyped(''); }} className="mt-1" />
        <span><strong className="text-amber-200">Limpieza de productos de prueba con historial:</strong> desvincular las solicitudes de presupuesto, conservar íntegros los presupuestos y los pedidos históricos (datos de artículos y precios), y eliminar la ficha del catálogo. Los pedidos antiguos ya no podrán abrir esa ficha. Esta operación es irreversible.</span>
      </label>
      <label className="block text-sm" htmlFor="bulk-confirm">Escribe <strong className="select-all text-white">{confirmation}</strong> para confirmar:</label>
      <input id="bulk-confirm" value={typed} onChange={e => setTyped(e.target.value)} autoComplete="off" className="w-full max-w-md rounded-lg border border-white/20 bg-[#101319] px-3 py-2 text-white" />
      <div className="flex gap-3">
        <button type="button" disabled={typed !== confirmation || working} onClick={erase} className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white disabled:opacity-40">{working ? 'Eliminando...' : 'Eliminar seleccionados'}</button>
        <button type="button" disabled={working} onClick={() => { setSelected([]); setTyped(''); }} className="rounded-lg border border-white/20 px-4 py-2">Cancelar</button>
      </div>
    </section>}
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#1a211e]">
      {remaining.length === 0 ? <p className="p-8 text-neutral-300">Todavía no hay productos.</p> : <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="border-b border-white/10 text-neutral-400"><tr><th className="p-4">Elegir</th><th className="p-4">Producto</th><th className="p-4">Categoría</th><th className="p-4">Modalidad</th><th className="p-4">Precio</th><th className="p-4">Estado</th><th className="p-4">Acciones</th></tr></thead>
        <tbody>{remaining.map(p => <tr key={p.id} className="border-b border-white/10">
          <td className="p-4"><input type="checkbox" aria-label={`Seleccionar ${p.name}`} checked={selected.includes(p.id)} onChange={e => setSelected(prev => e.target.checked ? [...prev, p.id] : prev.filter(id => id !== p.id))} /></td>
          <td className="p-4"><p className="font-semibold">{p.name}</p><p className="text-xs text-neutral-400">{p.slug}</p></td>
          <td className="p-4">{p.category}</td>
          <td className="p-4">{p.saleMode === 'DIRECT' ? 'Venta directa' : 'Presupuesto'}</td>
          <td className="p-4">{p.priceCents === null ? '—' : euro(p.priceCents)}</td>
          <td className="p-4">{p.status === 'ACTIVE' ? 'Activo' : p.status === 'DRAFT' ? 'Borrador' : 'Archivado'}</td>
          <td className="p-4"><Link href={`/admin/productos/${p.id}`} className="rounded-lg border border-white/20 px-3 py-2 hover:border-[#B5FF67]">Editar</Link></td>
        </tr>)}</tbody>
      </table>}
    </div>
  </div>;
}
