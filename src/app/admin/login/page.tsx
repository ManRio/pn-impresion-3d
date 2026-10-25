'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { LockKeyhole, LogIn } from 'lucide-react';

import { authClient } from '@/lib/auth-client';

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (result.error) {
        setError('Correo o contraseña incorrectos.');
        return;
      }

      router.replace('/admin');
      router.refresh();
    } catch {
      setError('No se ha podido conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className='min-h-screen bg-[#101319] px-4 py-16 text-white'>
      <div className='mx-auto w-full max-w-md'>
        <Link
          href='/'
          className='mb-8 inline-block text-sm text-neutral-400 hover:text-white'
        >
          ← Volver a la tienda
        </Link>

        <div className='rounded-2xl border border-white/10 bg-[#171d1b] p-8 shadow-2xl'>
          <div className='mb-8 flex flex-col items-center text-center'>
            <Image
              src='/LogoPN.png'
              alt='P&N Impresión 3D'
              width={110}
              height={110}
              className='mb-5 h-auto w-28 object-contain'
              priority
            />

            <LockKeyhole size={25} className='mb-3 text-[#B5FF67]' />

            <h1 className='font-display text-2xl font-extrabold'>
              PANEL DE ADMINISTRACIÓN
            </h1>

            <p className='mt-2 text-sm text-neutral-400'>
              Acceso exclusivo para administradores
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-5'>
            <div>
              <label htmlFor='email' className='mb-2 block text-sm font-medium'>
                Correo electrónico
              </label>

              <input
                id='email'
                type='email'
                required
                autoComplete='username'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full rounded-lg border border-white/15 bg-[#101319] px-4 py-3 text-white outline-none focus:border-[#B5FF67]'
                placeholder='admin@ejemplo.com'
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='mb-2 block text-sm font-medium'
              >
                Contraseña
              </label>

              <input
                id='password'
                type='password'
                required
                autoComplete='current-password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full rounded-lg border border-white/15 bg-[#101319] px-4 py-3 text-white outline-none focus:border-[#B5FF67]'
                placeholder='Tu contraseña'
              />
            </div>

            {error && (
              <p role='alert' className='text-sm text-red-400'>
                {error}
              </p>
            )}

            <button
              type='submit'
              disabled={loading}
              className='flex w-full items-center justify-center gap-2 rounded-lg bg-[#B5FF67] px-4 py-3 font-display font-bold text-[#101319] transition hover:bg-[#d1ff9a] disabled:opacity-60'
            >
              <LogIn size={19} />
              {loading ? 'Accediendo...' : 'INICIAR SESIÓN'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
