'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
export default function AccountAccess() {
  const router = useRouter();
  const [signup, setSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = signup
        ? await authClient.signUp.email({ name, email, password })
        : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message ?? 'No se pudo acceder.');
        return;
      }
      const sessionResult = await authClient.getSession();

      const role = sessionResult.data?.user?.role;

      if (role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/mi-cuenta');
      }

      router.refresh();
    } catch {
      setError('No se pudo conectar. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  }
  const css =
    'mt-1 w-full rounded-lg border border-white/20 bg-[#101319] p-3 text-white';
  return (
    <form
      onSubmit={submit}
      className='mt-6 space-y-4 rounded-xl border border-white/10 bg-[#1a211e] p-6'
    >
      {signup && (
        <label className='block text-sm'>
          Nombre
          <input
            className={css}
            required
            minLength={2}
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
      )}
      <label className='block text-sm'>
        Email
        <input
          type='email'
          autoComplete='email'
          required
          className={css}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className='block text-sm'>
        Contraseña
        <input
          type='password'
          required
          minLength={signup ? 8 : undefined}
          autoComplete={signup ? 'new-password' : 'current-password'}
          className={css}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error && (
        <p role='alert' className='text-sm text-red-300'>
          {error}
        </p>
      )}
      <button
        disabled={busy}
        className='w-full rounded-lg bg-[#B5FF67] px-4 py-3 font-bold text-[#101319] disabled:opacity-50'
      >
        {busy ? 'Procesando...' : signup ? 'Crear cuenta' : 'Iniciar sesión'}
      </button>
      <button
        type='button'
        onClick={() => {
          setSignup((v) => !v);
          setError('');
        }}
        className='w-full text-sm text-[#B5FF67]'
      >
        {signup ? 'Ya tengo cuenta' : 'Crear una cuenta'}
      </button>
    </form>
  );
}
