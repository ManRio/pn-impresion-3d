import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { discoverMakerWorld, validCategory } from "@/lib/makerworld-discovery";
import { searchMakerWorld } from "@/lib/makerworld-search";
import { importSelectedModels } from "./actions";
import { saveSelectedToLibrary } from "./save-to-library";
import ExploreGrid from "./ExploreGrid";

type Params = {
  nav?: string;
  page?: string;
  q?: string;
  mode?: string;
  ok?: string;
  error?: string;
};

const navOptions = [
  { key: "Trending", label: "Tendencias" },
  { key: "category_400", label: "Juguetes y juegos" },
  { key: "category_800", label: "Hogar y decoración" },
] as const;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const mode = params.mode === "search" ? "search" : "nav";
  const nav = validCategory(typeof params.nav === "string" ? params.nav : "");
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const requestedPage = Number(params.page ?? "1");
  const page = Number.isInteger(requestedPage) && requestedPage >= 1 &&
    requestedPage <= 25 ? requestedPage : 1;

  let models: Awaited<ReturnType<typeof discoverMakerWorld>> = [];
  let total: number | null = null;
  let error = "";
  if (mode === "search" && q.length < 2) {
    error = "Escribe al menos dos caracteres para buscar.";
  } else {
    try {
      if (mode === "search") {
        const result = await searchMakerWorld(q, page);
        models = result.models;
        total = result.total;
      } else {
        models = await discoverMakerWorld(nav, page);
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Error al consultar MakerWorld.";
    }
  }

  const [categories, imported, saved] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.product.findMany({
      where: {
        sourcePlatform: "MAKERWORLD",
        sourceModelId: { in: models.map(m => String(m.id)) },
      },
      select: { sourceModelId: true },
    }),
    prisma.savedDesign.findMany({
      where: { platform: "MAKERWORLD", externalId: { in: models.map(m => String(m.id)) } },
      select: { externalId: true },
    }),
  ]);
  const importedIds = imported.map(p => p.sourceModelId).filter((v): v is string => v !== null);
  const savedIds = saved.map(d => d.externalId);
  const importedSet = new Set(importedIds);
  const availableCount = models.filter(m => !importedSet.has(String(m.id))).length;
  const pageUrl = (nextPage: number) =>
    mode === "search"
      ? `/admin/explorar?mode=search&q=${encodeURIComponent(q)}&page=${nextPage}`
      : `/admin/explorar?nav=${encodeURIComponent(nav)}&page=${nextPage}`;

  return (
    <main className="min-h-screen bg-[#101319] px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="mb-7 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white">
          <ArrowLeft size={16}/> Volver al panel
        </Link>
        <p className="text-sm font-bold text-[#B5FF67]">P&N · DESCUBRIMIENTO</p>
        <h1 className="font-display text-3xl font-bold">EXPLORAR MAKERWORLD</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Busca diseños en MakerWorld o explora sus categorías. Los modelos seleccionados se importan como borradores.
        </p>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <form method="GET" className="space-y-3 rounded-xl border border-white/10 bg-[#1a211e] p-5">
            <input type="hidden" name="mode" value="search"/>
            <label htmlFor="q" className="block font-semibold">Buscar en todo MakerWorld</label>
            <input id="q" name="q" type="search" minLength={2} maxLength={80}
              defaultValue={q} placeholder="Ej. dragon, llavero, organizador..."
              className="w-full rounded-lg border border-white/15 bg-[#101319] px-4 py-3 outline-none focus:border-[#B5FF67]"/>
            <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-[#B5FF67] px-5 py-3 font-bold text-[#101319]">
              <Search size={17}/> Buscar modelos
            </button>
          </form>
          <form method="GET" className="space-y-3 rounded-xl border border-white/10 bg-[#1a211e] p-5">
            <label htmlFor="nav" className="block font-semibold">Explorar por categoría</label>
            <select id="nav" name="nav" defaultValue={nav}
              className="w-full rounded-lg border border-white/15 bg-[#101319] px-4 py-3">
              {navOptions.map(option => <option key={option.key} value={option.key}>{option.label}</option>)}
            </select>
            <button type="submit" className="rounded-lg border border-[#B5FF67] px-5 py-3 font-semibold text-[#B5FF67]">Explorar</button>
          </form>
        </div>

        {(error || params.error) && (
          <p role="alert" className="mt-5 rounded-lg border border-red-700 bg-red-950/30 p-4 text-red-200">
            {(error || params.error || "").slice(0, 200)}
          </p>
        )}
        {params.ok && (
          <p role="status" className="mt-5 rounded-lg border border-[#B5FF67]/30 bg-[#B5FF67]/10 p-4 text-[#D8FFC0]">
            {params.ok.slice(0, 200)}
          </p>
        )}

        <div className="mt-7 text-sm text-neutral-400">
          {mode === "search" ? `Resultados para «${q}»` : "Resultados por categoría"}
          {total !== null ? ` · ${total} resultados indicados por MakerWorld` : ""}
        </div>

        {models.length > 0 && (
          <form action={saveSelectedToLibrary} className="mt-5 space-y-5">
            <div className="flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-[#1a211e] p-5">
              <div className="min-w-56 flex-1">
                <label htmlFor="categoryId" className="mb-2 block text-sm">Categoría de destino</label>
                <select id="categoryId" name="categoryId" defaultValue=""
                  className="w-full rounded-lg border border-white/15 bg-[#101319] px-4 py-3">
                  <option value="" disabled>Selecciona una categoría</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <button type="submit"
                className="rounded-lg bg-[#B5FF67] px-5 py-3 font-bold text-[#101319] disabled:opacity-40">
                Guardar selección en biblioteca
              </button>
              <button type="submit" formAction={importSelectedModels}
                disabled={availableCount === 0 || categories.length === 0}
                className="rounded-lg border border-[#B5FF67] px-5 py-3 font-bold text-[#B5FF67] disabled:opacity-40">
                Crear borradores de producto
              </button>
            </div>
            <p className="text-xs text-amber-200">
              Máximo 10 modelos por operación. Para biblioteca no hace falta categoría; para productos, sí. Sin publicación automática ni copia de fotografías.
              Debemos verificar los derechos comerciales antes de poner cualquier pieza a la venta.
            </p>
            <ExploreGrid models={models} importedIds={importedIds} savedIds={savedIds}/>
          </form>
        )}

        <nav className="mt-8 flex items-center justify-between gap-3">
          {page > 1
            ? <Link className="rounded-lg border border-white/20 px-4 py-2" href={pageUrl(page - 1)}>← Anterior</Link>
            : <span/>}
          <span className="text-sm text-neutral-400">Página {page}</span>
          {models.length === 20 && page < 25
            ? <Link className="rounded-lg border border-white/20 px-4 py-2" href={pageUrl(page + 1)}>Siguiente →</Link>
            : <span/>}
        </nav>
      </div>
    </main>
  );
}
