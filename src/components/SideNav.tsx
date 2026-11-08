"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/login/actions";
import styles from "./side-nav.module.css";

const links = [
  { href: "/", label: "заказы" },
  { href: "/equipment", label: "учет оборудования" },
  { href: "/promo", label: "промокоды" },
  { href: "/stats", label: "статистика" },
] as const;

export function SideNav() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  return (
    <nav className={styles.nav} aria-label="Навигация">
      <ul className={styles.list}>
        {links.map(({ href, label }) => {
          const isCurrent =
            href === "/"
              ? pathname === "/" || pathname.startsWith("/orders")
              : pathname.startsWith(href);

          return (
            <li key={href}>
              <Link
                href={href}
                className={
                  isCurrent ? `${styles.link} ${styles.linkActive}` : styles.link
                }
                aria-current={isCurrent ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      <form action={logoutAction} className={styles.logout}>
        <button type="submit" className={styles.link}>
          выход
        </button>
      </form>
    </nav>
  );
}
