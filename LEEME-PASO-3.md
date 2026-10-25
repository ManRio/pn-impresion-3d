# P&N Impresión 3D — Paso 3: Base de datos y catálogo (v0.4)

Esta actualización AÑADE archivos; no reemplaza la portada, cabecera, estilos, favicon ni package.json.

## 1. Copia de seguridad
Guarda una copia de tu carpeta actual. Extrae el ZIP y copia `prisma/`, `prisma.config.ts`, `src/lib/prisma.ts`, `src/app/api/productos/route.ts` y `.env.example` en la raíz de tu proyecto. Si `src/lib/prisma.ts` ya existe, consúltalo antes de sobrescribir.

## 2. Dependencias de Prisma 7
Verifica que tienes Node 20.19+ (o 22.12+): `node -v`.
En la terminal de VS Code (en la raíz del proyecto):

    npm install @prisma/client@7 @prisma/adapter-pg@7 pg dotenv
    npm install -D prisma@7

En package.json, agrega la propiedad raíz `"type": "module"` si no existe (Prisma 7 la requiere).
No uses `--force` ni `--legacy-peer-deps`.

## 3. Conectar una base de datos REAL
Crea PostgreSQL local o una instancia de desarrollo gestionada (p.ej. Neon, Supabase). Crea `.env` desde `.env.example`, sustituyendo DATABASE_URL por tu cadena real. No publiques capturas de credenciales ni las subas a Git.

## 4. Migración y cliente

    npx prisma validate
    npx prisma migrate dev --name init_catalogo
    npx prisma generate
    npx prisma studio

`migrate dev` crea tablas en la base de datos configurada. Usa una base NUEVA de desarrollo, no una que tenga datos. Si pide resetear una base con datos, cancela y consúltalo primero.

## 5. Validación de la aplicación

    npx eslint .
    npm run build
    npm run dev

Abre `http://localhost:3000/api/productos`. Debe devolver `{ "products": [] }` porque aún no hemos cargado productos reales. Un error 500 indica que no existe conectividad o falta la configuración. Esta API es pública y solo devuelve artículos activos; no contiene operaciones administrativas.

## Importante
- La ruta `/tienda` sigue con productos de demostración; conectar la interfaz a PostgreSQL será el paso 3.2.
- `QuoteRequest` es solo la estructura inicial; todavía no hay subida de archivos ni formulario conectado.
- Nunca subir `.env` a Git; comprueba que `.gitignore` contiene `.env*` (permitiendo `.env.example`).
- Los importes están guardados en céntimos para evitar errores con decimales.
- El sistema no tiene aún autenticación, compras ni pagos. No publicar como tienda operativa.
