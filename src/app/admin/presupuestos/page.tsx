import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';
import { saveQuoteManagement } from './actions';
export const dynamic='force-dynamic';
const statuses=['NEW','REVIEWING','QUOTED','ACCEPTED','REJECTED','CLOSED'] as const;
const label:Record<string,string>={NEW:'Nueva',REVIEWING:'En revisión',QUOTED:'Presupuestada',ACCEPTED:'Aceptada',REJECTED:'Rechazada',CLOSED:'Cerrada'};
const css='mt-1 w-full rounded-lg border border-white/20 bg-[#101319] p-3 text-sm text-white outline-none focus:border-[#B5FF67]';
const money=(v:number)=>(v/100).toLocaleString('es-ES',{style:'currency',currency:'EUR'});
type Props={searchParams:Promise<{error?:string;ok?:string}>};
export default async function AdminQuotes({searchParams}:Props){
 await requireAdmin();
 const [quotes,params]=await Promise.all([
  prisma.quoteRequest.findMany({include:{product:{select:{name:true}},internalNotes:{orderBy:{createdAt:'desc'},take:50}},orderBy:{createdAt:'desc'},take:100}),searchParams
 ]);
 return <main className="mx-auto max-w-6xl px-5 py-12 text-white">
 <Link href="/admin" className="text-sm text-[#B5FF67]">← Volver al panel</Link>
 <h1 className="mt-5 text-3xl font-black">Presupuestos</h1><p className="mt-2 text-sm text-white/60">Historial interno compartido entre administradores. Las notas no son visibles para el cliente.</p>
 {params.error&&<p role="alert" className="mt-4 rounded-lg border border-red-500/50 p-3 text-red-300">{params.error.slice(0,180)}</p>}
 {params.ok&&<p role="status" className="mt-4 rounded-lg border border-[#B5FF67]/40 p-3 text-[#B5FF67]">Cambios guardados.</p>}
 <div className="mt-7 space-y-6">{quotes.length===0&&<p>No hay presupuestos todavía.</p>}{quotes.map(q=>{
  const last=q.internalNotes.find(n=>n.reference||n.amountCents!==null||n.itemsSummary||n.deliveryEstimate);
  return <section id={`q-${q.id}`} key={q.id} className="scroll-mt-24 rounded-xl border border-white/10 bg-[#1a211e] p-5">
   <div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs text-[#B5FF67]">{q.product?.name??'Solicitud general'}</p><h2 className="text-xl font-bold">{q.customerName}</h2><a href={`mailto:${q.email}`} className="text-sm text-white/70 underline">{q.email}</a><p className="text-xs text-white/50">{q.createdAt.toLocaleString('es-ES')} · {q.id.slice(-8).toUpperCase()}</p></div><span className="h-fit rounded-lg border border-white/20 px-3 py-2 text-sm">{label[q.status]}</span></div>
   <div className="mt-5 grid gap-6 lg:grid-cols-2">
    <div className="space-y-5"><div><h3 className="font-bold">Solicitud</h3><p className="mt-2 whitespace-pre-wrap break-words text-sm text-white/70">{q.notes}</p></div>
    {last&&<div className="rounded-lg border border-[#B5FF67]/25 bg-[#B5FF67]/5 p-4"><h3 className="font-bold text-[#B5FF67]">Último presupuesto registrado</h3>{last.reference&&<p className="text-sm">N.º: {last.reference}</p>}{last.itemsSummary&&<p className="text-sm">Piezas: {last.itemsSummary}</p>}{last.deliveryEstimate&&<p className="text-sm">Entrega: {last.deliveryEstimate}</p>}{last.amountCents!==null&&<p className="text-sm font-bold">Precio: {money(last.amountCents)}</p>}<p className="mt-2 text-xs text-white/60">{last.sentToCustomer?'Marcado como enviado':'Sin confirmar envío'} · {last.authorName}</p></div>}
    <div><h3 className="font-bold">Notas y cambios</h3>{q.internalNotes.length===0&&<p className="mt-2 text-sm text-white/50">Sin anotaciones todavía.</p>}<ol className="mt-3 space-y-3">{q.internalNotes.map(n=><li key={n.id} className="rounded-lg border border-white/10 bg-[#101319] p-3"><p className="text-xs text-white/50">{n.authorName} · {n.createdAt.toLocaleString('es-ES')} · {label[n.statusFrom]} → {label[n.statusTo]}</p>{n.body&&<p className="mt-2 whitespace-pre-wrap break-words text-sm">{n.body}</p>}{(n.reference||n.itemsSummary||n.deliveryEstimate||n.amountCents!==null)&&<p className="mt-2 text-xs text-[#B5FF67]">{[n.reference&&`N.º ${n.reference}`,n.itemsSummary&&`Piezas: ${n.itemsSummary}`,n.deliveryEstimate&&`Entrega: ${n.deliveryEstimate}`,n.amountCents!==null&&money(n.amountCents)].filter(Boolean).join(' · ')}</p>}{n.sentToCustomer&&<p className="mt-1 text-xs text-white/50">Envío al cliente confirmado manualmente</p>}</li>)}</ol></div>
    </div>
    <form action={saveQuoteManagement} className="space-y-4 rounded-lg border border-white/10 bg-[#101319] p-4"><h3 className="font-bold">Registrar gestión</h3><input type="hidden" name="id" value={q.id}/>
     <label className="block text-sm">Estado<select name="status" defaultValue={q.status} className={css}>{statuses.map(s=><option key={s} value={s}>{label[s]}</option>)}</select></label>
     <div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm">N.º presupuesto<input name="reference" maxLength={100} className={css} placeholder="PN-2026-001"/></label><label className="block text-sm">Importe (€)<input name="amount" inputMode="decimal" className={css} placeholder="29,90"/></label></div>
     <label className="block text-sm">Piezas o descripción del trabajo<input name="items" maxLength={500} className={css} placeholder="3 llaveros PLA, dos colores..."/></label>
     <label className="block text-sm">Tiempo estimado de entrega<input name="delivery" maxLength={200} className={css} placeholder="5 a 7 días laborables"/></label>
     <label className="block text-sm">Nota interna<textarea name="note" maxLength={4000} rows={4} className={css} placeholder="Resumen del email, observaciones o motivo de rechazo"/></label>
     <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="sent"/> Presupuesto ya enviado por email al cliente</label>
     <button className="w-full rounded-lg bg-[#B5FF67] px-4 py-3 font-bold text-[#101319]">Guardar estado y anotación</button><p className="text-xs text-white/50">Este formulario registra el trabajo, pero no envía correos.</p>
    </form>
   </div>
  </section>;
 })}</div></main>;
}
