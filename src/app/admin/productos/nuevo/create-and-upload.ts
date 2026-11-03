"use server";
import { prisma } from "@/lib/prisma";
import { parseProductSEO } from "@/lib/product-seo";
import { requireAdmin } from "@/lib/require-admin";
import { publicationFailures } from "@/lib/publication-checks";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
const val=(form:FormData,k:string)=>String(form.get(k)||"").trim();
const n=(s:string,min:number,max:number)=>/^\d+$/.test(s)&&Number.isSafeInteger(Number(s))&&Number(s)>=min&&Number(s)<=max?Number(s):null;
function fail(s:string):never{redirect(`/admin/productos/nuevo?error=${encodeURIComponent(s)}`)}
function slugify(name:string){return name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
function sniff(bytes:Buffer){if(bytes.subarray(0,3).equals(Buffer.from([255,216,255])))return "image/jpeg";if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return "image/png";if(bytes.toString("ascii",0,4)==="RIFF"&&bytes.toString("ascii",8,12)==="WEBP")return "image/webp";return null}
export async function createAndUpload(form:FormData){
 await requireAdmin();const name=val(form,"name").replace(/\s+/g," "),description=val(form,"description"),categoryId=val(form,"categoryId"),saleMode=val(form,"saleMode"),sku=val(form,"sku").toUpperCase(),label=val(form,"label"),color=val(form,"color"),material=val(form,"material");
 const weightGrams=n(val(form,"weightGrams"),1,100000),rateCents=n(val(form,"rateCents"),1,10000),priceRaw=val(form,"priceCents"),minutesRaw=val(form,"productionMins"),productionMins=minutesRaw?n(minutesRaw,1,100000):null;
 if(name.length<3||name.length>120||description.length<10||description.length>5000||!slugify(name))fail("Revisa el nombre y descripción.");
 if(!["DIRECT","QUOTE"].includes(saleMode)||!await prisma.category.findUnique({where:{id:categoryId}}))fail("Categoría o modalidad incorrecta.");
 if(!/^[A-Z0-9][A-Z0-9_-]{2,49}$/.test(sku)||label.length<2||label.length>100||color.length<2||color.length>60||!["PLA","PETG","TPU","OTHER"].includes(material))fail("Revisa la primera variante.");
 if(weightGrams===null||rateCents===null||(minutesRaw&&productionMins===null))fail("Peso, tarifa o tiempo incorrectos.");
 const priceCents=priceRaw?n(priceRaw,0,100000000):weightGrams*rateCents;
 if(priceCents===null||priceCents>100000000||(saleMode==="DIRECT"&&priceCents===0))fail("Precio incorrecto.");
 let seo:ReturnType<typeof parseProductSEO>;try {seo=parseProductSEO(form)}catch(e){fail(e instanceof Error?e.message:"Error de SEO")};
 let productId="";
 try{const base=slugify(name);let slug=base;for(let k=2;k<200&&await prisma.product.findUnique({where:{slug}});k++)slug=`${base}-${k}`;
 const p=await prisma.product.create({data:{name,description,...seo,categoryId,slug,status:"DRAFT",designOrigin:"OWN",saleMode:saleMode as "DIRECT"|"QUOTE",variants:{create:{sku,label,color,material:material as "PLA"|"PETG"|"TPU"|"OTHER",weightGrams,priceCents,productionMins}}}});productId=p.id;
 }catch(e){console.error("createAndUpload create",e);fail("No se pudo crear. Revisa que el SKU no esté duplicado.")}
 revalidatePath('/admin/productos');
 return productId;
}

export async function finishNewProduct(productId: string, publish: boolean) {
 await requireAdmin();
 const product = await prisma.product.findUnique({
   where: { id: productId }, include: { category: true, variants: true, images: true },
 });
 if (!product) return { published: false, message: 'Producto inexistente.' };
 if (!publish) return { published: false, message: 'Borrador guardado.' };
 const failures = publicationFailures(product);
 if (failures.length) return { published: false, message: 'Borrador guardado; revisa los requisitos para publicarlo.' };
 await prisma.product.update({ where: { id: productId }, data: { status: 'ACTIVE' } });
 revalidatePath('/tienda');
 revalidatePath('/api/productos');
 revalidatePath(`/tienda/${product.slug}`);
 return { published: true, message: 'Producto publicado.' };
}
