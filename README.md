# P&N Impresión 3D

**Tienda online de productos impresos en 3D y encargos personalizados**, orientada inicialmente al mercado español.

> **Estado (octubre de 2026): MVP en desarrollo.** El administrador de productos y el catálogo público están operativos y probados en entorno de desarrollo. **Todavía no hay carrito, gestión de pedidos, checkout ni cobros integrados**, y la solicitud de presupuestos sigue pendiente de implementación. **No está lista para recibir compras reales ni para lanzamiento público.**

## 1. Tecnologías

| Área                  | Tecnologías                                                                     |
| --------------------- | ------------------------------------------------------------------------------- |
| Frontend y servidor   | Next.js 16 (App Router), React 19, TypeScript                                   |
| Estilos               | Tailwind CSS 4, identidad P&N en carbón/verde lima, tipografías Oxanium e Inter |
| Base de datos         | PostgreSQL en Neon, Prisma 7, `@prisma/adapter-pg`                              |
| Autenticación         | Better Auth, sesiones y plugin `admin`                                          |
| Imágenes              | Cloudinary para archivos; Neon almacena URLs, ALT y orden de galería            |
| Modelos de referencia | Integración administrativa con MakerWorld (API no oficial; uso interno)         |
| Impresión             | Bambu Lab A1 con AMS Lite; referencias de Bambu Studio                          |

## 2. Funcionalidades implementadas

### Administración (`/admin`)

- Inicio de sesión y acceso restringido a usuarios con rol `admin`, con comprobación del lado del servidor.
- Dashboard con accesos a gestión y herramientas.
- Alta y gestión de categorías.
- Crear productos **como borrador o publicarlos directamente**; editar y guardar sus datos, variantes, materiales, colores y precios.
- Productos con modalidad de **venta directa** (`DIRECT`) o **bajo presupuesto** (`QUOTE`).
- Subida múltiple de fotografías a Cloudinary desde el formulario de nuevo producto; gestión posterior de galería, imagen principal y textos alternativos.
- Selección de archivos con indicador de cuántas fotografías se han elegido antes de enviar el formulario.
- Gestión de publicación: publicar, despublicar, archivar y eliminar definitivamente productos. El borrado exige confirmación y contempla la limpieza de imágenes en Cloudinary.
- Distinción entre **diseños propios/personalizados** y **diseños de terceros**: los propios no requieren declaración documental adicional; los importados o de terceros requieren revisar los permisos comerciales correspondientes.
- Importación de datos técnicos de archivos `.gcode.3mf` de Bambu Studio para apoyar el cálculo de precios y tiempos.

### MakerWorld: exploración y biblioteca interna

- Búsqueda y exploración de referencias desde el administrador.
- Consulta de modelos individuales, guardado en una biblioteca independiente y clasificación para revisión.
- Selección y operaciones masivas sobre diseños de la biblioteca.
- Conversión de selecciones a **productos borrador** sin publicarlos automáticamente.
- Conservación de la referencia y procedencia externa para su revisión.

**Importante:** la disponibilidad de un modelo en MakerWorld **no implica autorización para fabricar y vender sus impresiones**. La integración utiliza endpoints no oficiales y puede cambiar o dejar de funcionar; su uso está destinado a la investigación y gestión interna, no a reutilizar imágenes ajenas automáticamente en el escaparate.

### Tienda pública

- `/tienda` muestra **productos publicados (`ACTIVE`) cargados desde Neon**, en lugar de las antiguas tarjetas de demostración.
- Tarjetas con información real, categorías, fotografías y precios cuando están disponibles.
- Ficha individual en `/tienda/[slug]` con descripción, variantes, materiales, colores y galería.
- Galería con ampliación de fotografías en un modal, sin abandonar la ficha del producto.
- Los productos retirados o archivados dejan de formar parte del catálogo público.
- `/api/productos` ofrece una lectura de los productos activos.

## 3. Requisitos para trabajar en local

- Node.js 24 y npm (en desarrollo se ha utilizado Node 24.22.1).
- VS Code o editor equivalente.
- Base de datos PostgreSQL de desarrollo en Neon.
- Credenciales de Better Auth y Cloudinary configuradas localmente.

## 4. Instalación y configuración

Clonar y preparar el proyecto:

```powershell
git clone https://github.com/ManRio/pn-impresion-3d.git
cd pn-impresion-3d
npm install
```

Crear `.env` a partir de `.env.example` **si está disponible** y completar estas variables en el entorno local:

