export type CartLine = { variantId: string; quantity: number };
export type CartData = { lines: CartLine[]; notes: string };

// Carrito local por cuenta. No se transfiere entre dispositivos.
export const CART_KEY = 'pn-cart-v1'; // Antigua clave compartida: NO volver a usar.
const PREFIX = 'pn-cart-user-v2:';
let activeUserId: string | null = null;
const emptyCart = (): CartData => ({ lines: [], notes: '' });

export function setActiveCartUser(userId: string | null) {
  if (typeof window === 'undefined') return;
  const next = userId || null;
  // Retirar los datos del carrito antiguo, que podía mezclarse entre cuentas.
  localStorage.removeItem(CART_KEY);
  if (activeUserId === next) return;
  activeUserId = next;
  window.dispatchEvent(new Event('pn-cart-changed'));
}

export function readCart(): CartData {
  if (typeof window === 'undefined' || !activeUserId) return emptyCart();
  try {
    const raw = localStorage.getItem(PREFIX + activeUserId);
    const d: unknown = JSON.parse(raw || '{}');
    if (typeof d !== 'object' || d === null) return emptyCart();
    const parsed = d as {lines?: unknown;notes?: unknown};
    const lines = Array.isArray(parsed.lines) ? parsed.lines.filter((line: unknown): line is CartLine => {
      if (typeof line !== 'object' || line === null) return false;
      const entry = line as Record<string, unknown>;
      return typeof entry.variantId === 'string' && entry.variantId.length > 0 && Number.isInteger(entry.quantity) && Number(entry.quantity) > 0 && Number(entry.quantity) <= 20;
    }).slice(0,30) : [];
    return { lines, notes: typeof parsed.notes === 'string' ? parsed.notes.slice(0,2000) : '' };
  } catch { return emptyCart(); }
}

export function saveCart(data: CartData): boolean {
  if (typeof window === 'undefined' || !activeUserId) return false;
  try {
    localStorage.setItem(PREFIX + activeUserId, JSON.stringify(data));
    window.dispatchEvent(new Event('pn-cart-changed'));
    return true;
  } catch { return false; }
}
