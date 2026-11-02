/** P&N - Importación segura de fichas, SIN variantes ni imágenes. */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

const commit = process.argv.includes('--apply');
const file = resolve('data/productos_pn_final_30.json');
const records = JSON.parse(readFileSync(file, 'utf8'));
if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL en .env');
if (!Array.isArray(records) || records.length !== 30 || records.some(x => x.reference === 'WA-024')) throw new Error('El archivo no contiene exactamente los 30 productos aprobados.');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
const requiredProductColumns = ['id','name','slug','description','status','saleMode','categoryId','shortDescription','seoTitle','seoDescription','seoKeywords','socialTitle','socialDescription'];
const normalized = v => String(v ?? '').trim();
const failures = [];
const ready = [];
let existingCount = 0;
try {
  await client.connect();
  const columnData = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Product'`);
  const cols = new Set(columnData.rows.map(x => x.column_name));
  const absent = requiredProductColumns.filter(x => !cols.has(x));
  if (absent.length) throw new Error(`Faltan columnas en Product: ${absent.join(', ')}. Comprueba la migración SEO antes de importar.`);
  const names = new Set();
  for (const p of records) {
    const ref = normalized(p.reference);
    const slug = normalized(p.slug);
    if (!ref || !slug || names.has(slug) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {failures.push(`${ref}: slug vacío, inválido o repetido`);continue;}
    names.add(slug);
    if (!normalized(p.name) || !normalized(p.description) || !['DIRECT','QUOTE'].includes(p.saleMode)) { failures.push(`${ref}: faltan datos esenciales`);continue; }
    if (normalized(p.name).length > 120 || normalized(p.description).length > 5000) {failures.push(`${ref}: nombre o descripción exceden límites`);continue;}
    const cat = await client.query(`SELECT c.id, c."parentId", parent.name AS parent_name FROM "Category" c LEFT JOIN "Category" parent ON parent.id = c."parentId" WHERE c.name = $1 AND parent.name = $2`, [normalized(p.subcategory),normalized(p.category)]);
    if (cat.rowCount !== 1) { failures.push(`${ref}: subcategoría no encontrada o ambigua: ${p.category} / ${p.subcategory}`);continue;}
    const already = await client.query(`SELECT id FROM "Product" WHERE slug = $1`,[slug]);
    if (already.rowCount) { existingCount++;continue; }
    ready.push({p, categoryId:cat.rows[0].id});
  }
  console.log(`Validación: ${records.length} referencias; ${ready.length} nuevas; ${existingCount} ya existentes; ${failures.length} incidencias.`);
  for (const error of failures) console.error('INCIDENCIA:',error);
  if (failures.length) throw new Error('Se ha cancelado la operación: corrige las incidencias antes de aplicar.');
  if (!commit) {console.log('SIMULACIÓN OK. Para importar: node scripts/importar-productos.mjs --apply');}
  else {
    await client.query('BEGIN');
    for (const {p,categoryId} of ready) {
      await client.query(`INSERT INTO "Product" (id,name,slug,description,status,"saleMode","categoryId","shortDescription","seoTitle","seoDescription","seoKeywords","socialTitle","socialDescription","createdAt","updatedAt") VALUES ($1,$2,$3,$4,'DRAFT',$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW())`,
      [randomUUID(), normalized(p.name),normalized(p.slug),normalized(p.description),p.saleMode,categoryId,normalized(p.shortDescription)||null,normalized(p.seoTitle)||null,normalized(p.seoDescription)||null,normalized(p.seoKeywords)||null,normalized(p.socialTitle)||null,normalized(p.socialDescription)||null]);
    }
    await client.query('COMMIT');
    console.log(`IMPORTACIÓN COMPLETADA: ${ready.length} nuevos borradores sin variantes ni imágenes; ${existingCount} omitidos por existir.`);
  }
} catch(e){ if(commit) await client.query('ROLLBACK').catch(()=>{});console.error('ERROR:',e.message);process.exitCode=1; }
finally { await client.end().catch(()=>{}); }
