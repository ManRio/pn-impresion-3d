"use server";
import {headers} from "next/headers";
import {auth} from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import {revalidatePath} from "next/cache";
type Input={lines:{variantId:string;quantity:number}[];notes:string};
type Result={ok:true;reference:string}|{ok:false;error:string};
export async function placeOrder(input:Input):Promise<Result>{
 const session=await auth.api.getSession({headers:await headers()});
 if(!session)return {ok:false,error:"Inicia sesión en Mi cuenta antes de confirmar el pedido."};
 if(!input||!Array.isArray(input.lines)||!input.lines.length||input.lines.length>30||typeof input.notes!=="string"||input.notes.length>2000)return {ok:false,error:"Carrito no válido."};
 const quantities=new Map<string,number>();
 for(const line of input.lines){if(!line||typeof line.variantId!=="string"||!Number.isInteger(line.quantity)||line.quantity<1||line.quantity>20)return {ok:false,error:"Cantidad no válida."};quantities.set(line.variantId,(quantities.get(line.variantId)??0)+line.quantity);}
 if([...quantities.values()].some(x=>x>20))return {ok:false,error:"Máximo 20 unidades por variante."};
 const profile=await prisma.customerProfile.findUnique({where:{userId:session.user.id}});
 if(!profile||!profile.shippingAddress.trim()||!profile.shippingPostalCode.trim()||!profile.shippingCity.trim()||!profile.shippingProvince.trim()||!profile.shippingCountry.trim())return {ok:false,error:"Completa primero tu dirección de envío en Mi cuenta."};
 const variants=await prisma.productVariant.findMany({where:{id:{in:[...quantities.keys()]},active:true,priceCents:{gt:0},product:{status:"ACTIVE",saleMode:"DIRECT"}},include:{product:{select:{name:true}}}});
 if(variants.length!==quantities.size)return {ok:false,error:"Algún producto ya no está disponible. Revisa tu carrito."};
 const total=variants.reduce((sum,v)=>sum+v.priceCents*quantities.get(v.id)!,0);
 if(!Number.isSafeInteger(total)||total<=0||total>100000000)return {ok:false,error:"Total no válido."};
 const order=await prisma.order.create({data:{userId:session.user.id,customerName:session.user.name,customerEmail:session.user.email,customerPhone:profile.phone,shippingAddress:[profile.shippingAddress,profile.shippingPostalCode,profile.shippingCity,profile.shippingProvince,profile.shippingCountry].join(" | "),billingAddress:[profile.billingAddress||profile.shippingAddress,profile.billingPostalCode||profile.shippingPostalCode,profile.billingCity||profile.shippingCity,profile.billingProvince||profile.shippingProvince,profile.billingCountry||profile.shippingCountry].join(" | "),customerNotes:input.notes,totalCents:total,items:{create:variants.map(v=>({variantId:v.id,productName:v.product.name,variantLabel:v.label,sku:v.sku,material:v.material,color:v.color,unitPriceCents:v.priceCents,quantity:quantities.get(v.id)!,lineTotalCents:v.priceCents*quantities.get(v.id)!}))},history:{create:{authorName:"Sistema",publicMessage:"Pedido recibido",previousStatus:null,newStatus:"RECEIVED"}}},select:{id:true}});
 revalidatePath("/admin/pedidos");revalidatePath("/mi-cuenta/mis-pedidos");
 return {ok:true,reference:order.id.slice(-8).toUpperCase()};
}
