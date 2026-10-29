import "server-only";

import type { DiscoveryModel } from "@/lib/makerworld-discovery";

type Obj = Record<string, unknown>;
const obj = (value: unknown): Obj =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Obj : {};
const str = (v: unknown) => typeof v === "string" ? v : "";
const num = (v: unknown) => typeof v === "number" && Number.isFinite(v) ? v : 0;

export async function searchMakerWorld(keyword: string, page: number): Promise<{
  models: DiscoveryModel[];
  total: number | null;
}> {
  const term = keyword.trim().slice(0, 80);
  if (term.length < 2) throw new Error("Escribe al menos dos caracteres.");
  if (!Number.isInteger(page) || page < 1 || page > 25) {
    throw new Error("Página fuera de rango.");
  }

  const url = new URL("https://api.bambulab.com/v1/search-service/select/design2");
  url.searchParams.set("keyword", term);
  url.searchParams.set("offset", String((page - 1) * 20));
  url.searchParams.set("limit", "20");

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(12000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`MakerWorld no responde (HTTP ${response.status}).`);
  const data: unknown = await response.json();
  const body = obj(data);
  if (!Array.isArray(body.hits)) throw new Error("Formato de búsqueda no reconocido.");

  const models: DiscoveryModel[] = [];
  const seen = new Set<number>();
  for (const raw of body.hits.slice(0, 20)) {
    const item = obj(raw);
    const id = num(item.id);
    if (!Number.isSafeInteger(id) || id <= 0 || seen.has(id)) continue;
    seen.add(id);
    const creator = obj(item.designCreator);
    models.push({
      id,
      title: (str(item.title) || `Modelo ${id}`).slice(0, 180),
      designer: str(creator.name).slice(0, 200),
      license: str(item.license).slice(0, 200),
      downloads: num(item.downloadCount),
      likes: num(item.likeCount),
      cover: str(item.cover) || null,
      url: `https://makerworld.com/es/models/${id}`,
    });
  }

  return {
    models,
    total: typeof body.total === "number" && Number.isFinite(body.total)
      ? body.total : null,
  };
}
