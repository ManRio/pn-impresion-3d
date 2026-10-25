import type {Metadata} from 'next';
import ProductGrid from '@/components/ProductGrid';
export const metadata:Metadata={title:'Tienda'};
export default function Page(){return <main className="mx-auto min-h-[65vh] max-w-7xl px-5 py-16 lg:px-8"><p className="text-sm font-bold uppercase tracking-widest text-[#b5ff67]">Catálogo</p><h1 className="mb-4 mt-3 text-4xl font-black">Descubre nuestras ideas</h1><p className="mb-10 text-white/60">Esta es una vista de prueba. Los productos aún no están a la venta.</p><ProductGrid/></main>}
