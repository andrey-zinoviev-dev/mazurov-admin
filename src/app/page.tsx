// import Link from "next/link";
import { EntityRow } from "@/components/EntityRow/EntityRow";
import {
  // formatMoney,
  formatOrderDate,
  // formatRentalPeriod,
  getOrderStatusView,
} from "@/lib/order-display";
import { getRecentOrders } from "@/lib/orders-query";
import { formatItemsInOrderPreview } from "@/lib/order-display";

import styles from "./page.module.css";
import RowActions from "@/components/RowActions/RowActions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const orders = await getRecentOrders();

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Заказы</h1>

      <p className={styles.sectionLabel}>последние заказы</p>

      {orders.length === 0 ? (
        <p className={styles.empty}>пока нет заказов</p>
      ) : (
        <ul className={styles.list}>
          {orders.map((order) => {
            const status = getOrderStatusView(order.statusCode, order.status);
            // console.log(status);
            const orderId = order.id.toString();
            const orderDate = formatOrderDate(order.createdAt);
            const previewItems = formatItemsInOrderPreview(order.items, 2);
            const { visible: visibleItems, hiddenCount } = previewItems;

            return (
              <li key={orderId} className={styles.item}>
                <EntityRow
                  title={`Заказ ${order.orderNumber}`}
                  badge={status.label}
                  subtitle={orderDate}
                  cells={[{ label: "Срок аренды", value: `${order.days} дня - ${order.dates}` }, { label: "Итого", value: Number(order.total) }, { label: "Товары", value: <>
                    <ul>
                      {
                        visibleItems.map((item) => {
                          return <li key={item.id}>
                            <span>{item.productName}</span>
                          </li>
                        })
                      }
                    </ul>
                    <span>+ {hiddenCount} товаров в заказе</span>
                  </> }]}
                  actions={
                    <RowActions actions={[
                      {
                        label: "Изменить статус заказа",
                        opensDrawer: true,
                      },
                      {
                        label: "Удалить",
                        tone: "danger",
                        opensDrawer: true,
                      },
                    ]} />
                  }
                  href={`/orders/${orderId}`}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
