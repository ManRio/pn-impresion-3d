import Image from 'next/image';
import Link from 'next/link';

const trabajos = [
  {
    src: '/images/proyectos/nacimiento-impresion-3d.webp',
    title: 'Nacimiento impreso en 3D',
    alt: 'Figura del Nacimiento con tres personajes sobre una base circular, fotografiada junto a una impresora 3D',
    description: 'Detalle de una figura decorativa recién fabricada.',
  },
  {
    src: '/images/proyectos/busto-religioso-impresion-3d.webp',
    title: 'Busto decorativo en 3D',
    alt: 'Busto religioso impreso en 3D, visto de perfil, con acabado blanco y rosa y textura visible',
    description: 'Primer plano del relieve y de los detalles de impresión.',
  },
  {
    src: '/images/proyectos/figura-religiosa-acabado-metalizado-3d.webp',
    title: 'Figura con acabado metalizado',
    alt: 'Figura religiosa con corona de rayos y acabado de apariencia bronce, fabricada mediante impresión 3D',
    description: 'Pieza decorativa con acabado de apariencia metálica.',
  },
  {
    src: '/images/proyectos/impresora-bambu-lab-a1-taller.webp',
    title: 'Nuestro equipo de impresión',
    alt: 'Impresora Bambu Lab A1 con AMS Lite y bobinas de filamento en el espacio de trabajo',
    description: 'Vista del equipo utilizado para fabricar nuestras piezas.',
  },
  {
    src: '/images/proyectos/busto-policromado-impreso-3d.webp',
    title: 'Busto con acabado pintado',
    alt: 'Busto religioso impreso en 3D y pintado, mostrado de perfil, con detalles de cabello y rostro',
    description: 'Ejemplo de acabado pintado sobre una pieza impresa.',
  },
];

export default function TrabajosRealesSevilla() {
  return (
    <section aria-labelledby="trabajos-reales-title" className="border-y border-white/10 bg-[#101610] px-5 py-16 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#B5FF67]">
          Trabajos reales
        </p>
        <h2 id="trabajos-reales-title" className="mt-3 font-display text-3xl font-extrabold text-white sm:text-4xl">
          Así toman forma nuestros proyectos en 3D
        </h2>
        <p className="mt-5 max-w-3xl leading-8 text-neutral-300">
          Estas son fotografías originales de piezas fabricadas y de nuestro equipo de trabajo.
          Mostramos ejemplos reales de detalles, acabados y del proceso de fabricación
          desde Castilblanco de los Arroyos, Sevilla.
        </p>

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trabajos.map((trabajo) => (
            <figure key={trabajo.src} className="overflow-hidden rounded-2xl border border-white/10 bg-[#171c17]">
              <div className="relative aspect-[4/5] bg-[#222922]">
                <Image
                  src={trabajo.src}
                  alt={trabajo.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain"
                  loading="lazy"
                />
              </div>
              <figcaption className="p-5">
                <h3 className="font-display text-lg font-bold text-white">{trabajo.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-300">{trabajo.description}</p>
              </figcaption>
            </figure>
          ))}
          <figure className="overflow-hidden rounded-2xl border border-white/10 bg-[#171c17]">
            <video
              className="aspect-[4/5] w-full bg-[#222922] object-contain"
              controls
              playsInline
              preload="none"
              poster="/images/proyectos/proceso-impresion-multicolor-portada.webp"
              aria-label="Vídeo de una pieza multicolor durante el proceso de impresión 3D"
            >
              <source src="/videos/proyectos/proceso-impresion-multicolor.mp4" type="video/mp4" />
              Tu navegador no admite reproducción de vídeo HTML5.
            </video>
            <figcaption className="p-5">
              <h3 className="font-display text-lg font-bold text-white">Impresión multicolor en proceso</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-300">
                Grabación real de la impresora trabajando con varios colores.
              </p>
            </figcaption>
          </figure>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/presupuesto"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#B5FF67] px-6 py-3 font-bold text-[#101319] hover:bg-[#d2ffab]"
          >
            Cuéntanos tu proyecto
          </Link>
          <Link
            href="/tienda"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 px-6 py-3 font-bold text-white hover:border-[#B5FF67]"
          >
            Explorar la tienda
          </Link>
        </div>
      </div>
    </section>
  );
}
