
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from 'lucide-react';

export type FeaturedSlide = {
  id: string;
  name: string;
  slug: string;
  category: string;
  imageUrl: string;
  imageAlt: string;
};

type Props = {
  products: FeaturedSlide[];
};

export default function FeaturedProductSlider({
  products,
}: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    const media = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );

    const update = () => setReduceMotion(media.matches);
    update();

    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (
      products.length < 2 ||
      paused ||
      interacting ||
      reduceMotion
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setCurrent((index) => (index + 1) % products.length);
      }
    }, 5000);

    return () => window.clearInterval(interval);
  }, [products.length, paused, interacting, reduceMotion]);

  if (!products.length) return null;

  const active = products[current] ?? products[0];

  const previous = () => {
    setCurrent((index) =>
      (index - 1 + products.length) % products.length,
    );
  };

  const next = () => {
    setCurrent((index) => (index + 1) % products.length);
  };

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Productos destacados de P&N"
      className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#1a241b] shadow-2xl shadow-black/40"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setInteracting(false);
        }
      }}
    >
      <div
        className="relative aspect-5/5 overflow-hidden bg-[#253027]"
        aria-live="off"
      >
        <Image
          key={active.id}
          src={active.imageUrl}
          alt={active.imageAlt || active.name}
          fill
          priority={current === 0}
          loading={current === 0 ? 'eager' : 'lazy'}
          sizes="(max-width: 1024px) 90vw, 520px"
          className="object-cover"
        />

        {products.length > 1 && (
          <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
            <span className="rounded-full bg-[#101319]/85 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
              {current + 1} / {products.length}
            </span>

            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-label={
                paused
                  ? 'Reanudar reproducción automática'
                  : 'Pausar reproducción automática'
              }
              aria-pressed={paused}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-[#101319]/85 text-white backdrop-blur-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B5FF67]"
            >
              {paused || reduceMotion ? (
                <Play size={18} aria-hidden="true" />
              ) : (
                <Pause size={18} aria-hidden="true" />
              )}
            </button>
          </div>
        )}

        {products.length > 1 && (
          <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between">
            <button
              type="button"
              onClick={previous}
              aria-label="Ver producto anterior"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-[#101319]/85 text-white backdrop-blur-md hover:bg-[#B5FF67] hover:text-[#101319] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B5FF67]"
            >
              <ChevronLeft aria-hidden="true" size={22} />
            </button>

            <button
              type="button"
              onClick={next}
              aria-label="Ver producto siguiente"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-[#101319]/85 text-white backdrop-blur-md hover:bg-[#B5FF67] hover:text-[#101319] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B5FF67]"
            >
              <ChevronRight aria-hidden="true" size={22} />
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 bg-[#172018] p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-[#B5FF67]">
              {active.category}
            </p>

            <h2 className="mt-1 truncate text-base font-bold text-white">
              {active.name}
            </h2>
          </div>

          <Link
            href={`/tienda/${encodeURIComponent(active.slug)}`}
            aria-label={`Ver producto: ${active.name}`}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#B5FF67] text-[#101319] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>

        {products.length > 1 && (
          <div
            className="mt-5 flex items-center justify-center gap-2"
            aria-label="Seleccionar producto destacado"
          >
            {products.map((product, index) => (
              <button
                key={product.id}
                type="button"
                onClick={() => setCurrent(index)}
                aria-label={`Mostrar producto ${index + 1}: ${product.name}`}
                aria-current={index === current ? 'true' : undefined}
                className={`flex h-11 min-w-11 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B5FF67]`}
              >
                <span
                  aria-hidden="true"
                  className={`block h-2 rounded-full transition-[width,background-color] motion-reduce:transition-none ${
                    current === index
                      ? 'w-7 bg-[#B5FF67]'
                      : 'w-2 bg-white/35'
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
