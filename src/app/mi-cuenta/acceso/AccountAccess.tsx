'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import { authClient } from '@/lib/auth-client';
import PrivacyNotice from '@/components/legal/PrivacyNotice';

export default function AccountAccess() {
  const router = useRouter();

  const [signup, setSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const longEnough = password.length >= 12;
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const inputClass =
    'w-full rounded-xl border border-white/15 bg-[#101319] px-4 py-3.5 text-white outline-none transition focus:border-[#B5FF67] focus:ring-2 focus:ring-[#B5FF67]/10';

  function switchMode() {
    setSignup((current) => !current);
    setError('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmation(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) return;

    setError('');

    if (signup) {
      if (name.trim().length < 2) {
        setError('Indica tu nombre.');
        return;
      }

      if (!longEnough) {
        setError('La contraseña debe tener al menos 12 caracteres.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
    }

    setBusy(true);

    try {
      const result = signup
        ? await authClient.signUp.email({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
          })
        : await authClient.signIn.email({
            email: email.trim().toLowerCase(),
            password,
          });

      if (result.error) {
        setError(
          signup
            ? 'No se pudo completar el registro. Revisa los datos o inténtalo más tarde.'
            : 'No se pudo iniciar sesión. Revisa tus credenciales o inténtalo más tarde.',
        );
        return;
      }

      const sessionResult = await authClient.getSession();

      if (!sessionResult.data?.user) {
        setError(
          'Cuenta creada o solicitud recibida. Si se requiere verificación por correo, revisa tu bandeja de entrada.',
        );
        return;
      }

      const role = sessionResult.data.user.role;

      router.replace(role === 'admin' ? '/admin' : '/mi-cuenta');
      router.refresh();
    } catch {
      setError('No se pudo conectar. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className='mt-7 overflow-hidden rounded-2xl border border-white/10 bg-[#1a211e] shadow-2xl shadow-black/20'>
      <div className='border-b border-white/10 bg-[#B5FF67]/5 px-6 py-5'>
        <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[#B5FF67]/25 bg-[#B5FF67]/10 text-[#B5FF67]'>
          {signup ? <UserRound size={23} /> : <LockKeyhole size={23} />}
        </div>

        <h2 className='text-xl font-bold text-white'>
          {signup ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}
        </h2>

        <p className='mt-2 text-sm leading-6 text-neutral-400'>
          {signup
            ? 'Guarda tus datos y consulta tus pedidos y presupuestos desde un mismo lugar.'
            : 'Accede a tu perfil para consultar tus pedidos y encargos.'}
        </p>
      </div>

      <form onSubmit={submit} className='space-y-5 p-6'>
        {signup && (
          <div className='space-y-2'>
            <label htmlFor='register-name' className='text-sm font-semibold'>
              Nombre
            </label>

            <input
              id='register-name'
              type='text'
              name='name'
              autoComplete='name'
              required
              minLength={2}
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder='Tu nombre'
              className={inputClass}
            />
          </div>
        )}

        <div className='space-y-2'>
          <label htmlFor='account-email' className='text-sm font-semibold'>
            Correo electrónico
          </label>

          <input
            id='account-email'
            type='email'
            name='email'
            autoComplete='email'
            required
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder='nombre@ejemplo.com'
            className={inputClass}
          />
        </div>

        <div className='space-y-2'>
          <label htmlFor='account-password' className='text-sm font-semibold'>
            Contraseña
          </label>

          <div className='relative'>
            <input
              id='account-password'
              type={showPassword ? 'text' : 'password'}
              name='password'
              required
              minLength={signup ? 12 : undefined}
              maxLength={128}
              autoComplete={signup ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={signup ? 'Mínimo 12 caracteres' : 'Tu contraseña'}
              className={`${inputClass} pr-14`}
            />

            <button
              type='button'
              aria-label={
                showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
              }
              aria-pressed={showPassword}
              onClick={() => setShowPassword((current) => !current)}
              className='absolute inset-y-0 right-3 flex items-center px-2 text-neutral-400 hover:text-[#B5FF67]'
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>

          {signup && (
            <p
              className={`flex items-center gap-2 text-xs ${
                longEnough ? 'text-[#B5FF67]' : 'text-neutral-400'
              }`}
            >
              <Check size={14} />
              {longEnough
                ? 'Longitud mínima alcanzada'
                : 'Utiliza al menos 12 caracteres. Se recomienda una frase larga y única.'}
            </p>
          )}
        </div>

        {signup && (
          <div className='space-y-2'>
            <label htmlFor='confirm-password' className='text-sm font-semibold'>
              Repetir contraseña
            </label>

            <div className='relative'>
              <input
                id='confirm-password'
                type={showConfirmation ? 'text' : 'password'}
                name='confirmPassword'
                required
                minLength={12}
                maxLength={128}
                autoComplete='new-password'
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder='Repite tu contraseña'
                className={`${inputClass} pr-14`}
                aria-invalid={confirmPassword.length > 0 && !passwordsMatch}
              />

              <button
                type='button'
                aria-label={
                  showConfirmation
                    ? 'Ocultar confirmación'
                    : 'Mostrar confirmación'
                }
                aria-pressed={showConfirmation}
                onClick={() => setShowConfirmation((current) => !current)}
                className='absolute inset-y-0 right-3 flex items-center px-2 text-neutral-400 hover:text-[#B5FF67]'
              >
                {showConfirmation ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {confirmPassword && (
              <p
                className={`text-xs ${
                  passwordsMatch ? 'text-[#B5FF67]' : 'text-amber-300'
                }`}
              >
                {passwordsMatch
                  ? 'Las contraseñas coinciden.'
                  : 'Las contraseñas todavía no coinciden.'}
              </p>
            )}
          </div>
        )}

        {error && (
          <p
            role='alert'
            aria-live='polite'
            className='rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200'
          >
            {error}
          </p>
        )}

        <PrivacyNotice context='account' />

        <button
          type='submit'
          disabled={busy}
          className='flex w-full items-center justify-center gap-3 rounded-xl bg-[#B5FF67] px-5 py-3.5 font-bold text-[#101319] transition hover:bg-[#d0ff9c] disabled:cursor-not-allowed disabled:opacity-50'
        >
          {busy
            ? 'Procesando...'
            : signup
              ? 'Crear mi cuenta'
              : 'Iniciar sesión'}

          {!busy && <ArrowRight size={18} />}
        </button>

        <button
          type='button'
          disabled={busy}
          onClick={switchMode}
          className='w-full py-2 text-center text-sm text-[#B5FF67] hover:underline disabled:opacity-50'
        >
          {signup
            ? '¿Ya tienes una cuenta? Inicia sesión'
            : '¿Todavía no tienes cuenta? Regístrate'}
        </button>
      </form>

      <div className='flex items-center gap-3 border-t border-white/10 bg-[#101715] px-6 py-4 text-xs text-neutral-400'>
        <ShieldCheck size={20} className='shrink-0 text-[#B5FF67]' />
        Tus datos de acceso se gestionan mediante autenticación segura.
      </div>
    </div>
  );
}
