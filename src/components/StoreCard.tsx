import Link from "next/link";
import { euro } from "@/lib/store-products";
type P={slug:string;name:string;saleMode:"DIRECT"|"QUOTE";category:{name:string};images:{url:string;alt:string}[];variants:{priceCents:number}[]};
export default function StoreCard({product:p}:{product:P}){
 const price=p.variants.filter(v=>v.priceCents>0).map(v=>v.priceCents).sort((a,b)=>a-b)[0];
 return <Link href={`/tienda/${encodeURIComponent(p.slug)}`} className="group overflow-hidden rounded-xl border border-white/10 bg-[#1a211e] hover:border-[#B5FF67]/60">
  <div className="relative aspect-square bg-[#252b25]">{p.images[0]?<img src={p.images[0].url} alt={p.images[0].alt||p.name} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"/>:<div className="flex h-full items-center justify-center text-sm text-white/40">P&N IMPRESIÓN 3D</div>}</div>
  <div className="p-4"><span className="text-xs font-bold uppercase tracking-wide text-[#B5FF67]">{p.category.name}</span><h2 className="mt-2 text-lg font-bold">{p.name}</h2><p className="mt-3 text-sm text-white/70">{p.saleMode==="QUOTE"?"Solicitar presupuesto":price!==undefined?`Desde ${euro(price)}`:"Consultar precio"}</p></div>
 </Link>;
}
