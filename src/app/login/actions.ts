"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  createSessionToken,
  isAuthConfigured,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";

export type LoginState = {
  error?: string;
};

function safeNextPath(raw: FormDataEntryValue | null): string {
  const value = String(raw ?? "").trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return "/";
  }
  return value;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!isAuthConfigured()) {
    return {
      error: "Auth не настроен: задайте ADMIN_PASSWORD и SESSION_SECRET в .env",
    };
  }

  const password = String(formData.get("password") ?? "");
  if (!password) {
    return { error: "Введите пароль" };
  }

  if (!verifyPassword(password)) {
    return { error: "Неверный пароль" };
  }

  const token = createSessionToken();
  if (!token) {
    return { error: "Не удалось создать сессию" };
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, sessionCookieOptions());

  redirect(safeNextPath(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/login");
}
