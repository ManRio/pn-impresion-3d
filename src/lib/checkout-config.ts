export const SHIPPING_CENTS = 800;
export const PICKUP_ADDRESS =
  'Avda. Antonio Machado, 155, 41230 Castilblanco de los Arroyos (Sevilla)';

export const DELIVERY_METHODS = {
  SHIPPING: 'SHIPPING',
  PICKUP: 'PICKUP',
} as const;

export type DeliveryMethod =
  (typeof DELIVERY_METHODS)[keyof typeof DELIVERY_METHODS];

export function isDeliveryMethod(value: unknown): value is DeliveryMethod {
  return value === DELIVERY_METHODS.SHIPPING || value === DELIVERY_METHODS.PICKUP;
}

export function shippingCentsFor(method: DeliveryMethod): number {
  return method === 'SHIPPING' ? SHIPPING_CENTS : 0;
}

/** Validación inicial de cobertura; no verifica que la dirección exista. */
export function isSupportedShippingAddress(postalCode: string, country: string): boolean {
  const countryNormalized = country.trim().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (countryNormalized !== 'espana' && countryNormalized !== 'spain' && countryNormalized !== 'es') {
    return false;
  }
  const cp = postalCode.trim();
  if (!/^\d{5}$/.test(cp)) return false;
  const province = Number(cp.slice(0, 2));
  // Provincias 01–50, excepto Las Palmas (35) y Santa Cruz de Tenerife (38).
  // Incluye Baleares (07) y excluye Ceuta (51) y Melilla (52).
  return province >= 1 && province <= 50 && province !== 35 && province !== 38;
}
