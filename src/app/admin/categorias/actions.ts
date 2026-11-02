"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { slugifyCategory } from "@/lib/category-tree";
const get=(f:FormData,k:string)=>typeof f.get(k)==='string'?String(f.get(k)).trim().replace(/\s+/g,' '):'';
function feedback(kind:'ok'|'error',text:string):never {redirect(`/admin/categorias?${kind}=${encodeURIComponent(text)}`);}
async function checkParent(parentId:string, currentId?:string) {
 if (!parentId) return null;
 if (parentId===currentId) feedback('error','Una categoría no puede ser su propia subcategoría.');
 const parent=await prisma.category.findUnique({where:{id:parentId},select:{id:true,parentId:true}});
 if (!parent||parent.parentId) feedback('error','Solo puedes utilizar categorías principales como padre.');
 return parent.id;
}
function bust(){revalidatePath('/admin/categorias');revalidatePath('/tienda');revalidatePath('/admin/productos/nuevo');}
export async function createCategory(form:FormData) {
 await requireAdmin();const name=get(form,'name');const parentId=await checkParent(get(form,'parentId'));
 if(name.length<2||name.length>80) feedback('error','Nombre de 2 a 80 caracteres.');
 const base=slugifyCategory(name);if(!base)feedback('error','Nombre inválido.');
 const parent=parentId?await prisma.category.findUnique({where:{id:parentId},select:{slug:true}}):null;
 const slug=parent?`${parent.slug}-${base}`:base;
 try{await prisma.category.create({data:{name,slug,parentId}});}catch(e){
  if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==='P2002')feedback('error','Ya existe esa URL.');
  feedback('error','No se pudo crear. Comprueba el nombre o la categoría padre.');
 }
 bust();feedback('ok','Categoría creada.');
}
export async function renameCategory(form:FormData) {
 await requireAdmin();const id=get(form,'id');const name=get(form,'name');const parentId=await checkParent(get(form,'parentId'),id);
 if(name.length<2||name.length>80)feedback('error','Nombre de 2 a 80 caracteres.');
 const existing=await prisma.category.findUnique({where:{id},include:{_count:{select:{children:true}}}});
 if(!existing)feedback('error','Categoría inexistente.');
 if(parentId&&existing._count.children)feedback('error','No se puede convertir en subcategoría una categoría que ya tenga subcategorías.');
 const base=slugifyCategory(name);
 const parent=parentId?await prisma.category.findUnique({where:{id:parentId},select:{slug:true}}):null;
 const slug=parent?`${parent.slug}-${base}`:base;
 if(slug!==existing.slug && existing._count.children)feedback('error','Para cambiar la URL de una categoría con subcategorías, mueve o renombra primero las hijas.');
 try{await prisma.category.update({where:{id},data:{name,parentId,slug}});}catch(e){
  if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==='P2002')feedback('error','La URL ya existe.');
  feedback('error','No se pudo actualizar.');
 }
 bust();feedback('ok','Categoría actualizada.');
}
export async function deleteCategory(form:FormData) {
 await requireAdmin();const id=get(form,'id');
 const cat=await prisma.category.findUnique({where:{id},include:{_count:{select:{products:true,children:true}}}});
 if(!cat)feedback('error','Categoría no encontrada.');
 if(cat._count.products||cat._count.children)feedback('error','No se puede borrar una categoría que tenga productos o subcategorías.');
 try{await prisma.category.delete({where:{id}});}catch{feedback('error','No se pudo borrar: comprueba las relaciones.');}
 bust();feedback('ok','Categoría eliminada.');
}
