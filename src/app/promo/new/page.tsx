import Link from "next/link";
import { PromoForm } from "./PromoForm"
import styles from "./page.module.css";

export default function NewPromoPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/promo" className={styles.backLink}>
          ← все промокоды
        </Link>
        <h1 className={styles.title}>Создать промокод</h1>
      </div>

      <PromoForm />
    </div>
  );
}
