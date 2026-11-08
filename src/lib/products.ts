import { prisma } from "./prisma";

export async function getProductsByCategoryId(categoryId: number) {
    return prisma.product.findMany({
        where: {
            category: {
                parentId: categoryId,
            },
        },
    });
}