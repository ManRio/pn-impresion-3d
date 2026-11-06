# P&N Impresión 3D

**Tienda online de productos impresos en 3D y encargos personalizados**, orientada inicialmente al mercado español.

> **Estado (4 de noviembre de 2026): MVP avanzado, pendiente de despliegue comercial.**
> Landing rediseñada con slider de productos reales, páginas de contacto y
> borradores legales, canales de contacto e información básica de privacidad
> en los formularios. Dominio elegido: pn3d.es.
>
> Datos comerciales confirmados: envío con Correos por 8 € o recogida gratuita;
> venta en Península y Baleares; precios de catálogo con impuestos incluidos.
>
> Pendiente de implementar: selector de entrega y recálculo del checkout en
> servidor, integración con Stripe, confirmación fiscal por la gestoría,
> condiciones comerciales definitivas y auditorías SEO, seguridad y
> accesibilidad.
>
> **No habilitar ventas reales hasta completar estas comprobaciones.**

## 1. Tecnologías

| Área                   | Tecnologías                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| Frontend y servidor    | Next.js 16 (App Router), React 19, TypeScript                     |
| Estilos                | Tailwind CSS 4, identidad P&N carbón/verde lima, Oxanium e Inter  |
| Base de datos          | PostgreSQL en Neon, Prisma 7, `@prisma/adapter-pg`                |
| Autenticación          | Better Auth, sesiones y plugin `admin`                            |
| Imágenes               | Cloudinary (subida directa firmada); Neon guarda URL, ALT y orden |
| Referencias de modelos | MakerWorld (integración interna basada en endpoints no oficiales) |
| Impresión              | Bambu Lab A1 con AMS Lite; archivos técnicos de Bambu Studio      |

## 2. Funcionalidades implementadas

### Administración y catálogo (`/admin`)

- Acceso restringido a administradores con comprobación de rol en el servidor.
- Dashboard con accesos a productos, categorías, presupuestos, pedidos y herramientas internas.
- Crear, editar, publicar, despublicar, archivar y eliminar productos; eliminación múltiple con confirmación y comprobaciones de relaciones históricas.
- Modalidades de venta directa (`DIRECT`) y bajo presupuesto (`QUOTE`), variantes, materiales, colores, consumos y precios.
- Fotografías en Cloudinary: subida directa desde el navegador con firma temporal y comprobación administrativa en servidor; hasta 8 archivos de 5 MB por producto, JPG/PNG/WebP, galería, portada y textos ALT.
- Alta de producto con campos comerciales y SEO separados del transporte de fotos: se crea un borrador, se registran imágenes verificadas y se intenta publicar si se solicitó y se cumplen los requisitos.
- Borrado de fotografías y productos: primero se confirma el cambio en Neon y después se limpia Cloudinary; los fallos de limpieza se registran y requieren gestión posterior. No existe todavía una cola persistente de reintentos.
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
- Formulario público de presupuesto con honeypot y validaciones de servidor; limitación configurada con Upstash Redis (ventana deslizante, 3 solicitudes/hora por IP y, si hay sesión, 3 por usuario). **Pendiente de prueba funcional del límite y de verificar las credenciales Redis en producción.**

### Carrito y pedidos — sin pago online integrado

- Productos `DIRECT` añadibles por variante y cantidad, con notas del comprador.
- Cabecera con iconos de carrito/cuenta, contador, vista rápida y acceso a perfil, pedidos y presupuestos.
- Carrito separado por cuenta mediante `localStorage` **en el mismo navegador**; no se sincroniza entre dispositivos ni persiste en Neon.
- Registro de pedidos con recálculo de precios en el servidor y conservación de líneas históricas.
- Idempotencia del checkout mediante `Order.checkoutKey` (UUID) con índice `UNIQUE` en PostgreSQL, reutilización de clave ante reintentos y gestión del conflicto `P2002`; comprobada en Neon la existencia del índice y una fila con la clave de un pedido de prueba. **Pendiente probar reintentos simultáneos de extremo a extremo.**
- `/api/cart-preview` comprueba el JSON, limita el cuerpo a 16 KB y hasta 30 líneas, valida cantidades e identificadores, rechaza duplicados y vuelve a consultar las variantes activas en Neon; no constituye por sí solo un limitador de frecuencia.
- Historial privado `/mi-cuenta/mis-pedidos`.
- Administración `/admin/pedidos`: **Recibido, En fabricación, Terminado, Enviado**, transportista, seguimiento y notas internas.

