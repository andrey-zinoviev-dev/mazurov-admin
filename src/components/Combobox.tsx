"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import styles from "./combobox.module.css";

const MOBILE_MQ = "(max-width: 899px)";

export type ComboboxStatus = "idle" | "loading" | "ready";

type ComboboxProps<T> = {
  label: string;
  placeholder?: string;
  listAriaLabel?: string;
  disabled?: boolean;
  className?: string;
  query: string;
  onQueryChange: (query: string) => void;
  items: T[];
  getItemId: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  onSelect: (item: T) => void;
  /** Called when mobile cancel / clear closes the search. */
  onCancel?: () => void;
  /**
   * On mobile: search-icon button; tap opens a fullscreen sheet
   * (same pattern as mazurov-actual ProductSearch). Desktop keeps the input.
   */
  iconTrigger?: boolean;
  status?: ComboboxStatus;
  emptyHint?: string;
  loadingText?: string;
  emptyResultText?: string;
};

function subscribeMobile(onChange: () => void) {
  const mq = window.matchMedia(MOBILE_MQ);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_MQ).matches;
}

function getServerMobileSnapshot() {
  return false;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 4.5a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm8 14-3.2-3.2"
      />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.5 5.5 9 12l6.5 6.5"
      />
    </svg>
  );
}

export function Combobox<T>({
  label,
  placeholder = "поиск…",
  listAriaLabel = "Результаты поиска",
  disabled,
  className,
  query,
  onQueryChange,
  items,
  getItemId,
  renderItem,
  onSelect,
  onCancel,
  iconTrigger = false,
  status = "ready",
  emptyHint = "начните вводить…",
  loadingText = "ищу…",
  emptyResultText = "ничего не найдено",
}: ComboboxProps<T>) {
  const listId = useId();
  const inputId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getServerMobileSnapshot,
  );

  const [open, setOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const needle = query.trim();
  const sheetActive = iconTrigger && isMobile && sheetOpen;
  /** Legacy fullscreen for non-icon comboboxes (e.g. order product search). */
  const expanded = !iconTrigger && open && isMobile;
  const showList = sheetActive || expanded || (open && needle.length > 0);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!isMobile && sheetOpen) {
      setSheetOpen(false);
    }
  }, [isMobile, sheetOpen]);

  useEffect(() => {
    if (sheetActive || expanded) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [sheetActive, expanded]);

  useEffect(() => {
    if (!sheetActive && !expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => {
      document.body.style.overflow = previous;
      window.cancelAnimationFrame(id);
    };
  }, [sheetActive, expanded]);

  useEffect(() => {
    setActiveIndex(0);
  }, [items, query]);

  function closeSheet() {
    setSheetOpen(false);
    setOpen(false);
    onQueryChange("");
    onCancel?.();
    inputRef.current?.blur();
  }

  function cancelExpanded() {
    setOpen(false);
    onQueryChange("");
    onCancel?.();
    inputRef.current?.blur();
  }

  function selectItem(item: T) {
    setSheetOpen(false);
    setOpen(false);
    onSelect(item);
  }

  function handleQueryChange(next: string) {
    onQueryChange(next);
    setOpen(true);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      if (sheetActive) {
        closeSheet();
        return;
      }
      if (expanded) {
        cancelExpanded();
        return;
      }
      setOpen(false);
      return;
    }

    if (!showList || items.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % items.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + items.length) % items.length);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const item = items[activeIndex];
      if (item) selectItem(item);
    }
  }

  let listBody: ReactNode;
  if (!needle) {
    listBody = <li className={styles.empty}>{emptyHint}</li>;
  } else if (status === "loading") {
    listBody = <li className={styles.empty}>{loadingText}</li>;
  } else if (items.length === 0) {
    listBody = <li className={styles.empty}>{emptyResultText}</li>;
  } else {
    listBody = items.map((item, index) => {
      const id = getItemId(item);
      return (
        <li key={id} role="presentation">
          <button
            id={`${listId}-option-${id}`}
            type="button"
            role="option"
            aria-selected={index === activeIndex}
            className={styles.option}
            data-active={index === activeIndex ? "true" : undefined}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => selectItem(item)}
          >
            {renderItem(item)}
          </button>
        </li>
      );
    });
  }

  const activeId =
    showList && items[activeIndex]
      ? `${listId}-option-${getItemId(items[activeIndex])}`
      : undefined;

  const field = (
    <label className={styles.field} htmlFor={inputId}>
      <span className={styles.label}>{label}</span>
      <input
        ref={inputRef}
        id={inputId}
        className={styles.input}
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        placeholder={placeholder}
        value={query}
        disabled={disabled}
        autoComplete="off"
        enterKeyHint="search"
        spellCheck={false}
        onChange={(event) => handleQueryChange(event.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />
    </label>
  );

  const list =
    showList ? (
      <ul
        id={listId}
        className={styles.list}
        role="listbox"
        aria-label={listAriaLabel}
      >
        {listBody}
      </ul>
    ) : null;

  if (iconTrigger) {
    const sheetPortal =
      portalReady && sheetActive
        ? createPortal(
            <div
              className={styles.sheet}
              role="dialog"
              aria-modal="true"
              aria-label={label}
            >
              <div className={styles.sheetToolbar}>
                <button
                  type="button"
                  className={styles.sheetBack}
                  onClick={closeSheet}
                  aria-label="Закрыть поиск"
                >
                  <BackIcon />
                </button>
                {field}
              </div>
              {list}
            </div>,
            document.body,
          )
        : null;

    return (
      <div
        ref={rootRef}
        className={[styles.root, styles.iconMode, className]
          .filter(Boolean)
          .join(" ")}
      >
        <button
          type="button"
          className={styles.trigger}
          aria-label={label}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          disabled={disabled}
          onClick={() => setSheetOpen(true)}
        >
          <SearchIcon />
        </button>

        {!sheetActive ? (
          <div className={styles.shell}>
            <div className={styles.top}>{field}</div>
            {list}
          </div>
        ) : null}

        {sheetPortal}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-expanded={expanded ? "true" : undefined}
    >
      <div className={styles.top}>
        {field}
        {expanded ? (
          <button type="button" className={styles.cancel} onClick={cancelExpanded}>
            [ отмена ]
          </button>
        ) : null}
      </div>
      {list}
    </div>
  );
}

/** Shared option layout helpers for consumers. */
export const comboboxOptionStyles = {
  top: styles.optionTop,
  name: styles.optionName,
  meta: styles.optionMeta,
  status: styles.optionStatus,
};
