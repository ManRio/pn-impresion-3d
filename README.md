# P&N Impresión 3D

**Tienda online de productos impresos en 3D y encargos personalizados**, orientada inicialmente al mercado español.

> **Estado (2 de noviembre de 2026): MVP avanzado en desarrollo y pruebas locales.** Catálogo, administración, categorías y subcategorías, cuentas, presupuestos, carrito y registro/seguimiento de pedidos están implementados. Los campos SEO de producto se han incorporado, pero **la indexación, el rendimiento y la seguridad de producción siguen pendientes de auditoría**. El pago online, las reglas definitivas de envío y los requisitos legales/fiscales continúan pendientes. **La tienda aún no está preparada para un lanzamiento comercial abierto.**

## 1. Tecnologías

| Área                   | Tecnologías                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| Frontend y servidor    | Next.js 16 (App Router), React 19, TypeScript                     |
| Estilos                | Tailwind CSS 4, identidad P&N carbón/verde lima, Oxanium e Inter  |
| Base de datos          | PostgreSQL en Neon, Prisma 7, `@prisma/adapter-pg`                |
| Autenticación          | Better Auth, sesiones y plugin `admin`                            |
| Imágenes               | Cloudinary; Neon guarda referencias, ALT y posición de galería    |
| Referencias de modelos | MakerWorld (integración interna basada en endpoints no oficiales) |
| Impresión              | Bambu Lab A1 con AMS Lite; archivos técnicos de Bambu Studio      |

## 2. Funcionalidades implementadas

### Administración y catálogo (`/admin`)

- Acceso restringido a administradores con comprobación de rol en el servidor.
- Dashboard con accesos a productos, categorías, presupuestos, pedidos y herramientas internas.
- Crear, editar, publicar, despublicar, archivar y eliminar productos; eliminación múltiple con confirmación y comprobaciones de relaciones históricas.
- Modalidades de venta directa (`DIRECT`) y bajo presupuesto (`QUOTE`), variantes, materiales, colores, consumos y precios.
- Fotografías en Cloudinary: carga múltiple, galería, orden, imagen principal y textos alternativos. Los borrados remotos deben verificarse antes de eliminar registros.
- Distinción de diseños propios/personalizados y de terceros, con revisión de autorización comercial cuando proceda.
- Importación de información técnica `.gcode.3mf` de Bambu Studio para apoyar estimaciones.

### Categorías principales y subcategorías

- Modelo jerárquico `Category.parentId` y relación padre-hijo, conservando `Product.categoryId`.
- Importación realizada de **10 categorías principales y 60 subcategorías** desde el inventario facilitado por P&N.
- Formularios de alta y edición con selector de categoría principal y subcategoría.
- Filtros de tienda: elegir una categoría principal incluye sus subcategorías; elegir una subcategoría filtra sus productos.
- Se conservan las categorías anteriores hasta que se revisen o retiren de forma controlada.

### MakerWorld: exploración y biblioteca interna

- Exploración de modelos, consulta de referencias, biblioteca y operaciones de clasificación/selección.
- Conversión de diseños seleccionados a borradores, sin publicación automática.
- Registro de procedencia de referencias externas.

**Importante:** que un diseño aparezca en MakerWorld no implica permiso comercial. La integración utiliza endpoints no oficiales y puede cambiar o dejar de funcionar.

### Tienda pública

- Catálogo `/tienda` alimentado por productos publicados (`ACTIVE`) en Neon, con filtros de categorías/subcategorías.
- Página `/tienda/[slug]` con descripción, variantes, precios y galería ampliable.
- Los productos retirados o archivados no aparecen en la tienda.
- Lectura pública de productos activos en `/api/productos`.

### Campos SEO y contenido comercial

- Campos por producto para **descripción corta, título SEO, meta descripción, términos de búsqueda internos, título social, descripción social e imagen social**.
- Preparación del catálogo de **30 fichas** identificadas a partir de la información facilitada por P&N, con Excel/JSON e importador de borradores. **No se declara la importación como ejecutada hasta verificarla en Neon.**
- Debe verificarse en el entorno local la salida efectiva de `generateMetadata`, los enlaces canónicos, Open Graph y los metadatos por producto antes de publicar.
- Pendientes `sitemap.xml`, `robots.txt`, datos estructurados de producto, optimización de imágenes, auditoría móvil y revisión editorial final.
- Se mantiene `noindex` durante el desarrollo para evitar la indexación prematura.

