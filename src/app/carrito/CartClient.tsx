'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { readCart, saveCart, type CartData } from '@/lib/cart-store';
import { placeOrder } from './actions';
type Preview = {
  id: string;
  name: string;
  slug: string;
  label: string;
  priceCents: number;
  image: string | null;
};
const eur = (n: number) =>
  (n / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
export default function CartClient() {
  const [cart, setCart] = useState<CartData>({ lines: [], notes: '' });
  const [preview, setPreview] = useState<Preview[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<string | null>(null);
  const refresh = useCallback(async (c: CartData) => {
    try {
      const r = await fetch('/api/cart-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines: c.lines }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setPreview(d.items);
    } catch {
      setError('No se pudo cargar el carrito.');
    }
  }, []);
  const initialized = useRef(false);

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
  const update = (next: CartData) => {
    setCart({ ...next, lines: [...next.lines] });
    saveCart(next);
  };
  const total = cart.lines.reduce(
    (sum, l) =>
      sum +
      (preview.find((p) => p.id === l.variantId)?.priceCents ?? 0) * l.quantity,
    0,
  );
  async function submit() {
    setBusy(true);
    setError('');
    try {
      const result = await placeOrder({ lines: cart.lines, notes: cart.notes });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(result.reference);
      saveCart({ lines: [], notes: '' });
      setCart({ lines: [], notes: '' });
    } catch {
      setError('No se pudo registrar el pedido.');
    } finally {
      setBusy(false);
    }
  }
  if (done)
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
      {cart.lines.map((l) => {
        const p = preview.find((x) => x.id === l.variantId);
        return (
          <div
            key={l.variantId}
            className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/15 bg-[#1a211e] p-4'
          >
            <div>
              <p className='font-semibold'>
                {p?.name ?? 'Producto no disponible'}
              </p>
              <p className='text-xs text-white/60'>{p?.label ?? l.variantId}</p>
              <p className='text-sm text-[#B5FF67]'>
                {p ? eur(p.priceCents) : 'Pendiente'}
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <input
                aria-label='Cantidad'
                className='w-18 rounded-lg bg-[#101319] p-2'
                type='number'
                min={1}
                max={20}
                value={l.quantity}
                onChange={(e) =>
                  update({
                    ...cart,
                    lines: cart.lines.map((x) =>
                      x.variantId === l.variantId
                        ? {
                            ...x,
                            quantity: Math.max(
                              1,
                              Math.min(20, Number(e.target.value) || 1),
                            ),
                          }
                        : x,
                    ),
                  })
                }
              />
              <button
                type='button'
                onClick={() =>
                  update({
                    ...cart,
                    lines: cart.lines.filter(
                      (x) => x.variantId !== l.variantId,
                    ),
                  })
                }
                className='text-sm text-red-300'
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
              value={cart.notes}
              onChange={(e) => update({ ...cart, notes: e.target.value })}
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
          {error && (
            <p role='alert' className='mt-3 text-red-300'>
              {error}
            </p>
          )}
          <button
            type='button'
            onClick={submit}
            disabled={busy || preview.length !== cart.lines.length}
            className='mt-4 rounded-lg bg-[#B5FF67] px-6 py-3 font-bold text-[#101319] disabled:opacity-50'
          >
            {busy ? 'Registrando...' : 'Solicitar pedido sin pagar'}
          </button>
        </section>
      )}
    </div>
  );
}
