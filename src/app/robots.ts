import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/', '/api/', '/mi-cuenta/', '/carrito', '/pago/',
        '/presupuesto/confirmacion',
      ],
    }],
    sitemap: 'https://pn3d.es/sitemap.xml',
    host: 'https://pn3d.es',
  };
}
