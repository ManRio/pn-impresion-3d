import Link from "next/link";
import { Layers, Plus, Save, Trash2, ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { createCategory, deleteCategory, renameCategory } from "./actions";

type Params = { ok?: string; error?: string };

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<Params> }) {
  await requireAdmin();
  const [categories, feedback] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    searchParams,
  ]);
  const message = feedback.ok || feedback.error;
  return (
    <main className="min-h-screen bg-[#101319] px-4 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin" className="mb-8 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white">
          <ArrowLeft size={16} /> Volver al panel
        </Link>
        <div className="mb-8 flex items-center gap-3">
          <Layers className="text-[#B5FF67]" size={30} />
          <div>
            <p className="text-sm font-bold text-[#B5FF67]">P&N · CATÁLOGO</p>
            <h1 className="font-display text-3xl font-extrabold">CATEGORÍAS</h1>
            <p className="mt-1 text-sm text-neutral-400">Organiza los artículos de tu tienda.</p>
          </div>
        </div>
        {message && (
          <p role="status" className={`mb-6 rounded-lg border px-4 py-3 text-sm ${feedback.error ? "border-red-700 bg-red-950/40 text-red-200" : "border-[#B5FF67]/30 bg-[#B5FF67]/10 text-[#D8FFC0]"}`}>
            {message.slice(0, 180)}
          </p>
        )}
        <section className="mb-8 rounded-xl border border-white/10 bg-[#1a211e] p-5">
          <h2 className="mb-4 font-display text-lg font-bold">AÑADIR CATEGORÍA</h2>
          <form action={createCategory} className="flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="category-name">Nombre de la categoría</label>
            <input id="category-name" name="name" minLength={2} maxLength={80} required placeholder="Ej. Figuras articuladas" className="min-w-0 flex-1 rounded-lg border border-white/15 bg-[#101319] px-4 py-3 outline-none focus:border-[#B5FF67]" />
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#B5FF67] px-5 py-3 font-bold text-[#101319] hover:bg-[#d1ff9a]">
              <Plus size={18}/> Crear categoría
            </button>
          </form>
          <p className="mt-3 text-xs text-neutral-400">La URL (slug) se generará automáticamente a partir del nombre.</p>
        </section>
        <section className="rounded-xl border border-white/10 bg-[#1a211e] p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold">CATEGORÍAS EXISTENTES</h2>
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm">{categories.length}</span>
          </div>
          {categories.length === 0 ? (
            <p className="rounded-lg border border-dashed border-white/20 p-8 text-center text-neutral-400">Aún no hay categorías. Crea la primera con el formulario superior.</p>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="rounded-lg border border-white/10 bg-[#101319] p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
                    <span>URL: /categoria/{category.slug}</span>
                    <span>{category._count.products} productos</span>
                  </div>
                  <form action={renameCategory} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={category.id}/>
                    <label className="sr-only" htmlFor={`name-${category.id}`}>Renombrar {category.name}</label>
                    <input id={`name-${category.id}`} name="name" defaultValue={category.name} minLength={2} maxLength={80} required className="min-w-0 flex-1 rounded-lg border border-white/15 bg-[#1a211e] px-3 py-2 outline-none focus:border-[#B5FF67]" />
                    <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm hover:border-[#B5FF67]"><Save size={16}/> Guardar</button>
                  </form>
                  {category._count.products === 0 && (
                    <form action={deleteCategory} className="mt-3">
                      <input type="hidden" name="id" value={category.id}/>
                      <button type="submit" className="inline-flex items-center gap-2 text-sm text-red-300 hover:text-red-200"><Trash2 size={15}/> Eliminar categoría vacía</button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
