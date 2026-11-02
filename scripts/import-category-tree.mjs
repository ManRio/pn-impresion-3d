import 'dotenv/config';
import pg from 'pg';
import { readFileSync } from 'node:fs';
const groups=JSON.parse(readFileSync(new URL('../data/categories.json',import.meta.url),'utf8'));
const slugify=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
if(!process.env.DATABASE_URL)throw new Error('Falta DATABASE_URL');
const db=new pg.Client({connectionString:process.env.DATABASE_URL});
const preview=process.argv.includes('--dry-run');
let created=0, existing=0;
try{
 await db.connect();await db.query('BEGIN');
 for(const [main,children] of Object.entries(groups)){
  const rootSlug=slugify(main);
  let row=(await db.query('SELECT id,"parentId" FROM "Category" WHERE slug=$1',[rootSlug])).rows[0];
  if(row&&row.parentId)throw new Error(`Colisión: ${main} ya es subcategoría`);
  if(!row){
   const id=`category-${crypto.randomUUID()}`;
   await db.query('INSERT INTO "Category" (id,name,slug,"parentId","createdAt","updatedAt") VALUES ($1,$2,$3,NULL,NOW(),NOW())',[id,main,rootSlug]);
   row={id};created++;
  }else existing++;
  for(const child of children){
   const slug=`${rootSlug}-${slugify(child)}`;
   const found=(await db.query('SELECT id,"parentId" FROM "Category" WHERE slug=$1',[slug])).rows[0];
   if(found){if(found.parentId!==row.id)throw new Error(`Colisión de slug: ${slug}`);existing++;continue;}
   await db.query('INSERT INTO "Category" (id,name,slug,"parentId","createdAt","updatedAt") VALUES ($1,$2,$3,$4,NOW(),NOW())',[`category-${crypto.randomUUID()}`,child,slug,row.id]);created++;
  }
 }
 if(preview){await db.query('ROLLBACK');console.log(`SIMULACIÓN: ${created} se crearían, ${existing} existentes. No se guardó nada.`);}
 else {await db.query('COMMIT');console.log(`IMPORTACIÓN OK: ${created} creadas, ${existing} existentes. Sin eliminar ni reasignar productos.`);}
}catch(e){try{await db.query('ROLLBACK')}catch{}console.error('ERROR:',e.message);process.exitCode=1;}finally{await db.end()}
