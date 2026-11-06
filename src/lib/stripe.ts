import 'server-only';
import Stripe from 'stripe';

// Nunca inferimos la activación real de una clave pegada por error.
// El despliegue permanece en pruebas hasta configurar STRIPE_MODE=live.
export type StripeMode = 'test' | 'live';
export function getStripeMode(): StripeMode {
  const mode = process.env.STRIPE_MODE ?? 'test';
  if (mode !== 'test' && mode !== 'live') {
    throw new Error('STRIPE_MODE debe ser test o live.');
  }
  return mode;
}

function configuredStripeSecret(): string {
  const mode = getStripeMode();
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret?.startsWith(`sk_${mode}_`)) {
    throw new Error(`STRIPE_SECRET_KEY no coincide con STRIPE_MODE=${mode}.`);
  }
  return secret;
}

let stripeClient: Stripe | undefined;
let stripeClientKey: string | undefined;

export function getStripe(): Stripe {
  const key = configuredStripeSecret();
  if (!stripeClient || stripeClientKey !== key) {
    stripeClient = new Stripe(key);
    stripeClientKey = key;
  }
  return stripeClient;
}

export function checkoutEnabled(): boolean {
  if (process.env.STRIPE_CHECKOUT_ENABLED !== 'true') return false;
  try {
    configuredStripeSecret();
    return true;
  } catch {
    return false;
  }
}

export function checkoutSessionPrefix(): string {
  return `cs_${getStripeMode()}_`;
}

export function checkoutBaseUrl(): string {
  // URL fija y controlada: nunca aceptar Host/X-Forwarded-Host de la petición.
  const raw = process.env.BETTER_AUTH_URL;
  if (!raw) throw new Error('Falta BETTER_AUTH_URL');
  const url = new URL(raw);
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
    throw new Error('La URL de checkout requiere HTTPS.');
  }
  return url.origin;
}
