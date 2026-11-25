'use client';

/* eslint-disable prefer-rest-params -- Google Consent Mode utiliza el objeto arguments. */

import Link from 'next/link';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'pn3d-google-consent-v1';
const TAG_ID = 'GTM-KZZJ26DZ';
export const CONSENT_EVENT = 'pn3d:consent-changed';
export const SETTINGS_EVENT = 'pn3d:open-cookie-settings';

type Consent = { analytics: boolean; ads: boolean };

declare global {
  interface Window {
    dataLayer?: unknown[];
    pn3dGoogleConsent?: Consent;
  }
}

function readConsent(): Consent | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const obj: unknown = JSON.parse(raw);
    if (!obj || typeof obj !== 'object' || !('analytics' in obj) || !('ads' in obj)) return null;
    const c = obj as Record<string, unknown>;
    if (typeof c.analytics !== 'boolean' || typeof c.ads !== 'boolean') return null;
    return { analytics: c.analytics, ads: c.ads };
  } catch { return null; }
}

function googleConsent(action: 'default' | 'update', c: Consent) {
  window.dataLayer ??= [];
  window.dataLayer.push(((function () { return arguments; }) as (...args: unknown[]) => IArguments)('consent', action, {
    analytics_storage: c.analytics ? 'granted' : 'denied',
    ad_storage: c.ads ? 'granted' : 'denied',
    ad_user_data: c.ads ? 'granted' : 'denied',
    ad_personalization: c.ads ? 'granted' : 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
  }));
}

function syncGoogle(c: Consent) {
  const wasLoaded = Boolean(document.getElementById('pn3d-google-tag'));
  window.pn3dGoogleConsent = c;
  googleConsent('update', c);
  window.dispatchEvent(new Event(CONSENT_EVENT));
  if ((!c.analytics && !c.ads) || wasLoaded) return;
  // Consent Mode básico: no cargamos la etiqueta hasta recibir consentimiento.
  window.dataLayer ??= [];
  window.dataLayer.unshift(((function () { return arguments; }) as (...args: unknown[]) => IArguments)('consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied',
    security_storage: 'granted',
  }));
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const script = document.createElement('script');
  script.id = 'pn3d-google-tag';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${TAG_ID}`;
  document.head.appendChild(script);
}

export default function ConsentManager() {
  const [choice, setChoice] = useState<Consent | null | undefined>(undefined);
  const [settings, setSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [ads, setAds] = useState(false);

  useEffect(() => {
    const saved = readConsent();
    // La actualización sucede después del primer render del cliente.
    queueMicrotask(() => setChoice(saved));
    if (saved) syncGoogle(saved);
    const open = () => {
      const c = readConsent();
      setAnalytics(c?.analytics ?? false);
      setAds(c?.ads ?? false);
      setSettings(true);
    };
    window.addEventListener(SETTINGS_EVENT, open);
    return () => window.removeEventListener(SETTINGS_EVENT, open);
  }, []);

  function save(c: Consent) {
    const prev = readConsent();
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch {
      // Si el almacenamiento está bloqueado, se conserva la elección en memoria.
    }
    setChoice(c);
    setSettings(false);
    if (prev && (prev.analytics || prev.ads) && !c.analytics && !c.ads) {
      // Garantiza que no permanezca el contenedor ya cargado tras revocar permisos.
      window.location.reload();
      return;
    }
    syncGoogle(c);
  }

  if (choice === undefined || (choice !== null && !settings)) return null;
  const actionClass = 'rounded-lg px-4 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B5FF67]';
  return (
    <div className='fixed inset-x-0 bottom-0 z-[200] max-h-[90dvh] overflow-y-auto border-t border-white/20 bg-[#142019] p-5 text-white shadow-2xl' role='dialog' aria-modal='true' aria-label='Preferencias de cookies'>
      <div className='mx-auto max-w-4xl'>
        <h2 className='font-display text-xl font-bold'>Tu privacidad en P&N Impresión 3D</h2>
        <p className='mt-2 text-sm leading-6 text-neutral-200'>Utilizamos almacenamiento técnico para el carrito y la sesión. Con tu autorización también podemos medir visitas y compras mediante etiquetas de Google y, por separado, medir la eficacia de nuestros productos en Google. Puedes rechazar ambas opciones y seguir comprando. <Link href='/cookies' className='text-[#B5FF67] underline'>Política de cookies</Link>.</p>
        {settings && (
          <fieldset className='mt-4 space-y-3 rounded-xl border border-white/20 p-4'>
            <legend className='px-1 font-semibold'>Configurar consentimiento</legend>
            <p className='text-xs text-neutral-300'>Necesarias: siempre activas (sesión y carrito).</p>
            <label className='flex items-center gap-3 text-sm'><input type='checkbox' checked={analytics} onChange={e => setAnalytics(e.target.checked)} /> Analítica de Google (GA4 y medición de compras)</label>
            <label className='flex items-center gap-3 text-sm'><input type='checkbox' checked={ads} onChange={e => setAds(e.target.checked)} /> Publicidad y medición de productos en Google</label>
          </fieldset>
        )}
        <div className='mt-5 flex flex-wrap gap-3'>
          <button type='button' className={`${actionClass} border border-white/50`} onClick={() => save({ analytics: false, ads: false })}>Rechazar opcionales</button>
          {settings ? (
            <button type='button' className={`${actionClass} bg-[#B5FF67] text-black`} onClick={() => save({ analytics, ads })}>Guardar preferencias</button>
          ) : (
            <button type='button' className={`${actionClass} border border-white/50`} onClick={() => setSettings(true)}>Configurar</button>
          )}
          <button type='button' className={`${actionClass} bg-[#B5FF67] text-black`} onClick={() => save({ analytics: true, ads: true })}>Aceptar todas</button>
        </div>
      </div>
    </div>
  );
}
