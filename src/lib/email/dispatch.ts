import 'server-only';
import { prisma } from '@/lib/prisma';

const MAX_ATTEMPTS = 6;
const LEASE_MS = 10 * 60 * 1000;

export async function dispatchEmailBatch(limit = 10) {
  if (process.env.EMAIL_NOTIFICATIONS_ENABLED !== 'true') return { disabled: true, sent: 0, failed: 0 };
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey?.startsWith('re_') || !from) throw new Error('Resend no está configurado');

  const now = new Date();
  const stale = new Date(now.getTime() - LEASE_MS);
  const candidates = await prisma.emailNotification.findMany({
    where: { attempts: { lt: MAX_ATTEMPTS }, OR: [
      { status: { in: ['PENDING', 'FAILED'] }, nextAttemptAt: { lte: now } },
      { status: 'SENDING', lockedAt: { lte: stale } },
    ] },
    orderBy: { createdAt: 'asc' }, take: Math.min(20, Math.max(1, limit)),
  });
  let sent = 0;
  let failed = 0;
  for (const job of candidates) {
    const claim = await prisma.emailNotification.updateMany({
      where: { id: job.id, status: job.status, attempts: job.attempts },
      data: { status: 'SENDING', lockedAt: new Date(), attempts: { increment: 1 } },
    });
    if (claim.count !== 1) continue;
    try {
      // Cuerpo inmutable e idempotencia del proveedor protegen los reintentos.
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': job.dedupeKey,
        },
        body: JSON.stringify({
          from,
          to: [process.env.EMAIL_TEST_RECIPIENT || job.recipient],
          reply_to: process.env.EMAIL_REPLY_TO || 'info@pn3d.es',
          subject: job.subject,
          html: job.html,
        }),
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) throw new Error(`Resend HTTP ${response.status}`);
      const result: unknown = await response.json();
      const providerId = result && typeof result === 'object' && 'id' in result && typeof result.id === 'string' ? result.id : null;
      if (!providerId) throw new Error('Resend no confirmó el identificador');
      await prisma.emailNotification.update({ where: { id: job.id }, data: {
        status: 'SENT', sentAt: new Date(), providerId, lockedAt: null, lastError: null,
      } });
      sent++;
    } catch (error) {
      const attempt = job.attempts + 1;
      const backoffMinutes = Math.min(60 * 6, 2 ** Math.min(attempt, 8));
      await prisma.emailNotification.update({ where: { id: job.id }, data: {
        status: 'FAILED', lockedAt: null,
        nextAttemptAt: new Date(Date.now() + backoffMinutes * 60000),
        lastError: error instanceof Error ? error.message.slice(0, 180) : 'Error de envío',
      } });
      failed++;
    }
  }
  return { disabled: false, processed: candidates.length, sent, failed };
}
