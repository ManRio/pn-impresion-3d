import Link from "next/link";
import { ArrowLeft, Search, PackagePlus } from "lucide-react";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { getMakerWorldModel } from "@/lib/makerworld";
import { importMakerWorldDraft } from "./actions";

type Query = { url?: string; error?: string };

export default async function ImportPage({ searchParams }: { searchParams: Promise<Query> }) {
  await requireAdmin();
  const params = await searchParams;
  const url = typeof params.url === "string" ? params.url.slice(0, 1000) : "";
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }, select: { id: true, name: true },
  });
  let model: Awaited<ReturnType<typeof getMakerWorldModel>> | null = null;
  let error = typeof params.error === "string" ? params.error.slice(0, 180) : "";
  if (url && !error) {
    try { model = await getMakerWorldModel(url); }
    catch (e) { error = e instanceof Error ? e.message : "No se pudo consultar MakerWorld."; }
  }
  const existing = model ? await prisma.product.findFirst({
    where: { sourcePlatform: "MAKERWORLD", sourceModelId: String(model.id) },
    select: { id: true, name: true },
  }) : null;

  const field = "w-full rounded-lg border border-white/15 bg-[#101319] px-4 py-3 text-white outline-none focus:border-[#B5FF67]";
  return (
    <main className="min-h-screen bg-[#101319] px-4 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin" className="mb-8 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white"><ArrowLeft size={16}/> Volver al panel</Link>
        <p className="text-sm font-bold text-[#B5FF67]">P&N · CATÁLOGO</p>
        <h1 className="font-display text-3xl font-extrabold">IMPORTAR DESDE MAKERWORLD</h1>
        <p className="mt-3 text-sm text-neutral-400">Consulta un modelo y guárdalo en Neon como borrador, pendiente de autorización y de datos de fabricación.</p>
        <form method="GET" className="mt-8 space-y-4 rounded-xl border border-white/10 bg-[#1a211e] p-6">
          <label htmlFor="url" className="block text-sm font-medium">Enlace del modelo</label>
          <input id="url" name="url" type="url" required defaultValue={url} placeholder="https://makerworld.com/es/models/..." className={field}/>
          <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-[#B5FF67] px-5 py-3 font-bold text-[#101319] hover:bg-[#d1ff9a]"><Search size={18}/> Consultar modelo</button>
        </form>
        {error && <p role="alert" className="mt-6 rounded-lg border border-red-700 bg-red-950/30 p-4 text-sm text-red-200">{error}</p>}
        {model && <section className="mt-8 space-y-5 rounded-xl border border-white/10 bg-[#1a211e] p-6">
          <h2 className="font-display text-xl font-bold">RESULTADO DE LA CONSULTA</h2>
          <div><p className="text-xs text-neutral-400">Modelo #{model.id}</p><h3 className="mt-1 text-xl font-semibold">{model.title}</h3><p className="mt-2 text-sm text-neutral-300">Diseñador: {model.designer || "No disponible"}</p></div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-4 text-sm"><p className="font-semibold text-amber-200">Licencia: {model.license || "Sin identificar"}</p><p className="mt-2 text-amber-100/80">La importación no concede permiso comercial. No se importan fotografías y el producto permanece como borrador.</p></div>
          <div><h4 className="font-semibold">Perfiles de impresión ({model.profiles.length})</h4><div className="mt-3 space-y-2">{model.profiles.map((profile,index)=><div key={`${profile.id}-${index}`} className="rounded-lg border border-white/10 bg-[#101319] px-4 py-3 text-sm">{profile.title || "Perfil sin título"} <span className="text-neutral-400">#{profile.id}</span></div>)}</div></div>
          {existing ? <div className="rounded-lg border border-[#B5FF67]/30 bg-[#B5FF67]/10 p-4"><p className="font-semibold">Este modelo ya está en el catálogo.</p><Link href={`/admin/productos/${existing.id}`} className="mt-2 inline-block text-sm text-[#B5FF67] underline">Editar {existing.name}</Link></div> : categories.length === 0 ? <p className="rounded-lg border border-amber-500/30 p-4 text-sm">Primero debes <Link className="text-[#B5FF67] underline" href="/admin/categorias">crear una categoría</Link>.</p> : <form action={importMakerWorldDraft} className="space-y-4 rounded-lg border border-white/10 bg-[#101319] p-5">
            <input type="hidden" name="url" value={`https://makerworld.com/es/models/${model.id}`}/>
            <label htmlFor="categoryId" className="block text-sm font-medium">Categoría del borrador</label>
            <select id="categoryId" name="categoryId" required defaultValue="" className={field}><option value="" disabled>Selecciona una categoría</option>{categories.map(cat=><option key={cat.id} value={cat.id}>{cat.name}</option>)}</select>
            <p className="text-xs text-neutral-400">Se guardarán la procedencia, autor y licencia. No se asignará un peso ficticio, un precio ni una imagen.</p>
            <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-[#B5FF67] px-5 py-3 font-bold text-[#101319] hover:bg-[#d1ff9a]"><PackagePlus size={18}/> Crear producto como borrador</button>
          </form>}
        </section>}
      </div>
    </main>
  );
}
