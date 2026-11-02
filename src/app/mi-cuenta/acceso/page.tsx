import AccountAccess from './AccountAccess';

export default function AccessPage() {
  return (
    <main className='mx-auto max-w-md px-5 py-16'>
      <h1 className='text-3xl font-bold'>Acceso de clientes</h1>

      <p className='mt-2 text-sm text-white/60'>
        Inicia sesión o crea tu cuenta para consultar tu perfil, tus pedidos y
        tus presupuestos.
      </p>

      <AccountAccess />
    </main>
  );
}
