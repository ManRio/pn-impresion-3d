'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/require-admin';
import { prisma } from '@/lib/prisma';
import type { QuoteStatus } from '@/generated/prisma/client';

const statuses: QuoteStatus[] = ['NEW','REVIEWING','QUOTED','ACCEPTED','REJECTED','CLOSED'];
const get=(f:FormData,k:string)=>String(f.get(k)??'').trim();
const fail=(id:string,msg:string):never=>redirect(`/admin/presupuestos?error=${encodeURIComponent(msg)}#q-${encodeURIComponent(id)}`);
export async function saveQuoteManagement(f:FormData){
 const admin=await requireAdmin();
 const id=get(f,'id'),status=get(f,'status') as QuoteStatus;
 const note=get(f,'note'),reference=get(f,'reference'),items=get(f,'items'),delivery=get(f,'delivery'),amount=get(f,'amount');
 const sent=f.get('sent')==='on';
 if(!statuses.includes(status)) fail(id,'Estado inválido');
 if(note.length>4000||reference.length>100||items.length>500||delivery.length>200) fail(id,'Texto demasiado largo');
 if(amount&&!/^\d{1,8}([.,]\d{1,2})?$/.test(amount)) fail(id,'Importe incorrecto');
 const amountCents=amount?Math.round(Number(amount.replace(',','.'))*100):null;
 const quote=await prisma.quoteRequest.findUnique({where:{id},select:{id:true,status:true}});
 if(!quote) redirect('/admin/presupuestos?error=Solicitud%20no%20encontrada');
 if(status==='REJECTED'&&!note) fail(id,'Para rechazar, añade el motivo en la nota');
 if(quote.status===status&&!note&&!reference&&!items&&!delivery&&!amount&&!sent) fail(id,'Indica alguna modificación');
 await prisma.$transaction(async tx=>{
  await tx.quoteRequest.update({where:{id},data:{status}});
  await tx.quoteInternalNote.create({data:{quoteId:id,authorId:admin.id,authorName:admin.name,body:note,statusFrom:quote.status,statusTo:status,reference:reference||null,itemsSummary:items||null,deliveryEstimate:delivery||null,amountCents,sentToCustomer:sent}});
 });
 revalidatePath('/admin/presupuestos');revalidatePath('/mi-cuenta/mis-presupuestos');
 redirect(`/admin/presupuestos?ok=1#q-${encodeURIComponent(id)}`);
}
