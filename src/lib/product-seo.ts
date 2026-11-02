export const seoFields = ['shortDescription', 'seoTitle', 'seoDescription', 'seoKeywords', 'socialTitle', 'socialDescription', 'socialImageUrl'] as const;
export function parseProductSEO(form: FormData) {
  const limits = {shortDescription:500,seoTitle:160,seoDescription:320,seoKeywords:500,socialTitle:160,socialDescription:320,socialImageUrl:1500} as const;
  const result:Record<string,string|null>={};
  for(const key of seoFields){
    const raw=form.get(key);
    if(typeof raw!=='string') throw new Error(`Campo SEO inválido: ${key}`);
    const text=raw.trim();
    if(text.length>limits[key]) throw new Error(`Demasiados caracteres en ${key}`);
    result[key]=text||null;
  }
  if(result.socialImageUrl){
    let url:URL;
    try { url = new URL(result.socialImageUrl); } catch { throw new Error('La URL de la imagen social no es válida.'); }
    if(url.protocol!=='https:')throw new Error('La imagen social requiere HTTPS.');
  }
  return result as {shortDescription:string|null;seoTitle:string|null;seoDescription:string|null;seoKeywords:string|null;socialTitle:string|null;socialDescription:string|null;socialImageUrl:string|null};
}
