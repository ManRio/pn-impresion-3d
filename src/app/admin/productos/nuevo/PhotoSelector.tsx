'use client';

import { useState } from 'react';
import { CheckCircle2, Images, Upload } from 'lucide-react';

export default function PhotoSelector() {
  const [files, setFiles] = useState<string[]>([]);

  return (
    <section className='space-y-4 rounded-xl border border-white/10 bg-[#1a211e] p-6'>
      <div>
        <h2 className='font-display text-xl font-bold'>
          FOTOGRAFÍAS (OPCIONAL)
        </h2>
        <p className='mt-2 text-xs text-neutral-400'>
          Hasta 8 fotografías. JPG, PNG o WebP, máximo 5 MB cada una.
        </p>
      </div>

      <label
        htmlFor='product-photos'
        className='inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#B5FF67] px-5 py-3 text-sm font-bold text-[#101319] transition hover:bg-[#d0ff9c]'
      >
        <Upload size={17} />
        Seleccionar fotografías
      </label>

      <input
        id='product-photos'
        type='file'
        name='photos'
        accept='image/jpeg,image/png,image/webp'
        multiple
        className='sr-only'
        onChange={(event) => {
          const selected = Array.from(event.target.files ?? []);
          setFiles(selected.map((file) => file.name));
        }}
      />

      {files.length > 0 ? (
        <div
          role='status'
          aria-live='polite'
          className='rounded-lg border border-[#B5FF67]/30 bg-[#B5FF67]/5 p-4'
        >
          <div className='mb-3 flex items-center gap-2 text-[#B5FF67]'>
            <CheckCircle2 size={18} />
            <span className='text-sm font-semibold'>
              {files.length} fotografía{files.length !== 1 ? 's' : ''}{' '}
              seleccionada
              {files.length !== 1 ? 's' : ''}
            </span>
          </div>

          <ul className='space-y-1 text-xs text-neutral-300'>
            {files.map((name, index) => (
              <li key={index} className='flex items-center gap-2'>
                <Images size={13} className='shrink-0 text-neutral-400' />
                <span className='break-all'>{name}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className='text-sm text-neutral-400'>
          Ninguna fotografía seleccionada.
        </p>
      )}

      <p className='text-xs text-neutral-400'>
        Las fotografías se subirán al guardar o publicar el producto. Podrás
        editar sus textos ALT después.
      </p>
    </section>
  );
}
