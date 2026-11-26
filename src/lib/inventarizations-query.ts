import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/client";

export const inventarizationListSelect = {
    id: true,
    date: true,
    inspector: true,
    status: true,
    comment: true,
} satisfies Prisma.InventarizationSelect;

export type InventarizationListItem = Prisma.InventarizationGetPayload<{
    select: typeof inventarizationListSelect;
}>;

export const getInventarizations = async () => {
    return prisma.inventarization.findMany({
        select: inventarizationListSelect,
        orderBy: {
            date: "desc",
        }
    });
};

export const getInventarization = async (id: number, categoryId: number) => {
    return prisma.inventarization.findUnique({
        where: {
            id,
        },
        select: {
            ...inventarizationListSelect,
            items: {
                where: {
                    product: {
                        category: {
                            parentId: categoryId,
                        },
                    },
                },
                include: {
                    product: {
                        include: {
                            category: true,
                        },
                    },
                },
            },
        },
    });
};