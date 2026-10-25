# P&N Impresión 3D — Ecommerce en desarrollo

Tienda online de **P&N Impresión 3D** para productos impresos en 3D bajo demanda y encargos personalizados, con venta prevista en España.

> **Estado:** MVP en desarrollo. La interfaz muestra productos de demostración. La base PostgreSQL está creada en Neon y accesible desde Prisma Studio, pero el catálogo visual aún no consume los datos de la base. No hay pagos ni panel administrativo operativo. Se mantiene `noindex` durante el desarrollo.

## Stack tecnológico

- Next.js 16, React 19 y TypeScript.
- Tailwind CSS 4, estilos personalizados y Lucide React.
- Oxanium para títulos e Inter para textos.
- PostgreSQL en Neon, Prisma ORM 7 y `@prisma/adapter-pg`.

## Requisitos

- Node.js **24 LTS** (probado con `24.22.1`).
- npm y VS Code.
- Proyecto PostgreSQL en Neon para las funciones con datos.

## Instalación local

1. Clonar el repositorio, abrir la carpeta en VS Code y ejecutar:

   ```powershell
   npm install
   ```

2. Crear un archivo `.env` en la raíz siguiendo `.env.example`:

   ```dotenv
   DATABASE_URL="postgresql://...CONEXION_POOL..."
   DATABASE_URL_UNPOOLED="postgresql://...CONEXION_DIRECTA..."
   ```

   Utilizar las URL reales proporcionadas por Neon. `DATABASE_URL` corresponde a la conexión con _pooling_ para la aplicación; `DATABASE_URL_UNPOOLED` es la conexión directa usada en `prisma.config.ts` para migraciones. **Nunca publicar credenciales ni el archivo `.env`.**

3. Validar el esquema y generar el cliente Prisma:

   ```powershell
   npx prisma validate
   npx prisma generate
   ```

4. En una base de datos de desarrollo **nueva**, aplicar las migraciones versionadas:

   ```powershell
   npx prisma migrate deploy
   ```

5. Iniciar la web con `npm run dev` y abrir http://localhost:3000.

## Comandos útiles

```powershell
npm run dev        # Servidor local
npm run lint       # Análisis ESLint
npm run build      # Compilación de producción
npx prisma studio  # Consultar tablas en una interfaz visual
```

ESLint 9.39.5 se mantiene temporalmente por compatibilidad de plugins. Su migración a una versión mantenida está pendiente.

## Páginas y funciones actuales

| Ruta              | Estado                                                                          |
| ----------------- | ------------------------------------------------------------------------------- |
| `/`               | Portada visual responsive                                                       |
| `/tienda`         | Catálogo ficticio de demostración                                               |
| `/personalizados` | Página informativa                                                              |
| `/presupuesto`    | Página informativa; solicitud funcional pendiente                               |
| `/contacto`       | Página informativa; formulario funcional pendiente                              |
| `/api/productos`  | Endpoint de lectura preparado para productos publicados; requiere conexión a BD |

## Base de datos

El esquema `prisma/schema.prisma` contiene los modelos `Category`, `Product`, `ProductImage`, `ProductVariant`, `PricingConfig` y `QuoteRequest`.

Las migraciones se guardan en `prisma/migrations/` y deben incluirse en Git. La base Neon actual ya está sincronizada y las tablas de negocio están vacías hasta incorporar productos reales.

## Reglas comerciales previstas

- Bambu Lab A1 con AMS Lite.
- Catálogo mixto: compra directa y encargos sujetos a presupuesto.
- Tarifa orientativa configurable de **0,10–0,12 €/gramo**; revisar complejidad, desperdicio, empaquetado, impuestos y envío antes de publicar cada precio.
- Fabricación bajo demanda y ámbito de venta inicial en España.

## Identidad visual

Paleta carbón y verde lima (`#B5FF67`), logotipo de P&N, favicon `LogoPN.png` y tipografías Oxanium e Inter. Diseño y catálogo visual todavía sujetos a mejoras.

## Próximos hitos

1. Autenticación y autorización del administrador.
2. CRUD de categorías, productos, variantes y precios, con subida segura de imágenes.
3. Catálogo conectado a PostgreSQL con fotografías y precios reales.
4. Solicitudes de presupuesto y almacenamiento seguro de archivos STL/3MF.
5. Carrito, pagos, pedidos, notificaciones y envíos.
6. Revisión legal, fiscal, SEO y activación de indexación en el lanzamiento.

## Seguridad

- No subir `.env`, `.env.local`, contraseñas ni archivos privados de clientes.
- Revisar `.gitignore`, `git status` y `git diff --cached --check` antes de cada commit.
- No exponer endpoints de escritura ni paneles de administración sin autenticación.
- Este repositorio **no es todavía una tienda lista para producción**.
