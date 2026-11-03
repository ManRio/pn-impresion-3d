'use client';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { createAndUpload, finishNewProduct } from './create-and-upload';
import { uploadProductPhotoDirect } from '@/lib/direct-product-upload';

export default function NewProductForm({children}:{children:React.ReactNode}) {
  const router = useRouter();
  const lock = useRef(false);
  const [busy,setBusy] = useState(false);
  const [status,setStatus] = useState('');
  async function submit(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    const form = event.currentTarget;
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement|null;
    const publish = submitter?.value === 'publish';
    const input = form.querySelector<HTMLInputElement>('input[name="photos"]');
    const files = Array.from(input?.files ?? []);
    if (files.length > 8 || files.some(f=>f.size===0||f.size>5*1024*1024 || !['image/jpeg','image/png','image/webp'].includes(f.type))) {
      setStatus('Máximo 8 fotografías de 5 MB cada una (JPG, PNG o WebP).'); return;
    }
    lock.current = true; setBusy(true); setStatus('Guardando producto...');
    let productId: string | null = null;
    try {
      const data = new FormData(form);
      data.delete('photos');
      // No publish until every selected photo is registered.
      productId = await createAndUpload(data);
      let failure = '';
      for (let i=0;i<files.length;i++) {
        setStatus(`Subiendo fotografía ${i+1} de ${files.length}...`);
        try { await uploadProductPhotoDirect(productId,files[i],`${String(data.get('name')||'Producto')} - fotografía ${i+1}`.slice(0,180)); }
        catch(e) { failure = e instanceof Error?e.message:'Error al subir una fotografía.'; break; }
      }
      if (failure) {
        router.push(`/admin/productos/${productId}?error=${encodeURIComponent('Producto guardado como borrador. '+failure)}`);
        return;
      }
      const result = await finishNewProduct(productId,publish);
      router.push(`/admin/productos/${productId}?ok=${encodeURIComponent(result.message)}`);
    } catch(e) {
      if (productId) router.push(`/admin/productos/${productId}?error=${encodeURIComponent('Borrador guardado. Revisa imágenes y publicación.')}`);
      else setStatus(e instanceof Error?e.message:'No se pudo guardar el producto.');
    } finally {lock.current=false;setBusy(false)}
  }
  return <form onSubmit={submit} className="space-y-6" aria-busy={busy}>
    {children}
    {busy&&<p role="status" className="rounded-lg border border-[#B5FF67]/30 p-3 text-sm text-[#B5FF67]">{status}</p>}
    {!busy&&status&&<p role="alert" className="text-sm text-red-300">{status}</p>}
  </form>;
}
