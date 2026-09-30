import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { LoginForm } from "./LoginForm";
import styles from "./page.module.css";

function safeNextPath(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("://")
  ) {
    return "/";
  }
  return value;
}

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  if (await isAuthenticated()) {
    redirect("/");
  }

  const params = await searchParams;
  const nextPath = safeNextPath(params.next);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Вход</h1>
      </div>
      <LoginForm nextPath={nextPath} />
    </div>
  );
}
