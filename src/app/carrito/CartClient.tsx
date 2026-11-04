'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { readCart, saveCart, type CartData } from '@/lib/cart-store';
import { placeOrder } from './actions';
import PrivacyNotice from '@/components/legal/PrivacyNotice';

type Preview = {
  id: string;
  name: string;
  slug: string;
  label: string;
  priceCents: number;
  image: string | null;
};

const CHECKOUT_KEY = 'pn-checkout-key';

const eur = (n: number) =>
  (n / 100).toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
  });

export default function CartClient() {
  const [cart, setCart] = useState<CartData>({
    lines: [],
    notes: '',
  });

  const [preview, setPreview] = useState<Preview[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<string | null>(null);

  // Protección adicional frente a dobles clics.
  const submitting = useRef(false);
  const initialized = useRef(false);

  const refresh = useCallback(async (currentCart: CartData) => {
    try {
      const response = await fetch('/api/cart-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify({
          lines: currentCart.lines,
        }),
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

    const loadCart = () => {
      const savedCart = readCart();

      setCart(savedCart);
      void refresh(savedCart);
    };

    queueMicrotask(loadCart);
  }, [refresh]);

  // Cualquier cambio en el carrito invalida el intento anterior.
  const update = (next: CartData) => {
    if (submitting.current) return;

    sessionStorage.removeItem(CHECKOUT_KEY);

    setCart({
      ...next,
      lines: [...next.lines],
    });

    setError('');
    setPreview([]);
    saveCart(next);

    void refresh(next);
  };

  const total = cart.lines.reduce((sum, line) => {
    const product = preview.find((item) => item.id === line.variantId);

    return sum + (product?.priceCents ?? 0) * line.quantity;
  }, 0);

  async function submit() {
    if (
      submitting.current ||
      cart.lines.length === 0 ||
      preview.length !== cart.lines.length
    ) {
      return;
    }

    submitting.current = true;
    setBusy(true);
    setError('');

    try {
      // La clave se conserva si falla la comunicación.
      // Así un reintento no crea un pedido duplicado.
      let checkoutKey = sessionStorage.getItem(CHECKOUT_KEY);

      if (!checkoutKey) {
        checkoutKey = crypto.randomUUID();
        sessionStorage.setItem(CHECKOUT_KEY, checkoutKey);
      }

      const result = await placeOrder({
        lines: cart.lines,
        notes: cart.notes,
        checkoutKey,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      // Solo eliminar la clave cuando el servidor
      // confirma correctamente el pedido.
      sessionStorage.removeItem(CHECKOUT_KEY);

      setDone(result.reference);

      const emptyCart: CartData = {
        lines: [],
        notes: '',
      };

      saveCart(emptyCart);
      setCart(emptyCart);
      setPreview([]);
    } catch {
      // Mantener la clave permite reintentar el mismo pedido.
      setError(
        'No se pudo confirmar el resultado del pedido. Puedes reintentarlo sin duplicarlo.',
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  if (done) {
    return (
      <section
        role='status'
        className='rounded-xl border border-[#B5FF67]/40 p-6'
      >
        <h2 className='text-xl font-bold text-[#B5FF67]'>
          Pedido recibido: {done}
        </h2>

        <p className='mt-2 text-white/70'>
          Aún no se ha efectuado ningún pago. Contactaremos contigo para
          confirmar los siguientes pasos.
        </p>

        <Link
          href='/mi-cuenta/mis-pedidos'
          className='mt-4 inline-block underline'
        >
          Mis pedidos
        </Link>
      </section>
    );
  }

  return (
    <div className='space-y-5'>
      {cart.lines.length === 0 && (
        <div className='rounded-xl border border-white/15 p-6'>
          Tu carrito está vacío.{' '}
          <Link href='/tienda' className='text-[#B5FF67] underline'>
            Ver tienda
          </Link>
        </div>
      )}

      {cart.lines.map((line) => {
        const product = preview.find((item) => item.id === line.variantId);

        return (
          <div
            key={line.variantId}
            className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/15 bg-[#1a211e] p-4'
          >
            <div>
              <p className='font-semibold'>
                {product?.name ?? 'Producto no disponible'}
              </p>

              <p className='text-xs text-white/60'>
                {product?.label ?? line.variantId}
              </p>

              <p className='text-sm text-[#B5FF67]'>
                {product ? eur(product.priceCents) : 'Pendiente'}
              </p>
            </div>

            <div className='flex items-center gap-3'>
              <input
                aria-label='Cantidad'
                className='w-18 rounded-lg bg-[#101319] p-2'
                type='number'
                min={1}
                max={20}
                disabled={busy}
                value={line.quantity}
                onChange={(event) =>
                  update({
                    ...cart,
                    lines: cart.lines.map((item) =>
                      item.variantId === line.variantId
                        ? {
                            ...item,
                            quantity: Math.max(
                              1,
                              Math.min(20, Number(event.target.value) || 1),
                            ),
                          }
                        : item,
                    ),
                  })
                }
              />

              <button
                type='button'
                disabled={busy}
                onClick={() =>
                  update({
                    ...cart,
                    lines: cart.lines.filter(
                      (item) => item.variantId !== line.variantId,
                    ),
                  })
                }
                className='text-sm text-red-300 disabled:opacity-50'
              >
                Quitar
              </button>
            </div>
          </div>
        );
      })}

      {cart.lines.length > 0 && (
        <section className='rounded-xl border border-white/15 p-5'>
          <label className='text-sm font-semibold'>
            Notas para el pedido
            <textarea
              className='mt-2 w-full rounded-lg border border-white/20 bg-[#101319] p-3'
              rows={4}
              maxLength={2000}
              disabled={busy}
              value={cart.notes}
              onChange={(event) =>
                update({
                  ...cart,
                  notes: event.target.value,
                })
              }
              placeholder='Nombres, colores, detalles de personalización...'
            />
          </label>

          <p className='mt-3 text-lg font-bold'>Subtotal: {eur(total)}</p>

          <p className='mt-2 text-xs text-amber-200'>
            Gastos de envío e impuestos finales pendientes de confirmar. Este
            paso NO realiza un cobro.
          </p>

          <p className='mt-2 text-xs text-white/60'>
            Para registrar el pedido debes iniciar sesión y tener completa tu
            dirección de envío.
          </p>

          <div className='mt-5'>
            <PrivacyNotice context='checkout' />
          </div>

          {error && (
            <p role='alert' className='mt-3 text-red-300'>
              {error}
            </p>
          )}

          <button
            type='button'
            onClick={submit}
            disabled={
              busy ||
              cart.lines.length === 0 ||
              preview.length !== cart.lines.length
            }
            className='mt-4 rounded-lg bg-[#B5FF67] px-6 py-3 font-bold text-[#101319] disabled:opacity-50'
          >
            {busy ? 'Registrando...' : 'Solicitar pedido sin pagar'}
          </button>
        </section>
      )}
    </div>
  );
}
