import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';
import DetailToggle from '@/components/admin/DetailToggle';
import { saveQuoteManagement } from './actions';

export const dynamic = 'force-dynamic';
const statuses = ['NEW', 'REVIEWING', 'QUOTED', 'ACCEPTED', 'REJECTED', 'CLOSED'] as const;
const labels: Record<string, string> = { NEW: 'Nueva', REVIEWING: 'En revisión', QUOTED: 'Presupuestada', ACCEPTED: 'Aceptada', REJECTED: 'Rechazada', CLOSED: 'Cerrada' };
const css = 'mt-1 w-full rounded-lg border border-white/20 bg-[#101319] p-3 text-sm text-white outline-none focus:border-[#B5FF67]';
const money = (value: number) => (value / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
const PAGE_SIZE = 25;
type Query = { error?: string; ok?: string; q?: string; status?: string; page?: string };
type Props = { searchParams: Promise<Query> };
function listUrl(query: Query, page: number) {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.status && query.status !== 'ALL') params.set('status', query.status);
  params.set('page', String(page));
  return `/admin/presupuestos?${params.toString()}`;
}

export default async function AdminQuotes({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;
  const search = (params.q ?? '').trim().slice(0, 100);
  const status = statuses.includes(params.status as (typeof statuses)[number]) ? params.status! : 'ALL';
  const requestedPage = Number(params.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const where = {
    ...(status !== 'ALL' ? { status: status as (typeof statuses)[number] } : {}),
    ...(search ? { OR: [
      { id: { contains: search, mode: 'insensitive' as const } },
      { customerName: { contains: search, mode: 'insensitive' as const } },
      { email: { contains: search, mode: 'insensitive' as const } },
      { product: { name: { contains: search, mode: 'insensitive' as const } } },
    ] } : {}),
  };
  const total = await prisma.quoteRequest.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const quotes = await prisma.quoteRequest.findMany({
    where,
    include: { product: { select: { name: true } }, internalNotes: { orderBy: { createdAt: 'desc' }, take: 50 } },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 text-white sm:px-6">
      <Link href="/admin" className="text-sm text-[#B5FF67]">← Volver al panel</Link>
      <h1 className="mt-5 text-3xl font-black">Presupuestos</h1>
      <p className="mt-2 text-sm text-white/60">Listado de solicitudes. Abre una ficha para ver notas, registrar importes y actualizar el estado. El formulario no envía correos.</p>
      {params.error && <p role="alert" className="mt-4 rounded-lg border border-red-500/50 p-3 text-red-300">{params.error.slice(0, 180)}</p>}
      {params.ok && <p role="status" className="mt-4 rounded-lg border border-[#B5FF67]/40 p-3 text-[#B5FF67]">Cambios guardados.</p>}
      <form method="GET" className="mt-7 flex flex-wrap items-end gap-3 rounded-xl border border-white/15 bg-[#1a211e] p-4">
        <label className="min-w-48 flex-1 text-xs text-white/70">Buscar referencia, cliente, email o producto
          <input name="q" type="search" maxLength={100} defaultValue={search} placeholder="Buscar presupuesto" className={css}/>
        </label>
        <label className="text-xs text-white/70">Estado
          <select name="status" defaultValue={status} className={css}><option value="ALL">Todos</option>{statuses.map(s => <option key={s} value={s}>{labels[s]}</option>)}</select>
        </label>
        <button className="rounded-lg bg-[#B5FF67] px-5 py-3 text-sm font-bold text-[#101319]">Filtrar</button>
        <Link href="/admin/presupuestos" className="rounded-lg border border-white/20 px-4 py-3 text-sm">Limpiar</Link>
      </form>
      <p className="mt-4 text-sm text-white/60">{total} {total === 1 ? 'presupuesto' : 'presupuestos'} · Página {currentPage} de {totalPages}</p>
      <div className="mt-3 overflow-x-auto rounded-xl border border-white/15 bg-[#1a211e]">
        <table className="w-full min-w-[750px] text-left text-sm">
          <thead className="bg-[#101715] text-xs uppercase tracking-wide text-white/60"><tr><th scope="col" className="px-4 py-4">Referencia / fecha</th><th scope="col" className="px-4 py-4">Cliente</th><th scope="col" className="px-4 py-4">Producto</th><th scope="col" className="px-4 py-4">Estado</th><th scope="col" className="px-4 py-4 text-right">Importe</th><th scope="col" className="px-4 py-4 text-right">Detalle</th></tr></thead>
          {quotes.map(q => {
            const last = q.internalNotes.find(n => n.reference || n.amountCents !== null || n.itemsSummary || n.deliveryEstimate);
            const latestAmount = q.internalNotes.find(n => n.amountCents !== null)?.amountCents;
            return (
              <tbody key={q.id} id={`q-${q.id}`} className="border-t border-white/10">
                <tr className="align-middle hover:bg-white/[0.03]">
                  <td className="px-4 py-3"><span className="font-semibold">#{q.id.slice(-8).toUpperCase()}</span><span className="mt-1 block text-xs text-white/50">{q.createdAt.toLocaleDateString('es-ES')}</span></td>
                  <td className="px-4 py-3"><span className="font-medium">{q.customerName}</span><span className="mt-1 block max-w-56 truncate text-xs text-white/50" title={q.email}>{q.email}</span></td>
                  <td className="px-4 py-3">{q.product?.name ?? 'Solicitud general'}</td>
                  <td className="px-4 py-3">{labels[q.status]}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{latestAmount != null ? money(latestAmount) : 'Por definir'}</td>
                  <td className="px-4 py-3 text-right"><DetailToggle detailId={`detalle-q-${q.id}`} /></td>
                </tr>
                <tr><td colSpan={6} className="p-0"><details id={`detalle-q-${q.id}`} className="group border-t border-white/10 bg-[#121a16]">
                  <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-[#B5FF67] hover:bg-white/5">Abrir / cerrar ficha del presupuesto #{q.id.slice(-8).toUpperCase()} <span className="inline-block transition-transform group-open:rotate-180">⌄</span></summary>
                  <div className="space-y-5 border-t border-white/10 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs text-[#B5FF67]">{q.product?.name ?? 'Solicitud general'}</p><h2 className="text-xl font-bold">{q.customerName}</h2><a href={`mailto:${q.email}`} className="text-sm text-white/70 underline">{q.email}</a><p className="mt-1 text-xs text-white/50">{q.createdAt.toLocaleString('es-ES')} · {q.id.slice(-8).toUpperCase()}</p></div><span className="rounded-lg border border-white/20 px-3 py-2 text-sm">{labels[q.status]}</span></div>
                    <div className="grid gap-6 lg:grid-cols-2"><div className="space-y-5"><section><h3 className="font-bold">Solicitud</h3><p className="mt-2 whitespace-pre-wrap break-words text-sm text-white/70">{q.notes}</p></section>
                      {last && <section className="rounded-lg border border-[#B5FF67]/25 bg-[#B5FF67]/5 p-4"><h3 className="font-bold text-[#B5FF67]">Último presupuesto registrado</h3>{last.reference && <p className="text-sm">N.º: {last.reference}</p>}{last.itemsSummary && <p className="text-sm">Piezas: {last.itemsSummary}</p>}{last.deliveryEstimate && <p className="text-sm">Entrega: {last.deliveryEstimate}</p>}{last.amountCents !== null && <p className="text-sm font-bold">Precio: {money(last.amountCents)}</p>}<p className="mt-2 text-xs text-white/60">{last.sentToCustomer ? 'Marcado como enviado' : 'Sin confirmar envío'} · {last.authorName}</p></section>}
                      <section><h3 className="font-bold">Notas y cambios</h3>{q.internalNotes.length === 0 && <p className="mt-2 text-sm text-white/50">Sin anotaciones todavía.</p>}<ol className="mt-3 space-y-3">{q.internalNotes.map(n => <li key={n.id} className="rounded-lg border border-white/10 bg-[#101319] p-3"><p className="text-xs text-white/50">{n.authorName} · {n.createdAt.toLocaleString('es-ES')} · {labels[n.statusFrom]} → {labels[n.statusTo]}</p>{n.body && <p className="mt-2 whitespace-pre-wrap break-words text-sm">{n.body}</p>}{(n.reference || n.itemsSummary || n.deliveryEstimate || n.amountCents !== null) && <p className="mt-2 text-xs text-[#B5FF67]">{[n.reference && `N.º ${n.reference}`, n.itemsSummary && `Piezas: ${n.itemsSummary}`, n.deliveryEstimate && `Entrega: ${n.deliveryEstimate}`, n.amountCents !== null && money(n.amountCents)].filter(Boolean).join(' · ')}</p>}{n.sentToCustomer && <p className="mt-1 text-xs text-white/50">Envío al cliente confirmado manualmente</p>}</li>)}</ol></section></div>
                      <form action={saveQuoteManagement} className="space-y-4 rounded-lg border border-white/10 bg-[#101319] p-4"><h3 className="font-bold">Registrar gestión</h3><input type="hidden" name="id" value={q.id}/><label className="block text-sm">Estado<select name="status" defaultValue={q.status} className={css}>{statuses.map(s => <option key={s} value={s}>{labels[s]}</option>)}</select></label><div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm">N.º presupuesto<input name="reference" maxLength={100} className={css} placeholder="PN-2026-001"/></label><label className="block text-sm">Importe (€)<input name="amount" inputMode="decimal" className={css} placeholder="29,90"/></label></div><label className="block text-sm">Piezas o descripción del trabajo<input name="items" maxLength={500} className={css} placeholder="3 llaveros PLA, dos colores..."/></label><label className="block text-sm">Tiempo estimado de entrega<input name="delivery" maxLength={200} className={css} placeholder="5 a 7 días laborables"/></label><label className="block text-sm">Nota interna<textarea name="note" maxLength={4000} rows={4} className={css} placeholder="Resumen del email, observaciones o motivo de rechazo"/></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="sent"/> Presupuesto ya enviado por email al cliente</label><button className="w-full rounded-lg bg-[#B5FF67] px-4 py-3 font-bold text-[#101319]">Guardar estado y anotación</button><p className="text-xs text-white/50">Este formulario registra el trabajo, pero no envía correos.</p></form>
                    </div>
                  </div>
                </details></td></tr>
              </tbody>
            );
          })}
          {quotes.length === 0 && <tbody><tr><td colSpan={6} className="px-4 py-10 text-center text-white/60">No hay presupuestos con estos filtros.</td></tr></tbody>}
        </table>
      </div>
      <nav aria-label="Paginación de presupuestos" className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm"><span className="text-white/60">Mostrando {quotes.length} de {total} presupuestos</span><div className="flex gap-2">{currentPage > 1 && <Link href={listUrl(params, currentPage - 1)} className="rounded-lg border border-white/20 px-4 py-2">← Anterior</Link>}{currentPage < totalPages && <Link href={listUrl(params, currentPage + 1)} className="rounded-lg border border-white/20 px-4 py-2">Siguiente →</Link>}</div></nav>
    </main>
  );
}
