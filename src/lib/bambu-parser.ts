import 'server-only';
import JSZip from 'jszip';

type ColorLine = { id: string; material: string; color: string; grams: number };
export type PrintAnalysis = {
  filename: string;
  printer: string;
  studio: string;
  nozzleMm: number | null;
  durationSeconds: number;
  totalGrams: number;
  colors: ColorLine[];
  noSupports: boolean | null;
  price10Cents: number;
  price12Cents: number;
  notes: string[];
};
const safeNumber = (s: string): number | null => {
  if (!s.trim()) return null;
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : null;
};
export async function analyzeBambu(file: File): Promise<PrintAnalysis> {
  if (!file.name.toLowerCase().endsWith('.gcode.3mf')) throw new Error('Sube un archivo .gcode.3mf laminado en Bambu Studio.');
  if (file.size < 100 || file.size > 20 * 1024 * 1024) throw new Error('El archivo debe medir entre 100 bytes y 20 MB.');
  const bytes = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(bytes, { checkCRC32: false });
  const target = zip.file('Metadata/slice_info.config');
  const gcode = zip.file('Metadata/plate_1.gcode');
  if (!target || !gcode) throw new Error('No se han encontrado los metadatos esperados de Bambu Studio para la placa 1.');
  // Metadata is small; only read the first available plate's two expected members.
  if ((target as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize &&
      (target as unknown as { _data: { uncompressedSize: number } })._data.uncompressedSize > 150_000) {
    throw new Error('El archivo de metadatos supera el límite admitido.');
  }
  const xml = await target.async('string');
  if (xml.length > 150_000) throw new Error('Metadatos demasiado grandes.');
  // G-code may be large; read it only when its uncompressed size is bounded.
  const size = (gcode as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize;
  if (size === undefined || size > 20 * 1024 * 1024) throw new Error('G-code demasiado grande o sin tamaño declarado.');
  const g = await gcode.async('string');
  const header = g.slice(0, 6000);
  const getXml = (key: string) => xml.match(new RegExp(`<metadata\\s+key="${key}"\\s+value="([^"]+)"`))?.[1];
  const plateWeight = safeNumber(getXml('weight') ?? '');
  const seconds = safeNumber(getXml('prediction') ?? '');
  if (plateWeight === null || seconds === null || seconds === 0) throw new Error('Faltan los datos de peso o duración de la placa.');
  const fils = [...xml.matchAll(/<filament\s+([^>]*?)\s*\/>/g)].map(m => {
    const attrs = Object.fromEntries([...m[1].matchAll(/([a-z_]+)="([^"]*)"/g)].map(k => [k[1], k[2]]));
    return {
      id: attrs.id ?? '', material: attrs.type ?? 'Desconocido',
      color: /^#[0-9a-fA-F]{6}$/.test(attrs.color ?? '') ? attrs.color : '#888888',
      grams: safeNumber(attrs.used_g ?? '') ?? 0,
    };
  });
  if (!fils.length) throw new Error('No se han encontrado los filamentos de la placa.');
  const sum = fils.reduce((n, f) => n + f.grams, 0);
  const notes: string[] = [];
  if (Math.abs(sum - plateWeight) > 0.05) notes.push('El desglose por colores no coincide con el peso total; revísalo en Bambu Studio.');
  const headWeights = header.match(/; total filament weight \[g\]\s*:\s*([^\r\n]+)/i)?.[1];
  if (headWeights) {
    const headTotal = headWeights.split(',').reduce((n, x) => n + (safeNumber(x.trim()) ?? 0), 0);
    if (Math.abs(headTotal - plateWeight) > 0.05) notes.push('La cabecera del G-code y los metadatos indican pesos diferentes.');
  }
  notes.push('La estimación puede variar respecto al consumo real. Confirma las purgas y el peso definitivo antes de publicar.');
  return {
    filename: file.name,
    printer: header.match(/; printer_model\s*=\s*([^\r\n]+)/)?.[1]?.trim() ?? 'No identificado',
    studio: header.match(/; BambuStudio ([^\r\n]+)/)?.[1]?.trim() ?? 'No identificado',
    nozzleMm: safeNumber(getXml('nozzle_diameters') ?? ''),
    durationSeconds: Math.round(seconds), totalGrams: plateWeight,
    colors: fils, noSupports: getXml('support_used') === 'false' ? true : getXml('support_used') === 'true' ? false : null,
    price10Cents: Math.round(plateWeight * 10), price12Cents: Math.round(plateWeight * 12),
    notes,
  };
}
