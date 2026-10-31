"use client";
import { useState } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { readCart, saveCart } from '@/lib/cart-store';

type Variant = { id: string; label: string; color: string; priceCents: number };
export default function AddToCart({ variants }: { variants: Variant[] }) {
  const { data: session, isPending } = authClient.useSession();
  const [selected, setSelected] = useState(variants[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');
  if (!variants.length) return <p className="mt-6 text-amber-300">No hay variantes disponibles.</p>;
  return <div className="mt-6 rounded-xl border border-white/15 p-4">
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm">Variante<select className="mt-1 w-full rounded-lg border border-white/20 bg-[#101319] p-3" value={selected} onChange={e=>{setSelected(e.target.value);setAdded(false);}}>{variants.map(v=><option key={v.id} value={v.id}>{v.label} · {v.color} · {(v.priceCents/100).toFixed(2)} €</option>)}</select></label>
      <label className="text-sm">Cantidad<input className="mt-1 w-full rounded-lg border border-white/20 bg-[#101319] p-3" type="number" min={1} max={20} value={quantity} onChange={e=>setQuantity(Math.max(1,Math.min(20,Number(e.target.value)||1)))}/></label>
    </div>
    {!isPending && !session && <p className="mt-3 text-sm text-amber-200">Para guardar productos en tu carrito, <Link href="/mi-cuenta/acceso" className="underline">inicia sesión</Link>.</p>}
    <button type="button" disabled={isPending || !session} className="mt-4 rounded-lg bg-[#B5FF67] px-5 py-3 font-bold text-[#101319] disabled:cursor-not-allowed disabled:opacity-50" onClick={()=>{
      setError('');
      const cart=readCart();
      const old=cart.lines.find(x=>x.variantId===selected);
      if(old) old.quantity=Math.min(20,old.quantity+quantity);
      else cart.lines.push({variantId:selected,quantity});
      if(saveCart(cart)) setAdded(true);
      else setError('No se pudo guardar el carrito. Actualiza la página y comprueba tu sesión.');
    }}>Añadir al carrito</button>
    {error&&<p role="alert" className="mt-3 text-sm text-amber-300">{error}</p>}
    {added&&<p role="status" className="mt-3 text-sm text-[#B5FF67]">Añadido. <Link href="/carrito" className="underline">Ver carrito</Link></p>}
  </div>;
}
