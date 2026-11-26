"use client";
import { createPortal } from "react-dom";

type DrawerProps = {
    children: React.ReactNode;
    open: boolean,
    close: () => void,
}

export default function Drawer({ children, open, close }: DrawerProps) {
    return open ? createPortal(
            <div role="dialog">
                <h1>Модалка</h1>
                <button onClick={close}>Закрыть</button>
                {children}
            </div>,
            document.body
    ) : null;
}