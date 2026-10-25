import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import UploadForm from "./UploadForm";
export default async function PrintPage({searchParams}:{searchParams:Promise<{error?:string}>}) {
  await requireAdmin();
  const [categories,products,query] = await Promise.all([
    prisma.category.findMany({orderBy:{name:"asc"},select:{id:true,name:true}}),
    prisma.product.findMany({orderBy:{name:"asc"},select:{id:true,name:true,variants:{select:{id:true,label:true,sku:true},orderBy:{createdAt:"asc"}}}}),
    searchParams
  ]);
  return <main className="min-h-screen bg-[#101319] px-4 py-12 text-white"><div className="mx-auto max-w-3xl">
    <Link href="/admin" className="mb-8 inline-block text-sm text-neutral-400 hover:text-white">← Volver al panel</Link>
    <p className="text-sm font-bold text-[#B5FF67]">P&N · FABRICACIÓN</p>
    <h1 className="mb-3 font-display text-3xl font-extrabold">ANALIZAR IMPRESIÓN</h1>
    <p className="mb-8 text-sm text-neutral-400">Obtén datos de Bambu Studio y aplícalos a una variante o crea un producto nuevo.</p>
    {query.error && <p className="mb-4 rounded-lg border border-red-500 p-3 text-sm text-red-200">{query.error.slice(0,180)}</p>}
    <UploadForm categories={categories} products={products}/>
  </div></main>;
}
