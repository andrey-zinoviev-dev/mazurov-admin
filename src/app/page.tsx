import Link from "next/link";
import {
  formatMoney,
  formatOrderDate,
  formatRentalPeriod,
  getOrderStatusView,
} from "@/lib/order-display";
import { getRecentOrders } from "@/lib/orders-query";
import styles from "./page.module.css";

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
            const orderId = order.id.toString();

            return (
              <li key={orderId} className={styles.item}>
                <Link href={`/orders/${orderId}`} className={styles.itemLink}>
                  <div className={styles.itemTop}>
                    <h2 className={styles.orderTitle}>Заказ {order.orderNumber}</h2>
                    <p className={styles.status} data-tone={status.tone}>
                      <span className={styles.statusDot} aria-hidden />
                      {status.label}
                    </p>
                  </div>

                  <dl className={styles.meta}>
                    <div className={styles.metaRow}>
                      <dt>Дата заказа:</dt>
                      <dd>{formatOrderDate(order.createdAt)}</dd>
                    </div>
                    <div className={styles.metaRow}>
                      <dt>Срок аренды:</dt>
                      <dd>{formatRentalPeriod(order.days, order.dates)}</dd>
                    </div>
                    <div className={styles.metaRow}>
                      <dt>Итого:</dt>
                      <dd className={styles.total}>{formatMoney(order.total)}</dd>
                    </div>
                  </dl>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
