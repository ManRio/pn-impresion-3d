"use client";

import { useMemo, useState } from "react";
import { bulkUpdateDesigns } from "./bulk-actions";
import { createProductsFromLibrary } from "./convert-to-products";
import { updateDesignStatus } from "./actions";

type Status = "TO_REVIEW" | "SHORTLIST" | "DISCARDED";
type Design = {
  id: string;
  externalId: string;
  title: string;
  designer: string;
  license: string;
  sourceUrl: string;
  status: Status;
};
const names: Record<Status, string> = {
  TO_REVIEW: "Pendiente",
  SHORTLIST: "Favorito",
  DISCARDED: "Descartado",
};
export default function LibraryGrid({
  designs, categories, productIds,
}: {
  designs: Design[];
  categories: { id: string; name: string }[];
  productIds: string[];
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const existing = useMemo(() => new Set(productIds), [productIds]);
  const allSelected = designs.length > 0 && designs.every(d => selectedSet.has(d.id));
  const change = (id: string, checked: boolean) =>
    setSelected(old => checked ? [...old.filter(v => v !== id), id].slice(0, 50) : old.filter(v => v !== id));
  return (
    <div className="space-y-5">
      <form action={bulkUpdateDesigns} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-[#1a211e] p-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={allSelected}
            onChange={event => setSelected(event.target.checked ? designs.slice(0, 50).map(d => d.id) : [])}
            className="size-5 accent-[#B5FF67]"/>
          Seleccionar página
        </label>
        {selected.map(id => <input key={id} type="hidden" name="designId" value={id}/>)}
        <span className="text-sm text-[#B5FF67]">{selected.length}/50 seleccionados</span>
        <select name="status" aria-label="Cambiar estado masivamente" defaultValue=""
          className="rounded-lg border border-white/20 bg-[#101319] px-3 py-2 text-sm">
          <option value="" disabled>Aplicar estado...</option>
          <option value="TO_REVIEW">Pendiente</option>
          <option value="SHORTLIST">Favorito</option>
          <option value="DISCARDED">Descartado</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          Categoría de productos
          <select name="categoryId" defaultValue=""
            aria-label="Categoría para nuevos borradores"
            className="rounded-lg border border-white/20 bg-[#101319] px-3 py-2 text-sm">
            <option value="">Seleccionar categoría...</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <button type="submit" formAction={createProductsFromLibrary}
          disabled={selected.length === 0 || categories.length === 0}
          className="rounded-lg border border-[#B5FF67] px-4 py-2 text-sm font-semibold text-[#B5FF67] disabled:opacity-40">
          Crear borradores de producto
        </button>
        <button type="submit" disabled={selected.length === 0}
          className="rounded-lg bg-[#B5FF67] px-4 py-2 text-sm font-bold text-[#101319] disabled:opacity-40">
          Aplicar a seleccionados
        </button>
      </form>
      <p className="text-xs text-amber-200">Crear borradores no supone autorización comercial. Los productos nuevos quedan en DRAFT, sin imágenes, variantes ni precio. La biblioteca conserva sus referencias.</p>
      <section className="grid gap-4 md:grid-cols-2">
        {designs.map(design => (
          <article key={design.id} className={`rounded-xl border bg-[#1a211e] p-5 ${selectedSet.has(design.id) ? "border-[#B5FF67]" : "border-white/10"}`}>
            <label className="flex cursor-pointer items-start gap-3">
              <input aria-label={`Seleccionar ${design.title}`} type="checkbox"
                checked={selectedSet.has(design.id)}
                disabled={!selectedSet.has(design.id) && selected.length >= 50}
                onChange={e => change(design.id, e.target.checked)}
                className="mt-1 size-5 accent-[#B5FF67]"/>
              <h2 className="text-lg font-semibold">{design.title}</h2>
            </label>
            <p className="mt-2 text-sm text-neutral-300">{design.designer || "Autor desconocido"} · #{design.externalId}</p>
            <p className="mt-1 text-xs text-amber-200">Licencia: {design.license || "No indicada"}</p>
            <p className="mt-1 text-xs text-neutral-400">Estado: {names[design.status]}</p>
            {existing.has(design.externalId) &&
              <p className="mt-1 text-xs font-semibold text-[#B5FF67]">Ya existe como producto</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={design.sourceUrl} target="_blank" rel="noopener noreferrer"
                className="rounded-lg border border-white/25 px-3 py-2 text-sm">Ver original ↗</a>
              <form action={updateDesignStatus} className="flex flex-wrap gap-2">
                <input type="hidden" name="id" value={design.id}/>
                <select name="status" defaultValue={design.status}
                  aria-label={`Estado de ${design.title}`}
                  className="rounded-lg border border-white/25 bg-[#101319] px-3 py-2 text-sm">
                  {Object.entries(names).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
                </select>
                <button type="submit" className="rounded-lg border border-[#B5FF67] px-3 py-2 text-sm text-[#B5FF67]">Actualizar</button>
              </form>
            </div>
          </article>
        ))}
      </section>
      {!designs.length && <p className="rounded-xl border border-dashed border-white/20 p-8 text-center text-neutral-400">No se encontraron diseños.</p>}
    </div>
  );
}
