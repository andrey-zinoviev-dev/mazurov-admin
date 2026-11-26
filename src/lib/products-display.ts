export function formatPrice(price: { toString(): string } | null | undefined): string {
    if(price == null) return "—";
    const num = Number(price.toString());
    if(isNaN(num)) return "—";
    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
    }).format(num);
}