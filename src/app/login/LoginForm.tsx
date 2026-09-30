"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";
import styles from "./page.module.css";

const initialState: LoginState = {};

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form className={styles.form} action={action}>
      <input type="hidden" name="next" value={nextPath} />
      <label className={styles.field}>
        <span className={styles.label}>пароль</span>
        <input
          className={styles.input}
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
        />
      </label>

      <div className={styles.actions}>
        <button className={styles.submit} type="submit" disabled={pending}>
          {pending ? "вход…" : "войти"}
        </button>
        {state.error ? <p className={styles.error}>{state.error}</p> : null}
      </div>
    </form>
  );
}
