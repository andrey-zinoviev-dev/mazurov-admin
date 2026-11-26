import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./entity-row.module.css";

export type EntityRowCell = {
    label: string;
    value: ReactNode;
};

export type EntityRowProps = {
    layout?: "media" | "plain",
    imageUrl?: string | null;
    title: string;
    subtitle?: ReactNode;
    badge?: ReactNode;
    cells: EntityRowCell[];
    actions?: ReactNode;
    href?: string;
};



export function EntityRow({
    layout,
    imageUrl,
    title,
    subtitle,
    badge,
    cells,
    actions,
    href,
}: EntityRowProps) {
    const media = imageUrl ? (
        <div className={styles.thumb}>
            <Image
                src={imageUrl}
                alt=""
                width={72}
                height={72}
                className={styles.thumbImage}
            />
        </div>
    ) : null;

    //swtich styles for layout
    const resolverLayout = layout ?? (imageUrl ? "media" : "plain");

    const identity = (
        <div className={styles.identity}>
            <div className={styles.titleRow}>
                <h3 className={styles.title}>{title}</h3>
                {badge == null || badge === false || badge === ""
                    ? null
                    : typeof badge === "string" || typeof badge === "number" ? (
                        <span className={styles.badge}>{badge}</span>
                    ) : (
                        badge
                    )}
            </div>
            {subtitle == null || subtitle === false || subtitle === "" ? null : (
                <p className={styles.subtitle}>{subtitle}</p>
            )}
        </div>
    );

    const meta = (
        <dl className={styles.cells}>
            {cells.map((cell) => (
                <div key={cell.label} className={styles.cell}>
                    <dt className={styles.cellLabel}>{cell.label}</dt>
                    <dd className={styles.cellValue}>{cell.value}</dd>
                </div>
            ))}
        </dl>
    );

    const body = (
        <>
            <div className={styles.lead}>
                {media}
                {identity}
            </div>
            {meta}
        </>
    );

    return (
        <article className={styles.row}>
            {href ? (
                <Link href={href} className={[styles.main, styles[resolverLayout]].join(" ")}>
                    {body}
                </Link>
            ) : (
                <div className={[styles.main, styles[resolverLayout]].join(" ")}>{body}</div>
            )}

            {actions != null ? (
                <div className={styles.actions}>{actions}</div>
            ) : null}
        </article>
    );
}
