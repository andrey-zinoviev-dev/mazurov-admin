"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { formatMoney, type OrderStatusTone } from "@/lib/order-display";
import { saveOrderChanges } from "./actions";
import { ProductSearch, type SearchableProduct } from "./ProductSearch";
import styles from "./page.module.css";

export type ProductOption = SearchableProduct;

export type OrderItemView = {
  key: string;
  productName: string;
  category: string | null;
  quantity: number;
  pricePerDay: string;
  daysCount: number;
  totalPrice: string;
  isDraft?: boolean;
};

type DraftItem = OrderItemView & {
  productId: number;
};

type Props = {
  orderId: string;
  orderNumber: number;
  statusLabel: string;
  statusTone: OrderStatusTone;
  orderDate: string;
  rentalPeriod: string;
  days: number;
  initialTotal: string;
  initialItems: OrderItemView[];
  products: ProductOption[];
};

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function OrderEditor({
  orderId,
  orderNumber,
  statusLabel,
  statusTone,
  orderDate,
  rentalPeriod,
  days,
  initialTotal,
  initialItems,
  products,
}: Props) {
  const [open, setOpen] = useState(false);
  const [searchKey, setSearchKey] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<SearchableProduct | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [addError, setAddError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savePending, startSaveTransition] = useTransition();

  const items = useMemo(
    () => [...initialItems, ...draftItems],
    [initialItems, draftItems],
  );

  const displayTotal = useMemo(() => {
    const draftSum = draftItems.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0,
    );
    return roundMoney(Number(initialTotal) + draftSum);
  }, [draftItems, initialTotal]);

  const hasChanges = draftItems.length > 0;

  function resetAddForm() {
    setSelectedProduct(null);
    setQuantity(1);
    setAddError(null);
    setSearchKey((key) => key + 1);
  }

  function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddError(null);

    if (!selectedProduct) {
      setAddError("Выберите товар из поиска");
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      setAddError("Количество от 1 до 99");
      return;
    }

    const pricePerDay = Number(selectedProduct.price);
    const totalPrice = roundMoney(pricePerDay * quantity * days);

    setDraftItems((prev) => [
      ...prev,
      {
        key: `draft-${selectedProduct.id}-${prev.length}-${Date.now()}`,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        category: selectedProduct.category,
        quantity,
        pricePerDay: selectedProduct.price,
        daysCount: days,
        totalPrice: String(totalPrice),
        isDraft: true,
      },
    ]);

    resetAddForm();
    setOpen(false);
  }

  function handleSave(formData: FormData) {
    setSaveError(null);
    startSaveTransition(async () => {
      const result = await saveOrderChanges({}, formData);
      if (result.ok) {
        setDraftItems([]);
        setOpen(false);
        resetAddForm();
        return;
      }
      setSaveError(result.error ?? "Не удалось сохранить");
    });
  }

  return (
    <div className={styles.page}>
      <div className={styles.summary}>
        <div className={styles.itemTop}>
          <div className={styles.heading}>
            <Link href="/" className={styles.backLink}>
              ← все заказы
            </Link>
            <h1 className={styles.orderTitle}>Заказ {orderNumber}</h1>
          </div>
          <p className={styles.status} data-tone={statusTone}>
            <span className={styles.statusDot} aria-hidden />
            {statusLabel}
          </p>
        </div>

        <dl className={styles.meta}>
          <div className={styles.metaRow}>
            <dt>Дата заказа:</dt>
            <dd>{orderDate}</dd>
          </div>
          <div className={styles.metaRow}>
            <dt>Срок аренды:</dt>
            <dd>{rentalPeriod}</dd>
          </div>
          <div className={styles.metaRow}>
            <dt>Итого:</dt>
            <dd className={styles.total}>{formatMoney(displayTotal)}</dd>
          </div>
        </dl>

        <a
          className={styles.pdfLink}
          href={`/orders/${orderId}/estimate.pdf`}
          target="_blank"
          rel="noopener noreferrer"
        >
          скачать смету PDF
        </a>
      </div>

      <section className={styles.itemsSection} aria-labelledby="order-items-heading">
        <div className={styles.itemsHeader}>
          <h2 id="order-items-heading" className={styles.itemsTitle}>
            товары
          </h2>
          {products.length === 0 ? (
            <button type="button" className={styles.addButton} disabled>
              нет товаров
            </button>
          ) : (
            <button
              type="button"
              className={styles.addButton}
              aria-expanded={open}
              onClick={() => {
                setOpen((value) => {
                  const next = !value;
                  if (!next) resetAddForm();
                  return next;
                });
              }}
            >
              {open ? "закрыть" : "добавить товар"}
            </button>
          )}
        </div>

        {open && products.length > 0 ? (
          <div className={styles.addPanel}>
            <form onSubmit={handleAdd} className={styles.addForm}>
              <ProductSearch
                key={searchKey}
                products={products}
                value={selectedProduct}
                onChange={setSelectedProduct}
              />

              <label className={styles.addField}>
                <span className={styles.addLabel}>кол-во</span>
                <input
                  className={styles.addInput}
                  type="number"
                  name="quantity"
                  min={1}
                  max={99}
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  required
                />
              </label>

              <button type="submit" className={styles.addButton}>
                добавить
              </button>
            </form>

            {addError ? <p className={styles.addError}>{addError}</p> : null}
          </div>
        ) : null}

        {items.length === 0 ? (
          <p className={styles.empty}>в заказе пока нет товаров</p>
        ) : (
          <ul className={styles.itemsList}>
            {items.map((item) => (
              <li
                key={item.key}
                className={styles.itemRow}
                data-draft={item.isDraft ? "true" : undefined}
              >
                <div className={styles.itemMain}>
                  <p className={styles.itemName}>
                    {item.productName}
                    {item.isDraft ? (
                      <span className={styles.draftMark}> новый</span>
                    ) : null}
                  </p>
                  {item.category ? (
                    <p className={styles.itemCategory}>{item.category}</p>
                  ) : null}
                </div>
                <dl className={styles.itemMeta}>
                  <div className={styles.itemMetaRow}>
                    <dt>кол-во</dt>
                    <dd>{item.quantity}</dd>
                  </div>
                  <div className={styles.itemMetaRow}>
                    <dt>цена / день</dt>
                    <dd>{formatMoney(item.pricePerDay)}</dd>
                  </div>
                  <div className={styles.itemMetaRow}>
                    <dt>дней</dt>
                    <dd>{item.daysCount}</dd>
                  </div>
                  <div className={styles.itemMetaRow}>
                    <dt>сумма</dt>
                    <dd className={styles.itemTotal}>{formatMoney(item.totalPrice)}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}

        <form action={handleSave} className={styles.saveBar}>
          <input type="hidden" name="orderId" value={orderId} />
          <input
            type="hidden"
            name="pendingItems"
            value={JSON.stringify(
              draftItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
              })),
            )}
          />
          <button
            type="submit"
            className={styles.saveButton}
            disabled={!hasChanges || savePending}
          >
            {savePending ? "сохраняю…" : "сохранить изменения"}
          </button>
          {saveError ? <p className={styles.addError}>{saveError}</p> : null}
        </form>
      </section>
    </div>
  );
}
