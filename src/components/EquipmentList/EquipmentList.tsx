import { getProductsByCategoryId } from "@/lib/products";

interface EquipmentListProps {
    categoryId: number;
}

export default async function EquipmentList({ categoryId }: EquipmentListProps) {
    const products = await getProductsByCategoryId(categoryId);

    return (
        <div>
            <h1>Equipment List</h1>
            <ul>
                {products.map((product) => (
                    <li key={product.id}>
                        <h3>{product.name}</h3>
                    </li>
                ))}
            </ul>
        </div>
    )
}