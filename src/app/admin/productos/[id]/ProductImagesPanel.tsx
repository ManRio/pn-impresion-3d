import { addProductImage, deleteProductImage, setMainProductImage, updateProductImageAlt } from "./image-actions";

type Image = { id: string; url: string; alt: string; position: number };
const input = "w-full rounded-lg border border-white/15 bg-[#101319] px-3 py-2.5 text-white";
export default function ProductImagesPanel({ productId, images }: { productId: string; images: Image[] }) {
  return (
    <section className="mb-8 space-y-5 rounded-xl border border-white/10 bg-[#1a211e] p-6">
      <div>
        <h2 className="font-display text-xl font-bold">FOTOGRAFÍAS DEL PRODUCTO ({images.length}/8)</h2>
        <p className="mt-1 text-sm text-neutral-400">Sube fotos propias o con autorización. Máximo 5 MB por imagen, JPG, PNG o WebP.</p>
      </div>
      {images.length < 8 && <form action={addProductImage} className="grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="productId" value={productId}/>
        <div><label htmlFor="image-upload" className="mb-1 block text-sm">Fotografía</label>
          <input id="image-upload" type="file" name="file" accept="image/jpeg,image/png,image/webp" required className={input}/></div>
        <div><label htmlFor="image-alt" className="mb-1 block text-sm">Descripción ALT</label>
          <input id="image-alt" name="alt" minLength={8} maxLength={180} required className={input} placeholder="Figura 3D de dragón articulado verde"/></div>
        <button type="submit" className="rounded-lg bg-[#B5FF67] px-4 py-3 font-semibold text-[#101319] sm:col-span-2">Subir fotografía</button>
      </form>}
      <div className="grid gap-5 sm:grid-cols-2">
        {images.map((image, index) => <article key={image.id} className="overflow-hidden rounded-xl border border-white/15 bg-[#101319]">
          <div className="aspect-[4/3] bg-[#090b0a] bg-contain bg-center bg-no-repeat" role="img" aria-label={image.alt}
            style={{ backgroundImage: `url(${JSON.stringify(image.url)})` }}/>
          <div className="space-y-3 p-4">
            {index === 0 && <p className="text-sm font-bold text-[#B5FF67]">Imagen principal</p>}
            <form action={updateProductImageAlt} className="space-y-2">
              <input type="hidden" name="productId" value={productId}/>
              <input type="hidden" name="imageId" value={image.id}/>
              <label className="block text-sm">Texto alternativo (ALT)</label>
              <input name="alt" defaultValue={image.alt} required minLength={8} maxLength={180} className={input}/>
              <button className="rounded-lg border border-[#B5FF67] px-3 py-2 text-sm text-[#B5FF67]">Guardar ALT</button>
            </form>
            <div className="flex flex-wrap gap-2">
              {index > 0 && <form action={setMainProductImage}>
                <input type="hidden" name="productId" value={productId}/><input type="hidden" name="imageId" value={image.id}/>
                <button className="rounded-lg border border-white/30 px-3 py-2 text-sm">Hacer principal</button>
              </form>}
              <form action={deleteProductImage}>
                <input type="hidden" name="productId" value={productId}/><input type="hidden" name="imageId" value={image.id}/>
                <button className="rounded-lg border border-red-500/50 px-3 py-2 text-sm text-red-300">Eliminar</button>
              </form>
            </div>
          </div>
        </article>)}
      </div>
      {images.length === 0 && <p className="rounded-lg border border-dashed border-white/20 p-6 text-center text-neutral-400">Todavía no hay fotografías en este producto.</p>}
    </section>
  );
}
