'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import PrivacyNotice from '@/components/legal/PrivacyNotice';
import { readCart, saveCart, type CartData } from '@/lib/cart-store';
import {
  shippingCentsFor, PICKUP_ADDRESS, type DeliveryMethod,
} from '@/lib/checkout-config';
import { splitIncludedVat } from '@/lib/tax-config';
import { startStripeCheckout } from './actions';

type Preview = {
  id: string;
  name: string;
  slug: string;
  label: string;
  priceCents: number;
  image: string | null;
};

const CHECKOUT_KEY = 'pn-checkout-key';
const eur = (n: number) => (n / 100).toLocaleString('es-ES', {
  style: 'currency', currency: 'EUR',
});

export default function CartClient() {
  const [cart, setCart] = useState<CartData>({ lines: [], notes: '' });
  const [preview, setPreview] = useState<Preview[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(null);
  const submitting = useRef(false);
  const initialized = useRef(false);

  const refresh = useCallback(async (currentCart: CartData) => {
    try {
      const response = await fetch('/api/cart-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ lines: currentCart.lines }),
      });
      const data: { items?: Preview[]; error?: string } = await response.json();
      if (!response.ok || !Array.isArray(data.items)) {
        throw new Error(data.error || 'Error consultando el carrito.');
      }
      setPreview(data.items);
      setError('');
    } catch {
      setPreview([]);
      setError('No se pudo cargar el carrito.');
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    queueMicrotask(() => {
      const savedCart = readCart();
      setCart(savedCart);
      void refresh(savedCart);
    });
  }, [refresh]);

  const update = (next: CartData) => {
    if (submitting.current) return;
    sessionStorage.removeItem(CHECKOUT_KEY);
    setCart({ ...next, lines: [...next.lines] });
    setError('');
    setPreview([]);
    saveCart(next);
    void refresh(next);
  };

  const selectDelivery = (method: DeliveryMethod) => {
    if (submitting.current) return;
    setDeliveryMethod(method);
    sessionStorage.removeItem(CHECKOUT_KEY);
    setError('');
  };

  const subtotal = cart.lines.reduce((sum, line) => {
    const product = preview.find(item => item.id === line.variantId);
    return sum + (product?.priceCents ?? 0) * line.quantity;
  }, 0);
  const ready = cart.lines.length > 0 && preview.length === cart.lines.length;
  const shipping = deliveryMethod ? shippingCentsFor(deliveryMethod) : 0;
  const grandTotal = subtotal + shipping;
  const taxBreakdown = splitIncludedVat(grandTotal);

  async function submit() {
    if (submitting.current || !ready || !deliveryMethod) {
      if (!deliveryMethod) setError('Selecciona envío o recogida presencial.');
      return;
    }
    submitting.current = true;
    setBusy(true);
    setError('');
    try {
      let checkoutKey = sessionStorage.getItem(CHECKOUT_KEY);
      if (!checkoutKey) {
        checkoutKey = crypto.randomUUID();
        sessionStorage.setItem(CHECKOUT_KEY, checkoutKey);
      }
      const result = await startStripeCheckout({
        lines: cart.lines, notes: cart.notes, deliveryMethod, checkoutKey,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // Conservar carrito y checkoutKey hasta recibir confirmación de pago.
      window.location.assign(result.url);
    } catch {
      setError('No se pudo iniciar Stripe. Puedes reintentar sin duplicar el pedido.');
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <div className='space-y-5'>
      {cart.lines.length === 0 && (
        <div className='rounded-xl border border-white/15 p-6'>
          Tu carrito está vacío.{' '}
          <Link href='/tienda' className='text-[#B5FF67] underline'>Ver tienda</Link>
        </div>
      )}
      {cart.lines.map(line => {
        const product = preview.find(item => item.id === line.variantId);
        return (
          <div key={line.variantId}
            className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/15 bg-[#1a211e] p-4'>
            <div>
              <p className='font-semibold'>{product?.name ?? 'Producto no disponible'}</p>
              <p className='text-xs text-white/60'>{product?.label ?? line.variantId}</p>
              <p className='text-sm text-[#B5FF67]'>
                {product ? eur(product.priceCents) : 'Pendiente'}
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <input aria-label={`Cantidad de ${product?.name ?? 'producto'}`}
                className='w-18 rounded-lg bg-[#101319] p-2'
                type='number' min={1} max={20} disabled={busy} value={line.quantity}
                onChange={event => update({
                  ...cart,
                  lines: cart.lines.map(item => item.variantId === line.variantId
                    ? { ...item, quantity: Math.max(1, Math.min(20, Number(event.target.value) || 1)) }
                    : item),
                })}
              />
              <button type='button' disabled={busy}
                aria-label={`Quitar ${product?.name ?? 'producto'} del carrito`}
                onClick={() => update({ ...cart, lines: cart.lines.filter(item => item.variantId !== line.variantId) })}
                className='text-sm text-red-300 disabled:opacity-50'>Quitar</button>
            </div>
          </div>
        );
      })}

      {cart.lines.length > 0 && (
        <section className='rounded-xl border border-white/15 p-5'>
          <label className='text-sm font-semibold'>
            Notas para el pedido
            <textarea className='mt-2 w-full rounded-lg border border-white/20 bg-[#101319] p-3'
              rows={4} maxLength={2000} disabled={busy} value={cart.notes}
              onChange={event => update({ ...cart, notes: event.target.value })}
              placeholder='Nombres, colores, detalles de personalización...'/>
          </label>

          <fieldset className='mt-6 rounded-xl border border-white/15 p-4'>
            <legend className='px-2 text-base font-bold'>¿Cómo quieres recibir tu pedido?</legend>
            <div className='mt-3 space-y-3'>
              <label className='flex cursor-pointer items-start gap-3 rounded-lg border border-white/15 p-4 has-checked:border-[#B5FF67]'>
                <input type='radio' name='deliveryMethod' value='SHIPPING'
                  checked={deliveryMethod === 'SHIPPING'} disabled={busy}
                  onChange={() => selectDelivery('SHIPPING')}
                  className='mt-1 accent-[#B5FF67]'/>
                <span>
                  <span className='block font-bold'>Envío con Correos · 8,00 €</span>
                  <span className='mt-1 block text-sm text-white/70'>Península y Baleares.</span>
                </span>
              </label>
              <label className='flex cursor-pointer items-start gap-3 rounded-lg border border-white/15 p-4 has-checked:border-[#B5FF67]'>
                <input type='radio' name='deliveryMethod' value='PICKUP'
                  checked={deliveryMethod === 'PICKUP'} disabled={busy}
                  onChange={() => selectDelivery('PICKUP')}
                  className='mt-1 accent-[#B5FF67]'/>
                <span>
                  <span className='block font-bold'>Recogida presencial · Gratis</span>
                  <span className='mt-1 block text-sm leading-6 text-white/70'>
                    {PICKUP_ADDRESS}. Te avisaremos cuando esté preparado.
                  </span>
                </span>
              </label>
            </div>
          </fieldset>

          <div className='mt-6 space-y-3 rounded-xl bg-[#101319] p-4'>
            <div className='flex justify-between gap-4'>
              <span>Subtotal de productos</span>
              <span>{ready ? eur(subtotal) : 'Calculando…'}</span>
            </div>
            <div className='flex justify-between gap-4'>
              <span>{deliveryMethod === 'SHIPPING' ? 'Envío con Correos' : 'Entrega'}</span>
              <span>{deliveryMethod ? (shipping ? eur(shipping) : 'Gratis') : 'Por elegir'}</span>
            </div>
            <div className='flex justify-between gap-4 border-t border-white/15 pt-3 text-lg font-bold'>
              <span>Total del pedido</span>
              <span className='text-[#B5FF67]'>
                {ready && deliveryMethod ? eur(grandTotal) : 'Pendiente'}
              </span>
            </div>
            {ready && deliveryMethod && (
              <div className='space-y-1 border-t border-white/10 pt-3 text-sm text-white/75'>
                <div className='flex justify-between gap-3'>
                  <span>Base imponible estimada (IVA 21 %)</span>
                  <span>{eur(taxBreakdown.baseCents)}</span>
                </div>
                <div className='flex justify-between gap-3'>
                  <span>IVA 21 % incluido</span>
                  <span>{eur(taxBreakdown.vatCents)}</span>
                </div>
              </div>
            )}
            <p className='text-xs leading-6 text-white/65'>
              Los precios y el transporte ya incluyen IVA. El tipo del 21 % debe
              comprobarse para cada familia de productos antes de aceptar pagos reales.
            </p>
          </div>
          <p className='mt-3 text-xs text-amber-200'>
            Pago de prueba con Stripe. No se cobrará dinero real.
          </p>
          <p className='mt-2 text-xs text-white/60'>
            {deliveryMethod === 'PICKUP'
              ? 'Necesitas iniciar sesión y tener completa tu dirección de facturación.'
              : 'Para el envío necesitas iniciar sesión y guardar una dirección de Península o Baleares en Mi cuenta.'}
          </p>
          <div className='mt-5'><PrivacyNotice context='checkout'/></div>
          {error && <p role='alert' className='mt-3 text-red-300'>{error}</p>}
          <button type='button' onClick={submit}
            disabled={busy || !ready || !deliveryMethod}
            className='mt-4 rounded-lg bg-[#B5FF67] px-6 py-3 font-bold text-[#101319] disabled:opacity-50'>
            {busy ? 'Abriendo Stripe…' : 'Pagar con Stripe (pruebas)'}
          </button>
        </section>
      )}
    </div>
  );
}
