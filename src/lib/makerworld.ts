import 'server-only';

type MakerWorldModel = {
  id: number;
  title: string;
  coverUrl: string | null;
  license: string;
  designer: string;
  profiles: {
    id: number;
    title: string;
  }[];
};

export function extractMakerWorldId(input: string): string | null {
  try {
    const url = new URL(input);

    if (
      url.protocol !== 'https:' ||
      !['makerworld.com', 'www.makerworld.com'].includes(
        url.hostname.toLowerCase(),
      )
    ) {
      return null;
    }

    const match = url.pathname.match(
      /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?models\/(\d+)(?:-|\/|$)/,
    );

    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export async function getMakerWorldModel(
  input: string,
): Promise<MakerWorldModel> {
  const id = extractMakerWorldId(input);

  if (!id) {
    throw new Error('Introduce una URL válida de MakerWorld.');
  }

  const response = await fetch(
    `https://api.bambulab.com/v1/design-service/design/${id}`,
    {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error(`MakerWorld no está disponible (HTTP ${response.status}).`);
  }

  const data: unknown = await response.json();

  if (!data || typeof data !== 'object') {
    throw new Error('Respuesta inesperada de MakerWorld.');
  }

  const model = data as Record<string, unknown>;

  const creator =
    model.designCreator && typeof model.designCreator === 'object'
      ? (model.designCreator as Record<string, unknown>)
      : {};

  const instances = Array.isArray(model.instances) ? model.instances : [];

  const text = (value: unknown) => (typeof value === 'string' ? value : '');

  return {
    id: Number(id),
    title: text(model.title).slice(0, 200),
    coverUrl: text(model.coverUrl) || null,
    license: text(model.license),
    designer: text(creator.name),
    profiles: instances
      .filter(
        (item): item is Record<string, unknown> =>
          item !== null && typeof item === 'object',
      )
      .slice(0, 30)
      .map((item) => ({
        id: Number(item.profileId ?? item.id ?? 0),
        title: text(item.title),
      })),
  };
}
