import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const MAX_LINES = 30;
const MAX_BODY_BYTES = 16 * 1024;

type CartLine = {
  variantId: string;
  quantity: number;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}

async function readLimitedBody(request: Request): Promise<string | null> {
  if (!request.body) return null;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      total += value.byteLength;

      if (total > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }

      chunks.push(value);
    }

    const bytes = new Uint8Array(total);
    let offset = 0;

    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return new TextDecoder('utf-8', {
      fatal: true,
    }).decode(bytes);
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type');

    if (!contentType?.toLowerCase().includes('application/json')) {
      return errorResponse('Formato no válido.', 415);
    }

    const contentLength = request.headers.get('content-length');

    if (contentLength !== null && Number(contentLength) > MAX_BODY_BYTES) {
      return errorResponse('Petición demasiado grande.', 413);
    }

    const body = await readLimitedBody(request);

    if (body === null) {
      return errorResponse('Petición demasiado grande o vacía.', 413);
    }

    const data: unknown = JSON.parse(body);

    if (
      !data ||
      typeof data !== 'object' ||
      !('lines' in data) ||
      !Array.isArray(data.lines)
    ) {
      return errorResponse('Carrito inválido.', 400);
    }

    if (data.lines.length > MAX_LINES) {
      return errorResponse('Demasiados artículos.', 400);
    }

    const lines: CartLine[] = [];

    for (const item of data.lines) {
      if (
        !item ||
        typeof item !== 'object' ||
        typeof item.variantId !== 'string' ||
        !/^[a-zA-Z0-9_-]{10,60}$/.test(item.variantId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 20
      ) {
        return errorResponse('Línea de carrito inválida.', 400);
      }

      lines.push({
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }

    const ids = [...new Set(lines.map((line) => line.variantId))];

    if (ids.length !== lines.length) {
      return errorResponse('Hay artículos duplicados.', 400);
    }

    if (ids.length === 0) {
      return NextResponse.json(
        { items: [] },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const variants = await prisma.productVariant.findMany({
      where: {
        id: { in: ids },
        active: true,
        priceCents: { gt: 0 },
        product: {
          status: 'ACTIVE',
          saleMode: 'DIRECT',
        },
      },
      include: {
        product: {
          select: {
            name: true,
            slug: true,
            images: {
              orderBy: { position: 'asc' },
              take: 1,
            },
          },
        },
      },
    });

    const byId = new Map(variants.map((variant) => [variant.id, variant]));

    const items = ids.flatMap((id) => {
      const variant = byId.get(id);

      if (!variant) return [];

      return [
        {
          id: variant.id,
          name: variant.product.name,
          slug: variant.product.slug,
          label: variant.label,
          priceCents: variant.priceCents,
          image: variant.product.images[0]?.url ?? null,
        },
      ];
    });

    return NextResponse.json(
      { items },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('JSON inválido.', 400);
    }

    console.error('Error consultando carrito:', error);

    return errorResponse('No se pudo consultar el carrito.', 500);
  }
}
