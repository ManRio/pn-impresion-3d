import "server-only";
import { prisma } from "@/lib/prisma";
export type ReadinessCheck = {key:string;label:string;ok:boolean;detail:string};
export async function assessProductReadiness(id:string):Promise<ReadinessCheck[]|null> {
 const p=await prisma.product.findUnique({where:{id},include:{category:true,variants:true,images:true}});
 if(!p)return null;
 const external=Boolean(p.sourcePlatform)||p.designOrigin==="THIRD_PARTY";
 const valid=p.variants.some(v=>v.active&&v.priceCents>0&&v.weightGrams>0);
 return [
  {key:"content",label:"Ficha",ok:p.name.trim().length>=3&&p.description.trim().length>=10,detail:"Nombre y descripción de al menos 10 caracteres."},
  {key:"category",label:"Categoría",ok:Boolean(p.category),detail:"Categoría asignada."},
  {key:"variant",label:"Precio de venta",ok:p.saleMode==="QUOTE"||valid,detail:p.saleMode==="QUOTE"?"Presupuesto: el precio se acuerda después.":"Necesitas una variante activa con precio y peso."},
  ...(external?[{key:"rights",label:"Licencia de terceros",ok:p.commercialPermission&&Boolean(p.rightsEvidence?.trim())&&Boolean(p.rightsReviewedAt),detail:"Acredita la autorización comercial del diseño externo."}]:[]),
 ];
}
