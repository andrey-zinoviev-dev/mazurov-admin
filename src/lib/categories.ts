import { prisma } from "./prisma";

export async function getRootCategories() {
    return prisma.category.findMany({
        where: {
            parentId: null,
        },
    });
}

// export async function getCategoriesByParentId(parentId: number) {
//     return prisma.category.findMany({
//         where: {
//             parentId: parentId,
//         },
//     });
// }