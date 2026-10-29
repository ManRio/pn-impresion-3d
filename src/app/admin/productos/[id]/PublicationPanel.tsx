import SaveAndPublish from "./SaveAndPublish";
import { publicationFailures } from "@/lib/publication-checks";
import { registerCommercialRights, revokeCommercialRights, unpublishProduct, updateDesignOrigin } from "./publication-actions";
import type { Prisma } from "@/generated/prisma/client";

type Product = Prisma.ProductGetPayload<{include: { images: true; variants: true; category: true }}>;

export default function PublicationPanel({ product }: { product: Product }) {
  const failures = publicationFailures(product);
  const imported = Boolean(product.sourcePlatform);
  const thirdParty = imported || product.designOrigin === "THIRD_PARTY";
  return (
    <section className="mb-8 space-y-5 rounded-xl border border-white/10 bg-[#1a211e] p-6">
      <h2 className="font-display text-xl font-bold">PUBLICACIÓN Y DERECHOS</h2>
      <p className="text-sm text-neutral-300">Estado: <strong>{product.status}</strong></p>
      <form action={updateDesignOrigin} className="flex flex-wrap items-end gap-3 rounded-lg border border-white/10 p-4">
        <input type="hidden" name="productId" value={product.id}/>
        <div className="min-w-48 flex-1">
          <label htmlFor="designOrigin" className="mb-2 block text-sm">Procedencia del diseño</label>
          <select id="designOrigin" name="designOrigin" defaultValue={imported ? "THIRD_PARTY" : product.designOrigin}
            disabled={imported} className="w-full rounded-lg border border-white/20 bg-[#101319] p-3">
            <option value="OWN">Diseño propio de P&N</option>
            <option value="CUSTOM">Personalización con derechos de uso</option>
            <option value="THIRD_PARTY">Diseño de terceros</option>
          </select>
          {imported && <p className="mt-1 text-xs text-amber-200">Procedencia importada bloqueada: no puede reclasificarse como propia.</p>}
        </div>
        {!imported && <button className="rounded-lg border border-white/25 px-4 py-3 text-sm" type="submit">Guardar procedencia</button>}
      </form>
      <p className="text-xs text-neutral-400">Los diseños propios no requieren formulario de licencia. Para diseños ajenos, sí debemos acreditar permiso comercial. Las fotografías también deben estar autorizadas.</p>
      {thirdParty && (product.commercialPermission ? (
        <div className="space-y-2 rounded-lg border border-[#B5FF67]/30 p-4">
          <p className="text-sm font-bold text-[#B5FF67]">Declaración de derechos registrada</p>
          <p className="whitespace-pre-wrap break-words text-xs text-neutral-300">{product.rightsEvidence}</p>
          <form action={revokeCommercialRights}>
            <input type="hidden" name="productId" value={product.id} />
            <button type="submit" className="rounded-lg border border-red-400 px-4 py-2 text-sm text-red-300">Revocar declaración y retirar de venta</button>
          </form>
        </div>
      ) : (
        <form action={registerCommercialRights} className="space-y-3">
          <input type="hidden" name="productId" value={product.id} />
          <label htmlFor="rightsEvidence" className="block text-sm font-semibold">Base documental de la autorización</label>
          <textarea id="rightsEvidence" name="rightsEvidence" required minLength={15} maxLength={2000} rows={3}
            placeholder="Ej. Diseño propio, contrato firmado o permiso escrito del autor (indicar referencia y fecha)."
            className="w-full rounded-lg border border-white/20 bg-[#101319] p-3" />
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="confirmed" required className="mt-1 accent-[#B5FF67]" />
            Declaro que he verificado autorización comercial del diseño y uso de fotografías.
          </label>
          <button type="submit" className="rounded-lg border border-[#B5FF67] px-4 py-2 text-sm text-[#B5FF67]">Registrar derechos</button>
        </form>
      ))}
      <div className="space-y-2 rounded-lg border border-white/10 bg-[#101319] p-4">
        <p className="font-semibold">Validación para publicar: {failures.length ? `${failures.length} pendientes` : "Datos completos"}</p>
        {failures.length > 0 && <ul className="list-inside list-disc space-y-1 text-sm text-amber-200">
          {failures.map(msg => <li key={msg}>{msg}</li>)}
        </ul>}
      </div>
      {product.status === "ACTIVE" ? (
        <form action={unpublishProduct}>
          <input type="hidden" name="productId" value={product.id} />
          <button type="submit" className="rounded-lg bg-red-300 px-4 py-3 font-bold text-[#101319]">Retirar producto de la venta</button>
        </form>
      ) : (
        <SaveAndPublish id={product.id}/>
      )}
    </section>
  );
}
