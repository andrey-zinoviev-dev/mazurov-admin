import { getRootCategories } from "@/lib/categories";
import EquipmentList from "@/components/EquipmentList/EquipmentList";
import RootCategoryNav from "@/components/RootCategoryNav/RootCategoryNav";
import { parseCategoryId } from "@/helpers/equipment";
import styles from "./page.module.css";

export default async function EquipmentPage({ searchParams }: PageProps<"/equipment">) {
    const parentCategories = await getRootCategories();
    const params = await searchParams;
    const categoryId = parseCategoryId(params.categoryId, 1);

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Учет оборудования</h1>
            <RootCategoryNav
                categories={parentCategories}
                activeCategoryId={categoryId}
                hrefForCategory={(id) => `/equipment?categoryId=${id}`}
            />
            <EquipmentList categoryId={categoryId} />
        </div>
    );
}
