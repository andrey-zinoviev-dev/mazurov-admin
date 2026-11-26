import Link from "next/link";
import { getInventarizations } from "@/lib/inventarizations-query";
import { EntityRow } from "@/components/EntityRow/EntityRow";

export default async function Inventarization () {
    const inventarizations = await getInventarizations();

    return (
        <>
            <Link href={`/`}>Назад к главной</Link>
            <h1>Инвентаризация</h1>
            <button>Создать инвентаризацию</button>
            {inventarizations.length > 0 ? <ul>
                {inventarizations.map((inventarization) => {
                    return <li key={inventarization.id}>{
                        <EntityRow href={`/inventarization/${inventarization.id}`} title={`Инвентаризация ${inventarization.date.toLocaleDateString()}`} cells={[
                            {
                                label: "Ответственный",
                                value: inventarization.inspector,
                            },
                            {
                                label: "Статус",
                                value: inventarization.status,
                            },
                            {
                                label: "Дата",
                                value: inventarization.date.toLocaleDateString(),
                            },
                        ]}></EntityRow>
                    }</li>
                })}
            </ul> : <p>Нет инвентаризаций</p>}
        </>
        
    )
}