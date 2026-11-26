import Link from "next/link";
import styles from "./root-category-nav.module.css";

type RootCategory = {
    id: number;
    name: string;
};

interface RootCategoryNavProps {
    categories: RootCategory[];
    activeCategoryId: number;
    hrefForCategory: (categoryId: number) => string;
}

export default function RootCategoryNav({
    categories,
    activeCategoryId,
    hrefForCategory,
}: RootCategoryNavProps) {
    return (
        <ul className={styles.categories}>
            {categories.map((category) => {
                const isActive = category.id === activeCategoryId;
                return (
                    <li key={category.id}>
                        <Link
                            href={hrefForCategory(category.id)}
                            className={[
                                styles.categoryLink,
                                isActive ? styles.categoryLinkActive : "",
                            ].filter(Boolean).join(" ")}
                            aria-current={isActive ? "page" : undefined}
                        >
                            {category.name}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
