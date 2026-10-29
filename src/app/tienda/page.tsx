import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { storeProducts } from "@/lib/store-products";
import StoreCard from "@/components/StoreCard";
export const metadata:Metadata={title:"Tienda",description:"Catálogo de productos impresos en 3D por P&N."};
export const dynamic="force-dynamic";
export default async function Tienda({searchParams}:{searchParams:Promise<{categoria?:string}>}){
 const {categoria}=await searchParams;
 const [items,categories]=await Promise.all([storeProducts(categoria),prisma.category.findMany({orderBy:{name:"asc"},select:{name:true,slug:true}})]);
 return <main className="mx-auto min-h-[70vh] max-w-7xl px-5 py-14 lg:px-8">
 <p className="text-sm font-bold uppercase tracking-widest text-[#B5FF67]">P&N IMPRESIÓN 3D</p><h1 className="mt-3 text-4xl font-black">TIENDA</h1>
 <p className="mt-3 text-white/60">Piezas impresas en 3D y proyectos personalizados.</p>
 <nav aria-label="Categorías" className="my-8 flex flex-wrap gap-2"><Link href="/tienda" className={`rounded-lg border px-4 py-2 text-sm ${!categoria?"border-[#B5FF67] text-[#B5FF67]":"border-white/20"}`}>Todos</Link>{categories.map(c=><Link key={c.slug} href={`/tienda?categoria=${encodeURIComponent(c.slug)}`} className={`rounded-lg border px-4 py-2 text-sm ${categoria===c.slug?"border-[#B5FF67] text-[#B5FF67]":"border-white/20"}`}>{c.name}</Link>)}</nav>
 {items.length?<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{items.map(p=><StoreCard key={p.id} product={p}/>)}</div>:<div className="rounded-xl border border-white/10 bg-[#1a211e] p-9"><p className="font-semibold">Aún no hay productos publicados en esta categoría.</p><p className="mt-2 text-sm text-white/60">Vuelve pronto o solicita una pieza personalizada.</p><Link href="/presupuesto" className="mt-5 inline-block text-[#B5FF67]">Solicitar presupuesto →</Link></div>}
 </main>;
}
