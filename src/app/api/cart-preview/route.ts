import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
export const runtime="nodejs";
export async function POST(req:Request) {
 try {
  const json:unknown=await req.json();
  if(!json||typeof json!=="object"||!("lines" in json)||!Array.isArray(json.lines))return NextResponse.json({error:"Carrito inválido"},{status:400});
  const lines=json.lines as {variantId?:unknown;quantity?:unknown}[];
  if(lines.length>30)return NextResponse.json({error:"Demasiados artículos"},{status:400});
  const ids=lines.map(l=>l.variantId).filter((v):v is string=>typeof v==="string").slice(0,30);
  const variants=await prisma.productVariant.findMany({where:{id:{in:ids},active:true,product:{status:"ACTIVE",saleMode:"DIRECT"}},include:{product:{select:{name:true,slug:true,images:{orderBy:{position:"asc"},take:1}}}}});
  return NextResponse.json({items:variants.map(v=>({id:v.id,name:v.product.name,slug:v.product.slug,label:v.label,priceCents:v.priceCents,image:v.product.images[0]?.url??null}))});
 }catch{return NextResponse.json({error:"No se pudo leer el carrito"},{status:400});}
}
