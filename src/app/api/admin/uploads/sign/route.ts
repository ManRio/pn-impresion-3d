import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import { prisma } from '@/lib/prisma';
import { signDirectProductUpload } from '@/lib/cloudinary';

export const runtime = 'nodejs';
export async function POST(req: Request) {
  await requireAdmin();
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Petición inválida' }, { status: 400 });
  }
  const id = body && typeof body === 'object' && 'productId' in body
    ? (body as { productId?: unknown }).productId : null;
  if (typeof id !== 'string' || !/^[a-z0-9_-]{10,60}$/i.test(id)) {
    return NextResponse.json({ error: 'Producto inválido' }, { status: 400 });
  }
  const product = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!product) return NextResponse.json({ error: 'Producto inexistente' }, { status: 404 });
  const count = await prisma.productImage.count({ where: { productId: id } });
  if (count >= 8) return NextResponse.json({ error: 'Máximo de fotografías alcanzado' }, { status: 409 });
  return NextResponse.json(signDirectProductUpload(id), { headers: { 'Cache-Control': 'no-store' } });
}
