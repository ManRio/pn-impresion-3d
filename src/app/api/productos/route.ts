import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true, name: true, slug: true, description: true, saleMode: true,
        category: { select: { name: true, slug: true } },
        images: { orderBy: { position: "asc" }, select: { url: true, alt: true } },
        variants: {
          where: { active: true },
          select: { sku: true, label: true, color: true, material: true, weightGrams: true, priceCents: true },
          orderBy: { priceCents: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 48,
    });
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error obteniendo catálogo:", error);
    return NextResponse.json({ error: "No se ha podido cargar el catálogo" }, { status: 500 });
  }
}
