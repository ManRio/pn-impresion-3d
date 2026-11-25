'use client';

export default function ManageCookiesButton() {
  return <button type='button' onClick={() => window.dispatchEvent(new Event('pn3d:open-cookie-settings'))} className='rounded-sm text-left underline-offset-4 hover:text-[#B5FF67] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B5FF67]'>Configurar cookies</button>;
}
