'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkQuoteRateLimit } from '@/lib/quote-rate-limit';

function read(form: FormData, key: string): string {
  const raw = form.get(key);
  return typeof raw === 'string' ? raw.trim() : '';
}

function fail(message: string): never {
  redirect(`/presupuesto?error=${encodeURIComponent(message)}`);
}

export async function submitQuote(form: FormData) {
  // 1. Honeypot anti-bots.
  if (read(form, 'website')) {
    fail('No se pudo registrar la solicitud.');
  }

  // 2. Lectura de datos.
  const name = read(form, 'customerName').replace(/\s+/g, ' ');
  const email = read(form, 'email').toLowerCase();
  const notes = read(form, 'notes');
  const productId = read(form, 'productId');

  // 3. Validación en el servidor.
  if (name.length < 2 || name.length > 120) {
    fail('Indica tu nombre (2-120 caracteres).');
  }

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fail('Correo electrónico no válido.');
  }

  if (notes.length < 15 || notes.length > 5000) {
    fail('Describe el encargo (15-5000 caracteres).');
  }

  // 4. Obtener sesión si existe.
  // Se permiten presupuestos sin registro.
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 5. Comprobar el límite antes de consultar o escribir en Neon.
  const limit = await checkQuoteRateLimit(session?.user?.id);

  if (!limit.allowed) {
    if (limit.reason === 'limit') {
      fail(
        'Has alcanzado el límite de solicitudes. Inténtalo de nuevo más tarde.',
      );
    }

    fail(
      'No podemos procesar solicitudes en este momento. Inténtalo más tarde.',
    );
  }

  // 6. Validar el producto, cuando la solicitud
  // esté relacionada con uno del catálogo.
  let product: { id: string } | null = null;

  if (productId) {
    product = await prisma.product.findFirst({
      where: {
        id: productId,
        status: 'ACTIVE',
        saleMode: 'QUOTE',
      },
      select: {
        id: true,
      },
    });

    if (!product) {
      fail('El producto indicado no está disponible para presupuestos.');
    }
  }

  // 7. Crear la solicitud.
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
