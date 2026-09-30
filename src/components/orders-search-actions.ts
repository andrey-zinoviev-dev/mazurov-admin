"use server";

import {
  formatMoney,
  formatOrderDate,
  getOrderStatusView,
  type OrderStatusTone,
} from "@/lib/order-display";
import { requireAuth } from "@/lib/auth";
import { searchOrdersByQuery } from "@/lib/orders-query";

export type OrderSearchHit = {
  id: string;
  orderNumber: number;
  statusLabel: string;
  statusTone: OrderStatusTone;
  secondary: string;
  totalLabel: string;
};

function secondaryLabel(order: {
  clientName: string | null;
  userName: string | null;
  phone: string | null;
  createdAt: Date | null;
}): string {
  const who = (order.clientName ?? order.userName ?? order.phone ?? "").trim();
  const date = formatOrderDate(order.createdAt);
  if (who) return `${who} · ${date}`;
  return date;
}

export async function searchOrdersAction(query: string): Promise<OrderSearchHit[]> {
  await requireAuth();

  const orders = await searchOrdersByQuery(query);

  return orders.map((order) => {
    const status = getOrderStatusView(order.statusCode, order.status);
    return {
      id: order.id.toString(),
      orderNumber: order.orderNumber,
      statusLabel: status.label,
      statusTone: status.tone,
      secondary: secondaryLabel(order),
      totalLabel: formatMoney(order.total),
    };
  });
}
