import "server-only";
import type { Prisma } from "@/generated/prisma/client";

type Product = Prisma.ProductGetPayload<{include:{images:true;variants:true;category:true}}>;

export function publicationFailures(product: Product): string[] {
  const issues: string[] = [];
  if (product.name.trim().length < 3 || product.description.trim().length < 10)
    issues.push("Completa el nombre y una descripción de al menos 10 caracteres.");
  if (!product.category) issues.push("Selecciona una categoría.");
  if (product.saleMode === "DIRECT" && !product.variants.some(v => v.active && v.priceCents > 0 && v.weightGrams > 0))
    issues.push("Para venta directa necesitas una variante activa con peso y precio positivo.");
  // MakerWorld / fuentes externas nunca pueden eludir el control cambiando designOrigin.
  const thirdParty = Boolean(product.sourcePlatform) || product.designOrigin === "THIRD_PARTY";
  if (thirdParty && (!product.commercialPermission || !product.rightsEvidence?.trim() || !product.rightsReviewedAt))
    issues.push("Los diseños de terceros requieren autorización comercial documentada.");
  return issues;
}
