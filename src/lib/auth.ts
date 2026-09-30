import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE = "admin_session";

/** 14 дней */
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 14;

function getSessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET?.trim();
  return secret ? secret : null;
}

function getAdminPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  // пустая строка = не настроено
  if (password == null || password === "") return null;
  return password;
}

export function isAuthConfigured(): boolean {
  return Boolean(getSessionSecret() && getAdminPassword());
}

/** Сравнение через SHA-256 + timingSafeEqual, без хранения хеша пароля. */
export function verifyPassword(input: string): boolean {
  const expected = getAdminPassword();
  if (expected == null) return false;

  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(now = Date.now()): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;

  const exp = now + SESSION_MAX_AGE_SEC * 1000;
  const payload = `v1.${exp}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;

  const secret = getSessionSecret();
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [version, expStr, signature] = parts;
  if (version !== "v1" || !expStr || !signature) return false;

  const payload = `${version}.${expStr}`;
  const expected = sign(payload, secret);

  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }

  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;

  return true;
}

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE_SEC) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function isAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

/** Для server actions и страниц: без сессии — на /login. */
export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
}
