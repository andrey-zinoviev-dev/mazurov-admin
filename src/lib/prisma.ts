import "server-only";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Parse DATABASE_URL into mariadb pool settings (avoids localhost/IPv6 hangs). */
function poolConfigFromDatabaseUrl(url: string) {
  const parsed = new URL(url);
  const host = parsed.hostname === "localhost" ? "127.0.0.1" : parsed.hostname;

  return {
    host,
    port: Number(parsed.port || 3306),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ""),
    connectionLimit: 5,
    connectTimeout: 10_000,
    acquireTimeout: 20_000,
    allowPublicKeyRetrieval: true,
    prepareCacheLength: 0,
  };
}

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  return new PrismaClient({
    adapter: new PrismaMariaDb(poolConfigFromDatabaseUrl(url)),
  });
}

function isUsableClient(client: PrismaClient | undefined): client is PrismaClient {
  return (
    typeof client?.order?.findMany === "function" &&
    typeof client?.promoCode?.findMany === "function"
  );
}

function getClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  if (isUsableClient(cached)) {
    return cached;
  }

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getClient();
