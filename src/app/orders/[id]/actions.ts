"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type SaveOrderState = {
  error?: string;
  ok?: boolean;
};

type PendingItemInput = {
  productId: number;
  quantity: number;
};

function parsePendingItems(raw: string): PendingItemInput[] | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    const items: PendingItemInput[] = [];
    for (const entry of parsed) {
      if (!entry || typeof entry !== "object") return null;
      const productId = Number((entry as { productId?: unknown }).productId);
      const quantity = Number((entry as { quantity?: unknown }).quantity);
      if (!Number.isInteger(productId) || productId <= 0) return null;
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return null;
      items.push({ productId, quantity });
    }
    return items;
  } catch {
    return null;
  }
}

export async function saveOrderChanges(
  _prev: SaveOrderState,
  formData: FormData,
): Promise<SaveOrderState> {
  await requireAuth();

  const orderIdRaw = String(formData.get("orderId") ?? "").trim();
  const pendingRaw = String(formData.get("pendingItems") ?? "").trim();

  let orderId: bigint;
  try {
    orderId = BigInt(orderIdRaw);
  } catch {
    return { error: "Некорректный заказ" };
  }

  const pending = parsePendingItems(pendingRaw);
  if (!pending) {
    return { error: "Некорректный список изменений" };
  }
  if (pending.length === 0) {
    return { error: "Нет изменений для сохранения" };
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      OR: [{ hidden: false }, { hidden: null }],
    },
    select: { id: true, days: true, total: true },
  });

  if (!order) {
    return { error: "Заказ не найден" };
  }

  const productIds = [...new Set(pending.map((item) => item.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    select: {
      id: true,
      name: true,
      price: true,
      category: { select: { name: true } },
    },
  });

  if (products.length !== productIds.length) {
    return { error: "Один из товаров недоступен" };
  }

  const productById = new Map(products.map((product) => [product.id, product]));
  const daysCount = order.days ?? 1;

  const rows = pending.map((item) => {
    const product = productById.get(item.productId);
    if (!product) {
      throw new Error("Product missing after validation");
    }
    const pricePerDay = Number(product.price.toString());
    const totalPrice =
      Math.round(pricePerDay * item.quantity * daysCount * 100) / 100;

    return {
      orderId: order.id,
      productId: product.id,
      productName: product.name,
      category: product.category.name,
      quantity: item.quantity,
      pricePerDay: product.price,
      daysCount,
      totalPrice,
    };
  });

  if (rows.some((row) => !Number.isFinite(Number(row.totalPrice)) || Number(row.totalPrice) < 0)) {
    return { error: "Не удалось посчитать сумму" };
  }

  const addedTotal = rows.reduce((sum, row) => sum + Number(row.totalPrice), 0);

  await prisma.$transaction([
    prisma.orderItem.createMany({ data: rows }),
    prisma.order.update({
      where: { id: order.id },
      data: { total: { increment: addedTotal } },
    }),
  ]);

  revalidatePath(`/orders/${orderIdRaw}`);
  revalidatePath("/");

  return { ok: true };
}
