import { getInventarization } from "@/lib/inventarizations-query";
import { EntityRow } from "../EntityRow/EntityRow";

interface InventarizationItemsListProps {
    inventarizationId: number;
    categoryId: number;
}

export default async function InventarizationItemsList({
    inventarizationId,
    categoryId,
}: InventarizationItemsListProps) {
    const inventarization = await getInventarization(inventarizationId, categoryId);

    if (!inventarization) {
        return <p>Инвентаризация не найдена</p>;
    }

    return (
        <div>
            <ul>
                {inventarization.items.map((item) => (
                    <li key={item.id}>
                        <EntityRow
                            title={item.product.name}
                            imageUrl={`https://storage.yandexcloud.net/mazurovbucket/${item.product.id}.jpg`}
                            badge={item.product.category.name}
                            cells={[
                                { label: "Количество", value: item.actualQty },
                                { label: "Комментарий", value: item.comment },
                            ]}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}
