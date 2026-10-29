import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { saveDesign, updateDesignStatus } from "./actions";

type Params = { status?: string; q?: string; ok?: string; error?: string };
const statusNames: Record<string, string> = {
  TO_REVIEW: "Pendiente",
  SHORTLIST: "Favorito",
  DISCARDED: "Descartado",
};
export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const status = ["TO_REVIEW", "SHORTLIST", "DISCARDED"].includes(params.status || "")
    ? params.status as "TO_REVIEW" | "SHORTLIST" | "DISCARDED" : undefined;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const designs = await prisma.savedDesign.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q ? { OR: [
        { title: { contains: q, mode: "insensitive" } },
        { designer: { contains: q, mode: "insensitive" } },
        { externalId: { contains: q } },
      ] } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const total = await prisma.savedDesign.count();
  return (
    <main className="min-h-screen bg-[#101319] px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link href="/admin" className="text-sm text-neutral-400 hover:text-white">← Volver al panel</Link>
        <div>
          <p className="text-sm font-bold text-[#B5FF67]">P&N · DISEÑOS</p>
          <h1 className="font-display text-3xl font-bold">BIBLIOTECA</h1>
          <p className="mt-2 text-sm text-neutral-400">
            {total} referencias guardadas. Esta biblioteca no publica productos ni concede derechos comerciales.
          </p>
        </div>
        {params.ok && <p role="status" className="rounded-lg border border-[#B5FF67]/30 p-3 text-[#B5FF67]">{params.ok.slice(0, 200)}</p>}
        {params.error && <p role="alert" className="rounded-lg border border-red-700 p-3 text-red-300">{params.error.slice(0, 200)}</p>}
        <section className="rounded-xl border border-white/10 bg-[#1a211e] p-5">
          <h2 className="mb-3 text-lg font-semibold">Guardar una referencia</h2>
          <form action={saveDesign} className="flex flex-wrap gap-3">
            <input name="model" required maxLength={500} placeholder="ID o enlace de MakerWorld"
              aria-label="ID o enlace de MakerWorld"
              className="min-w-56 flex-1 rounded-lg border border-white/15 bg-[#101319] px-4 py-3" />
            <button className="rounded-lg bg-[#B5FF67] px-5 py-3 font-semibold text-[#101319]" type="submit">Guardar referencia</button>
          </form>
          <p className="mt-2 text-xs text-neutral-400">
            Primera versión: guardado individual desde ID o URL. La selección múltiple del explorador se conectará a esta biblioteca en la siguiente fase.
          </p>
        </section>
        <form method="GET" className="flex flex-wrap gap-3">
          <input name="q" defaultValue={q} placeholder="Filtrar nombre, autor o ID"
            aria-label="Filtrar biblioteca" className="min-w-48 flex-1 rounded-lg border border-white/15 bg-[#1a211e] px-4 py-3" />
          <select name="status" defaultValue={status ?? ""} aria-label="Filtrar por estado"
            className="rounded-lg border border-white/15 bg-[#1a211e] px-4 py-3">
            <option value="">Todos los estados</option>
            {Object.entries(statusNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <button type="submit" className="rounded-lg border border-white/25 px-5 py-3">Filtrar</button>
        </form>
        <section className="grid gap-4 md:grid-cols-2">
          {designs.map(design => (
            <article key={design.id} className="rounded-xl border border-white/10 bg-[#1a211e] p-5">
              <h2 className="text-lg font-semibold">{design.title}</h2>
              <p className="mt-2 text-sm text-neutral-300">{design.designer || "Autor desconocido"} · #{design.externalId}</p>
              <p className="mt-1 text-xs text-amber-200">Licencia declarada: {design.license || "No indicada"}</p>
              <p className="mt-1 text-xs text-neutral-400">Estado: {statusNames[design.status]}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <a href={design.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="rounded-lg border border-white/25 px-3 py-2 text-sm hover:border-[#B5FF67]">Ver original ↗</a>
                <form action={updateDesignStatus} className="flex flex-wrap gap-2">
                  <input type="hidden" name="id" value={design.id}/>
                  <select name="status" defaultValue={design.status} aria-label={`Estado de ${design.title}`}
                    className="rounded-lg border border-white/25 bg-[#101319] px-3 py-2 text-sm">
                    {Object.entries(statusNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  <button type="submit" className="rounded-lg bg-[#B5FF67] px-3 py-2 text-sm font-semibold text-[#101319]">Actualizar</button>
                </form>
              </div>
            </article>
          ))}
        </section>
        {!designs.length && <p className="rounded-xl border border-dashed border-white/20 p-8 text-center text-neutral-400">No hay diseños para estos filtros.</p>}
        {designs.length === 100 && <p className="text-xs text-amber-200">Se muestran los primeros 100 resultados. Incorporaremos paginación en la ampliación de la biblioteca.</p>}
        <Link href="/admin/explorar" className="inline-block text-sm text-[#B5FF67] underline">Ir al explorador MakerWorld</Link>
      </div>
    </main>
  );
}
