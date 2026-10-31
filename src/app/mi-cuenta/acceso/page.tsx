import AccountAccess from "./AccountAccess";
export default function AccessPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return <Access searchParams={searchParams}/>;
}
async function Access({searchParams}: {searchParams: Promise<{next?:string}>}) {
  const next = (await searchParams).next;
  const destination = next?.startsWith("/") && !next.startsWith("//") && !next.includes("\\\\") ? next : "/mi-cuenta/mis-presupuestos";
  return <main className="mx-auto max-w-md px-5 py-16"><h1 className="text-3xl font-bold">Acceso de clientes</h1><p className="mt-2 text-sm text-white/60">Inicia sesión o crea tu cuenta para consultar tus presupuestos.</p><AccountAccess next={destination}/></main>;
}
