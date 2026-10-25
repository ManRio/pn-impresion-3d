"use client";
import { useActionState, useState } from "react";
import { UploadCloud } from "lucide-react";
import { analyzePrint, applyToVariant, createFromAnalysis, type AnalysisState } from "./actions";

type Props = { categories:{id:string;name:string}[]; products:{id:string;name:string;variants:{id:string;label:string;sku:string}[]}[] };
const money=(n:number)=>(n/100).toLocaleString("es-ES",{style:"currency",currency:"EUR"});
const input="w-full rounded-lg border border-white/15 bg-[#101319] px-3 py-2 text-white";
export default function UploadForm({categories,products}:Props) {
  const [state,action,pending]=useActionState(analyzePrint,{} as AnalysisState);
  const [fileName,setFileName]=useState("");
  const [mode,setMode]=useState<"variant"|"new">("variant");
  const [rate,setRate]=useState("12");
  const [target,setTarget]=useState("");
  const variants=products.flatMap(p=>p.variants.map(v=>({id:v.id,label:`${p.name} · ${v.label} (${v.sku})`})));
  return <div className="space-y-6">
    <form action={action} className="space-y-4 rounded-xl border border-white/10 bg-[#1a211e] p-6">
      <label htmlFor="gcode" className="block font-semibold">Archivo laminado de Bambu Studio (.gcode.3mf)</label>
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="gcode" className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#B5FF67] px-5 py-3 font-bold text-[#101319] hover:bg-[#d1ff9a]"><UploadCloud size={19}/> Seleccionar archivo</label>
        <span className="max-w-full break-all text-sm text-neutral-400">{fileName||"Ningún archivo seleccionado"}</span>
      </div>
      <input id="gcode" name="file" type="file" accept=".gcode.3mf" required className="sr-only" onChange={e=>setFileName(e.target.files?.[0]?.name??"")}/>
      <p className="text-xs text-neutral-400">Máximo 20 MB. El archivo no se guarda en Neon ni se ejecuta.</p>
      <button disabled={pending} className="rounded-lg bg-[#B5FF67] px-5 py-3 font-bold text-[#101319] disabled:opacity-60">{pending?"Analizando…":"Analizar impresión"}</button>
    </form>
    {state.error && <p role="alert" className="rounded-lg border border-red-700 bg-red-950/30 p-4 text-red-200">{state.error}</p>}
    {state.data && <section className="space-y-4 rounded-xl border border-white/10 bg-[#1a211e] p-6">
      <h2 className="font-display text-2xl font-bold">RESULTADO DEL ANÁLISIS</h2>
      <p className="break-all text-xs text-neutral-400">{state.data.filename}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <p>Impresora: <strong>{state.data.printer}</strong></p><p>Bambu Studio: <strong>{state.data.studio}</strong></p>
        <p>Peso total: <strong>{state.data.totalGrams.toLocaleString("es-ES")} g</strong></p>
        <p>Tiempo: <strong>{Math.floor(state.data.durationSeconds/60)} min {state.data.durationSeconds%60} s</strong></p>
        <p>Precio a 0,10 €/g: <strong>{money(state.data.price10Cents)}</strong></p><p>Precio a 0,12 €/g: <strong>{money(state.data.price12Cents)}</strong></p>
      </div>
      <h3 className="font-semibold">Filamentos</h3>
      {state.data.colors.map((f,i)=><div key={i} className="flex items-center gap-3 text-sm"><span className="h-5 w-5 rounded-full border border-white/20" style={{backgroundColor:f.color}}/><span className="flex-1">{f.material} · {f.color}</span><strong>{f.grams.toLocaleString("es-ES")} g</strong></div>)}
      {state.data.notes.map((note,i)=><p key={i} className="text-sm text-amber-200">{note}</p>)}
      {state.ticket && <div className="space-y-4 border-t border-white/10 pt-5">
        <h3 className="font-display text-xl font-bold">¿QUÉ HACEMOS CON ESTE ANÁLISIS?</h3>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={()=>setMode("variant")} className={`rounded-lg px-4 py-2 font-semibold ${mode==="variant"?"bg-[#B5FF67] text-[#101319]":"border border-white/30"}`}>Aplicar a variante</button>
          <button type="button" onClick={()=>setMode("new")} className={`rounded-lg px-4 py-2 font-semibold ${mode==="new"?"bg-[#B5FF67] text-[#101319]":"border border-white/30"}`}>Añadir nuevo producto</button>
        </div>
        <div><label className="mb-2 block text-sm">Tarifa de venta</label><select className={input} value={rate} onChange={e=>setRate(e.target.value)}><option value="10">0,10 €/g</option><option value="12">0,12 €/g</option></select></div>
        <p className="text-sm text-neutral-400">Precio calculado: <strong className="text-white">{money(Math.round(state.data.totalGrams*Number(rate)))}</strong>. El peso exacto se guarda en centigramos; el campo heredado en gramos se redondea hacia arriba.</p>
        {mode==="variant" ? <form action={applyToVariant} className="space-y-3">
          <input type="hidden" name="ticket" value={state.ticket}/><input type="hidden" name="rate" value={rate}/>
          <label htmlFor="variantId" className="block text-sm">Selecciona la variante que deseas actualizar</label>
          <select id="variantId" name="variantId" className={input} required value={target} onChange={e=>setTarget(e.target.value)}><option value="" disabled>Seleccionar variante</option>{variants.map(v=><option value={v.id} key={v.id}>{v.label}</option>)}</select>
          <p className="text-xs text-amber-200">Se actualizarán peso, material, colores, tiempo y precio de esa variante. No cambia el SKU ni la publicación.</p>
          <button disabled={!target} className="rounded-lg bg-[#B5FF67] px-5 py-3 font-bold text-[#101319] disabled:opacity-50">Confirmar actualización</button>
        </form> : <form action={createFromAnalysis} className="space-y-3">
          <input type="hidden" name="ticket" value={state.ticket}/><input type="hidden" name="rate" value={rate}/>
          <label className="block text-sm">Nombre comercial</label><input name="name" className={input} required minLength={3} maxLength={120} placeholder="Ej. Llavero personalizado"/>
          <label className="block text-sm">Descripción</label><textarea name="description" className={input} required minLength={10} maxLength={5000} rows={3} placeholder="Descripción del artículo..."/>
          <label className="block text-sm">Categoría</label><select name="categoryId" className={input} required defaultValue=""><option value="" disabled>Seleccionar categoría</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <label className="block text-sm">SKU único</label><input name="sku" className={input} required minLength={3} maxLength={50} placeholder="LLAVERO-PLA-001"/>
          <label className="block text-sm">Nombre de la variante</label><input name="label" className={input} required minLength={2} maxLength={100} placeholder="PLA multicolor"/>
          <p className="text-xs text-amber-200">El artículo se creará como BORRADOR. Revisa licencia comercial y fotografías antes de publicar.</p>
          <button disabled={!categories.length} className="rounded-lg bg-[#B5FF67] px-5 py-3 font-bold text-[#101319] disabled:opacity-50">Crear producto como borrador</button>
        </form>}
      </div>}
    </section>}
  </div>;
}
