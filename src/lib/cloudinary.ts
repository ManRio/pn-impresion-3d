import "server-only";
import { v2 as cloudinary } from "cloudinary";

function client() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error("Configura CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en .env.");
  }
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
  return cloudinary;
}

export async function uploadProductImage(data: Buffer, productId: string) {
  const api = client();
  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = api.uploader.upload_stream(
      { folder: `pn-impresion-3d/productos/${productId}`, resource_type: "image", overwrite: false },
      (error, result) => {
        if (error || !result?.secure_url || !result?.public_id) {
          reject(error ?? new Error("Cloudinary no devolvió una imagen válida."));
        } else {
          resolve({ secure_url: result.secure_url, public_id: result.public_id });
        }
      },
    );
    stream.end(data);
  });
}

export async function removeProductImage(publicId: string) {
  const result = await client().uploader.destroy(publicId, { resource_type: "image", invalidate: true });
  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error("Cloudinary no confirmó la eliminación.");
  }
}

export function publicIdFromProductUrl(url: string, productId: string): string | null {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  if (!name || !/^[a-zA-Z0-9_-]+$/.test(name)) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname !== "res.cloudinary.com") return null;
    const prefix = `/${name}/image/upload/`;
    if (!parsed.pathname.startsWith(prefix)) return null;
    const rest = parsed.pathname.slice(prefix.length).replace(/^v\d+\//, "");
    const match = /^pn-impresion-3d\/productos\/([a-z0-9]+)\/([a-zA-Z0-9_-]+)\.(jpg|jpeg|png|webp|gif|avif)$/i.exec(rest);
    if (!match || match[1] !== productId) return null;
    return `pn-impresion-3d/productos/${productId}/${match[2]}`;
  } catch { return null; }
}