### Checkout, entrega e impuestos

- Selección obligatoria del método de entrega:
  - Correos: 8,00 € por pedido.
  - Recogida presencial: gratuita.
- Envíos disponibles a España peninsular e Islas Baleares.
- Precios de catálogo con IVA incluido.
- Cálculo del subtotal, desglose de IVA y total final.
- Validación de productos, cantidades y precios en el servidor.
- Conservación del método de entrega y los importes en cada pedido.
- Protección contra pedidos duplicados mediante checkoutKey.
- Facturación mediante un programa externo.

### Pagos y despliegue

- Stripe SDK instalado; integración del cobro pendiente.
- Railway conectado a la rama main de GitHub.
- Dominio temporal de Railway habilitado.
- Las variables de entorno se configuran fuera del repositorio.

### Integración de Stripe Checkout

- Stripe SDK 23.1.0 instalado.
- Checkout alojado por Stripe en modo de pruebas.
- Importes calculados y validados en el servidor.
- Pedidos asociados a sesiones de Stripe.
- Endpoint de webhook preparado para verificar los pagos.
- Los pedidos solo se marcarán como pagados tras la confirmación segura del pago.
- Facturación realizada mediante un programa externo.

**Estado:** integración en pruebas. Pendiente de configurar
el webhook en Stripe, probar pagos completos y validar
la seguridad antes de activar cobros reales.

## 3. Requisitos de desarrollo

- Node.js 24 y npm; VS Code o equivalente.
- Base de datos de desarrollo en Neon.
- Better Auth y Cloudinary configurados en variables de entorno.
- Upstash Redis configurado para la protección de solicitudes públicas de presupuestos.

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
UPSTASH_REDIS_REST_URL="https://tu-instancia.upstash.io"
UPSTASH_REDIS_REST_TOKEN="tu_token_privado"
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

**Última validación comunicada (3 de noviembre de 2026):** TypeScript, lint y compilación de Next.js completados correctamente tras la adaptación a Cloudinary. Las comprobaciones previas de Prisma también se habían superado. La subida firmada y el registro de una fotografía existente en Neon se han verificado manualmente; la recuperación temporal se eliminó después. **Pendiente:** prueba integral de alta con varias imágenes y comprobación funcional del limitador Upstash. Esto no sustituye una auditoría de producción ni pruebas E2E.

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
| `/api/admin/uploads/sign`                                                     | Firma de subida a Cloudinary, solo para admin  |

## 7. Datos y reglas comerciales

- **Catálogo:** `Category`, `Product`, `ProductImage`, `ProductVariant`, `PricingConfig`.
- **Presupuestos:** `QuoteRequest`, `QuoteInternalNote`.
- **Pedidos:** `Order` (incluye `checkoutKey` único), `OrderItem`, `OrderHistory`.
- **Usuarios:** `User`, `Session`, `Account`, `Verification`, `CustomerProfile`.
- **Biblioteca:** `SavedDesign`.

Estados de producto: `DRAFT`, `ACTIVE`, `ARCHIVED`. Modalidades: `DIRECT`, `QUOTE`.

Precio orientativo inicial de referencia: **0,10–0,12 €/g**; el precio definitivo requiere revisión de costes, embalaje, impuestos, envío y márgenes. No inventar datos técnicos de variantes para habilitar una importación; deben ser confirmados antes de publicar.

## 8. Seguridad y despliegue

