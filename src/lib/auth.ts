import { betterAuth } from 'better-auth';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { admin } from 'better-auth/plugins';

import { prisma } from '@/lib/prisma';
import { sendAccountVerificationEmail } from '@/lib/email/verification';

export const auth = betterAuth({
  appName: 'P&N Impresión 3D',

  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    expiresIn: 3600,
    sendVerificationEmail: async ({ user, url }) => {
      await sendAccountVerificationEmail(user.email, url);
    },
  },

  // Protección básica para las rutas de autenticación.
  // Para producción configuraremos almacenamiento compartido.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 30,
  },

  plugins: [
    admin({
      defaultRole: 'user',
      adminRoles: ['admin'],
    }),
  ],
});
