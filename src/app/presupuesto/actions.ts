'use server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function read(form: FormData, key: string) {
  const raw = form.get(key);
  return typeof raw === 'string' ? raw.trim() : '';
}
function fail(message: string): never {
  redirect(`/presupuesto?error=${encodeURIComponent(message)}`);
}
export async function submitQuote(form: FormData) {
  if (read(form, 'website')) fail('No se pudo registrar la solicitud.');
  const name = read(form, 'customerName').replace(/\\s+/g, ' ');
  const email = read(form, 'email').toLowerCase();
  const notes = read(form, 'notes');
  const productId = read(form, 'productId');
  if (name.length < 2 || name.length > 120)
    fail('Indica tu nombre (2-120 caracteres).');
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fail('Correo electrónico no válido.');
  }
  if (notes.length < 15 || notes.length > 5000)
    fail('Describe el encargo (15-5000 caracteres).');

  const session = await auth.api.getSession({ headers: await headers() });
  let product: { id: string } | null = null;
  if (productId) {
    product = await prisma.product.findFirst({
      where: { id: productId, status: 'ACTIVE', saleMode: 'QUOTE' },
      select: { id: true },
    });
    if (!product)
      fail('El producto indicado no está disponible para presupuestos.');
  }

  await prisma.quoteRequest.create({
    data: {
      customerName: name,
      email,
      notes,
      productId: product?.id ?? null,
      userId: session?.user?.id ?? null,
      status: 'NEW',
    },
  });
  redirect('/presupuesto?ok=1');
}
