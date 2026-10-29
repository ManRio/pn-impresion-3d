"use client";

import { useMemo, useState } from "react";
import { ExternalLink, ImageOff, Search, CheckCheck } from "lucide-react";
import type { DiscoveryModel } from "@/lib/makerworld-discovery";

type Props = { models: DiscoveryModel[]; importedIds: string[]; savedIds: string[] };

function allowedCover(cover: string | null): string | null {
  if (!cover) return null;
  try {
    const url = new URL(cover);
    return url.protocol === "https:" &&
      ["makerworld.bblmw.com", "public-cdn.bblmw.com"].includes(url.hostname)
      ? url.href : null;
  } catch { return null; }
}

export default function ExploreGrid({ models, importedIds, savedIds }: Props) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");
  const imported = useMemo(() => new Set(importedIds), [importedIds]);
  const saved = useMemo(() => new Set(savedIds), [savedIds]);
  const visible = models.filter((model) => {
    const text = `${model.title} ${model.designer} ${model.license}`.toLocaleLowerCase();
    const matches = text.includes(search.trim().toLocaleLowerCase());
    if (!matches) return false;
    if (filter === "not-imported") return !imported.has(String(model.id));
    if (filter === "imported") return imported.has(String(model.id));
    return true;
  });
  function toggle(id: string, checked: boolean) {
    setSelected((current) => {
      if (!checked) return current.filter((item) => item !== id);
      if (current.includes(id) || current.length >= 10) return current;
      return [...current, id];
    });
  }
  function selectVisible() {
    setSelected((current) => [
      ...current,
      ...visible.map(m => String(m.id)).filter(id => !current.includes(id)),
    ].slice(0, 10));
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-[#1a211e] p-4">
        <div className="relative min-w-[180px] flex-1">
          <Search size={17} className="absolute left-3 top-3.5 text-neutral-400" />
          <input aria-label="Filtrar resultados de esta página" value={search} onChange={event => setSearch(event.target.value)}
            placeholder="Filtrar por nombre, diseñador o licencia…"
            className="w-full rounded-lg border border-white/15 bg-[#101319] py-3 pl-10 pr-3 text-sm outline-none focus:border-[#B5FF67]" />
        </div>
        <select aria-label="Filtrar modelos ya importados" value={filter} onChange={event => setFilter(event.target.value)}
          className="rounded-lg border border-white/15 bg-[#101319] px-3 py-3 text-sm">
          <option value="all">Todos</option>
          <option value="not-imported">Sin importar</option>
          <option value="imported">Importados</option>
        </select>
        <button type="button" onClick={selectVisible} disabled={selected.length === 10}
          className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-3 py-3 text-sm hover:border-[#B5FF67] disabled:opacity-40">
          <CheckCheck size={16}/> Seleccionar visibles
        </button>
        <span className="text-xs text-[#B5FF67]">{selected.length}/10 seleccionados</span>
      </div>
      <p className="text-xs text-neutral-400">Filtra los {models.length} resultados de esta página. La búsqueda no consulta todo MakerWorld. Las portadas son referencias visuales externas, no fotografías incorporadas al catálogo.</p>
      {selected.map(id => <input key={id} type="hidden" name="modelId" value={id} />)}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(model => {
          const id = String(model.id);
          const done = imported.has(id);
          const isSaved = saved.has(id);
          const checked = selected.includes(id);
          const cover = allowedCover(model.cover);
          return (
            <article key={id} className={`overflow-hidden rounded-xl border bg-[#1a211e] ${checked ? "border-[#B5FF67]" : "border-white/10"}`}>
              <div className="relative aspect-[4/3] bg-[#101319]">
                {cover ? (
                  <div role="img" aria-label={`Portada de referencia de ${model.title}`}
                    className="h-full w-full bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url("${cover}")` }} />
                ) : (
                  <div className="flex h-full items-center justify-center text-neutral-500"><ImageOff size={36}/></div>
                )}
                {(done || isSaved) && <span className="absolute right-3 top-3 rounded-md bg-[#B5FF67] px-2 py-1 text-xs font-bold text-[#101319]">{done && isSaved ? "Producto + biblioteca" : done ? "Producto importado" : "En biblioteca"}</span>}
              </div>
              <div className="space-y-2 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" checked={checked} disabled={!checked && selected.length >= 10}
                    onChange={event => toggle(id, event.target.checked)}
                    className="mt-1 h-5 w-5 accent-[#B5FF67]" />
                  <span className="font-semibold leading-snug">{model.title}</span>
                </label>
                <p className="text-sm text-neutral-300">{model.designer || "Diseñador desconocido"} · #{model.id}</p>
                <p className="text-xs text-neutral-400">{model.downloads.toLocaleString("es-ES")} descargas · {model.likes.toLocaleString("es-ES")} me gusta</p>
                <p className="text-xs text-amber-200">Licencia: {model.license || "Sin identificar"}</p>
                <a href={model.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[#B5FF67] underline">Abrir modelo <ExternalLink size={14}/></a>
              </div>
            </article>
          );
        })}
      </div>
      {visible.length === 0 && <p className="rounded-xl border border-dashed border-white/20 p-8 text-center text-neutral-400">No hay resultados con estos filtros.</p>}
    </div>
  );
}
