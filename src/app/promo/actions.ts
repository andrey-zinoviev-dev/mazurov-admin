"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  PromoDiscountType,
  PromoOrderLimit,
  PromoUsageType,
} from "@/generated/client";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type CreatePromoState = {
  error?: string;
};

function parseNonNegInt(raw: FormDataEntryValue | null, label: string): number | { error: string } {
  const value = Number(String(raw ?? "").trim());
  if (!Number.isInteger(value) || value < 0) {
    return { error: `${label} — целое число ≥ 0` };
  }
  return value;
}

export async function createPromoCode(
  _prev: CreatePromoState,
  formData: FormData,
): Promise<CreatePromoState> {
  await requireAuth();

  const code = String(formData.get("code") ?? "")
    .trim()
    .toUpperCase();
  if (!code) {
    return { error: "Укажите код промокода" };
  }
  if (code.length > 50) {
    return { error: "Код промокода не длиннее 50 символов" };
  }

  const discountTypeRaw = String(formData.get("discountType") ?? "percent");
  if (
    discountTypeRaw !== PromoDiscountType.percent &&
    discountTypeRaw !== PromoDiscountType.fixed
  ) {
    return { error: "Некорректный тип скидки" };
  }
  const discountType = discountTypeRaw;

  const discountValue = Number(String(formData.get("discountValue") ?? "").trim());
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    return { error: "Значение скидки должно быть больше 0" };
  }
  if (discountType === PromoDiscountType.percent && discountValue > 100) {
    return { error: "Процент скидки не может быть больше 100" };
  }

  const usageTypeRaw = String(formData.get("usageType") ?? "one_time");
  if (
    usageTypeRaw !== PromoUsageType.one_time &&
    usageTypeRaw !== PromoUsageType.multi
  ) {
    return { error: "Некорректный тип использования" };
  }

  const orderLimitRaw = String(formData.get("orderLimit") ?? "first_only");
  if (
    orderLimitRaw !== PromoOrderLimit.first_only &&
    orderLimitRaw !== PromoOrderLimit.any
  ) {
    return { error: "Некорректное ограничение по заказам" };
  }

  const validityType = String(formData.get("validityType") ?? "forever");
  let expiryDate: Date | null = null;
  if (validityType === "until_date") {
    const validUntil = String(formData.get("validUntil") ?? "").trim();
    if (!validUntil) {
      return { error: "Укажите дату окончания срока действия" };
    }
    const parsed = new Date(`${validUntil}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
      return { error: "Некорректная дата окончания" };
    }
    expiryDate = parsed;
  } else if (validityType !== "forever") {
    return { error: "Некорректный срок действия" };
  }

  const maxUses = parseNonNegInt(formData.get("maxUses"), "Макс. всего использований");
  if (typeof maxUses === "object") return maxUses;

  const maxUsesPerUser = parseNonNegInt(
    formData.get("maxUsesPerUser"),
    "Макс. использований на пользователя",
  );
  if (typeof maxUsesPerUser === "object") return maxUsesPerUser;

  const existing = await prisma.promoCode.findUnique({
    where: { code },
    select: { id: true },
  });
  if (existing) {
    return { error: `Промокод «${code}» уже существует` };
  }

  try {
    await prisma.promoCode.create({
      data: {
        code,
        discountType,
        discountValue,
        usageType: usageTypeRaw,
        orderLimit: orderLimitRaw,
        expiryDate,
        maxUses,
        maxUsesPerUser,
        timesUsed: 0,
        isActive: true,
      },
    });
  } catch {
    return { error: "Не удалось создать промокод" };
  }

  revalidatePath("/promo");
  redirect("/promo");
}