### Clientes, acceso y presupuestos

- Registro e inicio de sesión con Better Auth; redirección al panel admin o al perfil del cliente según rol.
- Perfil del cliente con contacto y direcciones.
- Solicitudes en `/presupuesto` e historial privado en `/mi-cuenta/mis-presupuestos`.
- Gestión administrativa con estado, referencia, importe, piezas, plazo, constancia manual de envío y notas internas con autor y fecha; las notas internas no se exponen al cliente.

### Carrito y pedidos — sin pago online integrado

- Productos `DIRECT` añadibles por variante y cantidad, con notas del comprador.
- Cabecera con iconos de carrito/cuenta, contador, vista rápida y acceso a perfil, pedidos y presupuestos.
- Carrito separado por cuenta mediante `localStorage` **en el mismo navegador**; no se sincroniza entre dispositivos ni persiste en Neon.
- Registro de pedidos con recálculo de precios en el servidor y conservación de líneas históricas.
- Historial privado `/mi-cuenta/mis-pedidos`.
- Administración `/admin/pedidos`: **Recibido, En fabricación, Terminado, Enviado**, transportista, seguimiento y notas internas.

**Atención:** crear un pedido no significa haber cobrado. Antes de vender deben cerrarse el sistema de pago, tarifas de envío, impuestos, importes definitivos, condiciones de compra y comunicaciones al cliente.

## 3. Requisitos de desarrollo

- Node.js 24 y npm; VS Code o equivalente.
- Base de datos de desarrollo en Neon.
- Better Auth y Cloudinary configurados en variables de entorno.

## 4. Instalación local

```powershell
git clone https://github.com/ManRio/pn-impresion-3d.git
cd pn-impresion-3d
npm install
```

Preparar `.env` localmente (desde `.env.example` si existe):

