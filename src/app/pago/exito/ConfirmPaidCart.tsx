'use client';

import { useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { readCart, saveCart, setActiveCartUser } from '@/lib/cart-store';

const CHECKOUT_KEY = 'pn-checkout-key';
const CHECKOUT_ATTEMPT_KEY = 'pn-checkout-attempt-v1';

export default function ConfirmPaidCart({ checkoutKey }: { checkoutKey: string | null }) {
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending || !session?.user.id || !checkoutKey) return;
    setActiveCartUser(session.user.id);
    // Solo borrar el carrito asociado a ESTA compra confirmada, no uno posterior.
    if (sessionStorage.getItem(CHECKOUT_KEY) !== checkoutKey) return;
    const cart = readCart();
    if (cart.lines.length > 0 && !saveCart({ lines: [], notes: '' })) return;
    sessionStorage.removeItem(CHECKOUT_KEY);
    sessionStorage.removeItem(CHECKOUT_ATTEMPT_KEY);
  }, [checkoutKey, isPending, session?.user.id]);

  return null;
}
