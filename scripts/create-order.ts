/**
 * Создаёт тестовый заказ в локальной БД (order + items + status history)
 * с реальными товарами из `products`.
 *
 * Запуск: npm run db:create-order
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

async function nextOrderNumber() {
  await prisma.orderCounter.upsert({
    where: { id: 1 },
    create: { id: 1, lastNumber: 0 },
    update: {},
  });

  const counter = await prisma.orderCounter.update({
    where: { id: 1 },
    data: { lastNumber: { increment: 1 } },
  });

  return counter.lastNumber;
}

/** Берём несколько реальных активных товаров из разных категорий. */
async function loadOrderProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { id: "asc" },
    take: 40,
  });

  if (products.length === 0) {
    throw new Error("В БД нет активных товаров — нечего класть в заказ");
  }

  // Предпочитаем разнообразие: камера + оптика + ещё что-то
  const byCategory = new Map<string, (typeof products)[number]>();
  for (const product of products) {
    if (!byCategory.has(product.category.name)) {
      byCategory.set(product.category.name, product);
    }
  }

  const picked = [...byCategory.values()].slice(0, 3);
  return picked.length > 0 ? picked : products.slice(0, Math.min(3, products.length));
}

async function main() {
  const days = 3;
  const products = await loadOrderProducts();

  const quantities = [1, 1, 2];
  const items = products.map((product, index) => {
    const quantity = quantities[index] ?? 1;
    const pricePerDay = Number(product.price.toString());
    const totalPrice = Math.round(pricePerDay * quantity * days * 100) / 100;

    return {
      productId: product.id,
      productName: product.name,
      category: product.category.name,
      quantity,
      pricePerDay,
      daysCount: days,
      totalPrice,
    };
  });

  const orderTotal = Math.round(
    items.reduce((sum, item) => sum + item.totalPrice, 0) * 100,
  ) / 100;

  const orderNumber = await nextOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: "local-dev-user",
      userName: "Local Dev",
      clientName: "Иван Тестов",
      phone: "+79001234567",
      email: "test@example.com",
      dates: "01.04.2026 - 03.04.2026",
      days,
      total: orderTotal,
      subtotal: orderTotal,
      status: "PENDING",
      statusCode: "PENDING",
      hidden: false,
      deliveryMethod: "pickup",
      items: { create: items },
      history: {
        create: [
          {
            status: "PENDING",
            comment: "Создан локальным скриптом",
          },
        ],
      },
    },
    include: { items: true },
  });

  console.log(`OK: заказ #${order.orderNumber}, id=${order.id.toString()}`);
  console.log(`Total: ${order.total.toString()}`);
  for (const item of order.items) {
    console.log(
      `  - [${item.productId}] ${item.productName} ×${item.quantity} = ${item.totalPrice.toString()}`,
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