```dotenv
DATABASE_URL="postgresql://...conexion-pooled..."
DATABASE_URL_UNPOOLED="postgresql://...conexion-directa..."
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="...secreto-aleatorio..."

CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

Las comillas en los valores simples de Cloudinary son opcionales. **Nunca subas secretos a Git ni los incluyas en capturas o incidencias públicas.** Comprueba que `.env` y otros archivos locales de credenciales estén ignorados.

Para una base de datos nueva, aplicar las migraciones versionadas y generar el cliente de Prisma:

```powershell
npx prisma validate
npx prisma migrate deploy
npx prisma generate
```

> `migrate deploy` aplica las migraciones existentes. `migrate dev` se reserva para crear nuevas migraciones durante el desarrollo del esquema. Antes de aplicar cambios a una base con datos, revisar y respaldar la base.

Iniciar el proyecto:

```powershell
npm run dev
```

Abrir **http://localhost:3000**. El acceso a `/admin` requiere una cuenta con rol `admin` ya configurada; no existe registro público para obtener ese rol.

## 5. Comandos útiles

```powershell
npm run dev
npx tsc --noEmit
npm run lint
npm run build
npx prisma validate
npx prisma migrate status
npx prisma studio
```

En el desarrollo se han utilizado comprobaciones de TypeScript, ESLint y compilación de producción antes de integrar cambios. Algunas advertencias de `<img>` frente a `next/image` pueden seguir pendientes de optimización; una advertencia no equivale a un error de compilación.

## 6. Rutas principales

| Ruta                     | Función / estado                                                   |
| ------------------------ | ------------------------------------------------------------------ |
| `/`                      | Portada de P&N                                                     |
| `/tienda`                | Catálogo dinámico de productos `ACTIVE`                            |
| `/tienda/[slug]`         | Ficha individual del producto                                      |
| `/personalizados`        | Página informativa de personalización                              |
| `/presupuesto`           | Página preparada; **recepción funcional de solicitudes pendiente** |
| `/contacto`              | Página de contacto/información                                     |
| `/admin/login`           | Acceso administrativo                                              |
| `/admin`                 | Panel principal, restringido                                       |
| `/admin/productos`       | Listado y gestión de productos                                     |
| `/admin/productos/nuevo` | Alta, fotografías y creación/publicación                           |
| `/admin/productos/[id]`  | Edición, galería, variantes y ciclo de vida                        |
| `/admin/categorias`      | Gestión de categorías                                              |
| `/admin/importar`        | Importación de modelos de referencia                               |
| `/admin/explorar`        | Exploración interna de MakerWorld                                  |
| `/admin/biblioteca`      | Biblioteca de diseños guardados                                    |
| `/api/productos`         | Lectura pública de productos activos                               |
| `/api/auth/[...all]`     | Endpoints de autenticación                                         |

## 7. Datos y reglas comerciales

El esquema Prisma incorpora, entre otros, los siguientes modelos:

- **Catálogo:** `Category`, `Product`, `ProductImage`, `ProductVariant`, `PricingConfig`.
- **Presupuestos:** `QuoteRequest` (estructura preparada; flujo de recepción/gestión pendiente).
- **Biblioteca:** `SavedDesign`.
- **Autenticación:** `User`, `Session`, `Account`, `Verification`.

Los productos usan estados `DRAFT`, `ACTIVE` y `ARCHIVED`. Su modalidad comercial es `DIRECT` o `QUOTE`.

**Criterio de publicación del MVP:** exigir datos esenciales de producto y categoría, y precio válido para venta directa. Las **fotografías y el tiempo de fabricación son opcionales**, aunque se recomiendan imágenes de calidad para vender. Los diseños propios no pasan por un trámite documental específico; para los de terceros se deben verificar las licencias y autorizaciones comerciales. Se conserva la procedencia de modelos importados.

**Precio orientativo:** 0,10–0,12 €/g de material, ajustable mediante variantes y precio manual. Antes de operar comercialmente deben verificarse también costes de fabricación, embalaje, envío, impuestos y márgenes. El tiempo de producción es un dato de apoyo, no una obligación para publicar.

## 8. Seguridad y consideraciones de despliegue

- Acciones administrativas protegidas por comprobación de rol en el servidor.
- Las fotografías se almacenan en Cloudinary; la base de datos guarda sus referencias. No almacenar archivos de clientes en directorios públicos por comodidad.
- No asumir licencias comerciales sobre diseños ni fotografías de terceros.
- Las operaciones de eliminación que afecten a **Neon y Cloudinary** no son una transacción única: ante un fallo parcial puede necesitarse revisión manual.
- La aplicación mantiene la instrucción **`noindex` durante el desarrollo**. Solo retirarla cuando estén resueltos los requisitos técnicos, legales y comerciales del lanzamiento.
- Revisar seguridad, tratamiento de datos personales, condiciones de venta, devoluciones, privacidad, cookies cuando corresponda y obligaciones fiscales antes de abrir al público.

## 9. Próximas entregas: cerrar el MVP comercial

1. **Presupuestos:** formulario real de solicitud para productos personalizados, validaciones y recepción/gestión desde el administrador. Los archivos técnicos privados (STL/3MF) deberán tratarse con almacenamiento y permisos adecuados.
2. **Carrito:** selección de variantes y cantidades, precios y resumen de compra.
3. **Pedidos y envíos:** datos del cliente, persistencia del pedido, estados administrativos y costes de envío.
4. **Pagos:** integración del proveedor elegido y confirmación fiable del pago desde el servidor.
5. **Lanzamiento:** pruebas de compra, optimización de imágenes, SEO, sitemap, datos estructurados y revisión legal. Desactivar `noindex` únicamente al publicar la tienda.

La prioridad es completar un **flujo real de solicitud o compra**, no seguir ampliando herramientas secundarias del administrador.

---

**Repositorio:** https://github.com/ManRio/pn-impresion-3d
