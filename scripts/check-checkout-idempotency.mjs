import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

const checkoutKey = process.argv[2];

if (
  !checkoutKey ||
  !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    checkoutKey,
  )
) {
  throw new Error('Indica un UUID válido.');
}

if (!process.env.DATABASE_URL) {
  throw new Error('Falta DATABASE_URL.');
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

try {
  await client.connect();

  const indexResult = await client.query(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = current_schema()
      AND tablename = 'Order'
      AND indexdef ILIKE '%"checkoutKey"%'
  `);

  const uniqueIndex = indexResult.rows.some((row) =>
    /CREATE UNIQUE INDEX/i.test(row.indexdef),
  );

  const orderResult = await client.query(
    `SELECT COUNT(*)::int AS total
     FROM "Order"
     WHERE "checkoutKey" = $1`,
    [checkoutKey],
  );

  const total = orderResult.rows[0].total;

  console.log('--- AUDITORÍA DE IDEMPOTENCIA ---');
  console.log('Índice UNIQUE:', uniqueIndex ? 'OK' : 'NO ENCONTRADO');
  console.log('Pedidos con esta clave:', total);

  if (!uniqueIndex || total !== 1) {
    process.exitCode = 1;
    console.error('REVISIÓN NECESARIA');
  } else {
    console.log('COMPROBACIÓN DE BASE DE DATOS CORRECTA');
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
