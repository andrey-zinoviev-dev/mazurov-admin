"use client";

import { usePathname } from "next/navigation";
import { Container } from "@/components/Container";
import { Header } from "@/components/Header";
import { MobileTabBar } from "@/components/MobileTabBar";
import { SideNav } from "@/components/SideNav";
import styles from "./app-shell.module.css";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  return (
    <>
      <Container>
        <Header />
        {isLogin ? (
          children
        ) : (
          <div className={styles.layout}>
            <SideNav />
            <div className={styles.content}>{children}</div>
          </div>
        )}
      </Container>
      <MobileTabBar />
    </>
  );
}
