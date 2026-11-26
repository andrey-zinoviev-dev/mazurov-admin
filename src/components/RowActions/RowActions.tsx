"use client";

import { useState } from "react";
import { ActionMenu, ActionMenuItem } from "../ActionMenu/ActionMenu";
import Drawer from "../Drawer/Drawer";

type RowActionType = {
    label: string;
    tone?: "default" | "danger";
    href?: string;
    opensDrawer?: boolean;
}

type RowActionsType = {
    actions: RowActionType[];
}

export default function RowActions({ actions }: RowActionsType) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <ActionMenu>
                {actions?.map((action, index) => {
                    return <ActionMenuItem key={index} onSelect={action.opensDrawer ? () => {
                        console.log("opened drawer from row actions" + action.label);
                        setOpen(true);
                    } : undefined}>{action.label}</ActionMenuItem>
                })}
            </ActionMenu>

            {open && (
                <Drawer open={open} close={() => {
                    setOpen(false);
                }}>
                    <span>ОТКРЫВАЕМ МОДАЛКУ С ГЛАВНОЙ СТРАНИЦЫ В ЗАКАЗАХ</span>
                </Drawer>
            )}
        </>
    )
}