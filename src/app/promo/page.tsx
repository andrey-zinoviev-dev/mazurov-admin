import Link from "next/link";
import {
  formatPromoDiscount,
  formatPromoExpiry,
  formatPromoUses,
  formatPromoUsesPerUser,
  getPromoStatusView,
} from "@/lib/promo-display";
import { getPromoCodes } from "@/lib/promo-query";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function PromoPage() {
  const promos = await getPromoCodes();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Промокоды</h1>
        <Link href="/promo/new" className={styles.createLink}>
          создать промокод
        </Link>
      </div>

      <p className={styles.sectionLabel}>история промокодов</p>

      {promos.length === 0 ? (
        <p className={styles.empty}>пока нет промокодов</p>
      ) : (
        <ul className={styles.list}>
          {promos.map((promo) => {
            const status = getPromoStatusView(promo.isActive, promo.expiryDate);

            return (
              <li key={promo.id} className={styles.item}>
                <div className={styles.itemBody}>
                  <div className={styles.itemTop}>
                    <h2 className={styles.promoTitle}>{promo.code}</h2>
                    <p className={styles.status} data-tone={status.tone}>
                      <span className={styles.statusDot} aria-hidden />
                      {status.label}
                    </p>
                  </div>

                  <dl className={styles.meta}>
                    <div className={styles.metaRow}>
                      <dt>Скидка:</dt>
                      <dd>
                        {formatPromoDiscount(
                          promo.discountType,
                          promo.discountValue,
                        )}
                      </dd>
                    </div>
                    <div className={styles.metaRow}>
                      <dt>Срок:</dt>
                      <dd>{formatPromoExpiry(promo.expiryDate)}</dd>
                    </div>
                    <div className={styles.metaRow}>
                      <dt>Использований:</dt>
                      <dd>
                        {formatPromoUses(promo.timesUsed, promo.maxUses)}
                      </dd>
                    </div>
                    <div className={styles.metaRow}>
                      <dt>На пользователя:</dt>
                      <dd>{formatPromoUsesPerUser(promo.maxUsesPerUser)}</dd>
                    </div>
                  </dl>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
