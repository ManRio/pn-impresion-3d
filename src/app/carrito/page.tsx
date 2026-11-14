import CartClient from './CartClient';
import { getStripeMode } from '@/lib/stripe';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Carrito' };
export default function CartPage() {
  return (
    <main id='contenido-principal' className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
      <h1 className='mb-5 text-3xl font-black'>Tu carrito</h1>
      <CartClient stripeMode={getStripeMode()} />
    </main>
  );
}
