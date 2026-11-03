import 'server-only';

import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

type LimitResult =
  | { allowed: true }
  | { allowed: false; reason: 'limit' | 'unavailable' };

let limiters:
  | {
      byIp: Ratelimit;
      byUser: Ratelimit;
    }
  | undefined;

function getLimiters() {
  if (limiters) return limiters;

  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    throw new Error('Falta la configuración Redis para presupuestos.');
  }

  const redis = Redis.fromEnv();

  limiters = {
    byIp: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 h'),
      prefix: 'pn:quotes:ip',
      enableTelemetry: false,
    }),

    byUser: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 h'),
      prefix: 'pn:quotes:user',
      enableTelemetry: false,
    }),
  };

  return limiters;
}

function hash(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export async function checkQuoteRateLimit(
  userId?: string,
): Promise<LimitResult> {
  try {
    const incomingHeaders = await headers();

    // En Vercel, obtener la IP de la cabecera gestionada
    // por la plataforma, no de una IP enviada por el formulario.
    const forwarded = incomingHeaders.get('x-vercel-forwarded-for');

    // Para pruebas locales, todas las peticiones comparten
    // deliberadamente un mismo identificador.
    const ip =
      forwarded?.split(',')[0]?.trim() ||
      (process.env.NODE_ENV === 'development' ? 'local-development' : null);

    if (!ip) {
      console.error('No se pudo identificar el origen del presupuesto.');
      return { allowed: false, reason: 'unavailable' };
    }

    const { byIp, byUser } = getLimiters();

    const ipResult = await byIp.limit(hash(ip));

    if (!ipResult.success) {
      return { allowed: false, reason: 'limit' };
    }

    if (userId) {
      const userResult = await byUser.limit(hash(userId));

      if (!userResult.success) {
        return { allowed: false, reason: 'limit' };
      }
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error en la protección anti-spam:', error);

    // Si Redis falla, no aceptamos envíos sin protección.
    return { allowed: false, reason: 'unavailable' };
  }
}
