'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

import { authClient } from '@/lib/auth-client';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      const result = await authClient.signOut();

      if (result.error) {
        throw new Error('No se pudo cerrar la sesión');
      }

      router.replace('/admin/login');
      router.refresh();
    } catch {
      alert('No se ha podido cerrar la sesión.');
      setLoading(false);
    }
  }

  return (
    <button
      type='button'
      onClick={handleLogout}
      disabled={loading}
      className='flex items-center gap-2 rounded-lg border border-white/15 px-4 py-3 text-sm text-white hover:border-[#B5FF67] disabled:opacity-60'
    >
      <LogOut size={18} />
      {loading ? 'Cerrando...' : 'Cerrar sesión'}
    </button>
  );
}
