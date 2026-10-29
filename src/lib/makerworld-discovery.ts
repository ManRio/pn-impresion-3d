import "server-only";

export type DiscoveryModel = {
  id: number;
  title: string;
  designer: string;
  license: string;
  downloads: number;
  likes: number;
  cover: string | null;
  url: string;
};

type Obj = Record<string, unknown>;
function obj(value: unknown): Obj {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Obj : {};
}
function string(value: unknown): string {
  return typeof value === "string" ? value : "";
}
function number(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
const ALLOWED = ["Trending", "category_400", "category_800"] as const;
export type DiscoveryCategory = (typeof ALLOWED)[number];
export function validCategory(input: string): DiscoveryCategory {
  return ALLOWED.includes(input as DiscoveryCategory) ? input as DiscoveryCategory : "Trending";
}

export async function discoverMakerWorld(category: DiscoveryCategory, page: number) {
  if (!Number.isSafeInteger(page) || page < 1 || page > 25) {
    throw new Error("Página fuera del rango permitido.");
  }
  const url = new URL("https://api.bambulab.com/v1/search-service/select/design/nav");
  url.searchParams.set("navKey", category);
  url.searchParams.set("offset", String((page - 1) * 20));
  url.searchParams.set("limit", "20");
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(12000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`MakerWorld no disponible (HTTP ${response.status}).`);
  const data: unknown = await response.json();
  const body = obj(data);
  const nested = obj(body.data);
  const rows = [body.hits, nested.hits, body.items, nested.items, body.models, nested.models]
    .find(Array.isArray);
  if (!Array.isArray(rows)) {
    throw new Error("MakerWorld ha cambiado el formato de sus resultados.");
  }
  const seen = new Set<number>();
  const models: DiscoveryModel[] = [];
  for (const raw of rows.slice(0, 20)) {
    const item = obj(raw);
    const id = number(item.id);
    if (!Number.isSafeInteger(id) || id <= 0 || seen.has(id)) continue;
    seen.add(id);
    const creator = obj(item.designCreator);
    models.push({
      id,
      title: string(item.title).slice(0, 180) || `Modelo ${id}`,
      designer: string(creator.name).slice(0, 200),
      license: string(item.license).slice(0, 200),
      downloads: number(item.downloadCount),
      likes: number(item.likeCount),
      cover: string(item.cover) || null,
      url: `https://makerworld.com/es/models/${id}`,
    });
  }
  return models;
}
