"use client";

import { useState } from "react";
import { Archive, Trash2, EyeOff } from "lucide-react";
import { archiveProduct, deleteProductPermanently, setProductInactive } from "./product-lifecycle-actions";

type Props = { productId: string; slug: string; status: "DRAFT" | "ACTIVE" | "ARCHIVED" };

export default function ProductLifecyclePanel({ productId, slug, status }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");

  return (
    <section className="mt-12 space-y-5 rounded-xl border border-white/10 bg-[#1a211e] p-6">
      <div>
        <h2 className="font-display text-xl font-bold">RETIRAR O ELIMINAR PRODUCTO</h2>
        <p className="mt-2 text-sm text-neutral-400">
          Despublicar conserva el borrador; archivar guarda el historial de la ficha; eliminar es irreversible.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {status === "ACTIVE" && (
          <form action={setProductInactive}>
            <input type="hidden" name="productId" value={productId} />
            <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-amber-400/40 px-4 py-3 text-sm font-semibold text-amber-200 hover:bg-amber-400/10">
              <EyeOff size={17} /> Despublicar
            </button>
          </form>
        )}
        {status !== "ARCHIVED" && (
          <form action={archiveProduct}>
            <input type="hidden" name="productId" value={productId} />
            <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-3 text-sm font-semibold hover:bg-white/5">
              <Archive size={17} /> Archivar
            </button>
          </form>
        )}
        {status !== "ACTIVE" && (
          <button type="button" onClick={() => setConfirming(value => !value)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/50 px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/10">
            <Trash2 size={17} /> Eliminar definitivamente
          </button>
        )}
      </div>

      {confirming && status !== "ACTIVE" && (
        <form action={deleteProductPermanently} className="space-y-3 rounded-lg border border-red-500/40 bg-red-950/20 p-4">
          <input type="hidden" name="productId" value={productId} />
          <p className="text-sm font-semibold text-red-200">Esta acción eliminará el producto y todas sus variantes y fotografías. No se puede deshacer.</p>
          <label htmlFor="confirmSlug" className="block text-sm text-neutral-300">
            Escribe <strong className="select-all text-white">{slug}</strong> para confirmar:
          </label>
          <input id="confirmSlug" name="confirmSlug" autoComplete="off" required value={typed}
            onChange={event => setTyped(event.target.value)}
            className="w-full rounded-lg border border-white/20 bg-[#101319] px-3 py-2.5 text-white" />
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={typed !== slug}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">
              Sí, eliminar definitivamente
            </button>
            <button type="button" onClick={() => { setConfirming(false); setTyped(""); }}
              className="rounded-lg border border-white/20 px-4 py-2.5 text-sm">Cancelar</button>
          </div>
        </form>
      )}
    </section>
  );
}
