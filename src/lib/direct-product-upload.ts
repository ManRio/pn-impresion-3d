import { registerDirectProductImage } from '@/app/admin/productos/[id]/image-actions';

type Signature = {
  timestamp: number; folder: string; public_id: string; signature: string;
  api_key: string; cloud_name: string;
};

export async function uploadProductPhotoDirect(
  productId: string, file: File, alt: string,
): Promise<void> {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type) ||
      file.size === 0 || file.size > 5 * 1024 * 1024) {
    throw new Error(`Archivo no válido: ${file.name}. Máximo 5 MB, JPG/PNG/WebP.`);
  }
  const sign = await fetch('/api/admin/uploads/sign', {
    method: 'POST', headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ productId }), cache: 'no-store',
  });
  const signed: Signature & {error?:string} = await sign.json();
  if (!sign.ok) throw new Error(signed.error || 'No se pudo autorizar la subida.');
  const payload = new FormData();
  payload.append('file',file);
  payload.append('api_key',signed.api_key);
  payload.append('timestamp',String(signed.timestamp));
  payload.append('folder',signed.folder);
  payload.append('public_id',signed.public_id);
  payload.append('signature',signed.signature);
  const result = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(signed.cloud_name)}/image/upload`,
    { method: 'POST', body: payload },
  );
  const remote: {public_id?: string; error?: {message?: string}} = await result.json();
  if (!result.ok || remote.public_id !== `${signed.folder}/${signed.public_id}`) {
    throw new Error(remote.error?.message || 'Cloudinary no confirmó la fotografía.');
  }
  const saved = await registerDirectProductImage(productId, remote.public_id, alt);
  if (!saved.ok) {
    // Do not delete here: may be an intermittent Neon failure; log for manual cleanup.
    throw new Error(`${saved.error} Imagen subida en Cloudinary; limpieza pendiente.`);
  }
}
