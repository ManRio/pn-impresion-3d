import 'server-only';
import Stripe from 'stripe';

let stripeClient: Stripe | undefined;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.startsWith('sk_test_')) {
    throw new Error('Stripe no está configurado con una clave de pruebas.');
  }
  stripeClient ??= new Stripe(key);
  return stripeClient;
}

export function checkoutEnabled(): boolean {
  return process.env.STRIPE_CHECKOUT_ENABLED === 'true' &&
    process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') === true;
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
