import "dotenv/config";
import { readFileSync } from "node:fs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const caPath = process.env.MYSQL_CA_PATH;

  if (!connectionString || !caPath) {
    throw new Error("Faltan DATABASE_URL o MYSQL_CA_PATH");
  }

  const url = new URL(connectionString);

  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.slice(1)),
    connectionLimit: 2,
    ssl: {
      ca: readFileSync(caPath, "utf8"),
      rejectUnauthorized: true,
    },
  });

  const prisma = new PrismaClient({ adapter });

  try {
    const [products, orders, users] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
    ]);

    console.log("Productos:", products);
    console.log("Pedidos:", orders);
    console.log("Usuarios:", users);
    console.log("Prisma Client → MySQL: OK");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Error en prueba Prisma:", error);
  process.exitCode = 1;
});
