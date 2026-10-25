import Link from 'next/link';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'Productos personalizados'};
export default function Page(){return <main className="mx-auto min-h-[65vh] max-w-5xl px-5 py-20"><p className="font-bold uppercase tracking-widest text-[#b5ff67]">A tu manera</p><h1 className="mt-4 text-5xl font-black">Productos personalizados</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-white/70">Estamos preparando productos que podrás adaptar a tu gusto. Para ideas especiales, solicita una valoración individual.</p><Link href="/presupuesto" className="mt-8 inline-block rounded-full bg-[#b5ff67] px-6 py-4 font-bold text-black">Solicitar presupuesto</Link></main>}
