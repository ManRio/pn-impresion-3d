import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { dispatchEmailBatch } from '@/lib/email/dispatch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function validSecret(received: string | null, expected: string | undefined): boolean {
  if (!expected || expected.length < 32 || !received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(`Bearer ${expected}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!validSecret(request.headers.get('authorization'), process.env.EMAIL_DISPATCH_SECRET)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    return NextResponse.json(await dispatchEmailBatch());
  } catch (error) {
    console.error('Fallo despachando notificaciones', error instanceof Error ? error.message : 'Error');
    return NextResponse.json({ error: 'Error en el procesador' }, { status: 500 });
  }
}
