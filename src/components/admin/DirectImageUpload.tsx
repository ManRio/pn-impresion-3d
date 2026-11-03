'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { uploadProductPhotoDirect } from '@/lib/direct-product-upload';

export default function DirectImageUpload({productId}:{productId:string}) {
  const router = useRouter();
  const [file,setFile] = useState<File|null>(null);
  const [alt,setAlt] = useState('');
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  async function upload(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || busy) return;
    const form = event.currentTarget;
    setBusy(true); setMessage('Subiendo fotografía...');
    try {
      await uploadProductPhotoDirect(productId,file,alt);
      setMessage('Fotografía añadida correctamente.');
      setFile(null); setAlt('');
      form.reset();
      router.refresh();
    } catch(err) { setMessage(err instanceof Error?err.message:'No se pudo subir la fotografía.'); }
    finally { setBusy(false); }
  }
  return <form onSubmit={upload} className="grid gap-4 sm:grid-cols-2">
    <label className="block text-sm">Fotografía
      <input type="file" accept="image/jpeg,image/png,image/webp" required disabled={busy}
        onChange={e=>setFile(e.target.files?.[0]??null)}
        className="mt-1 w-full rounded-lg border border-white/15 bg-[#101319] p-3" />
    </label>
    <label className="block text-sm">Descripción ALT
      <input value={alt} onChange={e=>setAlt(e.target.value)} minLength={8} maxLength={180}
        required disabled={busy} placeholder="Figura 3D de dragón articulado verde"
        className="mt-1 w-full rounded-lg border border-white/15 bg-[#101319] p-3"/>
    </label>
    <button disabled={busy} className="rounded-lg bg-[#B5FF67] px-4 py-3 font-bold text-[#101319] disabled:opacity-50 sm:col-span-2">
      {busy?'Subiendo...':'Subir fotografía'}
    </button>
    {message&&<p role="status" className="text-sm text-white/70 sm:col-span-2">{message}</p>}
  </form>;
}
