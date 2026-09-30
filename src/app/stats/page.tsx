import { formatMoney } from "@/lib/order-display";
import { getOrderStats } from "@/lib/orders-query";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

function moneyLabel(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  return `${formatMoney(value)} ₽`;
}

export default async function StatsPage() {
  const statsData = await getOrderStats();

  const stats = [
    { value: String(statsData.totalOrders), label: "Всего заказов" },
    { value: moneyLabel(statsData.revenue), label: "Выручка" },
    { value: moneyLabel(statsData.averageCheck), label: "Средний чек" },
    { value: String(statsData.promoUsed), label: "Промокодов использовано" },
  ] as const;

  return (
    <div className={styles.page}>
      <section className={styles.section} aria-labelledby="stats-title">
        <div>
          <h1 id="stats-title" className={styles.title}>
            Статистика
          </h1>
          <p className={styles.description}>
            Сводка по видимым заказам. Выручка и средний чек — по подтверждённым,
            выданным и выполненным; промокоды — только успешно применённые.
          </p>
        </div>

        <ul className={styles.grid}>
          {stats.map((stat) => (
            <li key={stat.label} className={styles.stat}>
              <span className={styles.value}>{stat.value}</span>
              <span className={styles.label}>{stat.label}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
