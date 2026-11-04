import { betterAuth } from 'better-auth';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { admin } from 'better-auth/plugins';

import { prisma } from '@/lib/prisma';

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
