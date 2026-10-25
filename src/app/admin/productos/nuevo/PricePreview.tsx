"use client";
import { useState } from "react";

export default function PricePreview() {
  const [weight, setWeight] = useState("85");
  const [rate, setRate] = useState("12");
  const [custom, setCustom] = useState("");
  const estimate = Number(weight) * Number(rate);
  const override = custom === "" ? "" : String(Math.round(Number(custom) * 100));
  const amount = custom === "" ? estimate : Number(override);
  return <div className="space-y-4 rounded-xl border border-[#B5FF67]/30 bg-[#101319] p-5">
    <h3 className="font-display font-bold text-[#B5FF67]">CÁLCULO DEL PRECIO</h3>
    <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm">Consumo total (gramos)<input name="weightGrams" type="number" min="1" max="100000" step="1" required value={weight} onChange={e => setWeight(e.target.value)} className="mt-2 w-full rounded-lg border border-white/15 bg-[#1a211e] px-4 py-3"/></label>
    <label className="block text-sm">Tarifa<select name="rateCents" value={rate} onChange={e => setRate(e.target.value)} className="mt-2 w-full rounded-lg border border-white/15 bg-[#1a211e] px-4 py-3"><option value="10">0,10 €/g</option><option value="12">0,12 €/g</option></select></label></div>
    <p className="text-sm text-neutral-400">Estimación: {(estimate / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</p>
    <label className="block text-sm">Precio manual opcional (€)<input type="number" min="0" max="1000000" step="0.01" value={custom} onChange={e => setCustom(e.target.value)} placeholder="Dejar vacío para usar cálculo" className="mt-2 w-full rounded-lg border border-white/15 bg-[#1a211e] px-4 py-3"/></label>
    <input type="hidden" name="priceCents" value={override}/>
    <p className="font-display text-2xl font-bold">{Number.isFinite(amount) ? (amount / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" }) : "—"}</p>
    <p className="text-xs text-neutral-400">Usar consumo total de Bambu Studio: pieza, soportes y purgas.</p>
  </div>;
}
