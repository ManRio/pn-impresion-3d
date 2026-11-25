import "server-only";

import { readFileSync } from "node:fs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("Falta DATABASE_URL");
  }

  const url = new URL(connectionString);

  if (url.protocol !== "mysql:") {
    throw new Error("DATABASE_URL debe utilizar MySQL");
  }

  const caPath = process.env.MYSQL_CA_PATH;

  if (!caPath) {
    throw new Error("Falta MYSQL_CA_PATH");
  }

  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.slice(1)),
    connectionLimit: 5,
    ssl: {
      ca: readFileSync(caPath, "utf8"),
      rejectUnauthorized: true,
    },
  });

  return new PrismaClient({ adapter });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
