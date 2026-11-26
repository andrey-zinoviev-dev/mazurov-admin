"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import Link from "next/link";
import styles from "./action-menu.module.css";

type ActionMenuContextValue = {
  close: () => void;
};

const ActionMenuContext = createContext<ActionMenuContextValue | null>(null);

function useActionMenuContext() {
  const ctx = useContext(ActionMenuContext);
  if (!ctx) {
    throw new Error("ActionMenuItem must be used inside ActionMenu");
  }
  return ctx;
}

function KebabIcon() {
  return (
    <svg
      className={styles.triggerIcon}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="1.6" fill="currentColor" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <circle cx="12" cy="19" r="1.6" fill="currentColor" />
    </svg>
  );
}

type ActionMenuProps = {
  children: ReactNode;
  label?: string;
};

export function ActionMenu({ children, label = "Действия" }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      const root = rootRef.current;
      if (!root) return;
      if (event.target instanceof Node && !root.contains(event.target)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <KebabIcon />
      </button>

      {open ? (
        <ActionMenuContext.Provider value={{ close }}>
          <ul id={menuId} className={styles.menu} role="menu" aria-label={label}>
            {children}
          </ul>
        </ActionMenuContext.Provider>
      ) : null}
    </div>
  );
}

export type ActionMenuItemProps = {
  children: ReactNode;
  tone?: "default" | "danger";
  href?: string;
  disabled?: boolean;
  onSelect?: () => void;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "onClick" | "type">;

export function ActionMenuItem({
  children,
  tone = "default",
  href,
  disabled,
  onSelect,
  ...rest
}: ActionMenuItemProps) {
  const { close } = useActionMenuContext();
  const className = [
    styles.item,
    tone === "danger" ? styles.itemDanger : "",
  ]
    .filter(Boolean)
    .join(" ");

  function handleSelect() {
    if (disabled) return;
    onSelect?.();
    close();
  }

  return (
    <li role="none">
      {href && !disabled ? (
        <Link
          href={href}
          role="menuitem"
          className={className}
          onClick={handleSelect}
        >
          {children}
        </Link>
      ) : (
        <button
          type="button"
          role="menuitem"
          className={className}
          disabled={disabled}
          onClick={handleSelect}
          {...rest}
        >
          {children}
        </button>
      )}
    </li>
  );
}
