import { notFound } from "next/navigation";
import {
  formatOrderDate,
  formatRentalPeriod,
  getOrderStatusView,
} from "@/lib/order-display";
import { prisma } from "@/lib/prisma";
import { OrderEditor } from "./OrderEditor";

export const dynamic = "force-dynamic";

type OrderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;

  let orderId: bigint;
  try {
    orderId = BigInt(id);
  } catch {
    notFound();
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      OR: [{ hidden: false }, { hidden: null }],
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      statusCode: true,
      dates: true,
      days: true,
      total: true,
      createdAt: true,
      items: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          productName: true,
          category: true,
          quantity: true,
          pricePerDay: true,
          daysCount: true,
          totalPrice: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ itemOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      price: true,
      category: { select: { name: true } },
    },
  });

  const status = getOrderStatusView(order.statusCode, order.status);
  const days = order.days ?? 1;

  return (
    <OrderEditor
      orderId={order.id.toString()}
      orderNumber={order.orderNumber}
      statusLabel={status.label}
      statusTone={status.tone}
      orderDate={formatOrderDate(order.createdAt)}
      rentalPeriod={formatRentalPeriod(order.days, order.dates)}
      days={days}
      initialTotal={order.total.toString()}
      initialItems={order.items.map((item) => ({
        key: item.id.toString(),
        productName: item.productName,
        category: item.category,
        quantity: item.quantity,
        pricePerDay: item.pricePerDay.toString(),
        daysCount: item.daysCount ?? days,
        totalPrice: item.totalPrice.toString(),
      }))}
      products={products.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price.toString(),
        category: product.category.name,
      }))}
    />
  );
}
