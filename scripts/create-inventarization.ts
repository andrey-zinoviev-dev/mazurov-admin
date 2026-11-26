/**
 * Создаёт тестовую инвентаризацию в локальной БД
 * с реальными товарами из `products`.
 *
 * Запуск: npm run db:create-inventarization
 */
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/client";

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

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(poolConfigFromDatabaseUrl(url)),
});

/** Берём несколько реальных активных товаров из разных категорий. */
async function loadProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { id: "asc" },
    take: 40,
  });

  if (products.length === 0) {
    throw new Error("В БД нет активных товаров — нечего класть в инвентаризацию");
  }

  const byCategory = new Map<string, (typeof products)[number]>();
  for (const product of products) {
    if (!byCategory.has(product.category.name)) {
      byCategory.set(product.category.name, product);
    }
  }

  const picked = [...byCategory.values()].slice(0, 5);
  return picked.length > 0 ? picked : products.slice(0, Math.min(5, products.length));
}

async function main() {
  const products = await loadProducts();

  const inventarization = await prisma.inventarization.create({
    data: {
      inspector: "Local Dev",
      status: "in_progress",
      comment: "Создана локальным скриптом",
      items: {
        create: products.map((product, index) => ({
          productId: product.id,
          // чуть варьируем факт: stock, stock-1 или null для одной позиции
          actualQty:
            index === products.length - 1
              ? null
              : Math.max(0, product.stock - (index % 2)),
          comment:
            index === 0
              ? "Всё на месте"
              : index === products.length - 1
                ? "Ещё не посчитано"
                : null,
        })),
      },
    },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  console.log(
    `OK: инвентаризация id=${inventarization.id.toString()}, status=${inventarization.status}`,
  );
  console.log(`Inspector: ${inventarization.inspector}`);
  console.log(`Date: ${inventarization.date.toISOString()}`);
  console.log(`Comment: ${inventarization.comment ?? "—"}`);
  console.log(`Items (${inventarization.items.length}):`);
  for (const item of inventarization.items) {
    console.log(
      `  - [${item.productId}] ${item.product.name} | actual=${item.actualQty ?? "null"} | stock=${item.product.stock}${item.comment ? ` | ${item.comment}` : ""}`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
