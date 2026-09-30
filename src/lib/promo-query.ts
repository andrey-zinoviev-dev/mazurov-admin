import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/client";

export const promoListSelect = {
  id: true,
  code: true,
  discountType: true,
  discountValue: true,
  expiryDate: true,
  maxUses: true,
  maxUsesPerUser: true,
  timesUsed: true,
  isActive: true,
  createdAt: true,
} satisfies Prisma.PromoCodeSelect;

export type PromoListItem = Prisma.PromoCodeGetPayload<{
  select: typeof promoListSelect;
}>;

export async function getPromoCodes() {
  return prisma.promoCode.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: promoListSelect,
  });
}
