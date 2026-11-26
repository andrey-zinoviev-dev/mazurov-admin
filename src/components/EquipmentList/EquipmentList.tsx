import { getProductsByCategoryId } from "@/lib/products-query";
import { EntityRow } from "../EntityRow/EntityRow";
import { formatPrice } from "@/lib/products-display";
import {
    ActionMenu,
    ActionMenuItem,
} from "../ActionMenu/ActionMenu";
import RowActions from "../RowActions/RowActions";

interface EquipmentListProps {
    categoryId: number;
}

export default async function EquipmentList({ categoryId }: EquipmentListProps) {
    const products = await getProductsByCategoryId(categoryId);

    return (
        <div>
            <ul>
                {products.map((product) => {
                    const price = formatPrice(product.price);
                    return (
                        <li key={product.id}>
                            <EntityRow
                                imageUrl={`https://storage.yandexcloud.net/mazurovbucket/${product.id}.jpg`}
                                href={`/equipment/${product.id}`}
                                title={product.name}
                                badge={product.category.name}
                                cells={[
                                    { label: "Комплектация", value: `Карта SD` },
                                    { label: "Цена", value: price },
                                    { label: "Количество в наличии", value: product.stock },
                                ]}
                                actions={
                                    <RowActions actions={[
                                        {
                                            label: "Удалить товар",
                                            tone: "danger",
                                            opensDrawer: true,
                                        },
                                    ]} />
                                }
                            />
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}