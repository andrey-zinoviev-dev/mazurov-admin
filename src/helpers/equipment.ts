export function parseCategoryId(rawSearch: string | string[] | undefined, fallback: number): number {
    const value = Array.isArray(rawSearch)
        ? rawSearch[0]
        : rawSearch;

    if(!value) return fallback;

    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : fallback;
}