```dotenv
DATABASE_URL="postgresql://...conexion-pooled..."
DATABASE_URL_UNPOOLED="postgresql://...conexion-directa..."
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="...secreto-aleatorio..."
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

**Nunca versionar `.env`, tokens, contraseñas, imágenes privadas ni archivos con datos personales.** Revisar scripts de importación y archivos de datos antes de incorporarlos al repositorio.

Aplicar migraciones versionadas y generar Prisma Client:

```powershell
npx prisma validate
npx prisma migrate deploy
npx prisma generate
npm run dev
```

Usar `prisma migrate dev` solo al **crear** nuevas migraciones en desarrollo. No ejecutar `migrate reset` contra Neon con datos que deban conservarse.

## 5. Comprobaciones de calidad

```powershell
npx prisma validate
npx tsc --noEmit
npm run lint
npm run build
npx prisma migrate status
```

**Última validación comunicada (2 de noviembre de 2026):** Prisma válido, TypeScript sin errores, lint con **0 errores y 4 advertencias** de uso de `<img>`, compilación de Next.js completada. No sustituye una auditoría de producción ni pruebas E2E.

## 6. Rutas principales

| Ruta                                                                          | Finalidad                                      |
| ----------------------------------------------------------------------------- | ---------------------------------------------- |
| `/`                                                                           | Landing pública                                |
| `/tienda`, `/tienda/[slug]`                                                   | Catálogo y fichas                              |
| `/personalizados`, `/presupuesto`, `/contacto`                                | Encargos, solicitud de presupuesto y contacto  |
| `/carrito`                                                                    | Carrito y registro inicial del pedido          |
| `/mi-cuenta/acceso`, `/mi-cuenta`                                             | Acceso y perfil                                |
| `/mi-cuenta/mis-presupuestos`, `/mi-cuenta/mis-pedidos`                       | Historiales privados                           |
| `/admin/login`, `/admin`                                                      | Acceso y dashboard administrativo              |
| `/admin/productos`, `/admin/productos/nuevo`, `/admin/productos/[id]`         | Gestión de catálogo                            |
| `/admin/categorias`                                                           | Categorías y subcategorías                     |
| `/admin/presupuestos`, `/admin/pedidos`                                       | Gestión de solicitudes y pedidos               |
| `/admin/importar`, `/admin/explorar`, `/admin/biblioteca`, `/admin/impresion` | Herramientas internas                          |
| `/api/auth/[...all]`, `/api/productos`, `/api/cart-preview`                   | Endpoints de autenticación, catálogo y carrito |

## 7. Datos y reglas comerciales

- **Catálogo:** `Category`, `Product`, `ProductImage`, `ProductVariant`, `PricingConfig`.
- **Presupuestos:** `QuoteRequest`, `QuoteInternalNote`.
- **Pedidos:** `Order`, `OrderItem`, `OrderHistory`.
- **Usuarios:** `User`, `Session`, `Account`, `Verification`, `CustomerProfile`.
- **Biblioteca:** `SavedDesign`.

Estados de producto: `DRAFT`, `ACTIVE`, `ARCHIVED`. Modalidades: `DIRECT`, `QUOTE`.

Precio orientativo inicial de referencia: **0,10–0,12 €/g**; el precio definitivo requiere revisión de costes, embalaje, impuestos, envío y márgenes. No inventar datos técnicos de variantes para habilitar una importación; deben ser confirmados antes de publicar.

## 8. Seguridad y despliegue

- Comprobar autorizaciones de servidor en todas las rutas administrativas, APIs y Server Actions; verificar aislamiento entre cuentas de cliente.
- Validar datos recibidos por el servidor, límites de peticiones, tamaños/formato de archivos y protección del almacenamiento de STL/3MF.
- Revisar sesiones, cookies, roles, dependencias, secretos, cabeceras HTTP, backups y recuperación ante fallos.
- Neon y Cloudinary no comparten una transacción: pueden requerirse medidas de compensación ante operaciones parciales.
- Mantener `noindex` hasta el lanzamiento y habilitar indexación solo después de validar contenido, privacidad y SEO.
- Antes de la apertura comercial, revisar identidad del vendedor, avisos legales, RGPD, privacidad, cookies cuando corresponda, condiciones de venta, desistimiento/excepciones y obligaciones fiscales con asesoramiento profesional.

### Advertencia de desarrollo: VS Code Dev Tunnels

Un túnel del puerto 3000 puede introducir una cabecera `x-forwarded-host` diferente del `origin` local y provocar `Invalid Server Actions request` en presupuestos o pedidos. Para desarrollo local, desactivar ese reenvío y reiniciar Next.js; no desactivar la protección de origen de manera general.

## 9. Prioridades para el lanzamiento

1. **Seguridad y funcionalidad:** auditoría de permisos, rutas, sesiones, ficheros y pruebas del recorrido cliente-administrador.
2. **Catálogo real:** revisar e importar los 30 borradores previstos, añadir fotografías, variantes confirmadas y textos finales.
3. **Venta real:** definir método de cobro o validación manual, importes definitivos, costes de envío, impuestos y comunicaciones.
4. **SEO y velocidad:** optimizar imágenes y consultas, medir Lighthouse/Core Web Vitals, confirmar metadatos, canónicas, sitemap, robots y datos estructurados.
5. **Landing y UX:** portada orientada a categorías, productos reales, confianza y conversión en móvil.
6. **Despliegue:** dominio, HTTPS, variables de producción, backups, información legal, pruebas finales e indexación controlada.

**Objetivo:** publicar primero una versión útil, segura y coherente comercialmente; dejar para más adelante extras como reseñas, cupones o sincronización del carrito entre dispositivos, si no bloquean el negocio.

## 10. Flujo de trabajo con Git

1. Revisar `git status` y los archivos nuevos, especialmente `scripts/`, `data/`, copias `.bak` y archivos no reconocidos.
2. Actualizar `README.md` **antes de ejecutar `git add`**.
3. Ejecutar validaciones técnicas y revisar los cambios (`git diff --check`).
4. Añadir exclusivamente archivos necesarios y comprobar el staging (`git diff --cached --check`, `git diff --cached --stat`).
5. Confirmar y subir a `main` únicamente cuando esté claro qué incluye el commit.

**Repositorio:** https://github.com/ManRio/pn-impresion-3d
