/**
 * P&N: régimen general de IVA.
 * Para el catálogo actualmente modelado asumimos provisionalmente el tipo
 * general del 21 %. Verificar excepciones por familia de producto con gestoría.
 * Los precios de Neon y los 8 € de Correos YA INCLUYEN impuestos.
 * Este módulo calcula importes para pedidos; NO emite facturas.
 */
export const STANDARD_VAT_RATE = 21 as const;

/** Desglosa un importe final en céntimos, sin aplicar IVA por segunda vez. */
export function splitIncludedVat(grossCents: number, vatRate = STANDARD_VAT_RATE) {
  if (!Number.isSafeInteger(grossCents) || grossCents < 0 ||
      !Number.isSafeInteger(vatRate) || vatRate < 0 || vatRate > 100) {
    throw new Error('Importe o tipo de IVA no válido.');
  }
  const baseCents = Math.round((grossCents * 100) / (100 + vatRate));
  return {
    grossCents,
    baseCents,
    vatCents: grossCents - baseCents,
    vatRatePercent: vatRate,
  };
}
