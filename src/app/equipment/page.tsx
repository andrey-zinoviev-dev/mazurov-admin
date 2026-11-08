import { getRootCategories } from "@/lib/categories";
import EquipmentList from "@/components/EquipmentList/EquipmentList";
import Link from "next/link";
import { parseCategoryId } from "@/helpers/equipment";

export default async function EquipmentPage({ searchParams }: PageProps<"/equipment">) {
    const parentCategories = (await getRootCategories());
    const params = await searchParams;
    const categoryId = parseCategoryId(params.categoryId, 1);

    return (
        <>
            <h1>Учет оборудования</h1>
            <ul>
                {parentCategories.map((category) => {
                    return <li key={category.id}>
                        <Link href={`/equipment?categoryId=${category.id}`}>{category.name}</Link>
                    </li>
                })}
            </ul>
            <EquipmentList categoryId={categoryId} />
        </>
    )
}