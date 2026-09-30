"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./mobile-tab-bar.module.css";

const links = [
  { href: "/", label: "заказы", icon: OrdersIcon },
  { href: "/promo", label: "промокоды", icon: PromoIcon },
  { href: "/stats", label: "статистика", icon: StatsIcon },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  return (
    <nav className={styles.bar} aria-label="Основная навигация">
      {links.map(({ href, label, icon: Icon }) => {
        const isCurrent =
          href === "/"
            ? pathname === "/" || pathname.startsWith("/orders")
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={
              isCurrent ? `${styles.item} ${styles.itemActive}` : styles.item
            }
            aria-current={isCurrent ? "page" : undefined}
          >
            <Icon />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function OrdersIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 4.5h10A1.5 1.5 0 0 1 18.5 6v12a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 18V6A1.5 1.5 0 0 1 7 4.5Z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M9 9h6M9 12.5h6M9 16h3.5"
      />
    </svg>
  );
}

function PromoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 9.5 9.5 4.5h6.2L19.5 8.3v6.2L14.5 19.5H8.3L4.5 15.7V9.5Z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M9.2 14.8 14.8 9.2"
      />
      <circle cx="9.8" cy="9.8" r="1.1" fill="currentColor" />
      <circle cx="14.2" cy="14.2" r="1.1" fill="currentColor" />
    </svg>
  );
}

function StatsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 19.5V11M12 19.5V4.5M19 19.5v-6"
      />
    </svg>
  );
}
