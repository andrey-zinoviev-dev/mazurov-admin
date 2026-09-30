export type EstimateSectionKey = "tech" | "personnel" | "admin";

export type EstimateLine = {
  name: string;
  days: number;
  quantity: number;
  pricePerDay: number;
  sum: number;
};

export type EstimateCategoryGroup = {
  title: string;
  lines: EstimateLine[];
  subtotal: number;
};

export type EstimateSection = {
  key: EstimateSectionKey;
  title: string;
  totalLabel: string;
  categories: EstimateCategoryGroup[];
  subtotal: number;
};

export type EstimateDoc = {
  orderNumber: number;
  contractor: string;
  client: string | null;
  project: string | null;
  orderDates: string | null;
  deliveryMethod: string | null;
  sections: EstimateSection[];
  techSum: number;
  hasDiscount: boolean;
  discountPercent: number;
  discountAmount: number;
  staffAndAdminSum: number;
  grandTotal: number;
  bankPercent: number;
  bankTotal: number;
  fileName: string;
};

export type EstimateOrderInput = {
  orderNumber: number;
  clientName: string | null;
  userName: string | null;
  dates: string | null;
  createdAt: Date | null;
  deliveryMethod: string | null;
  promoCode: string | null;
  promoRejected: boolean | null;
  promoDiscountPercent: number | null;
  items: Array<{
    productName: string;
    category: string | null;
    quantity: number;
    pricePerDay: { toString(): string } | number | string;
    daysCount: number | null;
    totalPrice: { toString(): string } | number | string;
  }>;
};

const CONTRACTOR = "ИП Мазуров А.В.";
const BANK_PERCENT = 9;

const SECTION_META: Record<
  EstimateSectionKey,
  { title: string; totalLabel: string }
> = {
  tech: {
    title: "ТЕХНИКА",
    totalLabel: "Итого техника",
  },
  personnel: {
    title: "ПЕРСОНАЛ",
    totalLabel: "Итого персонал",
  },
  admin: {
    title: "АДМИНИСТРАТИВНЫЕ РАСХОДЫ",
    totalLabel: "Итого административные расходы",
  },
};

const SECTION_ORDER: EstimateSectionKey[] = ["tech", "personnel", "admin"];

function toNumber(value: { toString(): string } | number | string): number {
  const num = typeof value === "number" ? value : Number(value.toString());
  return Number.isFinite(num) ? num : 0;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalizeHaystack(category: string | null, productName: string): string {
  return `${category ?? ""} ${productName}`.toLowerCase();
}

/** Доставка → админ, Механик → персонал, всё остальное → техника. */
export function classifyEstimateItem(
  category: string | null,
  productName: string,
): EstimateSectionKey {
  const hay = normalizeHaystack(category, productName);
  if (hay.includes("доставка")) return "admin";
  if (hay.includes("механик")) return "personnel";
  return "tech";
}

function categoryTitle(category: string | null): string {
  const trimmed = (category ?? "").trim();
  return trimmed || "Прочее";
}

function sanitizeFilePart(value: string): string {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 60);
}

function buildFileName(orderNumber: number, client: string | null, year: number): string {
  const who = client ? sanitizeFilePart(client) : "заказ";
  return `смета_${orderNumber}_${year}_${who}.pdf`;
}

/** pickup / delivery → русская подпись для шапки сметы. */
export function formatDeliveryMethod(value: string | null | undefined): string | null {
  const raw = (value ?? "").trim();
  if (!raw) return null;

  const key = raw.toLowerCase();
  if (key === "pickup" || key === "self" || key === "самовывоз") {
    return "Самовывоз";
  }
  if (key === "delivery" || key === "доставка") {
    return "Доставка";
  }

  return raw;
}

export function formatEstimateMoney(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function buildEstimateDoc(order: EstimateOrderInput): EstimateDoc {
  const client =
    (order.clientName ?? "").trim() ||
    (order.userName ?? "").trim() ||
    null;

  const orderDates =
    (order.dates ?? "").trim() ||
    (order.createdAt
      ? order.createdAt.toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : null);

  type Bucket = Map<string, EstimateLine[]>;
  const buckets: Record<EstimateSectionKey, Bucket> = {
    tech: new Map(),
    personnel: new Map(),
    admin: new Map(),
  };

  for (const item of order.items) {
    const section = classifyEstimateItem(item.category, item.productName);
    const title = categoryTitle(item.category);
    const days = item.daysCount ?? 1;
    const quantity = item.quantity;
    const pricePerDay = toNumber(item.pricePerDay);
    const sum = roundMoney(toNumber(item.totalPrice));

    const lines = buckets[section].get(title) ?? [];
    lines.push({
      name: item.productName,
      days,
      quantity,
      pricePerDay,
      sum,
    });
    buckets[section].set(title, lines);
  }

  const sections: EstimateSection[] = [];

  for (const key of SECTION_ORDER) {
    const categories: EstimateCategoryGroup[] = [];
    for (const [title, lines] of buckets[key]) {
      if (lines.length === 0) continue;
      const subtotal = roundMoney(lines.reduce((acc, line) => acc + line.sum, 0));
      categories.push({ title, lines, subtotal });
    }
    if (categories.length === 0) continue;

    const subtotal = roundMoney(
      categories.reduce((acc, group) => acc + group.subtotal, 0),
    );
    const meta = SECTION_META[key];
    sections.push({
      key,
      title: meta.title,
      totalLabel: meta.totalLabel,
      categories,
      subtotal,
    });
  }

  const techSum =
    sections.find((section) => section.key === "tech")?.subtotal ?? 0;
  const staffAndAdminSum = roundMoney(
    (sections.find((section) => section.key === "personnel")?.subtotal ?? 0) +
      (sections.find((section) => section.key === "admin")?.subtotal ?? 0),
  );

  const promoCode = (order.promoCode ?? "").trim();
  const promoRejected = order.promoRejected === true;
  const rawPercent = Math.max(0, order.promoDiscountPercent ?? 0);
  const hasDiscount = Boolean(promoCode) && !promoRejected && rawPercent > 0;

  const discountPercent = hasDiscount ? rawPercent : 0;
  const discountAmount = hasDiscount
    ? roundMoney((techSum * discountPercent) / 100)
    : 0;
  const grandTotal = roundMoney(techSum - discountAmount + staffAndAdminSum);
  const bankTotal =
    BANK_PERCENT > 0
      ? Math.round(grandTotal / (1 - BANK_PERCENT / 100))
      : grandTotal;

  const year = order.createdAt?.getFullYear() ?? new Date().getFullYear();

  return {
    orderNumber: order.orderNumber,
    contractor: CONTRACTOR,
    client,
    project: null,
    orderDates,
    deliveryMethod: formatDeliveryMethod(order.deliveryMethod),
    sections,
    techSum,
    hasDiscount,
    discountPercent,
    discountAmount,
    staffAndAdminSum,
    grandTotal,
    bankPercent: BANK_PERCENT,
    bankTotal,
    fileName: buildFileName(order.orderNumber, client, year),
  };
}
