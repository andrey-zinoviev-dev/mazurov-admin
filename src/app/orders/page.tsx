import { getAllOrders } from "@/lib/orders-query";
import { EntityRow } from "@/components/EntityRow/EntityRow";
import { formatItemsInOrderPreview, formatOrderDate, formatRentalPeriod, getOrderStatusView } from "@/lib/order-display";
// import { ActionMenu, ActionMenuItem } from "@/components/ActionMenu/ActionMenu";
import RowActions from "@/components/RowActions/RowActions";
export default async function Orders() {
    const orders = await getAllOrders();

    return (
        <>
            <h1>Все заказы</h1>
            <ul>
                {orders.map((order) => {
                    const orderDate = formatOrderDate(order.createdAt);
                    const bookedDates = formatRentalPeriod(order.days, order.dates);
                    const status = getOrderStatusView(order.statusCode);
                    const { visible, hiddenCount } = formatItemsInOrderPreview(order.items, 2);
                    return <li key={order.id}>
                        <EntityRow href={`/orders/${order.id}`} title={`Заказ ${order.id}`} subtitle={orderDate} cells={[
                            {
                                label: "Товары в заказе",
                                value: 
                                    <>
                                        <ul>
                                            {visible.map((item) => {
                                                return <li key={item.productId}>
                                                    <span>{item.productName}</span>
                                                </li>
                                            })}
                                        </ul>
                                        <span>
                                            +{hiddenCount} товара
                                        </span>
                                    </>
                            },
                            {
                                label: "Срок аренды",
                                value: <span>{bookedDates}</span>
                            },
                            {
                                label: "Сатус заказа",
                                value: <span>{status.label}</span>
                            },
                        ]} actions={
                            <RowActions actions={[
                                {
                                    label: "Изменить статус заказа",
                                    opensDrawer: true,
                                },
                                {
                                    label: "Удалить",
                                    tone: "danger",
                                    opensDrawer: true,
                                }
                            ]} />
                        }/>
                    </li>
                })}
            </ul>
        </>

    )
}