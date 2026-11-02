type SEO = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  shortDescription?: string | null;
  seoKeywords?: string | null;
  socialTitle?: string | null;
  socialDescription?: string | null;
  socialImageUrl?: string | null;
};
const input = 'mt-1 w-full rounded-lg border border-white/15 bg-[#101319] px-3 py-2 text-white focus:border-[#B5FF67] outline-none';
export default function ProductSEOFields({initial}: {initial?: SEO}) {
  return <section className="space-y-5 rounded-xl border border-white/10 bg-[#1a211e] p-6">
    <div><h2 className="text-xl font-bold">SEO y presentación comercial</h2><p className="mt-2 text-sm text-white/60">Los campos vacíos utilizan los datos del producto. No incluyas promesas que no hayas confirmado.</p></div>
    <label className="block text-sm">Descripción corta (visible en la ficha)
      <textarea name="shortDescription" rows={3} maxLength={500} defaultValue={initial?.shortDescription??''} className={input} placeholder="Resumen claro de qué es, para quién y qué se puede personalizar" />
    </label>
    <label className="block text-sm">Título SEO
      <input name="seoTitle" maxLength={160} defaultValue={initial?.seoTitle??''} className={input} placeholder="Llavero personalizado con nombre 3D" />
      <span className="text-xs text-white/50">Orientación habitual: 50–60 caracteres, sin sacrificar claridad.</span>
    </label>
    <label className="block text-sm">Meta descripción
      <textarea name="seoDescription" rows={3} maxLength={320} defaultValue={initial?.seoDescription??''} className={input} placeholder="Llavero con nombre impreso en 3D, disponible en varios colores..." />
      <span className="text-xs text-white/50">Orientación habitual: 140–160 caracteres. Google puede mostrar otro fragmento.</span>
    </label>
    <label className="block text-sm">Términos de búsqueda para planificación interna (no meta keywords)
      <input name="seoKeywords" maxLength={500} defaultValue={initial?.seoKeywords??''} className={input} placeholder="llavero personalizado con nombre, llavero 3D" />
    </label>
    <div className="grid gap-4 md:grid-cols-2">
      <label className="block text-sm">Título para redes sociales
        <input name="socialTitle" maxLength={160} defaultValue={initial?.socialTitle??''} className={input} />
      </label>
      <label className="block text-sm">Imagen social HTTPS (opcional)
        <input name="socialImageUrl" type="url" maxLength={1500} defaultValue={initial?.socialImageUrl??''} className={input} placeholder="https://..." />
      </label>
    </div>
    <label className="block text-sm">Descripción para redes sociales
      <textarea name="socialDescription" rows={2} maxLength={320} defaultValue={initial?.socialDescription??''} className={input} />
    </label>
    <p className="text-xs text-white/50">La URL pública continúa usando el slug actual. No se cambia automáticamente al editar para evitar enlaces rotos. El ALT de cada fotografía se gestiona desde la galería.</p>
  </section>;
}
