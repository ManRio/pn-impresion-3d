import CartClient from './CartClient';
import { getStripeMode } from '@/lib/stripe';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Carrito' };
export default function CartPage() {
  return (
    <main className='mx-auto max-w-4xl px-5 py-14'>
      <h1 className='mb-7 text-3xl font-black'>Tu carrito</h1>
      <CartClient stripeMode={getStripeMode()} />
    </main>
  );
}
