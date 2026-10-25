# P&N Impresión 3D

Ecommerce de impresión 3D en desarrollo. Catálogo mixto: productos de compra directa y encargos que requieren presupuesto. Destinado inicialmente a clientes en España.

> **Estado:** prototipo funcional con autenticación administrativa y base de datos. La tienda aún no procesa pedidos ni pagos; el catálogo público contiene contenido de demostración. No está lista para producción.

## Tecnologías

- Next.js 16, React 19, TypeScript y Tailwind CSS 4.
- Oxanium e Inter; identidad P&N en carbón y verde lima.
- PostgreSQL (Neon), Prisma 7 y adaptador `@prisma/adapter-pg`.
- Better Auth con plugin `admin` para sesiones y roles.

## Requisitos

- Node.js 24 LTS (en desarrollo se ha utilizado 24.22.1).
- npm y VS Code.
- Proyecto PostgreSQL de desarrollo en Neon.

## Configuración local

1. Clona el repositorio y abre la carpeta en VS Code.
2. Instala dependencias con `npm install`.
3. Crea `.env` a partir de `.env.example` (sin publicar credenciales):

   ```dotenv
   DATABASE_URL="postgresql://...conexion-pooled..."
   DATABASE_URL_UNPOOLED="postgresql://...conexion-directa..."
   BETTER_AUTH_URL="http://localhost:3000"
   BETTER_AUTH_SECRET="...secreto-aleatorio..."
   ```

4. Valida el esquema, aplica las migraciones _existentes_ a una base de desarrollo nueva y genera el cliente:

   ```powershell
   npx prisma validate
   npx prisma migrate deploy
   npx prisma generate
   ```

5. Inicia la aplicación con `npm run dev` y abre http://localhost:3000.

Nunca compartas `.env`, credenciales de Neon ni `BETTER_AUTH_SECRET`. Asegúrate de que `.env` está excluido en `.gitignore`.

## Comandos útiles

```powershell
npm run dev
npm run lint
npm run build
npx tsc --noEmit
npx prisma migrate status
npx prisma studio
```

## Rutas actuales

| Ruta                 | Estado                                        |
| -------------------- | --------------------------------------------- |
| `/`                  | Portada visual                                |
| `/tienda`            | Catálogo de demostración                      |
| `/personalizados`    | Página informativa                            |
| `/presupuesto`       | Página informativa; solicitudes pendientes    |
| `/contacto`          | Página informativa                            |
| `/admin/login`       | Inicio de sesión con Better Auth              |
| `/admin`             | Dashboard protegido por sesión y rol `admin`  |
| `/api/auth/[...all]` | Endpoints de Better Auth                      |
| `/api/productos`     | Lectura de productos publicados (requiere BD) |

## Modelo de datos

- **Catálogo:** `Category`, `Product`, `ProductImage`, `ProductVariant`, `PricingConfig`, `QuoteRequest`.
- **Autenticación:** `User`, `Session`, `Account`, `Verification`.
- **Migraciones:** archivos versionados en `prisma/migrations/` (actualmente 3 migraciones aplicadas en desarrollo).

## Reglas comerciales iniciales

- Impresora: Bambu Lab A1 con AMS Lite.
- Productos estándar y personalizados; ventas previstas en España.
- Precio orientativo: 0,10–0,12 €/g de material calculado con Bambu Studio, revisando tiempos, desperdicio, embalaje, impuestos, envío y márgenes antes de publicar el precio final.
- No se aceptan automáticamente modelos externos sin revisar derechos de uso comercial.

## Seguridad y limitaciones

- Acceso administrativo con Better Auth; rol `admin` verificado en el servidor.
- Registro público deshabilitado. No documentar ni automatizar credenciales en el repositorio.
- Las futuras operaciones de escritura deberán verificar permisos en servidor, validar datos y proteger los archivos subidos.
- La web permanece con `noindex` durante el desarrollo.
- **Pendiente para producción:** recuperación de acceso, controles antiabuso, revisión de autorización en cada endpoint, pagos, pedidos, documentación legal, tratamiento de datos y SEO definitivo.

## Próximos pasos

1. CRUD protegido de categorías.
2. Listado de productos reales desde Neon y alta/edición de productos.
3. Variantes, precios e imágenes.
4. Conexión del catálogo público a PostgreSQL.
5. Presupuestos, carrito, checkout, pagos y pedidos.