- **Comprobado manualmente:** separación de pedidos y presupuestos entre dos cuentas de cliente y redirección al inicio al intentar acceder a páginas de administración sin rol admin. **Pendiente:** pruebas específicas de operaciones administrativas invocadas directamente por HTTP.
- Mantener comprobación de rol administrativo en el servidor para rutas, APIs y Server Actions; la firma de Cloudinary no debe exponer `CLOUDINARY_API_SECRET` al navegador.
- Server Actions limitadas a 1 MB después de separar las fotos; mantener revisión de cualquier formulario nuevo que requiera cargas grandes. API de vista previa del carrito limitada a 16 KB.
- En fotos, conservar restricciones de formatos/tamaño y verificar en servidor las referencias recibidas de Cloudinary. Revisar validación de contenido y carreras en el máximo de imágenes antes de producción.
- Protección de presupuestos con Upstash Redis y rechazo seguro si el servicio falla; **pendiente prueba funcional**, revisión de cabeceras de IP confiables en despliegue y mitigación de tráfico distribuido.
- Revisar protección del almacenamiento de STL/3MF y demás endpoints públicos.
- Revisar sesiones, cookies, roles, dependencias, secretos, cabeceras HTTP, backups y recuperación ante fallos.
- Neon y Cloudinary no comparten una transacción: las operaciones parciales pueden dejar archivos sin referencia. **Pendiente:** limpieza recuperable/persistente o cola de reintentos y auditoría de imágenes huérfanas.
- En desarrollo se corrigió `publicIdFromProductUrl` para reconocer IDs de producto con guiones y se recuperó una imagen previamente subida pero no registrada; la página temporal de recuperación fue eliminada.
- Mantener `noindex` hasta el lanzamiento y habilitar indexación solo después de validar contenido, privacidad y SEO.
- Antes de la apertura comercial, revisar identidad del vendedor, avisos legales, RGPD, privacidad, cookies cuando corresponda, condiciones de venta, desistimiento/excepciones y obligaciones fiscales con asesoramiento profesional.

### Advertencia de desarrollo: VS Code Dev Tunnels

Un túnel del puerto 3000 puede introducir una cabecera `x-forwarded-host` diferente del `origin` local y provocar `Invalid Server Actions request` en presupuestos o pedidos. Para desarrollo local, desactivar ese reenvío y reiniciar Next.js; no desactivar la protección de origen de manera general.

## 9. Prioridades para el lanzamiento

1. **Seguridad y funcionalidad:** completar las pruebas de Upstash, reintentos de checkout, subida múltiple, permisos de acciones admin y limpieza fiable de Cloudinary; continuar auditoría de sesiones, archivos y endpoints.
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


## Stripe: preparación para test y producción (6 de noviembre de 2026)

- La selección es **explícita** mediante `STRIPE_MODE=test|live` (por defecto `test`).
- `STRIPE_SECRET_KEY` debe empezar por `sk_test_` o `sk_live_` según el modo; una mezcla deshabilita el checkout.
- `STRIPE_CHECKOUT_ENABLED=true` habilita el pago solo si el modo y la clave coinciden.
- El webhook verifica la firma con `STRIPE_WEBHOOK_SECRET` del mismo entorno, y compara `event.livemode`, `session.livemode`, prefijo del identificador, importe, moneda e identificador de pedido.
- Cada entorno de Stripe requiere su propio webhook de firma `whsec_` y sus sesiones son independientes.
- Se mantiene el circuito de notificaciones por Resend y Neon, sin cambios.
- Antes de entrar en producción hay que cerrar textos legales, política de entrega, facturación externa, cuenta bancaria/transferencias y una prueba real controlada.
- **No sustituir aún las claves de Railway.** Desplegar primero con `STRIPE_MODE=test`; validar todo con Stripe de pruebas. Para el corte a modo real, suspender temporalmente el checkout, esperar/reconciliar sesiones test pendientes, introducir secretos live y activar solo tras verificar el webhook real.
- Los historiales de pagos de prueba permanecen etiquetados como pruebas; no representan cobros reales.


## Checkout: información precontractual (revisión 2026-11-06)

- Carrito: muestra productos, cantidades, desglose IVA incluido, transporte y total; antes de pagar explica preparación y entrega, desistimiento y condiciones.
- El botón de producción se etiqueta «Realizar pedido con obligación de pago». En pruebas identifica expresamente la ausencia de cobro real.
- El comprador marca una casilla no premarcada de aceptación de condiciones de compra y envíos/devoluciones. El servidor valida `termsAccepted === true`; la creación inicial de `OrderHistory` registra una nota interna sobre la aceptación. Este registro es una evidencia básica, no un expediente jurídico completo de consentimiento/versionado.
- Las páginas legales siguen sujetas a revisión final; antes de ventas reales comprobar plazos específicos para trabajos largos, política de cancelaciones y confirmación contractual en soporte duradero.
- Tras esta actualización, volver a probar checkout de prueba, cancelación y recuperación, y las notificaciones. **No activar `STRIPE_MODE=live` solo por pasar el build.**
