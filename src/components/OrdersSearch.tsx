"use client";

import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import {
  Combobox,
  comboboxOptionStyles,
  type ComboboxStatus,
} from "./Combobox";
import {
  searchOrdersAction,
  type OrderSearchHit,
} from "./orders-search-actions";
import styles from "./orders-search.module.css";

const DEBOUNCE_MS = 300;

export function OrdersSearch() {
  const router = useRouter();
  const requestIdRef = useRef(0);

  const [query, setQuery] = useState("");
  const [items, setItems] = useState<OrderSearchHit[]>([]);
  const [status, setStatus] = useState<ComboboxStatus>("idle");

  const deferredQuery = useDeferredValue(query);
  const needle = deferredQuery.trim();

  useEffect(() => {
    if (!needle) {
      setItems([]);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    const requestId = ++requestIdRef.current;
    const timer = window.setTimeout(() => {
      void searchOrdersAction(needle).then((hits) => {
        if (requestId !== requestIdRef.current) return;
        setItems(hits);
        setStatus("ready");
      });
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [needle]);

  return (
    <Combobox
      className={styles.wrap}
      label="поиск заказа"
      placeholder="найти по телефону, номеру заказа"
      listAriaLabel="Результаты поиска заказов"
      iconTrigger
      query={query}
      onQueryChange={setQuery}
      items={items}
      status={status}
      getItemId={(order) => order.id}
      onSelect={(order) => {
        setQuery("");
        setItems([]);
        setStatus("idle");
        router.push(`/orders/${order.id}`);
      }}
      onCancel={() => {
        setItems([]);
        setStatus("idle");
      }}
      renderItem={(order) => (
        <>
          <span className={comboboxOptionStyles.top}>
            <span className={comboboxOptionStyles.name}>
              Заказ {order.orderNumber}
            </span>
            <span
              className={comboboxOptionStyles.status}
              data-tone={order.statusTone}
            >
              {order.statusLabel}
            </span>
          </span>
          <span className={comboboxOptionStyles.meta}>
            {order.secondary} · {order.totalLabel}
          </span>
        </>
      )}
    />
  );
}
