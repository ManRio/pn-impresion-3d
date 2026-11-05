'use client';
import { useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { readCart, saveCart, setActiveCartUser } from '@/lib/cart-store';

const CHECKOUT_KEY = 'pn-checkout-key';

export default function ConfirmPaidCart({ checkoutKey }: { checkoutKey: string | null }) {
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending || !session?.user.id || !checkoutKey) return;
    // La página de éxito puede montarse antes de que Header seleccione la cuenta.
    setActiveCartUser(session.user.id);
    // Solo vaciar el carrito del intento confirmado en esta sesión.
    if (sessionStorage.getItem(CHECKOUT_KEY) !== checkoutKey) return;
    const cart = readCart();
    if (cart.lines.length > 0 && !saveCart({ lines: [], notes: '' })) return;
    sessionStorage.removeItem(CHECKOUT_KEY);
  }, [checkoutKey, isPending, session?.user.id]);

  return null;
}
