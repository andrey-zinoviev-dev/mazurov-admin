import { formatMoney, formatOrderDate } from "@/lib/order-display";
import type { PromoDiscountType } from "@/generated/client";

export type PromoStatusTone = "done" | "cancelled" | "pending" | "neutral";

export type PromoStatusView = {
  label: string;
  tone: PromoStatusTone;
};

export function getPromoStatusView(
  isActive: boolean | null | undefined,
  expiryDate: Date | null | undefined,
  now = new Date(),
): PromoStatusView {
  if (isActive === false) {
    return { label: "Неактивен", tone: "cancelled" };
  }

  if (expiryDate) {
    const end = new Date(expiryDate);
    end.setHours(23, 59, 59, 999);
    if (end.getTime() < now.getTime()) {
      return { label: "Истёк", tone: "pending" };
    }
  }

  if (isActive === true || isActive == null) {
    return { label: "Активен", tone: "done" };
  }

  return { label: "Неактивен", tone: "cancelled" };
}

export function formatPromoDiscount(
  discountType: PromoDiscountType | null | undefined,
  discountValue: { toString(): string } | number | string,
): string {
  const num =
    typeof discountValue === "number"
      ? discountValue
      : Number(discountValue.toString());
  if (!Number.isFinite(num)) return "—";

  if (discountType === "fixed") {
    return `${formatMoney(num)} ₽`;
  }

  return `${num}%`;
}

export function formatPromoExpiry(expiryDate: Date | null | undefined): string {
  if (!expiryDate) return "бессрочный";
  return `до ${formatOrderDate(expiryDate)}`;
}

/** 0 = без ограничений; иначе факт / лимит или только лимит. */
export function formatPromoUses(
  timesUsed: number | null | undefined,
  maxUses: number | null | undefined,
): string {
  const used = timesUsed ?? 0;
  const max = maxUses ?? 0;
  if (max <= 0) return `${used} (без лимита)`;
  return `${used} / ${max}`;
}

export function formatPromoUsesPerUser(
  maxUsesPerUser: number | null | undefined,
): string {
  const max = maxUsesPerUser ?? 0;
  if (max <= 0) return "не ограничено";
  return String(max);
}
