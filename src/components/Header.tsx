"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/login/actions";
import { OrdersSearch } from "./OrdersSearch";
import styles from "./header.module.css";

export function Header() {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  const isHome = pathname === "/";

  const logo = (
    <Image
      src="/logo.png"
      alt="Mazurov Rental Admin"
      className={styles.logo}
      width={44}
      height={44}
      priority
    />
  );

  return (
    <header className={styles.header}>
      <div className={isLogin ? styles.topLogin : styles.top}>
        <div className={styles.logoTitle}>
          {isHome || isLogin ? (
            logo
          ) : (
            <Link href="/" aria-label="На главную" className={styles.logoLink}>
              {logo}
            </Link>
          )}
        </div>

        {!isLogin ? (
          <div className={styles.main}>
            <OrdersSearch />
            <form className={styles.mobileLogout} action={logoutAction}>
              <button type="submit" className={styles.link}>
                [ выход ]
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </header>
  );
}
