'use client';

import { useEffect } from 'react';

type Item = { item_id: string; item_name: string; price: number; quantity: number };
type Purchase = { transaction_id: string; value: number; currency: 'EUR'; shipping: number; items: Item[] };

declare global {
  interface Window {
    dataLayer?: unknown[];
    pn3dGoogleConsent?: { analytics: boolean; ads: boolean };
  }
}

export default function PurchaseTracker({ purchase }: { purchase: Purchase }) {
  useEffect(() => {
    function publish() {
      if (!(window.pn3dGoogleConsent?.analytics || window.pn3dGoogleConsent?.ads)) return;
      const key = `pn3d-purchase-reported:${purchase.transaction_id}`;
      try {
        if (window.localStorage.getItem(key) === '1') return;
      } catch { /* El navegador puede bloquear localStorage. */ }
      window.dataLayer ??= [];
      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push({ event: 'purchase', ecommerce: purchase });
      try { window.localStorage.setItem(key, '1'); } catch { /* Sin persistencia local no hay garantía adicional. */ }
    }
    publish();
    window.addEventListener('pn3d:consent-changed', publish);
    return () => window.removeEventListener('pn3d:consent-changed', publish);
  }, [purchase]);
  return null;
}
