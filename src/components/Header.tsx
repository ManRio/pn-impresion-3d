'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Menu, X, ShoppingCart, UserRound, LogIn, LogOut, Package,
  FileText, UserCircle, Trash2, ArrowRight, LoaderCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { readCart, saveCart, setActiveCartUser, type CartData } from '@/lib/cart-store';

const links = [
  ['/tienda', 'Tienda'],
  ['/personalizados', 'Personalizados'],
  ['/presupuesto', 'Presupuesto'],
  ['/contacto', 'Contacto'],
];

type Preview = {
  id: string;
  name: string;
  slug: string;
  label: string;
  priceCents: number;
  image: string | null;
};
const emptyCart: CartData = { lines: [], notes: '' };
const euros = (cents: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100);

type Panel = 'cart' | 'account' | null;

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [cart, setCart] = useState<CartData>(emptyCart);
  const [preview, setPreview] = useState<Preview[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const firstName = session?.user.name?.trim().split(/\s+/)[0] || 'Mi cuenta';

  // El almacén ya notifica los cambios mediante pn-cart-changed.
  useEffect(() => {
    const syncCart = () => setCart(readCart());
    window.addEventListener('pn-cart-changed', syncCart);
    window.addEventListener('storage', syncCart); // Otra pestaña.
    queueMicrotask(syncCart); // Carga inicial, sin setState síncrono en el efecto.
    return () => {
      window.removeEventListener('pn-cart-changed', syncCart);
      window.removeEventListener('storage', syncCart);
    };
  }, []);

  // Cambiar el carrito activo al cambiar la sesión, sin tocar otros usuarios.
  useEffect(() => {
    if (isPending) return;
    const userId = session?.user.id ?? null;
    queueMicrotask(() => {
      setActiveCartUser(userId);
      // Importante: también sincronizamos si el componente acaba de montar.
      setCart(readCart());
      setPreview([]);
    });
  }, [session?.user.id, isPending]);

  // Los datos del catálogo y los precios se consultan en el servidor.
  useEffect(() => {
    if (panel !== 'cart') return;
    if (!cart.lines.length) return;
    const controller = new AbortController();
    const load = async () => {
      setCartLoading(true);
      setCartError(false);
      try {
        const response = await fetch('/api/cart-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lines: cart.lines }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('No se pudo consultar el carrito');
        const data: { items: Preview[] } = await response.json();
        if (!controller.signal.aborted) setPreview(data.items);
      } catch {
        if (!controller.signal.aborted) setCartError(true);
      } finally {
        if (!controller.signal.aborted) setCartLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [panel, cart]);

  useEffect(() => {
    if (!panel) return;
    const onPointerDown = (event: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setPanel(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPanel(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [panel]);

  const itemCount = cart.lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = cart.lines.reduce((sum, line) => sum + (preview.find(p => p.id === line.variantId)?.priceCents ?? 0) * line.quantity, 0);
  const closePanels = () => { setPanel(null); setMobileOpen(false); };
  const togglePanel = (next: Exclude<Panel, null>) => {
    setMobileOpen(false);
    setPanel(current => current === next ? null : next);
  };
  const removeItem = (variantId: string) => {
    saveCart({ ...cart, lines: cart.lines.filter(line => line.variantId !== variantId) });
  };
  async function logout() {
    closePanels();
    const result = await authClient.signOut();
    if (result.error) return;
    setActiveCartUser(null);
    setCart(emptyCart);
    setPreview([]);
    router.replace('/');
    router.refresh();
  }

  return <>
    <div className="top-strip">
      <span>IMPRESIÓN 3D BAJO DEMANDA</span>
      <span className="hidden sm:inline">Ideas únicas · Fabricación personalizada · Envíos en España</span>
      <span>P&N · 3D</span>
    </div>
    <header className="site-header relative z-50">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="P&N Impresión 3D, inicio" onClick={closePanels}>
          <Image src="/images/pn-header.png" width={2172} height={724}
            sizes="(max-width: 720px) 150px, 205px" alt="P&N Impresión 3D"
            priority className="brand-wordmark" />
        </Link>
        <nav className="desktop-nav" aria-label="Navegación principal">
          {links.map(([href, label]) => <Link key={href} href={href} onClick={closePanels}>{label}</Link>)}
        </nav>
        <div className="header-actions flex items-center gap-2" ref={panelRef}>
          <div className="relative flex items-center gap-2">
            <button type="button" aria-label={`Abrir carrito, ${itemCount} productos`} title="Carrito"
              aria-expanded={panel === 'cart'} aria-controls="pn-header-cart"
              onClick={() => togglePanel('cart')}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${panel === 'cart' ? 'border-[#B5FF67] bg-[#B5FF67]/15 text-[#B5FF67]' : 'border-white/15 text-white hover:border-[#B5FF67] hover:text-[#B5FF67]'}`}>
              <ShoppingCart size={21}/>
              {itemCount > 0 && <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#B5FF67] px-1 text-[10px] font-extrabold text-[#101319]">{itemCount > 99 ? '99+' : itemCount}</span>}
            </button>
            <button type="button" aria-label="Abrir menú de usuario" title="Mi cuenta"
              aria-expanded={panel === 'account'} aria-controls="pn-header-account"
              onClick={() => togglePanel('account')}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${panel === 'account' ? 'border-[#B5FF67] bg-[#B5FF67]/15 text-[#B5FF67]' : 'border-white/15 text-white hover:border-[#B5FF67] hover:text-[#B5FF67]'}`}>
              <UserRound size={21}/>
            </button>

          {panel === 'cart' && <section id="pn-header-cart" aria-label="Resumen del carrito"
            className="absolute right-0 top-[calc(100%+12px)] z-[100] w-[min(360px,calc(100vw-24px))] rounded-2xl border border-white/15 bg-[#17201b] p-4 text-white shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-bold">Mi carrito</h2><span className="text-xs text-white/55">{itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}</span>
            </div>
            {cart.lines.length === 0 ? <div className="py-6 text-center"><ShoppingCart className="mx-auto mb-2 text-white/40"/><p className="text-sm text-white/65">Tu carrito está vacío</p><Link onClick={closePanels} href="/tienda" className="mt-3 inline-block text-sm text-[#B5FF67] underline">Ir a la tienda</Link></div> : <>
              <div className="max-h-72 space-y-3 overflow-y-auto py-3">
                {cart.lines.map(line => {
                  const p = preview.find(item => item.id === line.variantId);
                  return <div key={line.variantId} className="flex items-start gap-3 rounded-lg border border-white/10 bg-[#101715] p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5"><Package size={19} className="text-[#B5FF67]"/></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{p?.name ?? (cartLoading ? 'Cargando producto…' : 'Producto pendiente de consultar')}</p>
                      <p className="text-xs text-white/55">{p?.label ?? 'Variante'} · Cantidad: {line.quantity}</p>
                      {p && <p className="mt-1 text-sm text-[#B5FF67]">{euros(p.priceCents * line.quantity)}</p>}
                    </div>
                    <button type="button" aria-label="Quitar producto" onClick={() => removeItem(line.variantId)} className="rounded p-1 text-white/50 hover:text-red-300"><Trash2 size={17}/></button>
                  </div>;
                })}
              </div>
              {cartError && <p role="alert" className="text-xs text-amber-300">No se pudieron consultar los precios. Abre el carrito completo.</p>}
              <div className="flex justify-between border-t border-white/10 py-3 text-sm"><span>Subtotal orientativo</span><strong>{cartLoading || preview.length !== cart.lines.length ? 'Calculando…' : euros(total)}</strong></div>
              <Link href="/carrito" onClick={closePanels} className="flex items-center justify-center gap-2 rounded-lg bg-[#B5FF67] px-4 py-3 text-sm font-bold text-[#101319]">Ver carrito completo <ArrowRight size={16}/></Link>
            </>}
          </section>}

          {panel === 'account' && <section id="pn-header-account" aria-label="Menú de usuario"
            className="absolute right-0 top-[calc(100%+12px)] z-[100] w-[min(270px,calc(100vw-24px))] rounded-2xl border border-white/15 bg-[#17201b] p-3 text-white shadow-2xl shadow-black/60">
            {isPending ? <p className="p-3 text-sm text-white/60"><LoaderCircle size={16} className="mr-2 inline animate-spin"/>Comprobando sesión…</p> : session ? <>
              <div className="border-b border-white/10 px-3 pb-3"><p className="text-sm font-bold">Hola, {firstName}</p><p className="truncate text-xs text-white/55">{session.user.email}</p></div>
              <div className="space-y-1 pt-2">
                <Link href="/mi-cuenta" onClick={closePanels} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-white/10"><UserCircle size={18}/> Mi perfil</Link>
                <Link href="/mi-cuenta/mis-pedidos" onClick={closePanels} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-white/10"><Package size={18}/> Mis pedidos</Link>
                <Link href="/mi-cuenta/mis-presupuestos" onClick={closePanels} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-white/10"><FileText size={18}/> Mis presupuestos</Link>
                <button type="button" onClick={() => void logout()} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-300 hover:bg-red-500/10"><LogOut size={18}/> Cerrar sesión</button>
              </div>
            </> : <div className="space-y-1">
              <p className="px-3 py-2 text-sm text-white/65">Accede para consultar tus pedidos y presupuestos.</p>
              <Link href="/mi-cuenta/acceso" onClick={closePanels} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-white/10"><LogIn size={18}/> Iniciar sesión / Registrarse</Link>
            </div>}
          </section>}
          </div>

          <button type="button" className="mobile-trigger" aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen} onClick={() => {setPanel(null);setMobileOpen(!mobileOpen);}}>
            {mobileOpen ? <X/> : <Menu/>}
          </button>
        </div>
      </div>
      {mobileOpen && <nav className="mobile-nav" aria-label="Navegación móvil">
        {links.map(([href, label]) => <Link onClick={closePanels} key={href} href={href}>{label}</Link>)}
      </nav>}
    </header>
  </>;
}
