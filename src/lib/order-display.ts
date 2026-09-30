export type OrderStatusTone = "done" | "pending" | "cancelled" | "active" | "neutral";

export type OrderStatusView = {
  label: string;
  tone: OrderStatusTone;
};

const STATUS_BY_CODE: Record<string, OrderStatusView> = {
  COMPLETED: { label: "Выполнен", tone: "done" },
  PENDING: { label: "Ожидает оплаты", tone: "pending" },
  CONFIRMED: { label: "Подтвержден", tone: "active" },
  IN_PROGRESS: { label: "Выдан", tone: "active" },
  REJECTED: { label: "Отменен", tone: "cancelled" },
  CANCELLED: { label: "Отменен", tone: "cancelled" },
  CANCELED: { label: "Отменен", tone: "cancelled" },
};

/** UI-статус по `status_code` (как на макете истории заказов). */
export function getOrderStatusView(
  statusCode: string | null | undefined,
  fallbackStatus?: string | null,
): OrderStatusView {
  const code = (statusCode ?? "").trim().toUpperCase();
  if (code && STATUS_BY_CODE[code]) {
    return STATUS_BY_CODE[code];
  }

  const cleaned = (fallbackStatus ?? "")
    .replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s⏳✅❌🔄🎉]+/u, "")
    .trim();

  if (cleaned) {
    return { label: cleaned, tone: "neutral" };
  }

  return { label: "Неизвестно", tone: "neutral" };
}

export function formatOrderDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatMoney(value: { toString(): string } | number | string): string {
  const num = typeof value === "number" ? value : Number(value.toString());
  if (!Number.isFinite(num)) return "—";
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(num);
}

/** 1 день / 2 дня / 5 дней */
export function formatDayCount(days: number | null | undefined): string {
  const n = days ?? 1;
  const mod10 = n % 10;
  const mod100 = n % 100;
  let word = "дней";
  if (mod100 < 11 || mod100 > 14) {
    if (mod10 === 1) word = "день";
    else if (mod10 >= 2 && mod10 <= 4) word = "дня";
  }
  return `${n} ${word}`;
}

export function formatRentalPeriod(
  days: number | null | undefined,
  dates: string | null | undefined,
): string {
  const period = formatDayCount(days);
  const range = (dates ?? "").trim();
  if (!range) return period;
  return `${period} (${range})`;
}
