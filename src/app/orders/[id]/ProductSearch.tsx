"use client";

import { useDeferredValue, useMemo, useState } from "react";
import {
  Combobox,
  comboboxOptionStyles,
} from "@/components/Combobox";

export type SearchableProduct = {
  id: number;
  name: string;
  price: string;
  category: string;
};

type Props = {
  products: SearchableProduct[];
  value: SearchableProduct | null;
  onChange: (product: SearchableProduct | null) => void;
  disabled?: boolean;
};

const MAX_RESULTS = 12;

export function ProductSearch({ products, value, onChange, disabled }: Props) {
  const [query, setQuery] = useState(value?.name ?? "");
  const deferredQuery = useDeferredValue(query);

  const items = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    if (!needle) return [];

    return products
      .filter((product) => product.name.toLowerCase().includes(needle))
      .slice(0, MAX_RESULTS);
  }, [deferredQuery, products]);

  return (
    <Combobox
      label="товар"
      placeholder="начните вводить название…"
      listAriaLabel="Результаты поиска товаров"
      disabled={disabled}
      query={query}
      onQueryChange={(next) => {
        setQuery(next);
        if (value && next !== value.name) {
          onChange(null);
        }
      }}
      items={items}
      status="ready"
      getItemId={(product) => String(product.id)}
      onSelect={(product) => {
        onChange(product);
        setQuery(product.name);
      }}
      onCancel={() => {
        onChange(null);
      }}
      renderItem={(product) => (
        <>
          <span className={comboboxOptionStyles.name}>{product.name}</span>
          <span className={comboboxOptionStyles.meta}>
            {product.category} · {product.price} ₽/день
          </span>
        </>
      )}
    />
  );
}
