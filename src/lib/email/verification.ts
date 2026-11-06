import 'server-only';

/** Envío transaccional para Better Auth. No registrar jamás la URL/token. */
export async function sendAccountVerificationEmail(to: string, url: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey?.startsWith('re_') || !from) {
    throw new Error('La verificación de correo necesita RESEND_API_KEY y EMAIL_FROM.');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: process.env.EMAIL_REPLY_TO || 'info@pn3d.es',
      subject: 'Verifica tu correo | P&N Impresión 3D',
      text: `Confirma tu correo electrónico para acceder a P&N Impresión 3D. Enlace válido durante una hora:\n\n${url}\n\nSi no solicitaste una cuenta, ignora este mensaje.`,
    }),
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) {
    console.error('Resend rechazó correo de verificación', response.status);
    throw new Error('No se pudo enviar el correo de verificación.');
  }
}
