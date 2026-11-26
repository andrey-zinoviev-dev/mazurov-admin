import { getProductById } from "@/lib/products-query";
import Link from "next/link";
import Image from "next/image";

export default async function EquipmentPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    // console.log(id);

    const product = await getProductById(Number(id));

    return (
        <div>
            <Link href={`/equipment`}>Назад к списку оборудования</Link>
            <h1>{product?.name}</h1>
            <p>ID: {product?.id}</p>
            <p>Категория: {product?.category?.parent?.name}</p>
            <p>Цена: {Number(product?.price)}</p>
            <p>Количество в наличии: {product?.stock}</p>
            <Image src={`https://storage.yandexcloud.net/mazurovbucket/${product?.id}.jpg`} alt={product?.name || ""} width={100} height={100} />
        </div>
    )
}