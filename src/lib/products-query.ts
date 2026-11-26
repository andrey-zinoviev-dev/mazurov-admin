import { prisma } from "./prisma";

export async function getProductsByCategoryId(categoryId: number) {
    return prisma.product.findMany({
        where: {
            category: {
                parentId: categoryId,
            },
        },
        include: {
            category: {
                include: {
                    parent: true,
                },
            },
        },
    });
};

export async function getProductById(id: number) {
    return prisma.product.findUnique({
        where: {
            id,
        },
        include: {
            category: {
                include: {
                    parent: true,
                },
            },
        },
    });
    
};