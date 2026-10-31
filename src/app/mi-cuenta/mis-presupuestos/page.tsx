import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
const status: Record<string,string> = {
  NEW: "Nueva", REVIEWING: "En revisión", QUOTED: "Presupuestada",
  ACCEPTED: "Aceptada", REJECTED: "Rechazada", CLOSED: "Cerrada",
};
export default async function MyQuotes() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/mi-cuenta/acceso?next=%2Fmi-cuenta%2Fmis-presupuestos");
  const quotes = await prisma.quoteRequest.findMany({
    where: { userId: session.user.id }, // jamás buscar por email
    include: { product: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return <main className="mx-auto max-w-5xl px-5 py-14 text-white">
    <h1 className="text-3xl font-bold">Mis presupuestos</h1>
    <p className="mt-2 text-sm text-white/60">Solicitudes vinculadas a tu cuenta.</p>
    <div className="mt-8 space-y-4">
      {quotes.length === 0 && <p className="rounded-xl border border-white/15 p-6">Aún no tienes solicitudes asociadas a esta cuenta.</p>}
      {quotes.map(q => <article key={q.id} className="rounded-xl border border-white/10 bg-[#1a211e] p-5">
        <div className="flex flex-wrap justify-between gap-2">
          <h2 className="font-bold">{q.product?.name ?? "Proyecto personalizado"}</h2>
          <span className="rounded-lg bg-white/10 px-3 py-1 text-sm">{status[q.status]}</span>
        </div>
        <p className="mt-1 text-xs text-white/50">{q.createdAt.toLocaleDateString("es-ES")} · Referencia {q.id.slice(-8).toUpperCase()}</p>
        <p className="mt-3 whitespace-pre-wrap break-words text-sm text-white/75">{q.notes}</p>
        {q.product && <Link className="mt-3 inline-block text-sm text-[#B5FF67] underline" href={`/tienda/${q.product.slug}`}>Ver producto</Link>}
      </article>)}
    </div>
    <Link href="/presupuesto" className="mt-7 inline-block rounded-lg bg-[#B5FF67] px-5 py-3 font-bold text-[#101319]">Nueva solicitud</Link>
  </main>;
}
