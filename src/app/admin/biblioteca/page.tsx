import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { saveDesign } from "./actions";
import LibraryGrid from "./LibraryGrid";

type Params = { status?: string; q?: string; page?: string; ok?: string; error?: string };
const statusNames = {
  TO_REVIEW: "Pendiente",
  SHORTLIST: "Favorito",
  DISCARDED: "Descartado",
} as const;
type Status = keyof typeof statusNames;
const PAGE_SIZE = 24;

export default async function LibraryPage({ searchParams }: { searchParams: Promise<Params> }) {
  await requireAdmin();
  const params = await searchParams;
  const status = Object.hasOwn(statusNames, params.status ?? "") ? params.status as Status : undefined;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const rawPage = Number(params.page || 1);
  const wantedPage = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const where = {
    ...(status ? { status } : {}),
    ...(q ? { OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { designer: { contains: q, mode: "insensitive" as const } },
      { externalId: { contains: q } },
    ] } : {}),
  };
  const [total, filtered] = await Promise.all([
    prisma.savedDesign.count(),
    prisma.savedDesign.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(filtered / PAGE_SIZE));
  const page = Math.min(wantedPage, pages);
  const [categories, existingProducts] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.product.findMany({
      where: { sourcePlatform: "MAKERWORLD" },
      select: { sourceModelId: true },
    }),
  ]);
  const productIds = existingProducts.map(p => p.sourceModelId).filter((id): id is string => id !== null);
  const designs = await prisma.savedDesign.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true, externalId: true, title: true, designer: true,
      license: true, sourceUrl: true, status: true,
    },
  });
  const pageUrl = (n: number) => `/admin/biblioteca?${new URLSearchParams({
    ...(q ? { q } : {}),
    ...(status ? { status } : {}),
    page: String(n),
  }).toString()}`;
  return (
    <main className="min-h-screen bg-[#101319] px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link href="/admin" className="text-sm text-neutral-400 hover:text-white">← Volver al panel</Link>
        <div>
          <p className="text-sm font-bold text-[#B5FF67]">P&N · DISEÑOS</p>
          <h1 className="font-display text-3xl font-bold">BIBLIOTECA</h1>
          <p className="mt-2 text-sm text-neutral-400">{total} referencias guardadas · {filtered} coinciden con los filtros. No son productos de venta.</p>
        </div>
        {params.ok && <p role="status" className="rounded-lg border border-[#B5FF67]/30 p-3 text-[#B5FF67]">{params.ok.slice(0, 200)}</p>}
        {params.error && <p role="alert" className="rounded-lg border border-red-700 p-3 text-red-300">{params.error.slice(0, 200)}</p>}
        <section className="rounded-xl border border-white/10 bg-[#1a211e] p-5">
          <h2 className="mb-3 text-lg font-semibold">Guardar una referencia</h2>
          <form action={saveDesign} className="flex flex-wrap gap-3">
            <input name="model" required maxLength={500} placeholder="ID o enlace de MakerWorld"
              aria-label="ID o enlace de MakerWorld"
              className="min-w-56 flex-1 rounded-lg border border-white/15 bg-[#101319] px-4 py-3" />
            <button type="submit" className="rounded-lg bg-[#B5FF67] px-5 py-3 font-semibold text-[#101319]">Guardar referencia</button>
          </form>
        </section>
        <form method="GET" className="flex flex-wrap gap-3">
          <input name="q" defaultValue={q} placeholder="Filtrar por nombre, autor o ID" aria-label="Buscar en biblioteca"
            className="min-w-48 flex-1 rounded-lg border border-white/15 bg-[#1a211e] px-4 py-3"/>
          <select name="status" defaultValue={status ?? ""} aria-label="Filtrar por estado"
            className="rounded-lg border border-white/15 bg-[#1a211e] px-4 py-3">
            <option value="">Todos los estados</option>
            {Object.entries(statusNames).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
          </select>
          <button type="submit" className="rounded-lg border border-white/25 px-5 py-3">Filtrar</button>
        </form>
        <LibraryGrid designs={designs} categories={categories} productIds={productIds}/>
        <nav className="flex items-center justify-between gap-3 text-sm">
          {page > 1 ? <Link href={pageUrl(page-1)} className="rounded-lg border border-white/25 px-4 py-2">← Anterior</Link> : <span/>}
          <span>Página {page} de {pages} · {PAGE_SIZE} por página</span>
          {page < pages ? <Link href={pageUrl(page+1)} className="rounded-lg border border-white/25 px-4 py-2">Siguiente →</Link> : <span/>}
        </nav>
        <Link href="/admin/explorar" className="inline-block text-sm text-[#B5FF67] underline">Explorar MakerWorld</Link>
      </div>
    </main>
  );
}
