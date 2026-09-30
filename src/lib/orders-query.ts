import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/client";

export const RECENT_ORDERS_LIMIT = 30;
export const SEARCH_ORDERS_LIMIT = 12;

export const orderListSelect = {
  id: true,
  orderNumber: true,
  status: true,
  statusCode: true,
  dates: true,
  days: true,
  total: true,
  createdAt: true,
  clientName: true,
  userName: true,
  phone: true,
} satisfies Prisma.OrderSelect;

export type OrderListItem = Prisma.OrderGetPayload<{
  select: typeof orderListSelect;
}>;

const notHidden: Prisma.OrderWhereInput = {
  OR: [{ hidden: false }, { hidden: null }],
};

/** В выручку и средний чек — только подтверждённые / выданные / выполненные. */
const revenueStatusCodes = ["CONFIRMED", "IN_PROGRESS", "COMPLETED"] as const;

const revenueOrders: Prisma.OrderWhereInput = {
  AND: [notHidden, { statusCode: { in: [...revenueStatusCodes] } }],
};

const promoApplied: Prisma.OrderWhereInput = {
  AND: [
    notHidden,
    { promoCode: { gt: "" } },
    { OR: [{ promoRejected: false }, { promoRejected: null }] },
  ],
};

export type OrderStats = {
  totalOrders: number;
  revenue: number;
  averageCheck: number;
  promoUsed: number;
};

function buildSearchWhere(query: string): Prisma.OrderWhereInput {
  const q = query.trim();
  const textFilters: Prisma.OrderWhereInput[] = [
    { clientName: { contains: q } },
    { userName: { contains: q } },
    { phone: { contains: q } },
  ];

  const digits = q.replace(/\D/g, "");
  if (digits) {
    const asNumber = Number(digits);
    if (Number.isInteger(asNumber) && asNumber > 0 && asNumber <= 2_147_483_647) {
      textFilters.push({ orderNumber: asNumber });
    }
    if (digits !== q) {
      textFilters.push({ phone: { contains: digits } });
    }
  }

  return {
    AND: [notHidden, { OR: textFilters }],
  };
}

export async function getRecentOrders() {
  return prisma.order.findMany({
    where: notHidden,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: RECENT_ORDERS_LIMIT,
    select: orderListSelect,
  });
}

export async function getOrdersCount() {
  return prisma.order.count({ where: notHidden });
}

export async function getOrderStats(): Promise<OrderStats> {
  const [totalOrders, money, promoUsed] = await Promise.all([
    prisma.order.count({ where: notHidden }),
    prisma.order.aggregate({
      where: revenueOrders,
      _sum: { total: true },
      _avg: { total: true },
    }),
    prisma.order.count({ where: promoApplied }),
  ]);

  return {
    totalOrders,
    revenue: Number(money._sum.total ?? 0),
    averageCheck: Number(money._avg.total ?? 0),
    promoUsed,
  };
}

export async function searchOrdersByQuery(query: string) {
  const q = query.trim();
  if (!q) return [];

  return prisma.order.findMany({
    where: buildSearchWhere(q),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: SEARCH_ORDERS_LIMIT,
    select: orderListSelect,
  });
}
