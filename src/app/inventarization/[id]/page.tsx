import { getRootCategories } from "@/lib/categories";
import InventarizationItemsList from "@/components/InventarizationItemsList/InventarizationItemsList";
import RootCategoryNav from "@/components/RootCategoryNav/RootCategoryNav";
import { parseCategoryId } from "@/helpers/equipment";
import Link from "next/link";
import styles from "./page.module.css";

export default async function InventarizationPage({
    params,
    searchParams,
}: PageProps<"/inventarization/[id]">) {
    const { id } = await params;
    const parentCategories = await getRootCategories();
    const query = await searchParams;
    const categoryId = parseCategoryId(
        query.categoryId,
        parentCategories[0]?.id ?? 1,
    );

    return (
        <div className={styles.page}>
            <Link href="/inventarization">Назад к списку инвентаризаций</Link>
            <h1 className={styles.title}>Инвентаризация</h1>
            <RootCategoryNav
                categories={parentCategories}
                activeCategoryId={categoryId}
                hrefForCategory={(rootCategoryId) =>
                    `/inventarization/${id}?categoryId=${rootCategoryId}`
                }
            />
            <InventarizationItemsList
                inventarizationId={Number(id)}
                categoryId={categoryId}
            />
        </div>
    );
}
