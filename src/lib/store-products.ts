import "server-only";
import { prisma } from "@/lib/prisma";
export async function storeProducts(category?:string) {
 return prisma.product.findMany({
  where:{status:"ACTIVE",...(category?{category:{slug:category}}:{})},
  include:{category:{select:{name:true,slug:true}},images:{orderBy:{position:"asc"}},variants:{where:{active:true},orderBy:{priceCents:"asc"}}},
  orderBy:{createdAt:"desc"},take:120,
 });
}
export const euro=(c:number)=>new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"}).format(c/100);
