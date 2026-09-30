"use client";

import { useActionState, useState } from "react";
import { createPromoCode, type CreatePromoState } from "../actions";
import styles from "./page.module.css";

type ValidityType = "forever" | "until_date";

const initialState: CreatePromoState = {};

function PromoFormFields({
  action,
  pending,
}: {
  action: (payload: FormData) => void;
  pending: boolean;
}) {
  const [validityType, setValidityType] = useState<ValidityType>("forever");

  return (
    <form className={styles.form} action={action} noValidate>
      <label className={`${styles.field} ${styles.fieldWide}`}>
        <span className={styles.label}>код промокода</span>
        <input
          className={styles.input}
          name="code"
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="SUMMER25"
          maxLength={50}
          required
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>тип скидки</span>
        <select
          className={styles.select}
          name="discountType"
          defaultValue="percent"
        >
          <option value="percent">процент</option>
          <option value="fixed">фиксированная сумма</option>
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>значение скидки</span>
        <input
          className={styles.input}
          name="discountValue"
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          placeholder="10"
          required
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>тип использования</span>
        <select
          className={styles.select}
          name="usageType"
          defaultValue="one_time"
        >
          <option value="one_time">одноразовый</option>
          <option value="multi">многоразовый</option>
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>ограничение по заказам</span>
        <select
          className={styles.select}
          name="orderLimit"
          defaultValue="first_only"
        >
          <option value="first_only">только на один заказ</option>
          <option value="any">на любой заказ</option>
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>срок действия</span>
        <select
          className={styles.select}
          name="validityType"
          value={validityType}
          onChange={(event) =>
            setValidityType(event.target.value as ValidityType)
          }
        >
          <option value="forever">бессрочный</option>
          <option value="until_date">до определенной даты</option>
        </select>
      </label>

      {validityType === "until_date" ? (
        <label className={styles.field}>
          <span className={styles.label}>действует до</span>
          <input
            className={styles.input}
            name="validUntil"
            type="date"
            required
          />
        </label>
      ) : null}

      <label className={styles.field}>
        <span className={styles.label}>макс. всего использований</span>
        <input
          className={styles.input}
          name="maxUses"
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          defaultValue={0}
        />
        <span className={styles.hint}>0 = без ограничений</span>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>макс. использований на пользователя</span>
        <input
          className={styles.input}
          name="maxUsesPerUser"
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          defaultValue={0}
        />
        <span className={styles.hint}>0 = не ограничено</span>
      </label>

      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={pending}>
          {pending ? "создаю…" : "создать промокод"}
        </button>
      </div>
    </form>
  );
}

export function PromoForm() {
  const [state, action, pending] = useActionState(createPromoCode, initialState);

  return (
    <div>
      <PromoFormFields action={action} pending={pending} />
      {state.error ? <p className={styles.error}>{state.error}</p> : null}
    </div>
  );
}
