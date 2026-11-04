'use client';
import { useEffect } from 'react';
import { readCart, saveCart } from '@/lib/cart-store';

const CHECKOUT_KEY = 'pn-checkout-key';
export default function ConfirmPaidCart({ checkoutKey }: { checkoutKey: string | null }) {
  useEffect(() => {
    if (checkoutKey && sessionStorage.getItem(CHECKOUT_KEY) === checkoutKey) {
      // Solo borrar si este navegador conserva el intento que se acaba de pagar.
      const current = readCart();
      if (current.lines.length > 0) saveCart({ lines: [], notes: '' });
      sessionStorage.removeItem(CHECKOUT_KEY);
    }
  }, [checkoutKey]);
  return null;
}
